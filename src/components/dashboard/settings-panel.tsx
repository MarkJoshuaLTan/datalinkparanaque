"use client";

import React, { useState, useEffect } from 'react';
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
import { Barangay, BarangayConfig, allBarangays, SectionConfig } from '@/lib/locations';
import { TaxRateMap } from '@/lib/processor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Percent, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationSettings: BarangayConfig[];
  onSettingsChange: (newSettings: BarangayConfig[]) => void;
  taxRates: TaxRateMap;
  onTaxRatesChange: (newRates: TaxRateMap) => void;
}

type EditableSectionConfig = SectionConfig & { originalIndex: number };

const parseSectionKey = (key: string): { base: string; filter: string } => {
    const parts = key.split(/-(.+)/);
    if (parts.length > 1) {
        return { base: parts[0].trim(), filter: parts[1].trim() };
    }
    return { base: key.trim(), filter: '' };
};

const buildSectionKey = (base: string, filter: string): string => {
    const cleanFilter = filter.trim();
    if (!cleanFilter || cleanFilter.toUpperCase() === 'ALL LOTS') {
        return base.trim();
    }
    return `${base.trim()}-${cleanFilter}`;
};

export function SettingsPanel({
  open,
  onOpenChange,
  locationSettings,
  onSettingsChange,
  taxRates,
  onTaxRatesChange,
}: SettingsPanelProps) {
  const { toast } = useToast();
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | undefined>(allBarangays[0]);
  const [currentSections, setCurrentSections] = useState<EditableSectionConfig[]>([]);
  const [currentTaxRates, setCurrentTaxRates] = useState<TaxRateMap>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      if (selectedBarangay) {
        const barangayData = locationSettings.find(b => b.barangayCode === selectedBarangay.barangayCode);
        const sectionsWithIds = (barangayData?.sections || []).map((section, index) => ({
          ...section,
          originalIndex: index,
        }));
        setCurrentSections(sectionsWithIds.sort((a, b) => a.section.localeCompare(b.section, undefined, { numeric: true })));
      }
      setCurrentTaxRates({ ...taxRates });
    }
  }, [open, selectedBarangay, locationSettings, taxRates]);

  const handleSaveChanges = () => {
    // 1. Save Locations
    const sectionsToSave = currentSections.map(({ originalIndex, ...rest }) => rest);
    const newSettings = locationSettings.map(b => {
      if (selectedBarangay && b.barangayCode === selectedBarangay.barangayCode) {
        return { ...b, sections: sectionsToSave };
      }
      return b;
    });

    onSettingsChange(newSettings);
    onTaxRatesChange(currentTaxRates);

    toast({
      title: "Settings Saved",
      description: "Location settings and Tax rates have been updated successfully.",
    });
    onOpenChange(false);
  };

  const handleLocationUpdate = (
    originalIndex: number,
    field: 'location' | 'unitValue',
    value: string | number
  ) => {
    setCurrentSections(prev => 
      prev.map(sec => {
        if (sec.originalIndex === originalIndex) {
          const updatedValue = field === 'unitValue' ? Number(value) : value;
          return { ...sec, [field]: updatedValue };
        }
        return sec;
      })
    );
  };
  
  const handleKeyPartUpdate = (originalIndex: number, partToUpdate: 'base' | 'filter', newValue: string) => {
    setCurrentSections(prev => {
        const tempSections = prev.map(s => ({...s}));
        const sectionToUpdate = tempSections.find(s => s.originalIndex === originalIndex);
        if (!sectionToUpdate) return prev;

        const { base: oldBase, filter: oldFilter } = parseSectionKey(sectionToUpdate.section);
        const newBase = partToUpdate === 'base' ? newValue : oldBase;
        const newFilter = partToUpdate === 'filter' ? newValue : oldFilter;
        const newFullKey = buildSectionKey(newBase, newFilter);

        return prev.map(sec => 
            sec.originalIndex === originalIndex ? { ...sec, section: newFullKey } : sec
        );
    });
  };

  const handleRateUpdate = (usage: string, field: keyof TaxRateMap[string], value: number) => {
    setCurrentTaxRates(prev => ({
      ...prev,
      [usage]: {
        ...prev[usage],
        [field]: value / 100 // Convert percentage to decimal
      }
    }));
  };

  const filteredSections = currentSections.filter(
    (s) =>
      s.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[900px] sm:max-w-[900px] flex flex-col bg-card/95 backdrop-blur-xl border-white/10">
        <SheetHeader>
          <SheetTitle className="text-2xl font-black text-gradient uppercase">Global Calibration Panel</SheetTitle>
          <SheetDescription className="font-medium">
            Manage your land data processing rules, location mappings, and financial tax rates.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="locations" className="flex-1 flex flex-col mt-4 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 border mb-4">
            <TabsTrigger value="locations" className="text-xs font-bold uppercase gap-2">
              <MapPin className="w-3 h-3" /> Location Settings
            </TabsTrigger>
            <TabsTrigger value="rates" className="text-xs font-bold uppercase gap-2">
              <Percent className="w-3 h-3" /> Rates Calibration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="flex-1 flex flex-col gap-4 overflow-hidden outline-none m-0">
            <div className="grid grid-cols-5 items-center gap-4 px-1">
                <Label htmlFor="barangay-select" className="text-right col-span-1 text-xs font-black uppercase">
                    Barangay
                </Label>
                <Select value={selectedBarangay?.name} onValueChange={(name) => setSelectedBarangay(allBarangays.find(b => b.name === name))}>
                    <SelectTrigger className="col-span-3 h-9 text-xs" id="barangay-select">
                        <SelectValue placeholder="Select a barangay" />
                    </SelectTrigger>
                    <SelectContent>
                        {allBarangays.map(b => (
                            <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input 
                    readOnly 
                    value={selectedBarangay?.barangayCode || '---'} 
                    className="h-9 bg-muted/50 text-center font-mono text-xs font-black"
                />
            </div>
            <div className="relative px-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search section, filter, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                />
            </div>
            <div className="flex-1 border rounded-md overflow-hidden flex flex-col bg-muted/20">
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm p-4 border-b z-10">
                  <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2 text-[10px] font-black uppercase text-muted-foreground">Section</div>
                      <div className="col-span-3 text-[10px] font-black uppercase text-muted-foreground">Lot Filter</div>
                      <div className="col-span-5 text-[10px] font-black uppercase text-muted-foreground">Location Name</div>
                      <div className="col-span-2 text-[10px] font-black uppercase text-muted-foreground">Unit Value</div>
                  </div>
              </div>
              <div className="overflow-y-auto scrollbar-vertical-custom flex-1 p-4 space-y-2">
                {filteredSections.map((location) => {
                    const { base, filter } = parseSectionKey(location.section);
                    return (
                      <div key={location.originalIndex} className="grid grid-cols-12 gap-4 items-center group">
                          <Input
                              className="col-span-2 font-mono h-8 text-xs bg-background"
                              value={base}
                              onChange={(e) => handleKeyPartUpdate(location.originalIndex, 'base', e.target.value)}
                          />
                          <Input
                              className="col-span-3 font-mono text-[10px] h-8 bg-background"
                              value={filter}
                              placeholder="ALL LOTS"
                              onChange={(e) => handleKeyPartUpdate(location.originalIndex, 'filter', e.target.value)}
                          />
                          <Input
                              className="col-span-5 h-8 text-xs bg-background uppercase font-bold"
                              value={location.location}
                              onChange={(e) => handleLocationUpdate(location.originalIndex, 'location', e.target.value)}
                          />
                          <div className="col-span-2 relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-black">₱</span>
                              <Input
                                  type="number"
                                  className="pl-5 font-mono h-8 text-xs bg-background"
                                  value={location.unitValue || ''}
                                  placeholder="0"
                                  onChange={(e) => handleLocationUpdate(location.originalIndex, 'unitValue', e.target.value)}
                              />
                          </div>
                      </div>
                    )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rates" className="flex-1 flex flex-col gap-4 outline-none m-0 overflow-hidden">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-2">
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                <span className="font-black text-primary uppercase">Note:</span> These rates are applied globally across all records based on their <span className="font-bold">Actual Use (AU)</span> code. Assessment Levels determine what portion of Market Value is taxable.
              </p>
            </div>
            
            <div className="flex-1 border rounded-md overflow-hidden flex flex-col bg-muted/20">
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm p-4 border-b z-10">
                  <div className="grid grid-cols-12 gap-6 items-center">
                      <div className="col-span-3 text-[10px] font-black uppercase text-muted-foreground">Usage Code (AU)</div>
                      <div className="col-span-4 text-[10px] font-black uppercase text-muted-foreground">Assessment Level (%)</div>
                      <div className="col-span-5 text-[10px] font-black uppercase text-muted-foreground">Tax Rate (%)</div>
                  </div>
              </div>
              <div className="overflow-y-auto scrollbar-vertical-custom flex-1 p-4 space-y-3">
                {Object.keys(currentTaxRates).sort().map((au) => (
                  <div key={au} className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-3 font-black text-xs uppercase text-emerald-900 dark:text-emerald-400">
                      {au}
                    </div>
                    <div className="col-span-4 relative">
                      <Input
                        type="number"
                        className="h-8 text-xs pr-6 font-mono font-bold"
                        value={Math.round((currentTaxRates[au].assessmentLevel * 100))}
                        onChange={(e) => handleRateUpdate(au, 'assessmentLevel', Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">%</span>
                    </div>
                    <div className="col-span-5 relative">
                      <Input
                        type="number"
                        step="0.1"
                        className="h-8 text-xs pr-6 font-mono font-bold"
                        value={(currentTaxRates[au].taxRate * 100)}
                        onChange={(e) => handleRateUpdate(au, 'taxRate', Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="pt-6 border-t mt-4">
          <Button variant="outline" className="font-bold uppercase text-[10px]" onClick={() => onOpenChange(false)}>Discard Changes</Button>
          <Button className="font-black uppercase text-[10px] bg-primary hover:bg-emerald-800" onClick={handleSaveChanges}>
            Update Global Settings
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}