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
  Maximize2,
  Filter,
  Link2,
  Building2,
  HardHat,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const COLORS = ['#16A249', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

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
  taxabilityFilter: string;
  onTaxabilityFilterChange: (val: string) => void;
  workflowMode?: 'standard' | 'abstract' | 'building-permit';
}

export function AnalyticsView({
  analyticsData,
  onExplain,
  onExpand,
  taxabilityFilter,
  onTaxabilityFilterChange,
  workflowMode = 'standard'
}: AnalyticsViewProps) {
  const isAbstract = workflowMode === 'abstract';
  const isPermit = workflowMode === 'building-permit';

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 w-full h-full">
      {/* Compact Scope Bar */}
      <div className="flex items-center justify-between gap-3 bg-card px-3.5 py-2 rounded-lg border border-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {isPermit ? 'Audit Scope' : (isAbstract ? 'Relational Scope' : 'Analysis Scope')}
            </h3>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <p className="text-xs font-medium text-muted-foreground hidden sm:inline truncate">
              {isPermit ? 'Analytics for linked permit logs' : (isAbstract ? 'Audit analytics by tax status' : 'Filter analytics by tax status')}
            </p>
          </div>
        </div>
        {(!isPermit && !isAbstract) && (
          <div className="w-[180px] shrink-0">
            <Select value={taxabilityFilter} onValueChange={onTaxabilityFilterChange}>
              <SelectTrigger className="h-8 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Taxability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="T">Taxable (T)</SelectItem>
                <SelectItem value="E">Exempted (E)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Full-Bleed 2x2 Viewport-Maximized Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-3 flex-1 min-h-0">
        {/* 1. Property Usage Distribution */}
        <Card className="p-3.5 border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[240px] lg:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
            <h4 className="text-xs font-bold uppercase flex items-center gap-2 tracking-wider text-foreground truncate">
              {isPermit ? (
                <><HardHat className="w-4 h-4 text-[#16A249] shrink-0" /> Occupancy Distribution</>
              ) : isAbstract ? (
                <><Building2 className="w-4 h-4 text-[#16A249] shrink-0" /> Asset Classification</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 text-[#16A249] shrink-0" /> Property Usage Distribution</>
              )}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExplain('usage')}
                className="h-7 px-2.5 text-xs font-semibold text-foreground hover:text-[#16A249]"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-[#16A249]" /> Explain
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onExpand('usage')}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Expand chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ChartContainer config={analyticsChartConfig} className="h-full w-full !aspect-auto">
              <BarChart data={analyticsData.auChart} margin={{ top: 8, right: 12, left: 0, bottom: 28 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={48} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analyticsData.auChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        {/* 2. Barangay Distribution */}
        <Card className="p-3.5 border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[240px] lg:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
            <h4 className="text-xs font-bold uppercase flex items-center gap-2 tracking-wider text-foreground truncate">
              <MapPin className="w-4 h-4 text-[#16A249] shrink-0" /> {isPermit ? 'Permitting Hotspots' : (isAbstract ? 'Transaction Hotspots' : 'Barangay Distribution')}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExplain('barangay')}
                className="h-7 px-2.5 text-xs font-semibold text-foreground hover:text-[#16A249]"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-[#16A249]" /> Explain
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onExpand('barangay')}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Expand chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ChartContainer config={analyticsChartConfig} className="h-full w-full !aspect-auto">
              <BarChart data={analyticsData.barangayChart} margin={{ top: 8, right: 12, left: 0, bottom: 28 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={48} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analyticsData.barangayChart.map((entry, index) => <Cell key={`cell-brgy-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        {/* 3. Update Code Distribution */}
        <Card className="p-3.5 border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[240px] lg:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
            <h4 className="text-xs font-bold uppercase flex items-center gap-2 tracking-wider text-foreground truncate">
              {isPermit ? (
                <><ShieldCheck className="w-4 h-4 text-[#16A249] shrink-0" /> Match Precision Ratio</>
              ) : isAbstract ? (
                <><Link2 className="w-4 h-4 text-[#16A249] shrink-0" /> Join Success Rate</>
              ) : (
                <><RefreshCw className="w-4 h-4 text-[#16A249] shrink-0" /> Update Code Distribution</>
              )}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExplain('update')}
                className="h-7 px-2.5 text-xs font-semibold text-foreground hover:text-[#16A249]"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-[#16A249]" /> Explain
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onExpand('update')}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Expand chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ChartContainer config={analyticsChartConfig} className="h-full w-full !aspect-auto">
              <BarChart data={analyticsData.updateChart} margin={{ top: 8, right: 12, left: 0, bottom: 28 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={48} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analyticsData.updateChart.map((entry, index) => <Cell key={`cell-upd-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        {/* 4. Market Value Breakdown */}
        <Card className="p-3.5 border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[240px] lg:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
            <h4 className="text-xs font-bold uppercase flex items-center gap-2 tracking-wider text-foreground truncate">
              {isPermit ? (
                <><TrendingUp className="w-4 h-4 text-[#16A249] shrink-0" /> Investment Concentration</>
              ) : isAbstract ? (
                <><TrendingUp className="w-4 h-4 text-[#16A249] shrink-0" /> Fiscal Profile Ratio</>
              ) : (
                <><Database className="w-4 h-4 text-[#16A249] shrink-0" /> Market Value Breakdown</>
              )}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExplain('market')}
                className="h-7 px-2.5 text-xs font-semibold text-foreground hover:text-[#16A249]"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1 text-[#16A249]" /> Explain
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onExpand('market')}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Expand chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ChartContainer config={marketChartConfig} className="h-full w-full !aspect-auto">
              <PieChart>
                <Pie
                  data={analyticsData.marketChart}
                  cx="50%"
                  cy="48%"
                  innerRadius="48%"
                  outerRadius="76%"
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {analyticsData.marketChart.map((entry, index) => <Cell key={`cell-market-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              </PieChart>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
