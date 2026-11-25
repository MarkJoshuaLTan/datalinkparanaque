import * as XLSX from 'xlsx-js-style';

export interface SheetTableConfig {
  /** 1-based sheet index (1 = sheet1.xml, 2 = sheet2.xml, etc.) */
  sheetIndex: number;
  /** 1-based row number of the table header row (e.g. 37) */
  headerRow: number;
  /** 1-based row number of the last data row */
  lastRow: number;
  /** Exact header strings matching the cells in headerRow */
  headers: string[];
  /** Optional table name (alphanumeric + underscore only, no spaces) */
  tableName?: string;
}

export interface SheetFreezeConfig {
  /** 1-based sheet index (1 = sheet1.xml, 2 = sheet2.xml, etc.) */
  sheetIndex: number;
  /** Number of rows to freeze from the top (e.g. 4 freezes rows 1..4) */
  ySplit: number;
  /** Optional number of columns to freeze from the left */
  xSplit?: number;
}

export interface ExcelEnhancements {
  tables?: SheetTableConfig[];
  freezes?: SheetFreezeConfig[];
}

const escapeXml = (str: string): string =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const encodeCol = (colIdx0: number): string => XLSX.utils.encode_col(colIdx0);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

/**
 * Enhances an XLSX workbook buffer with OOXML Freeze Panes and/or native Excel Tables
 * (which automatically pin column headers into Excel's top bar when overscrolling past the header row),
 * then triggers a browser download.
 */
export function writeEnhancedXLSX(
  wb: XLSX.WorkBook,
  fileName: string,
  enhancements: ExcelEnhancements = {}
): void {
  const rawBuf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const zip = XLSX.CFB.read(new Uint8Array(rawBuf), { type: 'array' });

  const { tables = [], freezes = [] } = enhancements;

  // 1. Apply Freeze Panes (<pane state="frozen"/>)
  for (const freeze of freezes) {
    if (freeze.ySplit <= 0 && (!freeze.xSplit || freeze.xSplit <= 0)) continue;
    const sheetPath = `/xl/worksheets/sheet${freeze.sheetIndex}.xml`;
    const entry = XLSX.CFB.find(zip, sheetPath);
    if (!entry || !entry.content) continue;

    let xml = textDecoder.decode(new Uint8Array(entry.content as any));
    const xSplit = freeze.xSplit || 0;
    const ySplit = freeze.ySplit || 0;
    const topLeftCol = encodeCol(xSplit);
    const topLeftRow = ySplit + 1;
    const topLeftCell = `${topLeftCol}${topLeftRow}`;
    const activePane = xSplit > 0 && ySplit > 0 ? 'bottomRight' : xSplit > 0 ? 'topRight' : 'bottomLeft';
    const xAttr = xSplit > 0 ? ` xSplit="${xSplit}"` : '';
    const yAttr = ySplit > 0 ? ` ySplit="${ySplit}"` : '';

    const viewInner =
      `<pane${xAttr}${yAttr} topLeftCell="${topLeftCell}" activePane="${activePane}" state="frozen"/>` +
      `<selection pane="${activePane}" activeCell="${topLeftCell}" sqref="${topLeftCell}"/>`;

    if (xml.includes('<sheetView workbookViewId="0"/>')) {
      xml = xml.replace(
        '<sheetView workbookViewId="0"/>',
        `<sheetView workbookViewId="0">${viewInner}</sheetView>`
      );
    } else if (xml.includes('<sheetView workbookViewId="0">')) {
      xml = xml.replace(
        '<sheetView workbookViewId="0">',
        `<sheetView workbookViewId="0">${viewInner}`
      );
    }

    entry.content = Array.from(textEncoder.encode(xml)) as any;
    entry.size = entry.content.length;
  }

  // 2. Apply Native Excel Tables (auto-pins headers when overscrolling past headerRow)
  let tableCounter = 0;
  const contentTypeOverrides: string[] = [];

  for (const tbl of tables) {
    if (!tbl.headers.length || tbl.lastRow < tbl.headerRow) continue;
    const sheetPath = `/xl/worksheets/sheet${tbl.sheetIndex}.xml`;
    const sheetEntry = XLSX.CFB.find(zip, sheetPath);
    if (!sheetEntry || !sheetEntry.content) continue;

    tableCounter += 1;
    const tableId = tableCounter;
    const safeName = (tbl.tableName || `DataTable${tableId}`).replace(/[^A-Za-z0-9_]/g, '_');
    const lastColLetter = encodeCol(tbl.headers.length - 1);
    const ref = `A${tbl.headerRow}:${lastColLetter}${Math.max(tbl.lastRow, tbl.headerRow + 1)}`;

    // Deduplicate column names (Excel strictly requires unique table column names)
    const usedNames = new Map<string, number>();
    const tableColumnsXml = tbl.headers
      .map((rawName, idx) => {
        const base = (rawName || `Column${idx + 1}`).trim() || `Column${idx + 1}`;
        const key = base.toLowerCase();
        const count = usedNames.get(key) || 0;
        usedNames.set(key, count + 1);
        const finalName = count === 0 ? base : `${base} (${count + 1})`;
        return `<tableColumn id="${idx + 1}" name="${escapeXml(finalName)}"/>`;
      })
      .join('');

    const tableXml =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="${tableId}" name="${safeName}" displayName="${safeName}" ref="${ref}" totalsRowShown="0">` +
      `<autoFilter ref="${ref}"/>` +
      `<tableColumns count="${tbl.headers.length}">${tableColumnsXml}</tableColumns>` +
      `<tableStyleInfo name="TableStyleLight1" showFirstColumn="0" showLastColumn="0" showRowStripes="0" showColumnStripes="0"/>` +
      `</table>`;

    const tablePath = `/xl/tables/table${tableId}.xml`;
    XLSX.CFB.utils.cfb_add(zip, tablePath, textEncoder.encode(tableXml));
    contentTypeOverrides.push(
      `<Override PartName="${tablePath}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>`
    );

    // Add worksheet relationship to table
    const relsPath = `/xl/worksheets/_rels/sheet${tbl.sheetIndex}.xml.rels`;
    const rId = `rIdTbl${tableId}`;
    const relTag = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table${tableId}.xml"/>`;
    const existingRels = XLSX.CFB.find(zip, relsPath);
    if (existingRels && existingRels.content) {
      let relsXml = textDecoder.decode(new Uint8Array(existingRels.content as any));
      relsXml = relsXml.replace('</Relationships>', `${relTag}</Relationships>`);
      existingRels.content = Array.from(textEncoder.encode(relsXml)) as any;
      existingRels.size = existingRels.content.length;
    } else {
      const relsXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relTag}</Relationships>`;
      XLSX.CFB.utils.cfb_add(zip, relsPath, textEncoder.encode(relsXml));
    }

    // Update sheet XML: select first data row inside table so overscrolling immediately pins headers, and attach <tableParts>
    let sheetXml = textDecoder.decode(new Uint8Array(sheetEntry.content as any));
    const firstDataCell = `A${tbl.headerRow + 1}`;
    if (sheetXml.includes('<sheetView workbookViewId="0"/>')) {
      sheetXml = sheetXml.replace(
        '<sheetView workbookViewId="0"/>',
        `<sheetView workbookViewId="0"><selection activeCell="${firstDataCell}" sqref="${firstDataCell}"/></sheetView>`
      );
    }

    if (sheetXml.includes('</tableParts>')) {
      sheetXml = sheetXml.replace(
        '</tableParts>',
        `<tablePart r:id="${rId}"/></tableParts>`
      );
    } else {
      sheetXml = sheetXml.replace(
        '</worksheet>',
        `<tableParts count="1"><tablePart r:id="${rId}"/></tableParts></worksheet>`
      );
    }

    sheetEntry.content = Array.from(textEncoder.encode(sheetXml)) as any;
    sheetEntry.size = sheetEntry.content.length;
  }

  // 3. Register table content types in [Content_Types].xml
  if (contentTypeOverrides.length > 0) {
    const ctEntry = XLSX.CFB.find(zip, '/[Content_Types].xml');
    if (ctEntry && ctEntry.content) {
      let ctXml = textDecoder.decode(new Uint8Array(ctEntry.content as any));
      ctXml = ctXml.replace('</Types>', `${contentTypeOverrides.join('')}</Types>`);
      ctEntry.content = Array.from(textEncoder.encode(ctXml)) as any;
      ctEntry.size = ctEntry.content.length;
    }
  }

  const outBuf = XLSX.CFB.write(zip, { type: 'array', fileType: 'zip' });
  const blob = new Blob([new Uint8Array(outBuf)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
