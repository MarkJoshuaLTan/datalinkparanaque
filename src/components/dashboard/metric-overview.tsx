
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Files, 
  AlertTriangle, 
  Eraser, 
  CheckCircle2, 
  Archive, 
  Database, 
  BarChart3, 
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A component that animates a numeric value counting from its previous state to the new state.
 */
const AnimatedNumber = ({ value, prefix = "", decimals = 0 }: { value: number, prefix?: string, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 1500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
};

interface MetricOverviewProps {
  stats: {
    totalRawRows: number;
    systemCleanup: number;
    totalImported: number;
    duplicatesRemoved: number;
    finalCount: number;
    totalMarketValue: number;
    totalAssessedValue: number;
    totalYearlyTax: number;
    totalErrors: number;
  };
}

export function MetricOverview({ stats }: MetricOverviewProps) {
  const statDefinitions = [
    {
      label: "Imported Rows",
      value: <AnimatedNumber value={stats.totalRawRows} />,
      icon: Files,
      color: "border-l-slate-400",
      definition: "The total count of all raw data lines detected across all your uploaded spreadsheets before any filtering or processing."
    },
    {
      label: "Data Errors",
      value: <AnimatedNumber value={stats.totalErrors} />,
      icon: AlertTriangle,
      color: "border-l-red-500 bg-red-500/5",
      textClass: "text-red-600",
      definition: "Records flagged for critical data issues like missing Property Identification Numbers (PIN) or invalid formats that require manual correction."
    },
    {
      label: "Engine Cleanup",
      value: <AnimatedNumber value={stats.systemCleanup} />,
      icon: Eraser,
      color: "border-l-orange-400",
      textClass: "text-orange-600",
      definition: "Rows identified as non-data noise, duplicates, or incomplete entries that are moved to the Archive tab."
    },
    {
      label: "Valid Records",
      value: <AnimatedNumber value={stats.finalCount} />,
      icon: CheckCircle2,
      color: "border-l-primary bg-primary/5",
      textClass: "text-primary",
      definition: "The finalized set of clean, unique, and verified records that have passed all city-standard validation rules."
    },
    {
      label: "Duplicates",
      value: <AnimatedNumber value={stats.duplicatesRemoved} />,
      icon: Archive,
      color: "border-l-amber-400 bg-amber-500/5",
      textClass: "text-amber-500",
      definition: "Multiple records sharing the same PIN. The engine automatically moves duplicates to the Archive tab."
    },
    {
      label: "Total Market",
      value: <AnimatedNumber value={stats.totalMarketValue || 0} prefix="₱" decimals={2} />,
      icon: Database,
      color: "border-l-green-600 bg-green-500/5",
      textClass: "text-green-600",
      definition: "The combined Market Value of all currently filtered valid records."
    },
    {
      label: "Total Assessed",
      value: <AnimatedNumber value={stats.totalAssessedValue || 0} prefix="₱" decimals={2} />,
      icon: BarChart3,
      color: "border-l-blue-600 bg-blue-500/5",
      textClass: "text-blue-600",
      definition: "The sum of all Assessed Values for valid records."
    },
    {
      label: "Total Tax",
      value: <AnimatedNumber value={stats.totalYearlyTax || 0} prefix="₱" decimals={2} />,
      icon: TrendingUp,
      color: "border-l-emerald-600 bg-emerald-50/5",
      textClass: "text-emerald-600",
      definition: "The estimated combined Yearly Real Property Tax due for all valid records in this session."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 shrink-0">
      {statDefinitions.map((stat, i) => (
        <Popover key={i}>
          <PopoverTrigger asChild>
            <Card className={cn("p-4 border-l-4 flex flex-col shadow-sm cursor-help transition-all hover:scale-[1.03] active:scale-95 hover:shadow-md", stat.color)}>
              <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5 tracking-wide"><stat.icon className="w-3 h-3" /> {stat.label}</div>
              <div className={cn("font-black text-[17px] leading-tight truncate", stat.textClass || "text-foreground")}>{stat.value}</div>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-5 bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg bg-primary/10", stat.textClass)}><stat.icon className="w-4 h-4" /></div>
                <h4 className="font-black uppercase text-xs tracking-widest">{stat.label}</h4>
              </div>
              <p className="font-black text-2xl text-foreground break-words">{stat.value}</p>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed">{stat.definition}</p>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
