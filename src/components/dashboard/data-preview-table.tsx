"use client";

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { LandRecord } from '@/lib/processor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DataPreviewTableProps {
  data: LandRecord[];
  isProcessed?: boolean;
}

export function DataPreviewTable({ data, isProcessed = false }: DataPreviewTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>No data loaded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-auto border rounded-md h-[calc(100vh-280px)] scrollbar-thin">
      <Table className="text-xs">
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="min-w-[100px]">DATE</TableHead>
            <TableHead className="min-w-[120px]">ARP NO#</TableHead>
            <TableHead className="min-w-[180px]">PIN</TableHead>
            <TableHead className="min-w-[150px]">ACCOUNT NAME</TableHead>
            <TableHead className="min-w-[250px]">LOCATION</TableHead>
            <TableHead className="text-right">AREA (SQM)</TableHead>
            <TableHead className="text-right">MARKET VALUE</TableHead>
            {!isProcessed && <TableHead className="w-24 text-center">STATUS</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 1000).map((row, i) => (
            <TableRow 
              key={i} 
              className={cn(
                "hover:bg-accent/30",
                !isProcessed && row.isDuplicate && "bg-red-50/50 opacity-60"
              )}
            >
              <TableCell className="text-center font-mono text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium whitespace-nowrap">{row.date || '---'}</TableCell>
              <TableCell className="font-mono text-primary font-semibold">{row.arpNo || '---'}</TableCell>
              <TableCell className="font-mono">{row.pin || '---'}</TableCell>
              <TableCell className="max-w-[180px] truncate uppercase font-medium">{row.acctName || '---'}</TableCell>
              <TableCell className="max-w-[250px] truncate uppercase text-muted-foreground">
                {row.location || '---'}
              </TableCell>
              <TableCell className="text-right font-mono">{row.landArea?.toLocaleString() || '0'}</TableCell>
              <TableCell className="text-right font-mono font-bold">{row.marketValue?.toLocaleString() || '0'}</TableCell>
              {!isProcessed && (
                <TableCell className="text-center">
                  {row.isDuplicate ? (
                    <Badge variant="destructive" className="text-[9px] h-4 uppercase">Removed</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] h-4 uppercase bg-green-100 text-green-700 hover:bg-green-100">Kept</Badge>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {data.length > 1000 && (
            <TableRow>
              <TableCell colSpan={isProcessed ? 8 : 9} className="text-center py-4 bg-muted/20 text-muted-foreground">
                Showing first 1,000 records of {data.length.toLocaleString()}...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
