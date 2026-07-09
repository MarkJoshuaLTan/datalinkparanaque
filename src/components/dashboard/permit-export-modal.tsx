"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileDown, 
  Calendar,
  Link2,
  Unlink2,
  HelpCircle,
  HardHat,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { parse, isValid, startOfDay, endOfDay } from 'date-fns';

export interface PermitExportSettings {
  startDate: string;
  endDate: string;
  matchRules: ('Linked' | 'Unlinked')[];
  includePotential: boolean;
  includeUnderReview: boolean;
}

interface PermitExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  onExport: (settings: PermitExportSettings) => void;
}

export function PermitExportModal({
  open,
  onOpenChange,
  data,
  onExport
}: PermitExportModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMatchRules, setSelectedMatchRules] = useState<('Linked' | 'Unlinked')[]>(['Linked', 'Unlinked']);
  const [includePotential, setIncludePotential] = useState(true);
  const [includeUnderReview, setIncludeUnderReview] = useState(true);

  const parseRecordDate = (dateStr: string) => {
    if (!dateStr) return null;
    const cleaned = dateStr.trim();
    const formats = ['MM/dd/yyyy', 'M/d/yyyy', 'yyyy-MM-dd', 'MM-dd-yyyy', 'yyyy-dd-MM'];
    for (const fmt of formats) {
      const parsed = parse(cleaned, fmt, new Date());
      if (isValid(parsed)) return parsed;
    }
    const fallback = new Date(cleaned);
    return isValid(fallback) ? fallback : null;
  };

  const filteredCount = useMemo(() => {
    const start = startDate ? startOfDay(new Date(startDate)) : null;
    const end = endDate ? endOfDay(new Date(endDate)) : null;

    return data.filter(record => {
      const matchStatus = record.isJoined ? 'Linked' : 'Unlinked';
      if (!selectedMatchRules.includes(matchStatus)) return false;
      
      if (!includePotential && record.isPotentialMatch) return false;
      if (!includeUnderReview && record.isUnderReview) return false;

      if (start || end) {
        const recDate = parseRecordDate(record.dateIssued);
        if (!recDate) return false;
        if (start && recDate < start) return false;
        if (end && recDate > end) return false;
      }
      
      return true;
    }).length;
  }, [data, startDate, endDate, selectedMatchRules, includePotential, includeUnderReview]);

  const handleExportClick = () => {
    onExport({
      startDate,
      endDate,
      matchRules: selectedMatchRules,
      includePotential,
      includeUnderReview
    });
    onOpenChange(false);
  };

  const toggleMatchRule = (rule: 'Linked' | 'Unlinked') => {
    setSelectedMatchRules(prev => prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-3xl border-white/10 p-0 shadow-2xl">
        <div className="p-8 shrink-0 bg-orange-600/5 border-b">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-orange-600/20 p-3 rounded-xl border border-orange-600/20">
                <HardHat className="text-orange-600 w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-3xl font-black text-foreground uppercase tracking-tight leading-none">
                    Permit Export Controller
                  </DialogTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-muted-foreground hover:text-orange-600 transition-colors outline-none">
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl p-6">
                      <div className="space-y-3">
                        <h4 className="font-black uppercase text-[10px] tracking-widest text-orange-600">Audit Logic Overview</h4>
                        <p className="text-xs font-bold leading-relaxed text-muted-foreground uppercase">
                          The Permit Export links <span className="text-foreground">Building Permit logs</span> with the <span className="text-foreground">Assessment Roll</span>.
                          <br /><br />
                          Use filters to exclude <span className="text-orange-600">Potential Matches</span> or <span className="text-orange-600">Under Review</span> records to maintain official data standards.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <DialogDescription className="text-base font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                  Generate a filtered Abstract of Building Permits for official reporting.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-vertical-custom p-8 space-y-10">
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase text-orange-600 tracking-[0.15em] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Issuance Period
            </h3>
            <Card className="p-5 bg-muted/10 border-white/5 shadow-inner rounded-2xl grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">From Date Issued</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">To Date Issued</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 font-bold text-sm" />
              </div>
            </Card>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase text-orange-600 tracking-[0.15em] flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Relational Status
              </h3>
              <Card className="p-5 bg-muted/10 border-white/5 shadow-inner rounded-2xl grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox id="p-match-linked" checked={selectedMatchRules.includes('Linked')} onCheckedChange={() => toggleMatchRule('Linked')} />
                  <Label htmlFor="p-match-linked" className="text-xs font-bold uppercase cursor-pointer flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-emerald-600" /> Linked
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="p-match-unlinked" checked={selectedMatchRules.includes('Unlinked')} onCheckedChange={() => toggleMatchRule('Unlinked')} />
                  <Label htmlFor="p-match-unlinked" className="text-xs font-bold uppercase cursor-pointer flex items-center gap-2">
                    <Unlink2 className="w-3.5 h-3.5 text-red-500" /> Unlinked
                  </Label>
                </div>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase text-orange-600 tracking-[0.15em] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Integrity Flags
              </h3>
              <Card className="p-5 bg-muted/10 border-white/5 shadow-inner rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Checkbox id="p-inc-potential" checked={includePotential} onCheckedChange={(val) => setIncludePotential(!!val)} />
                    <Label htmlFor="p-inc-potential" className="text-xs font-bold uppercase cursor-pointer">Include Potential Matches</Label>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase">Review Required</Badge>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Checkbox id="p-inc-review" checked={includeUnderReview} onCheckedChange={(val) => setIncludeUnderReview(!!val)} />
                    <Label htmlFor="p-inc-review" className="text-xs font-bold uppercase cursor-pointer">Include Under Review (Duplicates)</Label>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 text-[8px] font-black uppercase">Ambiguous</Badge>
                </div>
              </Card>
            </section>
          </div>
        </div>

        <DialogFooter className="p-8 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Report Payload:</span>
            <Badge className="font-mono text-xl font-black px-6 py-2 bg-background text-foreground shadow-lg border-white/5">
                {filteredCount.toLocaleString()} Rows
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase text-xs tracking-widest px-8 h-12 hover:bg-muted">Discard</Button>
            <Button 
              onClick={handleExportClick} 
              disabled={filteredCount === 0 || selectedMatchRules.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-12 h-12 shadow-2xl shadow-orange-500/20"
            >
              <FileDown className="w-4 h-4 mr-2" /> Generate Report
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}