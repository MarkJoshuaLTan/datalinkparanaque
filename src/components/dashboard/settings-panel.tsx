
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationSettings: BarangayConfig[];
  onSettingsChange: (newSettings: BarangayConfig[]) => void;
}

export function SettingsPanel({
  open,
  onOpenChange,
  locationSettings,
  onSettingsChange,
}: SettingsPanelProps) {
  const { toast } = useToast();
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | undefined>(allBarangays[0]);
  const [currentSections, setCurrentSections] = useState<SectionConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open && selectedBarangay) {
      const barangayData = locationSettings.find(b => b.barangayCode === selectedBarangay.barangayCode);
      const sortedSections = barangayData?.sections.sort((a, b) => 
        a.section.localeCompare(b.section, undefined, { numeric: true })
      ) || [];
      setCurrentSections(sortedSections);
    }
  }, [open, selectedBarangay, locationSettings]);

  const handleSaveChanges = () => {
    if (!selectedBarangay) return;
    
    // Create a new array with the updated barangay settings
    const newSettings = locationSettings.map(b => {
      if (b.barangayCode === selectedBarangay.barangayCode) {
        return { ...b, sections: currentSections };
      }
      return b;
    });

    onSettingsChange(newSettings);
    toast({
      title: "Settings Saved",
      description: `Location settings for ${selectedBarangay.name} have been updated locally.`,
    });
    onOpenChange(false);
  };

  const handleLocationUpdate = (
    sectionKey: string,
    field: 'location' | 'unitValue',
    value: string | number
  ) => {
    setCurrentSections(prev => 
      prev.map(sec => {
        if (sec.section === sectionKey) {
          const updatedValue = field === 'unitValue' ? Number(value) : value;
          return { ...sec, [field]: updatedValue };
        }
        return sec;
      })
    );
  };
  
  const handleSectionKeyUpdate = (oldSectionKey: string, newSectionKey: string) => {
    setCurrentSections(prev => {
      // Check if new key already exists to prevent duplicates
      if(prev.some(sec => sec.section === newSectionKey)) {
        toast({
            variant: "destructive",
            title: "Duplicate Section",
            description: "A section with this identifier already exists.",
        });
        return prev;
      }
      return prev.map(sec => sec.section === oldSectionKey ? { ...sec, section: newSectionKey } : sec)
    });
  };


  const filteredSections = currentSections.filter(
    (s) =>
      s.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[900px] sm:max-w-[900px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Location & Unit Value Settings</SheetTitle>
          <SheetDescription>
            Manage default location names and unit values. Changes are saved to your browser's local storage.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
            <div className="grid grid-cols-5 items-center gap-2 px-1">
                <Label htmlFor="barangay-select" className="text-right col-span-1">
                    Barangay
                </Label>
                <Select value={selectedBarangay?.name} onValueChange={(name) => setSelectedBarangay(allBarangays.find(b => b.name === name))}>
                    <SelectTrigger className="col-span-3" id="barangay-select">
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
                    className="h-10 bg-muted/50 text-center font-mono"
                    title="Barangay Code"
                />
            </div>
            <div className="relative px-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search section or location name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="flex-1 border rounded-md overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm p-4 border-b z-10">
                  <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4 text-xs font-bold uppercase text-muted-foreground">Section Identifier</div>
                      <div className="col-span-6 text-xs font-bold uppercase text-muted-foreground">Location Name</div>
                      <div className="col-span-2 text-xs font-bold uppercase text-muted-foreground">Unit Value</div>
                  </div>
              </div>
              <div className="overflow-y-auto scrollbar-vertical-custom flex-1">
                {currentSections.length === 0 ? (
                   <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No location data found for this barangay.
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                  {filteredSections.map((location) => (
                      <div key={location.section} className="grid grid-cols-12 gap-2 items-center">
                          <Input
                            className="col-span-4 font-mono"
                            value={location.section}
                            placeholder="e.g. 001 or 022-{...}"
                            onChange={(e) => handleSectionKeyUpdate(location.section, e.target.value)}
                          />
                          <Input
                              className="col-span-6"
                              value={location.location}
                              onChange={(e) => handleLocationUpdate(location.section, 'location', e.target.value)}
                          />
                          <div className="col-span-2 relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
                              <Input
                                  type="number"
                                  className="pl-5"
                                  value={location.unitValue || ''}
                                  placeholder="Unit Value"
                                  onChange={(e) => handleLocationUpdate(location.section, 'unitValue', e.target.value)}
                              />
                          </div>
                      </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

    