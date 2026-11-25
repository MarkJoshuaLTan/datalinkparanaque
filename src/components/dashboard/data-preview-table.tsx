
"use client";

import React, { useState, memo, useMemo, useEffect, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { LandRecord, getModeOfConveyance } from '@/lib/processor';
import { calculateThreeYearStats } from '@/lib/three-year-report-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, AlertTriangle, Loader2, Info, Link2, Unlink2, HardHat, AlertCircle, Filter, Check, ChevronDown, Search, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNotification } from '@/contexts/NotificationContext';

interface DataPreviewTableProps {
  data: LandRecord[];
  isProcessed?: boolean;
  onRowClick: (record: LandRecord) => void;
  showLabels?: boolean;
  workflowMode?: 'standard' | 'abstract' | 'building-permit' | 'three-year-report';
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  statusOptions?: { value: string; label: string }[];
}

const RecordRow = memo(({ 
  row, 
  index, 
  isProcessed,
  onRowClick,
  showLabels,
  workflowMode,
  threeYearStats
}: { 
  row: LandRecord; 
  index: number; 
  isProcessed: boolean;
  onRowClick: (record: LandRecord) => void;
  showLabels?: boolean;
  workflowMode?: 'standard' | 'abstract' | 'building-permit' | 'three-year-report';
  threeYearStats?: any;
}) => {
  if (workflowMode === 'abstract') {
    const abstractRow = row as any;
    const kind = (row.kind || "").trim().toUpperCase();
    
    return (
      <TableRow 
        onClick={() => onRowClick(row)}
        className={cn(
          "border-b transition-all duration-200 hover:bg-muted/30 cursor-pointer",
          !abstractRow.isJoined && "bg-red-50/30 dark:bg-red-950/20"
        )}
      >
        <TableCell className="text-center font-black p-3 border-r bg-muted/5 text-muted-foreground font-mono">
          {index + 1}
        </TableCell>
        <TableCell className="font-mono p-3 font-black text-primary">{row.arpNo || '---'}</TableCell>
        <TableCell className="whitespace-nowrap p-3 font-bold">{row.date || ''}</TableCell>
        
        <TableCell className="p-3 bg-muted/5 border-l font-bold text-red-700/80 uppercase truncate max-w-[220px]">
          {abstractRow.cancelledOwner || ''}
        </TableCell>

        <TableCell className={cn(
          "max-w-[250px] truncate uppercase p-3 font-bold border-l",
          abstractRow.isJoined ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/10" : "text-red-400 italic opacity-50"
        )} title={row.acctName}>
          {row.acctName || '---'}
        </TableCell>

        <TableCell className="max-w-[250px] truncate uppercase p-3 text-muted-foreground italic border-l">
          {abstractRow.rollAddress || '---'}
        </TableCell>

        <TableCell className="max-w-[150px] truncate uppercase p-3 text-muted-foreground italic border-l">
          {row.location || '---'}
        </TableCell>

        <TableCell className="p-3 text-center border-l font-bold text-xs uppercase text-foreground">
          {getModeOfConveyance(row.update, row.acctName)}
        </TableCell>

        <TableCell className="text-right font-mono p-3 font-black border-l text-emerald-600">
          {abstractRow.sellingPrice ? (
            typeof abstractRow.sellingPrice === 'number' 
              ? `₱${abstractRow.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : abstractRow.sellingPrice
          ) : '0.00'}
        </TableCell>

        <TableCell className="p-3 text-center border-l font-black text-primary">
          {(kind === 'L' || kind === 'LAND') ? 'x' : ''}
        </TableCell>
        <TableCell className="p-3 text-center border-l font-black text-blue-600">
          {(kind === 'B' || kind === 'BUILDING') ? 'x' : ''}
        </TableCell>
        <TableCell className="p-3 text-center border-l font-black text-amber-600">
          {(kind === 'M' || kind === 'MACHINERY') ? 'x' : ''}
        </TableCell>

        <TableCell className="text-right font-mono p-3 font-black border-l">
          {((kind === 'B' || kind === 'BUILDING') ? (abstractRow.rollArea || row.landArea) : row.landArea)?.toLocaleString() || '0'}
        </TableCell>

        <TableCell className={cn(
          "p-3 font-mono text-center border-l",
          abstractRow.isJoined ? "text-blue-600 font-black" : "text-muted-foreground opacity-30"
        )}>
          {abstractRow.rollLotNo || '---'}
        </TableCell>

        <TableCell className="p-3 bg-muted/5 border-l text-center font-mono font-bold text-red-600/80">
          {abstractRow.cancelledTctNo || ''}
        </TableCell>

        <TableCell className={cn(
          "p-3 font-mono text-center border-l",
          abstractRow.isJoined ? "text-blue-600 font-black" : "text-muted-foreground opacity-30"
        )}>
          {abstractRow.rollTctNo || '---'}
        </TableCell>

        <TableCell className="p-3 font-bold border-l truncate">
          {abstractRow.notarialDate || '---'}
        </TableCell>

        <TableCell className="p-3 font-mono border-l truncate max-w-[180px]">
          {abstractRow.docFileNo || '---'}
        </TableCell>

        <TableCell className="p-3 font-bold border-l truncate uppercase text-muted-foreground">
          {abstractRow.notary || '---'}
        </TableCell>
        
        <TableCell className="text-center p-3 border-l">
          <div className="flex flex-col items-center gap-1">
            {abstractRow.isJoined ? (
              <Badge className="bg-emerald-600 text-white font-black text-[9px] tracking-widest gap-1 uppercase">
                <Link2 className="w-3" /> Linked
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-black text-[9px] tracking-widest gap-1 uppercase opacity-60">
                <Unlink2 className="w-3" /> No Match
              </Badge>
            )}
            {row.taxability === 'E' && (
              <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 bg-blue-600 text-white border-none shadow-sm">EXEMPT</Badge>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (workflowMode === 'building-permit') {
    const permitRow = row as any;
    return (
      <TableRow 
        onClick={() => onRowClick(row)}
        className={cn(
          "border-b transition-all duration-200 hover:bg-muted/30 cursor-pointer",
          !permitRow.isJoined && "bg-orange-50/30 dark:bg-red-950/20",
          (permitRow.isPotentialMatch || permitRow.isUnderReview) && "bg-amber-500/5"
        )}
      >
        <TableCell className="text-center font-black p-3 border-r bg-muted/5 text-muted-foreground font-mono">
          {index + 1}
        </TableCell>
        <TableCell className="whitespace-nowrap p-3 font-bold">{row.dateIssued || '---'}</TableCell>
        <TableCell className="font-mono p-3 font-black text-orange-600">{row.buildingPermitNo || '---'}</TableCell>
        <TableCell className="p-3 font-bold uppercase truncate max-w-[200px]">{row.barangayName || '---'}</TableCell>
        
        <TableCell className={cn(
          "font-mono p-3 border-l font-bold",
          permitRow.isJoined ? "text-emerald-700" : "text-muted-foreground italic opacity-40"
        )}>
          {permitRow.rollArp || '---'}
        </TableCell>

        <TableCell className="p-3 border-l uppercase text-muted-foreground truncate max-w-[220px]">
          {permitRow.rollAddress || '---'}
        </TableCell>

        <TableCell className="p-3 border-l uppercase font-bold text-xs truncate max-w-[200px]">
          {row.location || '---'}
        </TableCell>

        <TableCell className="p-3 border-l font-bold text-xs text-blue-600 uppercase">
          {row.useOfOccupancy || '---'}
        </TableCell>

        <TableCell className="text-right font-mono p-3 font-black border-l">
          {permitRow.rollArea?.toLocaleString() || '0'}
        </TableCell>

        <TableCell className="text-right font-mono p-3 font-black border-l text-emerald-600">
          ₱{row.estimatedCost?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
        </TableCell>

        <TableCell className="text-center p-3 border-l font-black text-xs">
          {permitRow.rollClass || '---'}
        </TableCell>

        <TableCell className="p-3 border-l uppercase text-muted-foreground font-bold text-[10px] max-w-[180px] truncate">
          {permitRow.rollOwner || '---'}
        </TableCell>

        <TableCell className="text-center p-3 border-l">
          <div className="flex flex-col items-center gap-1">
            {permitRow.isUnderReview ? (
              <Badge variant="outline" className="bg-orange-500 text-white font-black text-[9px] tracking-widest gap-1 uppercase border-none shadow-md">
                <AlertCircle className="w-3" /> Under Review
              </Badge>
            ) : permitRow.isPotentialMatch ? (
              <Badge variant="outline" className="bg-amber-500 text-white font-black text-[9px] tracking-widest gap-1 uppercase border-none shadow-md">
                <AlertCircle className="w-3" /> Potential Match
              </Badge>
            ) : permitRow.isJoined ? (
              <Badge className="bg-emerald-600 text-white font-black text-[9px] tracking-widest gap-1 uppercase">
                <Link2 className="w-3" /> Matched
              </Badge>
            ) : (
              <Badge variant="outline" className="font-black text-[9px] tracking-widest gap-1 uppercase opacity-60">
                <Unlink2 className="w-3" /> Unlinked
              </Badge>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (workflowMode === 'three-year-report') {
    const reportRow = row as any;
    return (
      <TableRow 
        onClick={() => onRowClick(row)}
        className={cn(
          "border-b transition-all duration-200 hover:bg-muted/30 cursor-pointer",
          !reportRow.isJoined && "bg-red-50/50 dark:bg-red-950/30"
        )}
      >
        <TableCell className={cn("text-center font-black p-3 border-r font-mono", !reportRow.isJoined ? "bg-red-50/50 text-red-500" : "bg-muted/5 text-muted-foreground")}>
          {index + 1}
        </TableCell>
        <TableCell className={cn("text-center font-bold p-3 border-l text-sm uppercase", !reportRow.isJoined ? "text-red-600" : "text-emerald-700")}>
          {!reportRow.isJoined ? '---' : (reportRow.kindGroup === 'Land' ? 'Land' : (reportRow.kindGroup === 'Building' ? 'Building' : `${reportRow.kind || ''}-${reportRow.au || ''}`.replace(/^-|-$/, '') || 'Other/Unmapped'))}
        </TableCell>
        <TableCell className={cn("font-bold uppercase p-3 border-l truncate max-w-[200px]", !reportRow.isJoined && "text-red-600")}>
          {reportRow.acctName || '---'}
        </TableCell>
        <TableCell className={cn("font-mono p-3 border-l font-black", !reportRow.isJoined ? "text-red-600" : "text-primary")}>
          {reportRow.arpNo || '---'}
        </TableCell>
        <TableCell className={cn("p-3 border-l uppercase truncate max-w-[250px] text-xs", !reportRow.isJoined ? "text-red-500" : "text-muted-foreground")}>
          {reportRow.rollAddress || reportRow.location || '---'}
        </TableCell>
        <TableCell className={cn("p-3 border-l uppercase font-bold text-xs text-center", !reportRow.isJoined && "text-red-600")}>
          {reportRow.salesClassification || '---'}
        </TableCell>
        <TableCell className={cn("p-3 border-l uppercase text-center", !reportRow.isJoined ? "text-red-400" : "text-muted-foreground")}>
          ---
        </TableCell>
        <TableCell className={cn("text-right font-mono p-3 font-black border-l", !reportRow.isJoined && "text-red-600")}>
          {reportRow.landArea ? reportRow.landArea.toLocaleString() : (reportRow.rollArea?.toLocaleString() || '0')}
        </TableCell>
        
        <TableCell className={cn("text-right font-mono p-3 font-black border-l", !reportRow.isJoined ? "text-red-600" : "text-emerald-600")}>
          {reportRow.sellingPriceRef ? (
            <span className="text-xs text-muted-foreground italic">Ref: {reportRow.sellingPriceRef}</span>
          ) : (
            reportRow.sellingPrice ? `₱${reportRow.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'
          )}
        </TableCell>

        <TableCell className={cn("text-right font-mono p-3 font-black border-l", !reportRow.isJoined ? "text-red-600" : "text-emerald-600")}>
          {reportRow.sellingPriceRef ? (
            <span className="text-xs text-muted-foreground italic">Ref: {reportRow.sellingPriceRef}</span>
          ) : (
            reportRow.salesValue ? `₱${reportRow.salesValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'
          )}
        </TableCell>

        {/* Sales Values */}
        {(() => {
          let lowestVal: any = '---';
          let medianVal: any = '---';
          let highestVal: any = '---';

          if (threeYearStats && !reportRow.isSdReview && !reportRow.sellingPriceRef && !reportRow.isUnderReview && typeof reportRow.salesValue === 'number' && reportRow.salesValue > 0) {
            const formattedVal = <span className="text-emerald-600">{`₱${reportRow.salesValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</span>;
            if (reportRow.salesValue <= threeYearStats.t1) {
              lowestVal = formattedVal;
            } else if (reportRow.salesValue <= threeYearStats.t2) {
              medianVal = formattedVal;
            } else {
              highestVal = formattedVal;
            }
          }

          const cellClass = cn("text-right font-mono p-3 font-black border-l", !reportRow.isJoined ? "bg-red-50/30 text-red-400" : "bg-emerald-50/30 dark:bg-emerald-950/20 text-muted-foreground/30");
          return (
            <>
              <TableCell className={cellClass}>{lowestVal}</TableCell>
              <TableCell className={cellClass}>{medianVal}</TableCell>
              <TableCell className={cn(cellClass, "border-r")}>{highestVal}</TableCell>
            </>
          );
        })()}

        <TableCell className="text-center p-3 border-l">
          <div className="flex flex-col items-center gap-1">
            {reportRow.isSdReview ? (
              <Badge variant="outline" className="bg-amber-500 text-white font-black text-[9px] tracking-widest gap-1 uppercase border-none shadow-md">
                <AlertCircle className="w-3" /> SD Review
              </Badge>
            ) : reportRow.isUnderReview ? (
              <Badge variant="outline" className="bg-orange-500 text-white font-black text-[9px] tracking-widest gap-1 uppercase border-none shadow-md">
                <AlertCircle className="w-3" /> Under Review
              </Badge>
            ) : reportRow.isJoined ? (
              <Badge className="bg-emerald-600 text-white font-black text-[9px] tracking-widest gap-1 uppercase">
                <Link2 className="w-3" /> Linked
              </Badge>
            ) : (
              <Badge variant="outline" className="font-black text-[9px] tracking-widest gap-1 uppercase opacity-60">
                <Unlink2 className="w-3" /> Unlinked
              </Badge>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const getStatusBadge = () => {
    if (row.isComparisonInjected) {
      return <span className="text-xs font-bold uppercase tracking-wide text-[#12A249]">VALID REFERENCE</span>;
    }
    
    switch (row.statusLabel) {
      case 'VALID':
        return <span className="text-xs font-bold uppercase tracking-wide text-[#12A249]">VALID</span>;
      case 'INVALID PIN FORMAT':
        return <span className="text-xs font-bold uppercase tracking-wide text-red-600">INVALID PIN FORMAT</span>;
      case 'AREA ERROR':
        return <span className="text-xs font-bold uppercase tracking-wide text-red-600">AREA ERROR</span>;
      case 'DUPLICATE':
        return <span className="text-xs font-bold uppercase tracking-wide text-red-600">DUPLICATE</span>;
      case 'INCOMPLETE':
        return <span className="text-xs font-bold uppercase tracking-wide text-orange-600">INCOMPLETE</span>;
      case 'CLEANUP':
        return <span className="text-xs font-bold uppercase tracking-wide text-orange-600">{row.cleanupReason || 'CLEANUP'}</span>;
      default:
        return <span className="text-xs font-bold uppercase tracking-wide text-amber-600">{row.statusLabel || 'UNKNOWN'}</span>;
    }
  };

  const displayUnitValue = isProcessed ? (row.unitValue2029 ?? row.unitValue) : row.unitValue2028;
  const displayMarketValue = isProcessed ? (row.marketValue2029 ?? row.marketValue) : row.marketValue2028;
  const displayAssessedValue = isProcessed ? (row.assessedValue2029 ?? row.assessedValue) : row.assessedValue2028;
  const displayYearlyTax = isProcessed ? (row.yearlyTax2029 ?? row.yearlyTax) : row.yearlyTax2028;

  const getTypeLabel = () => {
    if (showLabels) {
      if (row.isComparisonInjected || row.duplicateWithReference === 'REF') return "REF";
      if (row.isDuplicate || row.duplicateWithReference === 'DUP') return "DUP";
    }
    return index + 1;
  };

  return (
    <TableRow 
      onClick={() => onRowClick(row)}
      className={cn(
        "transition-colors duration-150 hover:bg-muted/50 cursor-pointer even:bg-muted/[0.15] [&>td]:border-b [&>td]:border-border/50",
        row.isComparisonInjected && "bg-emerald-500/5 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-[#12A249]",
        (row.statusLabel === 'DUPLICATE' || row.statusLabel === 'INCOMPLETE' || row.statusLabel === 'CLEANUP') && !row.isComparisonInjected && "opacity-75",
        row.statusLabel === 'AREA ERROR' ? "bg-red-500/[0.06]" : (row.statusLabel !== 'VALID' && row.statusLabel !== 'DUPLICATE' && row.statusLabel !== 'INCOMPLETE' && !row.isComparisonInjected && "bg-red-500/[0.04]")
      )}
    >
      <TableCell className={cn(
        "text-center font-semibold px-3 py-2.5 border-r border-border/50 tabular-nums text-xs",
        (showLabels && (row.isComparisonInjected || row.duplicateWithReference === 'REF')) ? "text-[#12A249] tracking-wider" : "text-muted-foreground"
      )}>
        {getTypeLabel()}
      </TableCell>
      <TableCell className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground tabular-nums">{row.date || '---'}</TableCell>
      <TableCell className={cn(
        "tabular-nums font-semibold px-3 py-2.5 text-sm whitespace-nowrap", 
        row.statusLabel === 'NO ARP NO#' ? "text-red-600 underline decoration-wavy" : "text-foreground",
        row.isComparisonInjected && "text-[#12A249]"
      )}>
        {row.arpNo || '---'}
      </TableCell>
      <TableCell className={cn("tabular-nums px-3 py-2.5 text-sm whitespace-nowrap", (row.statusLabel === 'INVALID PIN FORMAT' || (row.statusLabel === 'INCOMPLETE' && !row.pin)) ? "text-red-600 font-semibold" : "text-foreground")}>
        {row.pin || '---'}
      </TableCell>
      <TableCell className="px-3 py-2.5 tabular-nums text-sm text-muted-foreground truncate max-w-[160px]">
        {row.previous || '---'}
      </TableCell>
      <TableCell className="px-3 py-2.5 tabular-nums font-semibold text-sm text-blue-600 dark:text-blue-400 max-w-[120px] truncate">
        {row.newArpNo || '---'}
      </TableCell>
      <TableCell className="px-3 py-2.5 text-center">
        {row.update ? (
          <span className="inline-block bg-muted/70 px-2 py-0.5 rounded text-xs font-semibold text-foreground border border-border/60">
            {row.update}
          </span>
        ) : (
          <span className={cn("text-muted-foreground text-xs", row.statusLabel === 'NO UPDATE' && "text-red-500 font-semibold")}>---</span>
        )}
      </TableCell>
      <TableCell className="px-3 py-2.5 text-center">
        {row.taxability === 'E' ? (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">E</span>
        ) : (
          <span className="text-muted-foreground font-semibold text-xs">T</span>
        )}
      </TableCell>
      <TableCell className="max-w-[210px] truncate uppercase font-medium text-sm text-foreground px-3 py-2.5">{row.acctName || '---'}</TableCell>
      <TableCell className={cn("max-w-[240px] truncate uppercase px-3 py-2.5 text-sm text-muted-foreground", row.statusLabel === 'NO ADDRESS' && "text-red-500")}>
        {row.address || '---'}
      </TableCell>
      <TableCell className="max-w-[220px] truncate uppercase px-3 py-2.5 text-sm font-semibold text-foreground border-x border-border/40">
        {row.location || '---'}
      </TableCell>
      <TableCell className={cn("px-3 py-2.5 text-center text-sm font-semibold", row.statusLabel === 'NO KIND' ? "text-red-500" : "text-foreground")}>{row.kind || '---'}</TableCell>
      <TableCell className="px-3 py-2.5 text-center">
        <span className={cn("text-xs font-semibold uppercase text-muted-foreground", row.statusLabel === 'NO AU' && "text-red-500")}>
          {row.au || '---'}
        </span>
      </TableCell>
      <TableCell className={cn(
        "text-right tabular-nums px-3 py-2.5 text-sm border-l border-border/40", 
        row.statusLabel === 'AREA ERROR' ? "text-red-600 font-bold" : (row.statusLabel === 'INCOMPLETE' && row.landArea === 0 ? "text-red-600 font-semibold" : "text-foreground font-medium")
      )}>
        <div className="flex items-center justify-end gap-1.5">
          {row.statusLabel === 'AREA ERROR' && <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
          {row.landArea?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}
        </div>
      </TableCell>
      
      {/* 2028 Current Group */}
      <TableCell className="text-right tabular-nums px-3 py-2.5 text-sm text-muted-foreground border-l border-border bg-muted/20">
        {isProcessed && row.unitValue2028 ? `₱${row.unitValue2028.toLocaleString()}` : '---'}
      </TableCell>
      <TableCell className="text-right tabular-nums px-3 py-2.5 text-sm text-muted-foreground bg-muted/20">
        {isProcessed ? `₱${row.marketValue2028?.toLocaleString() || '0'}` : '---'}
      </TableCell>
      <TableCell className="text-right tabular-nums px-3 py-2.5 text-sm text-muted-foreground bg-muted/20">
        {isProcessed ? `₱${row.assessedValue2028?.toLocaleString() || '0'}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm font-semibold bg-muted/20", isProcessed ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground font-normal")}>
        {isProcessed ? `₱${row.yearlyTax2028?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` : '---'}
      </TableCell>

      {/* Deferred (2011 GR / 2012 SMV) Group */}
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm border-l border-border", isProcessed ? "text-foreground" : "text-muted-foreground")}>
        {isProcessed && row.unitValueDeferred ? `₱${row.unitValueDeferred.toLocaleString()}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm", isProcessed ? "text-foreground" : "text-muted-foreground")}>
        {isProcessed && row.marketValueDeferred ? `₱${row.marketValueDeferred.toLocaleString()}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm", isProcessed ? "text-foreground" : "text-muted-foreground")}>
        {isProcessed && row.assessedValueDeferred ? `₱${row.assessedValueDeferred.toLocaleString()}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm font-semibold", isProcessed ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground font-normal")}>
        {isProcessed && row.yearlyTaxDeferred !== undefined && (row.marketValueDeferred || 0) > 0
          ? `₱${row.yearlyTaxDeferred.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '---'}
      </TableCell>

      {/* 2029 RPVARA Group */}
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm border-l border-border bg-muted/15", isProcessed ? "font-medium text-foreground" : "text-muted-foreground")}>
        {isProcessed && displayUnitValue ? `₱${displayUnitValue.toLocaleString()}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm bg-muted/15", isProcessed ? "font-medium text-foreground" : "text-muted-foreground")}>
        {isProcessed ? `₱${displayMarketValue?.toLocaleString() || '0'}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm bg-muted/15", isProcessed ? "font-medium text-foreground" : "text-muted-foreground")}>
        {isProcessed ? `₱${displayAssessedValue?.toLocaleString() || '0'}` : '---'}
      </TableCell>
      <TableCell className={cn("text-right tabular-nums px-3 py-2.5 text-sm border-r border-border bg-muted/15", isProcessed ? "font-bold text-[#12A249]" : "text-muted-foreground")}>
        {isProcessed ? `₱${displayYearlyTax?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` : '---'}
      </TableCell>
      
      <TableCell className="text-center px-3 py-2.5 whitespace-nowrap">
        {getStatusBadge()}
      </TableCell>
    </TableRow>
  );
});

RecordRow.displayName = 'RecordRow';

export function DataPreviewTable({ data, isProcessed = false, onRowClick, showLabels = false, workflowMode = 'standard', statusFilter = 'all', onStatusFilterChange, statusOptions }: DataPreviewTableProps) {
  const [displayLimit, setDisplayLimit] = useState(350);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const { showSuccessToast } = useNotification();

  // Assessors Desk-style per-column header search, dropdown filter & sort state
  const [openHeader, setOpenHeader] = useState<string | null>(null);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [colSort, setColSort] = useState<{ field: 'date' | 'arpNo' | 'pin' | 'landArea'; dir: 'asc' | 'desc' } | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const headerContainerRef = useRef<HTMLTableSectionElement>(null);

  const applyColSort = (nextSort: { field: 'date' | 'arpNo' | 'pin' | 'landArea'; dir: 'asc' | 'desc' } | null) => {
    setOpenHeader(null);
    setIsSorting(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setColSort(nextSort);
        requestAnimationFrame(() => setIsSorting(false));
      }, 16);
    });
  };

  useEffect(() => {
    if (!openHeader) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (headerContainerRef.current && !headerContainerRef.current.contains(target)) {
        setOpenHeader(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenHeader(null);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [openHeader]);

  const setColFilter = (key: string, val: string) => {
    setColFilters(prev => {
      if (!val || val === 'all') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: val };
    });
  };

  const activeColFilterCount = Object.keys(colFilters).length + (colSort ? 1 : 0);
  const clearAllColFilters = () => {
    setColFilters({});
    setColSort(null);
    setOpenHeader(null);
  };

  const uniqueColumnOptions = useMemo(() => {
    if (workflowMode !== 'standard') return { updates: [] as string[], kinds: [] as string[], aus: [] as string[] };
    const updates = new Set<string>();
    const kinds = new Set<string>();
    const aus = new Set<string>();
    data.forEach(r => {
      if (r.update?.trim()) updates.add(r.update.trim().toUpperCase());
      if (r.kind?.trim()) kinds.add(r.kind.trim().toUpperCase());
      if (r.au?.trim()) aus.add(r.au.trim().toUpperCase());
    });
    return {
      updates: Array.from(updates).sort(),
      kinds: Array.from(kinds).sort(),
      aus: Array.from(aus).sort(),
    };
  }, [data, workflowMode]);

  const filteredTableData = useMemo(() => {
    if (workflowMode !== 'standard') return data;
    const entries = Object.entries(colFilters).filter(([, v]) => v.trim().length > 0);
    const stripPunct = (s: string) => s.replace(/[-\s_./]/g, '');

    let list = entries.length === 0 ? data : data.filter(row => {
      return entries.every(([key, rawVal]) => {
        const q = rawVal.trim().toLowerCase();
        if (key === 'update' || key === 'taxability' || key === 'kind' || key === 'au') {
          return String((row as any)[key] || '').trim().toLowerCase() === q;
        }
        const cellVal = String((row as any)[key] ?? '').toLowerCase();
        if (cellVal.includes(q)) return true;
        const cleanQ = stripPunct(q);
        return cleanQ.length >= 2 && stripPunct(cellVal).includes(cleanQ);
      });
    });

    if (colSort) {
      const { field, dir } = colSort;
      const mult = dir === 'asc' ? 1 : -1;
      // Pre-compute sort keys once per row (Schwartzian transform) for fast sorting on 50k+ rows
      const keyed = list.map((row) => {
        let key: number | string;
        if (field === 'landArea') {
          key = Number(row.landArea) || 0;
        } else if (field === 'date') {
          key = Date.parse(row.date || '') || 0;
        } else {
          key = String((row as any)[field] || '');
        }
        return { row, key };
      });
      keyed.sort((a, b) => {
        if (a.key < b.key) return -1 * mult;
        if (a.key > b.key) return 1 * mult;
        return 0;
      });
      list = keyed.map(k => k.row);
    }
    return list;
  }, [data, colFilters, colSort, workflowMode]);

  const threeYearStats = useMemo(() => {
    if (workflowMode !== 'three-year-report') return null;
    return calculateThreeYearStats(data as any[]);
  }, [data, workflowMode]);
  const fmtStats = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const BATCH_SIZE = 350;

  const handleLoadMore = () => {
    const nextBatchSize = Math.min(BATCH_SIZE, filteredTableData.length - displayLimit);
    setDisplayLimit(prev => prev + BATCH_SIZE);
    showSuccessToast(`Loaded ${nextBatchSize} additional records successfully.`);
  };

  const handleLoadAllClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmLoadAll = () => {
    setIsConfirmOpen(false);
    setIsBulkLoading(true);
    
    setTimeout(() => {
      const remainingCount = filteredTableData.length - displayLimit;
      setDisplayLimit(filteredTableData.length);
      setIsBulkLoading(false);
      showSuccessToast(`Loaded all ${remainingCount} remaining records successfully.`);
    }, 600);
  };

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm uppercase font-black opacity-30 tracking-widest">Awaiting Data Import</p>
      </div>
    );
  }

  const visibleData = filteredTableData.slice(0, displayLimit);
  const hasMore = filteredTableData.length > displayLimit;
  const nextBatchSize = Math.min(BATCH_SIZE, filteredTableData.length - displayLimit);

  const hasComparisons = data.some(r => r.isComparisonInjected);

  const yearLabel = isProcessed ? "2029" : "2028";
  const taxSuffix = !isProcessed ? " (CAPPED @ 6%)" : "";

  const renderSearchHeader = (
    key: string,
    label: string,
    placeholder: string,
    opts?: {
      align?: 'left' | 'center' | 'right';
      sortField?: 'date' | 'arpNo' | 'pin' | 'landArea';
      sortOptions?: { dir: 'desc' | 'asc'; label: string }[];
    }
  ) => {
    const query = colFilters[key] || '';
    const isOpen = openHeader === key;
    const isSorted = opts?.sortField && colSort?.field === opts.sortField;
    const isActive = Boolean(query) || Boolean(isSorted);
    const showInput = isOpen || Boolean(query);
    const alignClass = opts?.align === 'right' ? 'justify-end' : opts?.align === 'center' ? 'justify-center' : 'justify-start';

    return (
      <div className="relative flex w-full h-full items-center">
        {showInput ? (
          <div className="flex w-full items-center gap-0.5 px-1.5 py-1">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#12A249]" />
              <input
                type="text"
                autoFocus={isOpen}
                value={query}
                onChange={(e) => setColFilter(key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); setOpenHeader(null); }
                  if (e.key === 'Escape') { e.preventDefault(); setColFilter(key, ''); setOpenHeader(null); }
                }}
                placeholder={placeholder}
                className="w-full min-w-0 h-7 rounded-md border border-[#12A249] bg-background pl-7 pr-6 text-xs font-medium uppercase text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-[#12A249]"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setColFilter(key, ''); setOpenHeader(null); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Clear ${label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full h-full items-center">
            <button
              type="button"
              onClick={() => setOpenHeader(key)}
              className={cn(
                "flex-1 min-w-0 h-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors hover:bg-muted/80",
                alignClass,
                isActive ? "text-[#12A249] font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title={`Click to search${opts?.sortOptions ? ' or sort' : ''} ${label}`}
            >
              <span className="truncate">{label}</span>
            </button>
            {isSorted && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); applyColSort(null); }}
                className="shrink-0 mr-1.5 rounded p-0.5 text-[#12A249] hover:bg-muted hover:text-foreground transition-colors"
                title={`Clear ${label} sort`}
                aria-label={`Clear ${label} sort`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {isOpen && opts?.sortField && opts.sortOptions && (
          <div className="absolute left-0 top-full z-50 mt-1 w-max min-w-[205px] rounded-xl border border-border bg-card p-1.5 text-left shadow-xl normal-case font-normal space-y-0.5">
            {opts.sortOptions.map(opt => {
              const selected = colSort?.field === opts.sortField && colSort?.dir === opt.dir;
              return (
                <button
                  key={opt.dir}
                  type="button"
                  onClick={() => {
                    applyColSort(selected ? null : { field: opts.sortField!, dir: opt.dir });
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs uppercase whitespace-nowrap transition-colors cursor-pointer",
                    selected
                      ? "bg-[#12A249] font-bold text-white"
                      : "font-medium text-foreground/80 hover:bg-muted"
                  )}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <span className="inline-flex items-center gap-1.5 shrink-0">
                      <Check className="h-3.5 w-3.5 text-white" />
                      <X className="h-3.5 w-3.5 text-white/90 hover:text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderDropdownHeader = (
    key: string,
    defaultLabel: string,
    allLabel: string,
    options: { value: string; label: string }[]
  ) => {
    const current = colFilters[key] || 'all';
    const isFiltered = current !== 'all';
    const activeLabel = isFiltered
      ? (options.find(o => o.value === current)?.label || current)
      : defaultLabel;

    return (
      <div className="flex w-full h-full items-center">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex-1 min-w-0 h-full flex items-center justify-center text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors px-2 py-2 hover:bg-muted/80",
                isFiltered ? "text-[#12A249] font-bold" : "text-muted-foreground hover:text-foreground"
              )}
              title={`Click to filter by ${defaultLabel}`}
            >
              <span className="truncate">{activeLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={2}
            className="min-w-[160px] w-[var(--radix-dropdown-menu-trigger-width)] max-h-72 overflow-y-auto p-1.5 rounded-xl bg-card border border-border shadow-xl space-y-0.5"
          >
            <DropdownMenuItem
              onSelect={() => setColFilter(key, 'all')}
              className={cn(
                "cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                current === 'all'
                  ? "bg-[#12A249] text-white font-semibold focus:bg-[#12A249] focus:text-white"
                  : "text-foreground/80 font-medium hover:bg-muted focus:bg-muted"
              )}
            >
              <span>{allLabel}</span>
              {current === 'all' && <Check className="w-4 h-4 text-white shrink-0" />}
            </DropdownMenuItem>
            {options.map(opt => {
              const isSelected = current === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setColFilter(key, isSelected ? 'all' : opt.value)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg text-sm uppercase transition-colors",
                    isSelected
                      ? "bg-[#12A249] text-white font-semibold focus:bg-[#12A249] focus:text-white"
                      : "text-foreground/80 font-medium hover:bg-muted focus:bg-muted"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1.5 shrink-0">
                      <Check className="w-4 h-4 text-white" />
                      <X className="w-3.5 h-3.5 text-white/90" />
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        {isFiltered && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setColFilter(key, 'all'); }}
            className="shrink-0 mr-1 rounded p-0.5 text-[#12A249] hover:bg-muted hover:text-foreground transition-colors"
            title={`Clear ${defaultLabel} filter`}
            aria-label={`Clear ${defaultLabel} filter`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  const renderStatusHeader = (defaultLabel: string) => {
    if (!onStatusFilterChange || !statusOptions) {
      return defaultLabel;
    }
    const isFiltered = statusFilter !== 'all';
    const activeLabel = isFiltered
      ? (statusOptions.find(o => o.value === statusFilter)?.label || statusFilter)
      : defaultLabel;

    return (
      <div className="flex w-full h-full items-center">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex-1 min-w-0 h-full flex items-center justify-center text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors px-2 py-1.5 rounded-md hover:bg-muted/80",
                isFiltered ? "text-[#12A249]" : "text-foreground/80 hover:text-foreground"
              )}
              title="Click to filter by status"
            >
              <span className="truncate">{activeLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={2}
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[190px] p-1.5 rounded-xl bg-card border border-border shadow-xl space-y-0.5"
          >
            <DropdownMenuItem
              onSelect={() => onStatusFilterChange('all')}
              className={cn(
                "cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                statusFilter === 'all'
                  ? "bg-[#12A249] text-white font-semibold focus:bg-[#12A249] focus:text-white"
                  : "text-foreground/80 font-medium hover:bg-muted focus:bg-muted"
              )}
            >
              <span>All statuses</span>
              {statusFilter === 'all' && <Check className="w-4 h-4 text-white shrink-0" />}
            </DropdownMenuItem>
            {statusOptions.map(opt => {
              const isSelected = statusFilter === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => onStatusFilterChange(isSelected ? 'all' : opt.value)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg text-sm uppercase transition-colors",
                    isSelected
                      ? "bg-[#12A249] text-white font-semibold focus:bg-[#12A249] focus:text-white"
                      : "text-foreground/80 font-medium hover:bg-muted focus:bg-muted"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1.5 shrink-0">
                      <Check className="w-4 h-4 text-white" />
                      <X className="w-3.5 h-3.5 text-white/90" />
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        {isFiltered && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onStatusFilterChange('all'); }}
            className="shrink-0 mr-1.5 rounded p-0.5 text-[#12A249] hover:bg-muted hover:text-foreground transition-colors"
            title="Clear status filter"
            aria-label="Clear status filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-card overflow-hidden" suppressHydrationWarning>
      {isSorting && (
        <div className="absolute inset-0 z-[90] bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-card px-5 py-3 rounded-xl border border-border shadow-lg flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-[#12A249] animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Sorting records...</span>
          </div>
        </div>
      )}

      {isBulkLoading && (
        <div className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-card p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center">
            <Loader2 className="w-14 h-14 text-primary animate-spin mb-6" />
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Rendering Large Dataset...</h3>
            <p className="text-muted-foreground font-bold mt-2">This may take a moment depending on your device performance.</p>
          </div>
        </div>
      )}

      {workflowMode === 'abstract' && (
        <div className="px-4 py-2 bg-blue-500/10 border-b flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
            Relational Preview: Showing Journal transactions enriched with Assessment Roll parcel details and Cancelled references.
          </p>
        </div>
      )}

      {workflowMode === 'building-permit' && (
        <div className="px-4 py-2 bg-orange-500/10 border-b flex items-center gap-2">
          <HardHat className="w-3.5 h-3.5 text-orange-600" />
          <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
            Building Permit Preview: Linking orange permit logs with the Assessment Roll reference roll. Use 'Under Review' labels to verify ambiguous matches.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-auto border-t scrollbar-custom" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Table 
          className="text-sm min-w-[2700px] select-none border-separate border-spacing-0"
          wrapperClassName="overflow-visible" 
        >
          <TableHeader ref={headerContainerRef} className="bg-card sticky top-0 z-20 shadow-sm">
            {workflowMode === 'three-year-report' ? (
              <>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead rowSpan={2} className="w-14 text-center font-black bg-card border-r h-auto py-2">#</TableHead>
                  <TableHead rowSpan={2} className="min-w-[120px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    Kind of Property<br/><span className="text-muted-foreground font-normal">(1)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[200px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    Name of New Owner<br/><span className="text-muted-foreground font-normal">(2)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    ARPN/PIN<br/><span className="text-muted-foreground font-normal">(3)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[250px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    Location<br/><span className="text-muted-foreground font-normal">(4)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    Classification<br/><span className="text-muted-foreground font-normal">(5)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[180px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    Sub-class/Type of Bldg.<br/><span className="text-muted-foreground font-normal">(6)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[120px] font-black text-center uppercase bg-card border-l h-auto py-2">
                    Area<br/><span className="text-muted-foreground font-normal">(7)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px] font-black text-center uppercase bg-card border-l h-auto py-2 text-emerald-700">
                    Selling Price<br/><span className="text-muted-foreground font-normal">(8)</span>
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px] font-black text-center uppercase bg-card border-l h-auto py-2 text-emerald-700">
                    Sales Value<br/><span className="text-muted-foreground font-normal text-[9px]">(Peso/Per Sqm)</span><br/><span className="text-muted-foreground font-normal">(9)</span>
                  </TableHead>
                  <TableHead colSpan={3} className="text-center font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-x border-b-0 border-emerald-100 dark:border-emerald-900 h-auto py-2">
                    Sales Value
                  </TableHead>
                  <TableHead rowSpan={2} className="w-36 text-center font-black uppercase bg-card h-auto py-2">{renderStatusHeader('Record Status')}</TableHead>
                </TableRow>
                <TableRow className="hover:bg-transparent border-b-2">
                  <TableHead className="min-w-[100px] text-center font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-l border-emerald-100 dark:border-emerald-900 h-auto py-2">
                    Lowest
                    {threeYearStats && <><br/><span className="text-emerald-700 dark:text-emerald-400 font-bold text-[9px]">({fmtStats(threeYearStats.lowestMin)} - {fmtStats(threeYearStats.lowestMax)})</span></>}
                    <br/><span className="text-muted-foreground font-normal">(10)</span>
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-l border-emerald-100 dark:border-emerald-900 h-auto py-2">
                    Median
                    {threeYearStats && <><br/><span className="text-emerald-700 dark:text-emerald-400 font-bold text-[9px]">({fmtStats(threeYearStats.medianMin)} - {fmtStats(threeYearStats.medianMax)})</span></>}
                    <br/><span className="text-muted-foreground font-normal">(11)</span>
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-x border-emerald-100 dark:border-emerald-900 h-auto py-2">
                    Highest
                    {threeYearStats && <><br/><span className="text-emerald-700 dark:text-emerald-400 font-bold text-[9px]">({fmtStats(threeYearStats.highestMin)} - {fmtStats(threeYearStats.highestMax)})</span></>}
                    <br/><span className="text-muted-foreground font-normal">(12)</span>
                  </TableHead>
                </TableRow>
              </>
            ) : workflowMode === 'abstract' ? (
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="w-14 text-center font-black bg-card border-r">#</TableHead>
                <TableHead className="min-w-[150px] font-black uppercase bg-card border-l">ARP NO.</TableHead>
                <TableHead className="min-w-[120px] font-black uppercase bg-card">CONVEYANCE DATE</TableHead>
                <TableHead className="min-w-[220px] font-black uppercase bg-card border-l">OWNERSHIP TRANSFER FROM</TableHead>
                <TableHead className="min-w-[250px] font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-l border-emerald-100 dark:border-emerald-900">OWNERSHIP TRANSFER (TO)</TableHead>
                <TableHead className="min-w-[250px] font-black uppercase bg-card border-l">NEW OWNER ADDRESS</TableHead>
                <TableHead className="min-w-[200px] font-black uppercase bg-card border-l">PROPERTY LOCATION</TableHead>
                <TableHead className="min-w-[150px] text-center font-black uppercase bg-card border-l">MODE OF CONVEYANCE</TableHead>
                <TableHead className="min-w-[180px] text-right font-black uppercase bg-card border-l text-emerald-700">AMOUNT OF CONSIDERATION</TableHead>
                <TableHead className="min-w-[50px] text-center font-black uppercase bg-card border-l">L</TableHead>
                <TableHead className="min-w-[50px] text-center font-black uppercase bg-card border-l">B</TableHead>
                <TableHead className="min-w-[50px] text-center font-black uppercase bg-card border-l">M</TableHead>
                <TableHead className="min-w-[120px] text-right font-black uppercase bg-card border-l">AREA (sqm)</TableHead>
                <TableHead className="min-w-[100px] text-center font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-l border-emerald-100 dark:border-blue-900">LOT NO.</TableHead>
                <TableHead className="min-w-[120px] text-center font-black uppercase bg-card border-l">TITLE NO. (PREV)</TableHead>
                <TableHead className="min-w-[120px] text-center font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-l border-emerald-100 dark:border-blue-900">TITLE NO. (NEW)</TableHead>
                <TableHead className="min-w-[140px] font-black uppercase bg-card border-l">NOTARIAL DATE</TableHead>
                <TableHead className="min-w-[180px] font-black uppercase bg-card border-l">DOCUMENT FILE NO.</TableHead>
                <TableHead className="min-w-[220px] font-black uppercase bg-card border-l">NOTARY / AGENT</TableHead>
                <TableHead className="min-w-[140px] text-center font-black uppercase bg-card border-l">{renderStatusHeader('JOIN STATUS')}</TableHead>
              </TableRow>
            ) : workflowMode === 'building-permit' ? (
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="w-14 text-center font-black bg-card border-r">#</TableHead>
                <TableHead className="min-w-[120px] font-black uppercase bg-card">DATE ISSUED</TableHead>
                <TableHead className="min-w-[150px] font-black uppercase bg-card">PERMIT NO.</TableHead>
                <TableHead className="min-w-[200px] font-black uppercase bg-card">BARANGAY</TableHead>
                <TableHead className="min-w-[150px] font-black uppercase bg-emerald-50 dark:bg-emerald-950 border-l border-emerald-100">ARP/TDN (ROLL)</TableHead>
                <TableHead className="min-w-[220px] font-black uppercase bg-card border-l">PERMITTEE ADDRESS</TableHead>
                <TableHead className="min-w-[200px] font-black uppercase bg-card border-l">LOCATION</TableHead>
                <TableHead className="min-w-[180px] font-black uppercase bg-card border-l">OCCUPANCY</TableHead>
                <TableHead className="min-w-[120px] text-right font-black uppercase bg-card border-l">FLOOR AREA (ROLL)</TableHead>
                <TableHead className="min-w-[180px] text-right font-black uppercase bg-card border-l text-emerald-700">EST. COST</TableHead>
                <TableHead className="min-w-[100px] text-center font-black uppercase bg-card border-l">CLASS (ROLL)</TableHead>
                <TableHead className="min-w-[180px] font-black uppercase bg-card border-l">MATCH REF (ROLL)</TableHead>
                <TableHead className="min-w-[140px] text-center font-black uppercase bg-card border-l">{renderStatusHeader('MATCH STATUS')}</TableHead>
              </TableRow>
            ) : (
              <>
                <TableRow className="hover:bg-transparent">
                  <TableHead rowSpan={2} className="w-12 text-center text-xs font-semibold bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-r border-b border-border h-auto py-2.5 whitespace-nowrap">#</TableHead>
                  <TableHead rowSpan={2} className="min-w-[120px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('date', 'Date', 'MM/DD/YYYY', { sortField: 'date', sortOptions: [{ dir: 'desc', label: 'New to Old' }, { dir: 'asc', label: 'Old to New' }] })}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[145px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('arpNo', 'ARP No#', 'SEARCH ARP...', { sortField: 'arpNo', sortOptions: [{ dir: 'desc', label: 'Highest to Lowest' }, { dir: 'asc', label: 'Lowest to Highest' }] })}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[205px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('pin', 'PIN', 'SEARCH PIN...', { sortField: 'pin', sortOptions: [{ dir: 'asc', label: 'Ascending' }, { dir: 'desc', label: 'Descending' }] })}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('previous', 'Previous', 'SEARCH PREV...')}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[135px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('newArpNo', 'New ARP#', 'SEARCH NEW...')}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[90px] p-0 text-center bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderDropdownHeader('update', 'Update', 'All updates', uniqueColumnOptions.updates.map(u => ({ value: u.toLowerCase(), label: u })))}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[75px] p-0 text-center bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderDropdownHeader('taxability', 'Tax', 'All', [{ value: 't', label: 'T (Taxable)' }, { value: 'e', label: 'E (Exempt)' }])}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[210px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('acctName', 'Account Name', 'SEARCH OWNER...')}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[230px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('address', 'Address', 'SEARCH ADDRESS...')}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[210px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-x border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('location', 'Location', 'SEARCH LOCATION...')}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[75px] p-0 text-center bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderDropdownHeader('kind', 'Kind', 'All kinds', uniqueColumnOptions.kinds.map(k => ({ value: k.toLowerCase(), label: k })))}
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-[85px] p-0 text-center bg-[#F7F8FA] dark:bg-zinc-900 border-b border-border h-auto whitespace-nowrap">
                    {renderDropdownHeader('au', 'AU', 'All AU', uniqueColumnOptions.aus.map(a => ({ value: a.toLowerCase(), label: a })))}
                  </TableHead>
                  <TableHead rowSpan={2} className="text-right min-w-[125px] p-0 bg-[#F7F8FA] dark:bg-zinc-900 border-l border-b border-border h-auto whitespace-nowrap">
                    {renderSearchHeader('landArea', 'Area (sqm)', 'SEARCH AREA...', { align: 'right', sortField: 'landArea', sortOptions: [{ dir: 'desc', label: 'Highest to Lowest' }, { dir: 'asc', label: 'Lowest to Highest' }] })}
                  </TableHead>
                  <TableHead colSpan={4} className="text-center text-xs font-bold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-l border-b border-border h-auto py-1.5 whitespace-nowrap">
                    2028 — Current (Capped @ 6%)
                  </TableHead>
                  <TableHead colSpan={4} className="text-center text-xs font-bold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border-l border-b border-border h-auto py-1.5 whitespace-nowrap">
                    Deferred (2011 GR)
                  </TableHead>
                  <TableHead colSpan={4} className="text-center text-xs font-bold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-[#12A249] border-l border-r border-b border-border h-auto py-1.5 whitespace-nowrap">
                    {yearLabel} — {isProcessed ? 'RPVARA' : 'Baseline'}
                  </TableHead>
                  <TableHead rowSpan={2} className="w-[190px] min-w-[190px] p-0 text-center text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto whitespace-nowrap">{renderStatusHeader('Status')}</TableHead>
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right min-w-[115px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-l border-b border-border h-auto py-1.5 whitespace-nowrap">Unit</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto py-1.5 whitespace-nowrap">Market</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto py-1.5 whitespace-nowrap">Assessed</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-b border-border h-auto py-1.5 whitespace-nowrap">Tax (Cap)</TableHead>
                  <TableHead className="text-right min-w-[115px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-l border-b border-border h-auto py-1.5 whitespace-nowrap">Unit</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto py-1.5 whitespace-nowrap">Market</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto py-1.5 whitespace-nowrap">Assessed</TableHead>
                  <TableHead className="text-right min-w-[130px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border-b border-border h-auto py-1.5 whitespace-nowrap">Tax (Deferred)</TableHead>
                  <TableHead className="text-right min-w-[115px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-l border-b border-border h-auto py-1.5 whitespace-nowrap">Unit</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto py-1.5 whitespace-nowrap">Market</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-muted-foreground border-b border-border h-auto py-1.5 whitespace-nowrap">Assessed</TableHead>
                  <TableHead className="text-right min-w-[125px] text-xs font-semibold uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-900 text-[#12A249] border-r border-b border-border h-auto py-1.5 whitespace-nowrap">Tax{taxSuffix}</TableHead>
                </TableRow>
              </>
            )}
          </TableHeader>
          <TableBody>
            {visibleData.map((row, i) => (
              <RecordRow 
                key={row.id} 
                row={row} 
                index={i} 
                isProcessed={isProcessed}
                onRowClick={onRowClick} 
                showLabels={showLabels}
                workflowMode={workflowMode}
                threeYearStats={threeYearStats}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-4 py-2 bg-muted/30 border-t shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            SHOWING {visibleData.length.toLocaleString()} / {filteredTableData.length.toLocaleString()} TOTAL ROWS
          </div>
          {activeColFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllColFilters}
              className="h-7 px-2.5 text-xs font-semibold text-foreground hover:text-red-600 gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Column Filters ({activeColFilterCount})
            </Button>
          )}
        </div>
        {hasMore && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoadMore}
              className="text-xs font-bold uppercase tracking-wider bg-[#16A249] text-white border-[#138a3e] hover:bg-[#138a3e] hover:text-white h-8 shadow-sm px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Load More ({nextBatchSize} records)
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLoadAllClick}
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground h-8 px-3"
            >
              Load All
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Performance Warning</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-bold text-muted-foreground leading-relaxed">
              You are about to load <span className="text-primary font-black underline decoration-primary/30 underline-offset-4">{data.length.toLocaleString()}</span> records simultaneously. 
              This may cause the application to lag or slow down significantly depending on your device's performance. 
              Do you wish to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="font-black uppercase text-xs h-10 px-6 hover:bg-muted hover:text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLoadAll}
              className="bg-primary hover:bg-emerald-800 font-black uppercase text-xs h-10 px-8"
            >
              Confirm Load All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
