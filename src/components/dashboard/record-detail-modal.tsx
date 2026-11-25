"use client";

import React, { useState, useEffect } from 'react';
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
import { LandRecord, validateRecord, ValidationError, getModeOfConveyance } from '@/lib/processor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Save, Edit3, Archive, RotateCcw, ArrowRightLeft,
  Link2, Unlink2, AlertCircle, HardHat, TrendingUp, Trash2, X,
  FileText, Calculator, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label: string;
  field: keyof LandRecord;
  value: any;
  isEditing: boolean;
  isMono?: boolean;
  type?: string;
  uppercase?: boolean;
  errors?: ValidationError[];
  onChange: (field: keyof LandRecord, value: any) => void;
  displayOverride?: string;
  accent?: string;
}

const FieldItem = ({
  label,
  field,
  value,
  isEditing,
  isMono = false,
  type = "text",
  uppercase = false,
  errors,
  onChange,
  displayOverride,
  accent,
}: EditableFieldProps) => {
  const error = errors?.find(e => e.field === field);
  const hasError = !!error;
  const inputVal = (type === "number" && value === 0) ? "" : (value ?? "");
  const viewText = displayOverride ?? (value !== undefined && value !== null && String(value).trim() !== "" ? String(value) : "—");

  if (!isEditing) {
    return (
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <span>{label}</span>
          {hasError && <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
        </p>
        <p
          className={cn(
            "text-sm font-semibold text-foreground break-words leading-snug",
            isMono && "tabular-nums",
            uppercase && "uppercase",
            hasError && "text-red-600",
            accent
          )}
        >
          {viewText}
        </p>
        {hasError && (
          <p className="text-xs text-red-600 font-medium leading-snug">{error.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1 min-w-0">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <span>{label}</span>
        {hasError && <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
      </label>
      <Input
        type={type}
        value={inputVal}
        onChange={(e) => onChange(field, e.target.value)}
        className={cn(
          "h-8 text-sm font-medium bg-background",
          isMono && "tabular-nums",
          uppercase && "uppercase",
          hasError && "border-red-500 focus-visible:ring-red-500"
        )}
      />
      {hasError && (
        <p className="text-xs text-red-600 font-medium leading-snug">{error.message}</p>
      )}
    </div>
  );
};

const StaticItem = ({ label, value, isMono = false, accent }: { label: string; value: string; isMono?: boolean; accent?: string }) => (
  <div className="space-y-0.5 min-w-0">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className={cn("text-sm font-semibold text-foreground break-words leading-snug", isMono && "tabular-nums", accent)}>
      {value || "—"}
    </p>
  </div>
);

const fmtCurrency = (value?: number | string, decimals = 2) => {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "string") return value;
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

const KIND_LABELS: Record<string, string> = {
  L: "Land (L)",
  B: "Building (B)",
  M: "Machinery (M)",
};

interface RecordDetailModalProps {
  record: LandRecord | null;
  comparisonRecord?: LandRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedRecord: LandRecord) => void;
  onArchive?: (record: LandRecord) => void;
  onUnarchive?: (record: LandRecord) => void;
  onDelete?: (record: LandRecord) => void;
  workflowMode?: string;
  isProcessed?: boolean;
}

export function RecordDetailModal({
  record,
  comparisonRecord,
  open,
  onOpenChange,
  onSave,
  onArchive,
  onUnarchive,
  onDelete,
  workflowMode,
  isProcessed = false,
}: RecordDetailModalProps) {
  const [editedRecord, setEditedRecord] = useState<LandRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (record) {
      setEditedRecord({ ...record });
      setIsEditing(false);
    } else {
      setEditedRecord(null);
      setIsEditing(false);
    }
  }, [record]);

  if (!open || !editedRecord) return null;

  const r = editedRecord as any;
  const isAbstract = workflowMode === 'abstract';
  const isPermit = workflowMode === 'building-permit';
  const isThreeYear = workflowMode === 'three-year-report';
  const isSpecial = isAbstract || isPermit || isThreeYear;

  const handleChange = (field: keyof LandRecord, value: any) => {
    let v = value;
    if (field === 'landArea' || field === 'unitValue' || field === 'marketValue' || field === 'estimatedCost') {
      v = value === "" ? 0 : Number(value);
    }
    const updated = { ...editedRecord, [field]: v };
    if (field === 'landArea' || field === 'unitValue') {
      updated.marketValue = (Number(updated.landArea) || 0) * (Number(updated.unitValue) || 0);
    }
    const errors = validateRecord(updated);
    updated.errors = errors;
    updated.isValid = errors.length === 0;
    setEditedRecord(updated);
  };

  const handleAnyChange = (field: string, value: any) => {
    setEditedRecord(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleCancelEdit = () => {
    if (record) setEditedRecord({ ...record });
    setIsEditing(false);
  };

  const handleCommitSave = () => {
    onSave?.(editedRecord);
    setIsEditing(false);
  };

  const getStatusIndicator = () => {
    if (isPermit) {
      if (r.isUnderReview) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600"><AlertCircle className="w-3.5 h-3.5" /> Under Review</span>;
      if (r.isPotentialMatch) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><AlertCircle className="w-3.5 h-3.5" /> Potential Match</span>;
      return r.isJoined
        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A249]"><Link2 className="w-3.5 h-3.5" /> Matched</span>
        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><Unlink2 className="w-3.5 h-3.5" /> Unlinked</span>;
    }
    if (isThreeYear) {
      if (r.isUnderReview) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600"><AlertCircle className="w-3.5 h-3.5" /> Under Review</span>;
      return r.isJoined
        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600"><Link2 className="w-3.5 h-3.5" /> Linked</span>
        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><Unlink2 className="w-3.5 h-3.5" /> Unlinked</span>;
    }
    if (isAbstract) {
      return r.isJoined
        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A249]"><Link2 className="w-3.5 h-3.5" /> Linked</span>
        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">Unlinked</span>;
    }
    if (!editedRecord.isValid) {
      return <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-red-600"><AlertTriangle className="w-3.5 h-3.5" /> {editedRecord.statusLabel || "Invalid"}</span>;
    }
    if (editedRecord.isCleanup || editedRecord.isManualArchive) {
      return <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-orange-600">{editedRecord.isManualArchive ? "Archived" : (editedRecord.cleanupReason || "Cleanup")}</span>;
    }
    if (editedRecord.isDuplicate) {
      return <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-red-600">Duplicate</span>;
    }
    return <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#16A249]">Valid</span>;
  };

  const isInArchive = editedRecord.isManualArchive || editedRecord.isCleanup || editedRecord.isDuplicate;
  const headerRef = isPermit
    ? (r.buildingPermitNo || "—")
    : (editedRecord.arpNo || editedRecord.pin || "—");

  const headerIcon = isPermit
    ? <HardHat className="w-4 h-4 text-[#16A249] shrink-0" />
    : isThreeYear
      ? <TrendingUp className="w-4 h-4 text-violet-600 shrink-0" />
      : <FileText className="w-4 h-4 text-[#16A249] shrink-0" />;

  const kindKey = (editedRecord.kind || "").trim().toUpperCase();
  const kindDisplay = KIND_LABELS[kindKey] || editedRecord.kind || "—";
  const taxDisplay = editedRecord.taxability === 'E' ? 'Exempted (E)' : 'Taxable (T)';

  return (
    <aside
      className="w-[410px] xl:w-[450px] shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0 flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground min-w-0">
            {headerIcon}
            <span className="shrink-0">Record Details</span>
            <span className="text-muted-foreground font-normal">/</span>
            <span className="text-[#16A249] tabular-nums truncate" title={headerRef}>{headerRef}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background">
              {getStatusIndicator()}
            </span>
            {editedRecord.barangayName && (
              <span className="text-xs font-medium text-muted-foreground truncate">
                {editedRecord.barangayName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2.5 text-xs font-semibold gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Close details panel"
            aria-label="Close details panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto scrollbar-vertical-custom px-4 py-4 space-y-5">
        {/* ABSTRACT panel */}
        {isAbstract && (
          <section className="space-y-3 pb-4 border-b border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Ownership Transfer
            </h4>
            <div className="rounded-lg border border-border bg-background p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StaticItem label="Transfer From" value={r.cancelledOwner || "—"} />
                <StaticItem label="Prev Title No." value={r.cancelledTctNo || "—"} isMono />
              </div>
              <div className="border-t border-border pt-2.5 grid grid-cols-2 gap-3">
                <StaticItem label="Transfer To" value={editedRecord.acctName || "—"} />
                <StaticItem label="New Title No." value={r.rollTctNo || "—"} isMono />
              </div>
              <div className="border-t border-border pt-2.5 grid grid-cols-2 gap-3">
                <StaticItem label="Mode" value={getModeOfConveyance(editedRecord.update, editedRecord.acctName)} />
                <StaticItem label="Consideration" value={fmtCurrency(r.sellingPrice)} isMono accent="text-[#16A249]" />
                <StaticItem label="Notarial Date" value={r.notarialDate || "—"} />
                <StaticItem label="Doc File No." value={r.docFileNo || "—"} isMono />
              </div>
            </div>
          </section>
        )}

        {/* BUILDING PERMIT panel */}
        {isPermit && (
          <section className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5" /> Permit Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Permit No.</p>
                {isEditing ? (
                  <Input value={r.buildingPermitNo || ''} onChange={e => handleAnyChange('buildingPermitNo', e.target.value)} className="h-8 text-sm tabular-nums font-medium" />
                ) : (
                  <p className="text-sm font-semibold tabular-nums">{r.buildingPermitNo || "—"}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Date Issued</p>
                {isEditing ? (
                  <Input value={r.dateIssued || ''} onChange={e => handleAnyChange('dateIssued', e.target.value)} className="h-8 text-sm font-medium" />
                ) : (
                  <p className="text-sm font-semibold">{r.dateIssued || "—"}</p>
                )}
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Barangay / Owner Name</p>
                {isEditing ? (
                  <Input value={r.barangayName || ''} onChange={e => handleAnyChange('barangayName', e.target.value)} className="h-8 text-sm font-medium uppercase" />
                ) : (
                  <p className="text-sm font-semibold uppercase">{r.barangayName || "—"}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Use of Occupancy</p>
                {isEditing ? (
                  <Input value={r.useOfOccupancy || ''} onChange={e => handleAnyChange('useOfOccupancy', e.target.value)} className="h-8 text-sm font-medium uppercase" />
                ) : (
                  <p className="text-sm font-semibold uppercase">{r.useOfOccupancy || "—"}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Estimated Cost</p>
                {isEditing ? (
                  <Input type="number" value={r.estimatedCost || ''} onChange={e => handleAnyChange('estimatedCost', e.target.value === '' ? 0 : Number(e.target.value))} className="h-8 text-sm tabular-nums font-medium" />
                ) : (
                  <p className="text-sm font-semibold tabular-nums text-[#16A249]">{fmtCurrency(r.estimatedCost)}</p>
                )}
              </div>
              <div className="col-span-2">
                <FieldItem label="Property Location" field="location" value={editedRecord.location} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-3 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {r.isJoined ? "Assessment Roll Match" : "No Assessment Roll Match"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StaticItem label="ARP / TDN (Roll)" value={r.rollArp || "—"} isMono accent={r.isJoined ? "text-[#16A249]" : ""} />
                <StaticItem label="Floor Area (Roll)" value={r.rollArea ? `${Number(r.rollArea).toLocaleString()} sqm` : "—"} isMono />
                <StaticItem label="Class (Roll)" value={r.rollClass || "—"} />
                <StaticItem label="Owner (Roll)" value={r.rollOwner || "—"} />
              </div>
              {r.rollAddress && <StaticItem label="Roll Address" value={r.rollAddress} />}
            </div>
          </section>
        )}

        {/* THREE YEAR REPORT panel */}
        {isThreeYear && (
          <section className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> 3-Year Report Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FieldItem label="Name of New Owner" field="acctName" value={editedRecord.acctName} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
              </div>
              <FieldItem label="ARPN / Tax Dec. No." field="arpNo" value={editedRecord.arpNo} isEditing={isEditing} isMono errors={editedRecord.errors} onChange={handleChange} />
              <StaticItem
                label="Kind (Roll)"
                value={!r.isJoined ? "—" : r.kindGroup === 'Land' ? 'Land' : r.kindGroup === 'Building' ? 'Building' : r.kind || 'Other'}
                accent="text-[#16A249]"
              />
              <div className="col-span-2">
                <FieldItem label="Location" field="location" value={r.rollAddress || editedRecord.location} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
              </div>
              <FieldItem label="Area (sqm)" field="landArea" value={editedRecord.landArea} isEditing={isEditing} isMono type="number" errors={editedRecord.errors} onChange={handleChange} />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Selling Price</p>
                {isEditing ? (
                  <Input type="number" value={r.sellingPrice || ''} onChange={e => handleAnyChange('sellingPrice', e.target.value === '' ? 0 : Number(e.target.value))} className="h-8 text-sm tabular-nums font-medium" />
                ) : (
                  <p className="text-sm font-semibold tabular-nums">{fmtCurrency(r.sellingPrice)}</p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sales Value Brackets</p>
              <div className="grid grid-cols-3 gap-2">
                <StaticItem label="Lowest" value={fmtCurrency(r.saleLow)} isMono />
                <StaticItem label="Median" value={fmtCurrency(r.saleMedian)} isMono />
                <StaticItem label="Highest" value={fmtCurrency(r.saleHigh)} isMono />
              </div>
            </div>
          </section>
        )}

        {/* Duplicate conflict comparison (standard only) */}
        {comparisonRecord && editedRecord.statusLabel === 'DUPLICATE' && !isSpecial && (
          <section className="rounded-lg border border-border bg-background p-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Duplicate Conflict
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground border-b border-border pb-1">Archived (This)</p>
                <StaticItem label="ARP No#" value={editedRecord.arpNo || "—"} isMono />
                <StaticItem label="Market Value" value={isProcessed ? fmtCurrency(editedRecord.marketValue) : "—"} isMono />
              </div>
              <div className="space-y-1.5 border-l border-border pl-3">
                <p className="text-xs font-semibold text-[#16A249] border-b border-border pb-1">Active Reference</p>
                <StaticItem label="ARP No#" value={comparisonRecord.arpNo || "—"} isMono />
                <StaticItem label="Market Value" value={isProcessed ? fmtCurrency(comparisonRecord.marketValue) : "—"} isMono />
              </div>
            </div>
          </section>
        )}

        {/* STANDARD + ABSTRACT Complete Record Details */}
        {!isPermit && !isThreeYear && (
          <>
            {/* Section 1: Primary Identity & Classification */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#16A249]" /> Record Details
              </h4>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <FieldItem label="Date" field="date" value={editedRecord.date} isEditing={isEditing} isMono errors={editedRecord.errors} onChange={handleChange} />
                <FieldItem label="Update Code" field="update" value={editedRecord.update} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />

                <div className="col-span-2">
                  <FieldItem label="Account Name" field="acctName" value={editedRecord.acctName} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
                </div>

                <div className="col-span-2">
                  <FieldItem label="PIN Number" field="pin" value={editedRecord.pin} isEditing={isEditing} isMono errors={editedRecord.errors} onChange={handleChange} />
                </div>

                <FieldItem label="ARP No#" field="arpNo" value={editedRecord.arpNo} isEditing={isEditing} isMono errors={editedRecord.errors} onChange={handleChange} />
                <FieldItem label="Previous ARP" field="previous" value={editedRecord.previous} isEditing={isEditing} isMono errors={editedRecord.errors} onChange={handleChange} />

                <FieldItem label="New ARP#" field="newArpNo" value={editedRecord.newArpNo} isEditing={isEditing} isMono accent="text-blue-600 dark:text-blue-400" errors={editedRecord.errors} onChange={handleChange} />

                {/* Taxability */}
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Taxability</p>
                  {isEditing ? (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleChange('taxability', 'T')}
                        className={cn(
                          "flex-1 h-8 rounded-md text-xs font-bold border transition-colors",
                          editedRecord.taxability !== 'E'
                            ? "bg-[#16A249] text-white border-[#16A249]"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        )}
                      >
                        Taxable (T)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('taxability', 'E')}
                        className={cn(
                          "flex-1 h-8 rounded-md text-xs font-bold border transition-colors",
                          editedRecord.taxability === 'E'
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        )}
                      >
                        Exempt (E)
                      </button>
                    </div>
                  ) : (
                    <p className={cn("text-sm font-semibold", editedRecord.taxability === 'E' ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
                      {taxDisplay}
                    </p>
                  )}
                </div>

                <FieldItem label="Kind" field="kind" value={editedRecord.kind} displayOverride={kindDisplay} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
                <FieldItem label="Actual Use (AU)" field="au" value={editedRecord.au} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />

                <FieldItem
                  label="Land Area (sqm)"
                  field="landArea"
                  value={editedRecord.landArea}
                  displayOverride={editedRecord.landArea !== undefined ? `${Number(editedRecord.landArea).toLocaleString(undefined, { maximumFractionDigits: 2 })} sqm` : "—"}
                  isEditing={isEditing}
                  isMono
                  type="number"
                  errors={editedRecord.errors}
                  onChange={handleChange}
                />

                {isEditing ? (
                  <FieldItem label="Unit Value (₱)" field="unitValue" value={editedRecord.unitValue} isEditing={isEditing} isMono type="number" errors={editedRecord.errors} onChange={handleChange} />
                ) : (
                  <StaticItem label="Barangay" value={editedRecord.barangayName || "Unmapped"} />
                )}

                {(editedRecord.lotNo || editedRecord.blkNo || editedRecord.tctNo) && (
                  <>
                    {editedRecord.lotNo && <StaticItem label="Lot No." value={editedRecord.lotNo} isMono />}
                    {editedRecord.blkNo && <StaticItem label="Block No." value={editedRecord.blkNo} isMono />}
                    {editedRecord.tctNo && (
                      <div className="col-span-2">
                        <StaticItem label="Title / TCT No." value={editedRecord.tctNo} isMono />
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Section 2: Location & Address */}
            <section className="space-y-3 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#16A249]" /> Location & Address
              </h4>
              <div className="space-y-3">
                <FieldItem label="Assessed Location" field="location" value={editedRecord.location} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
                <FieldItem label="Owner Address" field="address" value={editedRecord.address} isEditing={isEditing} uppercase errors={editedRecord.errors} onChange={handleChange} />
                {editedRecord.sourceFile && (
                  <StaticItem label="Source File" value={editedRecord.sourceFile} />
                )}
              </div>
            </section>

            {/* Section 3: Valuation Breakdown */}
            <section className="space-y-3 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#16A249]" /> Valuation Breakdown
              </h4>

              {!isProcessed ? (
                <div className="rounded-lg border border-border bg-background p-3.5 text-xs text-muted-foreground leading-relaxed">
                  Valuations (2028 Current, Deferred 2011 GR, and 2029 RPVARA) will appear here after running <span className="font-semibold text-foreground">Run Batch Processor</span>.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* 2028 Current */}
                  <div className="rounded-lg border border-border bg-background overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">2028 — Current (Capped @ 6%)</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2">
                      <StaticItem label="Unit Value" value={editedRecord.unitValue2028 ? fmtCurrency(editedRecord.unitValue2028, 0) : "—"} isMono />
                      <StaticItem label="Market Value" value={fmtCurrency(editedRecord.marketValue2028, 0)} isMono />
                      <StaticItem label="Assessed Value" value={fmtCurrency(editedRecord.assessedValue2028, 0)} isMono />
                      <StaticItem label="Yearly Tax (Cap)" value={fmtCurrency(editedRecord.yearlyTax2028)} isMono accent="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  {/* Deferred (2011 GR) */}
                  <div className="rounded-lg border border-border bg-background overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Deferred (2011 GR)</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2">
                      <StaticItem label="Unit Value" value={editedRecord.unitValueDeferred ? fmtCurrency(editedRecord.unitValueDeferred, 0) : "—"} isMono />
                      <StaticItem label="Market Value" value={editedRecord.marketValueDeferred ? fmtCurrency(editedRecord.marketValueDeferred, 0) : "—"} isMono />
                      <StaticItem label="Assessed Value" value={editedRecord.assessedValueDeferred ? fmtCurrency(editedRecord.assessedValueDeferred, 0) : "—"} isMono />
                      <StaticItem
                        label="Yearly Tax"
                        value={editedRecord.yearlyTaxDeferred !== undefined && (editedRecord.marketValueDeferred || 0) > 0 ? fmtCurrency(editedRecord.yearlyTaxDeferred) : "—"}
                        isMono
                        accent="text-amber-600 dark:text-amber-400"
                      />
                    </div>
                  </div>

                  {/* 2029 RPVARA */}
                  <div className="rounded-lg border border-border bg-background overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#16A249]">2029 — RPVARA</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2">
                      <StaticItem label="Unit Value" value={(editedRecord.unitValue2029 ?? editedRecord.unitValue) ? fmtCurrency(editedRecord.unitValue2029 ?? editedRecord.unitValue, 0) : "—"} isMono />
                      <StaticItem label="Market Value" value={fmtCurrency(editedRecord.marketValue2029 ?? editedRecord.marketValue, 0)} isMono />
                      <StaticItem label="Assessed Value" value={fmtCurrency(editedRecord.assessedValue2029 ?? editedRecord.assessedValue, 0)} isMono />
                      <StaticItem label="Yearly Tax" value={fmtCurrency(editedRecord.yearlyTax2029 ?? editedRecord.yearlyTax)} isMono accent="text-[#16A249]" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-2 shrink-0">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="h-9 px-3.5 text-xs font-bold uppercase tracking-wider"
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCommitSave}
              className={cn(
                "h-9 px-4 text-xs font-bold uppercase tracking-wider gap-1.5 text-white",
                isPermit ? "bg-orange-600 hover:bg-orange-700" : isThreeYear ? "bg-violet-600 hover:bg-violet-700" : "bg-[#16A249] hover:bg-[#138a3e]"
              )}
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {!isSpecial && (
                isInArchive ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onUnarchive?.(editedRecord)}
                    className="h-8 px-3 text-xs font-semibold text-[#16A249] hover:text-[#138a3e]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onArchive?.(editedRecord)}
                    className="h-8 px-3 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    <Archive className="w-3.5 h-3.5 mr-1.5" /> Archive
                  </Button>
                )
              )}
              {onDelete && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 px-3 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the record and remove it from the active datasets.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDeleteDialogOpen(false);
                            setTimeout(() => onDelete(editedRecord), 200);
                          }}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-3.5 text-xs font-semibold bg-[#16A249] hover:bg-[#138a3e] text-white gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Record
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
