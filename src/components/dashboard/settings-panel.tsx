"use client";

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarangayConfig, SectionConfig } from '@/lib/locations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationSettings: BarangayConfig[];
  onLocationSettingsChange: (settings: BarangayConfig[]) => void;
}

export function SettingsPanel({
  open,
  onOpenChange,
  locationSettings,
  onLocationSettingsChange,
}: SettingsPanelProps) {
  const [selectedBarangay, setSelectedBarangay] = useState<string>(
    locationSettings[0]?.name || ''
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handleSectionChange = (
    barangayName: string,
    sectionCode: string,
    field: keyof SectionConfig,
    value: string | number
  ) => {
    const newSettings = locationSettings.map((brgy) => {
      if (brgy.name === barangayName) {
        return {
          ...brgy,
          sections: brgy.sections.map((sec) => {
            if (sec.section === sectionCode) {
              const updatedValue = field === 'unitValue' ? (typeof value === 'string' ? parseFloat(value) : value) : value;
              return { ...sec, [field]: updatedValue };
            }
            return sec;
          }),
        };
      }
      return brgy;
    });
    onLocationSettingsChange(newSettings);
  };

  const currentBarangay = locationSettings.find(
    (b) => b.name === selectedBarangay
  );

  const filteredSections = currentBarangay?.sections.filter(
    (s) =>
      s.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Location & Unit Value Settings</SheetTitle>
          <SheetDescription>
            Manage default location names and unit values based on Barangay Code and Section from the PIN.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
            <div className="grid grid-cols-5 items-center gap-2 px-1">
                <Label htmlFor="barangay-select" className="text-right col-span-1">
                    Barangay
                </Label>
                <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                    <SelectTrigger className="col-span-3" id="barangay-select">
                        <SelectValue placeholder="Select a barangay" />
                    </SelectTrigger>
                    <SelectContent>
                        {locationSettings.map(b => (
                            <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input 
                    readOnly 
                    value={currentBarangay?.barangayCode || '---'} 
                    className="h-10 bg-muted/50 text-center font-mono"
                    title="Barangay Code"
                />
            </div>
            <div className="relative px-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search section, lot filter, or location name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="flex-1 border rounded-md overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm p-4 border-b z-10">
                  <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-2 text-xs font-bold uppercase text-muted-foreground">Section</div>
                      <div className="col-span-3 text-xs font-bold uppercase text-muted-foreground">Lot Filter</div>
                      <div className="col-span-5 text-xs font-bold uppercase text-muted-foreground">Location Name</div>
                      <div className="col-span-2 text-xs font-bold uppercase text-muted-foreground">Unit Value</div>
                  </div>
              </div>
              <div className="overflow-y-auto scrollbar-vertical-custom flex-1">
                <div className="p-4 space-y-4">
                {filteredSections.map((section) => {
                    const sectionParts = section.section.split(/-(.+)/s);
                    const baseSection = sectionParts[0];
                    const lotPattern = sectionParts.length > 1 ? sectionParts[1] : null;

                    return (
                        <div key={section.section} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2 font-mono font-bold truncate" title={baseSection}>
                                {baseSection}
                            </div>
                            <div 
                              className="col-span-3 text-[10px] font-mono text-muted-foreground truncate bg-slate-50 p-2 h-10 flex items-center rounded-md border" 
                              title={lotPattern || 'Applies to all lots in this section'}
                            >
                                {lotPattern ? lotPattern.replace(/[{()}]/g, '') : <span className="opacity-50">ALL LOTS</span>}
                            </div>
                            <Input
                                className="col-span-5"
                                value={section.location}
                                onChange={(e) =>
                                handleSectionChange(
                                    selectedBarangay,
                                    section.section,
                                    'location',
                                    e.target.value
                                )
                                }
                            />
                            <div className="col-span-2 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
                                <Input
                                    type="number"
                                    className="pl-5"
                                    value={section.unitValue || ''}
                                    placeholder="Unit Value"
                                    onChange={(e) =>
                                    handleSectionChange(
                                        selectedBarangay,
                                        section.section,
                                        'unitValue',
                                        e.target.value
                                    )
                                    }
                                />
                            </div>
                        </div>
                    );
                })}
                </div>
              </div>
            </div>
        </div>
        <SheetFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
