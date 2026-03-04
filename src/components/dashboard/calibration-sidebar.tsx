"use client";

import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  CheckSquare, 
  AlertCircle,
  RotateCcw,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CalibrationRule } from '@/lib/processor';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalibrationSidebarProps {
  rules: CalibrationRule[];
  setRules: (rules: CalibrationRule[]) => void;
  options: {
    removeDuplicates: boolean;
    applyCalibration: boolean;
  };
  setOptions: (options: any) => void;
  exportColumns: Record<string, boolean>;
  setExportColumns: (cols: Record<string, boolean>) => void;
}

export function CalibrationSidebar({
  rules,
  setRules,
  options,
  setOptions,
  exportColumns,
  setExportColumns
}: CalibrationSidebarProps) {
  const [duplicateKeys, setDuplicateKeys] = useState<Set<string>>(new Set());

  const validateKeys = (currentRules: CalibrationRule[]) => {
    const keys = currentRules.map(r => r.pinPattern.trim().toLowerCase());
    const duplicates = new Set(keys.filter((item, index) => item !== "" && keys.indexOf(item) !== index));
    setDuplicateKeys(duplicates);
  };

  const addRule = () => {
    const newRule: CalibrationRule = {
      id: Math.random().toString(36).substr(2, 9),
      pinPattern: '',
      barangay: '',
      section: '',
      unitValue: undefined,
      overwrite: true,
    };
    const updated = [...rules, newRule];
    setRules(updated);
    validateKeys(updated);
  };

  const updateRule = (id: string, updates: Partial<CalibrationRule>) => {
    const updated = rules.map(r => r.id === id ? { ...r, ...updates } : r);
    setRules(updated);
    if ('pinPattern' in updates) validateKeys(updated);
  };

  const removeRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    validateKeys(updated);
  };

  const clearAllRules = () => {
    setRules([]);
    setDuplicateKeys(new Set());
  };

  const toggleColumn = (col: string) => {
    setExportColumns({ ...exportColumns, [col]: !exportColumns[col] });
  };

  const columns = Object.keys(exportColumns);

  return (
    <Card className="h-full border-none shadow-none bg-transparent flex flex-col gap-6 pb-10">
      {/* SECTION 1: SYSTEM OPTIONS */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" /> Processor Engine
        </h3>
        <Card className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold">REMOVE DUPLICATES</Label>
            <Switch 
              checked={options.removeDuplicates}
              onCheckedChange={(val) => setOptions({ ...options, removeDuplicates: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold">APPLY CALIBRATION</Label>
            <Switch 
              checked={options.applyCalibration}
              onCheckedChange={(val) => setOptions({ ...options, applyCalibration: val })}
            />
          </div>
        </Card>
      </div>

      {/* SECTION 2: EXPORT CONFIGURATION */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <CheckSquare className="w-3.5 h-3.5" /> Export Columns
        </h3>
        <Card className="p-3 grid grid-cols-2 gap-2">
          {columns.map(col => (
            <div key={col} className="flex items-center gap-2">
              <Checkbox 
                id={`col-${col}`} 
                checked={exportColumns[col]} 
                onCheckedChange={() => toggleColumn(col)}
              />
              <label htmlFor={`col-${col}`} className="text-[9px] font-bold uppercase cursor-pointer truncate">
                {col}
              </label>
            </div>
          ))}
        </Card>
      </div>

      {/* SECTION 3: STEP 2 - PRE-PROCESSING CONFIGURATION (DYNAMIC LIST) */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> Pre-Processing Configuration
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[9px] font-bold hover:text-destructive"
              onClick={clearAllRules}
              disabled={rules.length === 0}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Clear All
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={addRule}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {rules.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <p className="text-[10px] uppercase font-black opacity-30 tracking-widest">No Active Overrides</p>
              <p className="text-[9px] font-medium mt-1">Add entries to calibrate PIN patterns</p>
            </div>
          )}
          {rules.map((rule) => {
            const isDuplicate = duplicateKeys.has(rule.pinPattern.trim().toLowerCase());
            return (
              <Card key={rule.id} className={`p-3 relative group shadow-sm transition-all duration-200 border-l-4 ${isDuplicate ? 'border-l-destructive border-destructive/20' : 'border-l-primary border-emerald-50'}`}>
                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isDuplicate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-destructive text-white border-none text-[10px]">
                          Duplicate PIN Pattern detected.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-emerald-700 uppercase">Target PIN Pattern (Key)</Label>
                    <Input 
                      placeholder="e.g., 124-00-x..." 
                      className={`h-8 text-xs font-mono transition-colors ${isDuplicate ? 'bg-destructive/5 border-destructive focus-visible:ring-destructive' : 'bg-white border-emerald-100'}`}
                      value={rule.pinPattern}
                      onChange={(e) => updateRule(rule.id, { pinPattern: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold uppercase">Barangay (Value)</Label>
                      <Input 
                        className="h-8 text-xs border-emerald-50"
                        value={rule.barangay}
                        placeholder="BF HOMES"
                        onChange={(e) => updateRule(rule.id, { barangay: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold uppercase">Section (Value)</Label>
                      <Input 
                        className="h-8 text-xs border-emerald-50"
                        value={rule.section}
                        placeholder="Phase 2"
                        onChange={(e) => updateRule(rule.id, { section: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-green-700 uppercase">New Unit Value (₱ Override)</Label>
                    <Input 
                      type="number"
                      placeholder="Calculate from land area"
                      className="h-8 text-xs font-bold border-green-100 bg-green-50/30"
                      value={rule.unitValue || ''}
                      onChange={(e) => updateRule(rule.id, { unitValue: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
