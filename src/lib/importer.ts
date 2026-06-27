import * as XLSX from 'xlsx';
import { LandRecord } from './processor';

export const HEADER_ALIASES = {
  pin: [
    'pin', 'pin #', 'pin no', 'pin no.', 'property index no', 
    'property index number', 'property identification number', 
    'td pin', 'p.i.n.', 'property index', 'id pin'
  ],
  arpNo: [
    'arp no#', 'arp no', 'arp', 'arp number', 'current arp', 
    'current', 'td no', 'td number', 'td no.', 'arp. no.', 
    'tax declaration', 'tax declaration no', 'current td'
  ],
  acctName: [
    'acctname', 'account name', 'owner', 'owner name', 
    'owners name', 'acct name', 'account', 'taxpayer name', 
    'taxpayer', 'tax payer', 'declared owner'
  ],
  address: [
    'address', 'location', 'property address', 'location of property', 
    'addr', 'situs', 'site address'
  ],
  landArea: [
    'land area', 'area', 'area (sqm)', 'sqm', 'sq.m.', 'sq.m', 
    'lot area', 'total area', 'sq m', 'sq meters', 'total sqm'
  ],
  unitValue: [
    'unit value', 'uv', 'unit cost', 'market value per sqm', 
    'unit price', 'market unit value'
  ],
  marketValue: [
    'market value', 'mv', 'total market value', 'market val', 
    'total mv', 'market value total'
  ],
  assessedValue: [
    'assessed value', 'av', 'al', 'assessed val', 'total av', 
    'assessed level amount', 'total assessed'
  ],
  yearlyTax: [
    'yearly tax', 'tax', 'annual tax', 'tax due', 'yearly tax due', 
    'annual tax due', 'total tax'
  ],
  previous: [
    'previous', 'prev', 'prev arp', 'old arp', 'previous pin', 'prev.', 'previous record'
  ],
  update: [
    'update', 'upd', 'update code', 'type', 'upd code', 'u', 
    'revision', 'transaction code'
  ],
  kind: ['kind', 'k', 'property kind', 'classification'],
  au: [
    'au', 'actual use', 'use', 'a.u.', 'actual usage', 
    'usage code'
  ],
  date: [
    'date', 'effectivity', 'date effectivity', 'eff date', 
    'revision date', 'date of effectivity'
  ]
};

const parseNum = (val: any) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const mapRawToRecords = (raw: any[], fileName: string): LandRecord[] => {
  return raw.map((item, index) => {
    const norm: any = {};
    Object.keys(item).forEach(key => {
      const cleanKey = key.trim().toLowerCase();
      norm[cleanKey] = String(item[key]).trim();
    });

    const getValue = (field: keyof typeof HEADER_ALIASES) => {
      const aliases = HEADER_ALIASES[field];
      for (const alias of aliases) {
        if (norm[alias] !== undefined && norm[alias] !== "") return norm[alias];
      }
      return "";
    };

    let kind = String(getValue('kind')).trim();
    let au = String(getValue('au')).trim();
    
    const kau = String(norm['k-au'] || norm['k/au'] || '').trim();
    if (kau && kau.includes('-')) {
      const parts = kau.split('-');
      kind = parts[0]?.trim() || kind;
      au = parts[1]?.trim() || au;
    }
    
    const pin = String(getValue('pin')).trim();
    const arpNo = String(getValue('arpNo')).trim();
    const uniqueId = `${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: uniqueId,
      date: String(getValue('date')).trim(),
      arpNo: arpNo,
      pin: pin,
      previous: String(getValue('previous')).trim(),
      update: String(getValue('update')).trim(),
      taxability: 'T',
      acctName: String(getValue('acctName')).trim(),
      address: String(getValue('address')).trim(),
      location: String(norm['location'] || '').trim(),
      kind: kind,
      au: au,
      landArea: parseNum(getValue('landArea')),
      unitValue: parseNum(getValue('unitValue')),
      marketValue: parseNum(getValue('marketValue')),
      assessedValue: parseNum(getValue('assessedValue')),
      yearlyTax: parseNum(getValue('yearlyTax')),
      isCleanup: false,
      cleanupReason: "",
      sourceFile: fileName,
      rawRow: item
    };
  });
};

/**
 * Specialized parser for the Assessment Roll positional format.
 * Adjusts mapping based on whether the "Rec #" column is present (Exempt files omit it).
 */
const parseAssessmentRollPositional = (raw: any[][], fileName: string, isExempt: boolean): LandRecord[] => {
  return raw.map((row) => {
    const offset = isExempt ? -1 : 0;
    const kau = String(row[11 + offset] || '').trim();
    let kind = '';
    let au = '';
    if (kau.includes('-')) {
      const parts = kau.split('-');
      kind = parts[0]?.trim() || '';
      au = parts[1]?.trim() || '';
    }

    const uniqueId = `${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: uniqueId,
      date: String(row[7 + offset] || '').trim(),
      arpNo: String(row[9 + offset] || '').trim(),
      pin: String(row[6 + offset] || '').trim(),
      previous: String(row[10 + offset] || '').trim(),
      update: '', 
      taxability: isExempt ? 'E' : 'T',
      acctName: String(row[1 + offset] || '').trim(),
      address: String(row[2 + offset] || '').trim(),
      lotNo: String(row[3 + offset] || '').trim(),
      blkNo: String(row[4 + offset] || '').trim(),
      tctNo: String(row[5 + offset] || '').trim(),
      rollType: String(row[8 + offset] || '').trim(),
      location: '', 
      kind: kind,
      au: au,
      landArea: parseNum(row[12 + offset]),
      marketValue: parseNum(row[13 + offset]),
      assessedValue: parseNum(row[15 + offset]),
      unitValue: 0, 
      isCleanup: false,
      sourceFile: fileName,
      rawRow: row
    };
  });
};

/**
 * Specialized parser for the 14-column Journal positional format.
 * Implements Date Carry-Forward: If a row has a blank date, it inherits the date from the row above.
 * Processes the entire sheet to maintain vertical context.
 */
const parseJournalPositional = (raw: any[][], fileName: string): LandRecord[] => {
  let lastSeenDate = "";
  const records: LandRecord[] = [];
  
  raw.forEach((row) => {
    // Column 1 (Index 0) is typically the Date
    const currentDateRaw = String(row[0] || '').trim();
    
    // Update the active date if the current cell is not blank and not a header
    if (currentDateRaw !== "" && !currentDateRaw.toLowerCase().includes('date')) {
      lastSeenDate = currentDateRaw;
    }
    
    // Column 3 (Index 2) is the PIN. If it contains a dash, treat it as a data row.
    const pin = String(row[2] || '').trim();
    if (pin.includes('-')) {
      const uniqueId = `${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      records.push({
        id: uniqueId,
        date: lastSeenDate, // Use the carry-forward date
        arpNo: String(row[1] || '').trim(),
        pin: pin,
        update: String(row[3] || '').trim(),
        acctName: String(row[4] || '').trim(),
        location: String(row[5] || '').trim(),
        kind: String(row[6] || '').trim(),
        au: String(row[7] || '').trim(),
        landArea: parseNum(row[8]),
        marketValue: parseNum(row[9]),
        assessedValue: parseNum(row[10]),
        taxability: 'T',
        unitValue: 0,
        isCleanup: false,
        sourceFile: fileName,
        rawRow: row
      });
    }
  });
  
  return records;
};

export const parseFile = async (
  file: File, 
  workflowMode: 'standard' | 'roll' | 'journal' = 'standard',
  importMode: 'raw' | 'exempt' | 'journal' = 'raw'
): Promise<{ data: LandRecord[], count: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: false,
          cellNF: true,
          cellText: true
        });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (workflowMode === 'roll') {
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" }) as any[][];
          const pinIdx = importMode === 'exempt' ? 5 : 6;
          const dataRows = json.filter(row => row.length >= 16 && String(row[pinIdx] || '').includes('-'));
          const mappedData = parseAssessmentRollPositional(dataRows, file.name, importMode === 'exempt');
          resolve({ data: mappedData, count: dataRows.length });
        } else if (workflowMode === 'journal' || importMode === 'journal') {
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" }) as any[][];
          // Use the carry-forward aware parser on the full sheet
          const mappedData = parseJournalPositional(json, file.name);
          resolve({ data: mappedData, count: mappedData.length });
        } else {
          const json = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" }) as any[];
          const rawCount = json.length;
          const mappedData = mapRawToRecords(json, file.name);
          resolve({ data: mappedData, count: rawCount });
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsArrayBuffer(file);
  });
};