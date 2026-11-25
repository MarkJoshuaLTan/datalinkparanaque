
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Barangay, BarangayConfig, allBarangays, SectionConfig, initialLocationSettings } from '@/lib/locations';
import { TaxRateMap } from '@/lib/processor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Percent, MapPin, Save, Info, RotateCcw, Plus, Trash2, X, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const LOCAL_STORAGE_KEY = 'paranaque_datalink_v31';

// Deterministic fingerprint of initialLocationSettings so code updates to
// src/lib/locations/*.json automatically refresh stale localStorage snapshots.
const computeDefaultsVersion = (settings: BarangayConfig[]): string => {
  const str = JSON.stringify(settings);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return `v-${(hash >>> 0).toString(36)}`;
};

export const CURRENT_DEFAULTS_VERSION = computeDefaultsVersion(initialLocationSettings);

export function hydrateDeferredValues(saved: BarangayConfig[], savedVersion?: string): BarangayConfig[] {
  // If the bundled location JSONs changed since the user last saved,
  // automatically adopt the updated default schedule (including section/lot range edits).
  if (savedVersion !== CURRENT_DEFAULTS_VERSION) {
    return initialLocationSettings;
  }

  const defaultMap = new Map<string, Map<string, { unitValue?: number; deferredUnitValue?: number }>>();
  initialLocationSettings.forEach(b => {
    const secMap = new Map<string, { unitValue?: number; deferredUnitValue?: number }>();
    b.sections.forEach(s => {
      secMap.set(s.section, { unitValue: s.unitValue, deferredUnitValue: s.deferredUnitValue });
    });
    defaultMap.set(b.barangayCode, secMap);
  });

  return saved.map(b => {
    const secMap = defaultMap.get(b.barangayCode);
    if (!secMap) return b;
    return {
      ...b,
      sections: b.sections.map(s => {
        const def = secMap.get(s.section);
        const defaultDeferred = def?.deferredUnitValue ?? 0;
        const resolvedDeferred = (s.deferredUnitValue !== undefined && s.deferredUnitValue > 0)
          ? s.deferredUnitValue
          : defaultDeferred;
        return {
          ...s,
          deferredUnitValue: resolvedDeferred,
        };
      }),
    };
  });
}

export const defaultTaxRates: TaxRateMap = {
    "RESI": { assessmentLevel: 0.20, taxRate: 0.02 },
    "COMM": { assessmentLevel: 0.50, taxRate: 0.03 },
    "INDU": { assessmentLevel: 0.50, taxRate: 0.03 },
    "AGRI": { assessmentLevel: 0.20, taxRate: 0.025 },
    "GOV": { assessmentLevel: 0.15, taxRate: 0.00 },
    "SPEC": { assessmentLevel: 0.15, taxRate: 0.025 },
    "SPC1": { assessmentLevel: 0.15, taxRate: 0.025 },
    "SPC2": { assessmentLevel: 0.15, taxRate: 0.025 },
    "SPC3": { assessmentLevel: 0.15, taxRate: 0.025 },
    "SPC4": { assessmentLevel: 0.15, taxRate: 0.025 },
    "SPC5": { assessmentLevel: 0.15, taxRate: 0.025 },
};

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

interface SettingsOverlayProps {
    onClose: () => void;
    onSaveSettings?: (locationSettings: BarangayConfig[], taxRates: TaxRateMap) => void;
    locationSettings?: BarangayConfig[];
    taxRates?: TaxRateMap;
}

export function SettingsOverlay({
    onClose,
    onSaveSettings,
    locationSettings: propLocationSettings,
    taxRates: propTaxRates
}: SettingsOverlayProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [locationSettings, setLocationSettings] = useState<BarangayConfig[]>(propLocationSettings || initialLocationSettings);
  const [taxRates, setTaxRates] = useState<TaxRateMap>(propTaxRates || defaultTaxRates);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | undefined>(allBarangays[0]);
  const [currentSections, setCurrentSections] = useState<EditableSectionConfig[]>([]);
  const [currentTaxRates, setCurrentTaxRates] = useState<TaxRateMap>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeColumnSearch, setActiveColumnSearch] = useState<'sectionId' | 'lotRange' | 'location' | 'deferredUnitValue' | 'unitValue' | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    sectionId: '',
    lotRange: '',
    location: '',
    deferredUnitValue: '',
    unitValue: '',
  });
  const [activeSection, setActiveSection] = useState<'location' | 'rates'>('location');

  const containerRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const ratesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (propLocationSettings) {
        setLocationSettings(hydrateDeferredValues(propLocationSettings, parsed?.defaultsVersion));
      } else if (parsed?.locationSettings) {
        setLocationSettings(hydrateDeferredValues(parsed.locationSettings, parsed?.defaultsVersion));
      }
      if (propTaxRates) {
        setTaxRates(propTaxRates);
      } else if (parsed?.taxRates) {
        setTaxRates(parsed.taxRates);
      }
    } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
    }
  }, [propLocationSettings, propTaxRates]);

  useEffect(() => {
    if (isClient) {
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
  }, [isClient, selectedBarangay, locationSettings, taxRates]);

  const scrollToSection = (section: 'location' | 'rates') => {
    setActiveSection(section);
    const targetRef = section === 'location' ? locationRef : ratesRef;
    if (targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBarangayChange = (name: string) => {
    if (selectedBarangay) {
      const sectionsToSave = currentSections.map(({ originalIndex, ...rest }) => rest);
      setLocationSettings(prev => prev.map(b => b.barangayCode === selectedBarangay.barangayCode ? { ...b, sections: sectionsToSave } : b));
    }
    setSelectedBarangay(allBarangays.find(b => b.name === name));
  };

  const handleResetToDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setLocationSettings(initialLocationSettings);
    setTaxRates(defaultTaxRates);
    setSelectedBarangay(allBarangays[0]);
    if (onSaveSettings) {
      onSaveSettings(initialLocationSettings, defaultTaxRates);
    }
    toast({ title: "Data Restored", description: "Calibration rules have been reset to factory defaults." });
  };

  const handleSaveChanges = () => {
    const sectionsToSave = currentSections.map(({ originalIndex, ...rest }) => rest);
    const newLocationSettings = locationSettings.map(b => {
      if (selectedBarangay && b.barangayCode === selectedBarangay.barangayCode) {
        return { ...b, sections: sectionsToSave };
      }
      return b;
    });

    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : {};
        const payload = JSON.stringify({ ...parsed, defaultsVersion: CURRENT_DEFAULTS_VERSION, locationSettings: newLocationSettings, taxRates: currentTaxRates });
        localStorage.setItem(LOCAL_STORAGE_KEY, payload);
        setLocationSettings(newLocationSettings);
        setTaxRates(currentTaxRates);
        if (onSaveSettings) {
          onSaveSettings(newLocationSettings, currentTaxRates);
        }
        toast({ title: "Settings Saved", description: "Calibration rules and tax rates have been updated successfully." });
        onClose();
    } catch(e) {
        toast({ variant: 'destructive', title: "Error Saving Settings", description: "Could not save settings to local storage." });
    }
  };

  const handleAddSection = () => {
    if (!selectedBarangay) return;
    setSearchTerm('');
    setColumnFilters({ sectionId: '', lotRange: '', location: '', deferredUnitValue: '', unitValue: '' });
    setActiveColumnSearch(null);
    const newSection: EditableSectionConfig = { section: '000', location: 'NEW CUSTOM LOCATION', deferredUnitValue: 0, unitValue: 0, originalIndex: Date.now() };
    setCurrentSections(prev => [newSection, ...prev]);
    toast({ title: "New Mapping Added", description: "A blank entry has been created at the top of the list." });
  };

  const handleDeleteSection = (originalIndex: number) => {
    setCurrentSections(prev => prev.filter(s => s.originalIndex !== originalIndex));
  };

  const handleLocationUpdate = (originalIndex: number, field: 'location' | 'unitValue' | 'deferredUnitValue', value: string | number) => {
    setCurrentSections(prev => prev.map(sec => sec.originalIndex === originalIndex ? { ...sec, [field]: (field === 'unitValue' || field === 'deferredUnitValue') ? Number(value) : value } : sec));
  };
  
  const handleKeyPartUpdate = (originalIndex: number, partToUpdate: 'base' | 'filter', newValue: string) => {
    setCurrentSections(prev => {
        const sectionToUpdate = prev.find(s => s.originalIndex === originalIndex);
        if (!sectionToUpdate) return prev;
        const { base: oldBase, filter: oldFilter } = parseSectionKey(sectionToUpdate.section);
        const newBase = partToUpdate === 'base' ? newValue : oldBase;
        const newFilter = partToUpdate === 'filter' ? newValue : oldFilter;
        const newFullKey = buildSectionKey(newBase, newFilter);
        return prev.map(sec => sec.originalIndex === originalIndex ? { ...sec, section: newFullKey } : sec);
    });
  };

  const handleRateUpdate = (usage: string, field: keyof TaxRateMap[string], value: number) => {
    setCurrentTaxRates(prev => ({ ...prev, [usage]: { ...prev[usage], [field]: value / 100 } }));
  };

  const filteredSections = currentSections.filter(s => {
    const { base, filter } = parseSectionKey(s.section);
    const globalMatch = !searchTerm.trim() ||
      s.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.deferredUnitValue ?? '').includes(searchTerm.trim()) ||
      String(s.unitValue ?? '').includes(searchTerm.trim());
    const sectionIdMatch = !columnFilters.sectionId.trim() ||
      base.toLowerCase().includes(columnFilters.sectionId.trim().toLowerCase());
    const lotRangeMatch = !columnFilters.lotRange.trim() ||
      (filter || 'ALL LOTS').toLowerCase().includes(columnFilters.lotRange.trim().toLowerCase());
    const locationMatch = !columnFilters.location.trim() ||
      s.location.toLowerCase().includes(columnFilters.location.trim().toLowerCase());
    const deferredMatch = !columnFilters.deferredUnitValue.trim() ||
      String(s.deferredUnitValue ?? '').includes(columnFilters.deferredUnitValue.trim());
    const unitValueMatch = !columnFilters.unitValue.trim() ||
      String(s.unitValue ?? '').includes(columnFilters.unitValue.trim());
    return globalMatch && sectionIdMatch && lotRangeMatch && locationMatch && deferredMatch && unitValueMatch;
  });

  const renderColumnHeader = (
    key: 'sectionId' | 'lotRange' | 'location' | 'deferredUnitValue' | 'unitValue',
    label: string,
    colSpanClass: string,
    placeholder: string
  ) => {
    const isEditing = activeColumnSearch === key || columnFilters[key].length > 0;
    if (isEditing) {
      return (
        <div className={cn(colSpanClass, "relative flex items-center")}>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            autoFocus={activeColumnSearch === key}
            value={columnFilters[key]}
            placeholder={placeholder}
            onChange={(e) => setColumnFilters(prev => ({ ...prev, [key]: e.target.value }))}
            onBlur={() => {
              if (!columnFilters[key]) setActiveColumnSearch(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setColumnFilters(prev => ({ ...prev, [key]: '' }));
                setActiveColumnSearch(null);
              }
            }}
            className="h-7 pl-7 pr-7 text-xs bg-background border-border rounded-md font-medium"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setColumnFilters(prev => ({ ...prev, [key]: '' }));
              setActiveColumnSearch(null);
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
            aria-label={`Clear ${label} filter`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setActiveColumnSearch(key)}
        className={cn(
          colSpanClass,
          "group flex items-center gap-1.5 text-left text-xs font-bold uppercase text-muted-foreground hover:text-foreground tracking-wider cursor-pointer transition-colors py-0.5"
        )}
        title={`Click to filter by ${label}`}
      >
        <span className="truncate">{label}</span>
        <Search className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity shrink-0" />
      </button>
    );
  };
  
  if (!isClient) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-card">
        {/* Compact Header with Inline Tabs */}
        <header className="px-5 py-3 border-b shrink-0 flex items-center justify-between gap-4 bg-card/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2.5 shrink-0">
                <Settings className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                    <h1 className="text-base font-black tracking-tight text-foreground uppercase leading-tight">Configuration Panel</h1>
                    <p className="text-xs text-muted-foreground font-medium">Parañaque Smart Calibration Suite</p>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-lg border border-border/50">
                <button
                    onClick={() => setActiveSection('location')}
                    className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                        activeSection === 'location'
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    )}
                >
                    <MapPin className="w-3.5 h-3.5" />
                    Location Mappings
                </button>
                <button
                    onClick={() => setActiveSection('rates')}
                    className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                        activeSection === 'rates'
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    )}
                >
                    <Percent className="w-3.5 h-3.5" />
                    Tax &amp; Assessment
                </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="font-bold uppercase text-xs tracking-wider h-8 px-3 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Defaults
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Restore Factory Defaults?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-bold text-muted-foreground leading-relaxed">
                        This will overwrite all custom calibration rules and unit values with the official Parañaque schedule.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel className="font-bold uppercase text-xs h-9 px-5 hover:bg-muted hover:text-foreground">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetToDefaults} className="bg-orange-600 hover:bg-orange-700 hover:text-white font-bold uppercase text-xs h-9 px-6">Confirm Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted transition-all">
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </header>

        {/* Full-bleed Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {activeSection === 'location' ? (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0" ref={locationRef}>
                {/* Single-row Filter & Action Toolbar */}
                <div className="px-5 py-2.5 border-b bg-muted/20 flex flex-wrap items-center gap-2.5 shrink-0">
                    <Label htmlFor="barangay-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                        Barangay
                    </Label>
                    <Select value={selectedBarangay?.name} onValueChange={handleBarangayChange}>
                        <SelectTrigger className="w-[220px] h-9 text-xs font-bold uppercase rounded-lg bg-background" id="barangay-select">
                            <SelectValue placeholder="Select a barangay" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            {allBarangays.map(b => (
                                <SelectItem key={b.barangayCode} value={b.name} className="font-semibold text-xs uppercase">{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="h-9 flex items-center justify-center px-3 bg-background rounded-lg border border-border font-mono text-xs font-semibold text-muted-foreground shrink-0">
                        CODE: {selectedBarangay?.barangayCode || '---'}
                    </div>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search section ID, lot range, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-sm bg-background rounded-lg"
                        />
                    </div>
                    <Button onClick={handleAddSection} size="sm" className="h-9 px-4 font-bold uppercase text-xs tracking-wider gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                        <Plus className="w-4 h-4" /> Add Mapping
                    </Button>
                </div>

                {/* Sticky Column Headers (click any column to search inline) */}
                <div className="px-5 py-2 bg-muted/40 border-b shrink-0">
                    <div className="grid grid-cols-12 gap-3 items-center">
                        {renderColumnHeader('sectionId', 'Section ID', 'col-span-2', 'Filter section...')}
                        {renderColumnHeader('lotRange', 'Lot Range', 'col-span-2', 'Filter lot...')}
                        {renderColumnHeader('location', 'Assessed Location Name', 'col-span-3', 'Filter location...')}
                        {renderColumnHeader('deferredUnitValue', 'Deferred (2012)', 'col-span-2', 'Filter 2012...')}
                        {renderColumnHeader('unitValue', 'RPVARA (2029)', 'col-span-2', 'Filter 2029...')}
                        <div className="col-span-1 text-xs font-bold uppercase text-muted-foreground tracking-wider text-center">Action</div>
                    </div>
                </div>

                {/* Full-height Scrollable Section Rows */}
                <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-vertical-custom px-5 py-2 space-y-1.5">
                  {filteredSections.length > 0 ? (
                    filteredSections.map((location) => {
                        const { base, filter } = parseSectionKey(location.section);
                        return (
                          <div key={location.originalIndex} className="grid grid-cols-12 gap-3 items-center py-0.5">
                              <Input
                                  className="col-span-2 font-mono h-8 text-sm bg-background/60 font-semibold border-border/60 hover:border-primary/40 transition-colors rounded-md"
                                  value={base}
                                  onChange={(e) => handleKeyPartUpdate(location.originalIndex, 'base', e.target.value)}
                              />
                              <Input
                                  className="col-span-2 font-mono text-xs h-8 bg-background/60 border-border/60 hover:border-primary/40 transition-colors rounded-md"
                                  value={filter}
                                  placeholder="ALL LOTS"
                                  onChange={(e) => handleKeyPartUpdate(location.originalIndex, 'filter', e.target.value)}
                              />
                              <Input
                                  className="col-span-3 h-8 text-sm bg-background/60 uppercase font-semibold border-border/60 hover:border-primary/40 transition-colors rounded-md"
                                  value={location.location}
                                  onChange={(e) => handleLocationUpdate(location.originalIndex, 'location', e.target.value)}
                              />
                              <div className="col-span-2 relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-600 font-bold">₱</span>
                                  <Input
                                      type="number"
                                      className="pl-7 font-mono h-8 text-sm bg-background/60 font-semibold tabular-nums border-border/60 hover:border-amber-500/40 transition-colors rounded-md"
                                      value={location.deferredUnitValue || ''}
                                      placeholder="0"
                                      onChange={(e) => handleLocationUpdate(location.originalIndex, 'deferredUnitValue', e.target.value)}
                                  />
                              </div>
                              <div className="col-span-2 relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#12A249] font-bold">₱</span>
                                  <Input
                                      type="number"
                                      className="pl-7 font-mono h-8 text-sm bg-background/60 font-semibold tabular-nums border-border/60 hover:border-primary/40 transition-colors rounded-md"
                                      value={location.unitValue || ''}
                                      placeholder="0"
                                      onChange={(e) => handleLocationUpdate(location.originalIndex, 'unitValue', e.target.value)}
                                  />
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteSection(location.originalIndex)}
                                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                          </div>
                        )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <div className="p-4 rounded-full bg-muted/50 mb-4"><MapPin className="w-8 h-8 opacity-30" /></div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-50">No section data found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0" ref={ratesRef}>
                <div className="px-5 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2.5 shrink-0">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-xs font-medium text-muted-foreground">
                        Global multipliers for <span className="text-foreground font-bold">Actual Use (AU)</span> calculations. These rates determine the fiscal output for all post-processed property records.
                    </p>
                </div>

                <div className="px-5 py-2 bg-muted/40 border-b shrink-0">
                    <div className="grid grid-cols-12 gap-6 items-center">
                        <div className="col-span-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Usage Code (AU)</div>
                        <div className="col-span-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Assessment Level (%)</div>
                        <div className="col-span-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Active Tax Rate (%)</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-vertical-custom px-5 py-2 space-y-1.5">
                  {Object.keys(currentTaxRates).sort().map((au) => (
                    <div key={au} className="grid grid-cols-12 gap-6 items-center py-1 group">
                      <div className="col-span-4 font-bold text-sm uppercase text-foreground flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600/40 group-hover:bg-blue-600 transition-colors" />
                        {au}
                      </div>
                      <div className="col-span-4 relative">
                        <Input
                          type="number"
                          className="h-9 text-sm pr-8 font-mono font-semibold text-right bg-background/60 border-border/60 rounded-md focus-visible:ring-blue-600/30"
                          value={Math.round((currentTaxRates[au].assessmentLevel * 100))}
                          onChange={(e) => handleRateUpdate(au, 'assessmentLevel', Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                      </div>
                      <div className="col-span-4 relative">
                        <Input
                          type="number"
                          step="0.1"
                          className="h-9 text-sm pr-8 font-mono font-semibold text-right bg-background/60 border-border/60 rounded-md focus-visible:ring-blue-600/30"
                          value={(currentTaxRates[au].taxRate * 100)}
                          onChange={(e) => handleRateUpdate(au, 'taxRate', Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Compact Footer */}
        <footer className="px-5 py-2.5 border-t bg-card/90 backdrop-blur-xl flex items-center justify-between shrink-0 gap-3 z-10">
            <div className="text-xs font-semibold text-muted-foreground">
                {activeSection === 'location'
                  ? `Showing ${filteredSections.length} of ${currentSections.length} sections in ${selectedBarangay?.name || ''}`
                  : `${Object.keys(currentTaxRates).length} Actual Use (AU) rate profiles`}
            </div>
            <div className="flex items-center gap-2.5">
                <Button variant="ghost" size="sm" className="font-bold uppercase text-xs tracking-wider h-9 px-5 hover:bg-muted hover:text-foreground" onClick={onClose}>Discard Changes</Button>
                <Button size="sm" className="font-bold uppercase text-xs tracking-wider h-9 px-6 bg-primary hover:bg-emerald-800 text-white shadow-sm" onClick={handleSaveChanges}>
                    <Save className="w-4 h-4 mr-2" />
                    Commit Configuration
                </Button>
            </div>
        </footer>
    </div>
  );
}
