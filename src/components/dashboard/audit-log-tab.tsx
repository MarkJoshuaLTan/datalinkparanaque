
"use client";

import React from 'react';
import { ProcessingReport } from '@/lib/processor';
import { Card } from '@/components/ui/card';
import { 
  ShieldCheck, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Eraser, 
  Archive, 
  Zap,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface AuditLogTabProps {
  reports: ProcessingReport[];
}

export function AuditLogTab({ reports }: AuditLogTabProps) {
  if (reports.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ShieldCheck className="w-16 h-16 opacity-10 mb-4" />
        <p className="text-sm uppercase font-black opacity-30 tracking-widest">No Processing History Found</p>
      </div>
    );
  }

  const exportAsPDF = (report: ProcessingReport) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94); // Primary color
    doc.text("DATA LINK PARAÑAQUE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("CITY GOVERNMENT OF PARAÑAQUE - REAL PROPERTY DATA DIVISION", 105, 28, { align: "center" });
    
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("DATA PROCESSING AUDIT CERTIFICATE", 105, 50, { align: "center" });

    // Summary Text
    doc.setFontSize(11);
    doc.text(`Certificate No: AUDIT-${Date.now()}`, 20, 65);
    doc.text(`Processing Date: ${report.timestamp}`, 20, 72);
    doc.text(`Source File: ${report.fileName}`, 20, 79);

    const bodyText = `This document serves as an official audit log for the land record data processing performed on the specified date. The DataLink Parañaque engine has completed a multi-stage validation, cleanup, and calibration sequence as summarized below:`;
    
    const splitText = doc.splitTextToSize(bodyText, 170);
    doc.text(splitText, 20, 95);

    // Audit Data Table
    (doc as any).autoTable({
      startY: 110,
      head: [['Processing Metric', 'Result Count', 'Status']],
      body: [
        ['Total Records Imported', report.totalImported.toLocaleString(), 'Logged'],
        ['System Cleanup (Empty/Total Rows)', report.cleanupCount.toLocaleString(), 'Removed'],
        ['Duplicate PINs Detected', report.duplicatesDetected.toLocaleString(), 'Archived'],
        ['Records Calibrated (Auto-Mapping)', report.calibratedCount.toLocaleString(), 'Applied'],
        ['Data Integrity Errors Found', report.errorCount.toLocaleString(), report.errorCount > 0 ? 'NEEDS FIX' : 'CLEAN'],
        ['Final Validated Records', report.validCount.toLocaleString(), 'READY'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    });

    const financialStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("FINANCIAL SUMMARY", 20, financialStartY);
    
    doc.setFontSize(11);
    doc.text(`Total Market Value: PHP ${report.totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 20, financialStartY + 10);
    doc.text(`Total Assessed Value: PHP ${report.totalAssessedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 20, financialStartY + 17);

    // Legal Statement
    doc.setFontSize(9);
    doc.setTextColor(120);
    const legalText = "I hereby certify that the data processing results listed above have been generated through the standardized Parañaque Land Records engine and are ready for official audit review and integration.";
    doc.text(doc.splitTextToSize(legalText, 170), 20, 260);

    doc.save(`AuditReport-${report.fileName}-${Date.now()}.pdf`);
  };

  const exportAsExcel = (report: ProcessingReport) => {
    const data = [
      ["DATA LINK PARAÑAQUE - PROCESSING SUMMARY REPORT"],
      ["Generated On:", report.timestamp],
      ["Source File:", report.fileName],
      [],
      ["METRIC", "VALUE"],
      ["Total Imported", report.totalImported],
      ["System Cleanup", report.cleanupCount],
      ["Duplicates Detected", report.duplicatesDetected],
      ["Records Calibrated", report.calibratedCount],
      ["Records with Errors", report.errorCount],
      ["Final Validated Count", report.validCount],
      [],
      ["FINANCIALS"],
      ["Total Market Value", report.totalMarketValue],
      ["Total Assessed Value", report.totalAssessedValue],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Log");
    XLSX.writeFile(wb, `ProcessingSummary-${report.fileName}.xlsx`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-vertical-custom bg-muted/5">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> 
            Session Audit History
          </h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {reports.length} Total Processing Sessions
          </p>
        </div>

        {reports.map((report, index) => (
          <Card key={index} className="overflow-hidden border-white/5 shadow-xl hover:shadow-2xl transition-all group">
            <div className="p-6 bg-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight truncate max-w-[300px]">
                      {report.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportAsPDF(report)}
                    className="h-10 px-4 font-black uppercase text-[11px] tracking-widest border-emerald-600/30 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> PDF Audit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportAsExcel(report)}
                    className="h-10 px-4 font-black uppercase text-[11px] tracking-widest border-blue-600/30 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-2" /> Excel Log
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3 rounded-xl bg-muted/20 border border-white/5 text-center">
                  <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Imported</div>
                  <div className="text-sm font-black">{report.totalImported.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-white/5 text-center">
                  <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Cleanup</div>
                  <div className="text-sm font-black text-orange-600">{report.cleanupCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-white/5 text-center">
                  <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Duplicates</div>
                  <div className="text-sm font-black text-amber-500">{report.duplicatesDetected}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-white/5 text-center">
                  <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Calibrated</div>
                  <div className="text-sm font-black text-primary">{report.calibratedCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                  <div className="text-[9px] font-black text-red-700 uppercase mb-1">Errors</div>
                  <div className="text-sm font-black text-red-600">{report.errorCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                  <div className="text-[9px] font-black text-emerald-700 uppercase mb-1">Validated</div>
                  <div className="text-sm font-black text-emerald-600">{report.validCount.toLocaleString()}</div>
                </div>
              </div>
              
              {report.errorCount > 0 && (
                <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">
                    Audit incomplete: {report.errorCount} integrity errors detected. Manual correction required.
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
