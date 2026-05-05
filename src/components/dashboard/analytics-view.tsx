
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  Pie, 
  PieChart, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { 
  CheckCircle2, 
  MapPin, 
  RefreshCw, 
  Database, 
  Lightbulb, 
  Maximize2 
} from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const analyticsChartConfig = {
  value: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const marketChartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface AnalyticsViewProps {
  analyticsData: {
    totalRecords: number;
    auChart: { name: string; value: number }[];
    marketChart: { name: string; value: number }[];
    updateChart: { name: string; value: number }[];
    barangayChart: { name: string; value: number }[];
  };
  onExplain: (type: string) => void;
  onExpand: (type: 'usage' | 'barangay' | 'update' | 'market') => void;
}

export function AnalyticsView({ analyticsData, onExplain, onExpand }: AnalyticsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 max-w-7xl mx-auto w-full">
      <Card className="p-6 border-white/5 bg-card shadow-2xl overflow-hidden flex flex-col group">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-sm font-black uppercase flex items-center gap-2.5 tracking-widest text-muted-foreground">
            <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Property Usage Distribution
          </h4>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onExplain('usage')}
              className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Explain
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onExpand('usage')}
              className="h-8 w-8 bg-muted/20 hover:bg-primary hover:text-white transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={analyticsChartConfig}>
            <BarChart data={analyticsData.auChart} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.05} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{analyticsData.auChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
      
      <Card className="p-6 border-white/5 bg-card shadow-2xl overflow-hidden flex flex-col group">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-sm font-black uppercase flex items-center gap-2.5 tracking-widest text-muted-foreground">
            <MapPin className="w-4.5 h-4.5 text-primary" /> Barangay Distribution
          </h4>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onExplain('barangay')}
              className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Explain
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onExpand('barangay')}
              className="h-8 w-8 bg-muted/20 hover:bg-primary hover:text-white transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={analyticsChartConfig}>
            <BarChart data={analyticsData.barangayChart} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.05} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{analyticsData.barangayChart.map((entry, index) => <Cell key={`cell-brgy-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />)}</Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6 border-white/5 bg-card shadow-2xl overflow-hidden flex flex-col group">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-sm font-black uppercase flex items-center gap-2.5 tracking-widest text-muted-foreground">
            <RefreshCw className="w-4.5 h-4.5 text-primary" /> Update Code Distribution
          </h4>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onExplain('update')}
              className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Explain
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onExpand('update')}
              className="h-8 w-8 bg-muted/20 hover:bg-primary hover:text-white transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={analyticsChartConfig}>
            <BarChart data={analyticsData.updateChart} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.05} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{analyticsData.updateChart.map((entry, index) => <Cell key={`cell-upd-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}</Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6 border-white/5 bg-card shadow-2xl flex flex-col group relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-sm font-black uppercase flex items-center gap-2.5 tracking-widest text-muted-foreground">
            <Database className="w-4.5 h-4.5 text-primary" /> Market Value Breakdown
          </h4>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onExplain('market')}
              className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Explain
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onExpand('market')}
              className="h-8 w-8 bg-muted/20 hover:bg-primary hover:text-white transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={marketChartConfig}>
            <PieChart>
              <Pie data={analyticsData.marketChart} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {analyticsData.marketChart.map((entry, index) => <Cell key={`cell-market-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '11px', fontWeight: 'bold' }}/>
            </PieChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
