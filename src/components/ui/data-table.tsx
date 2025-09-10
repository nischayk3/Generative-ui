"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Filter } from "lucide-react";

const DataTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data?: Record<string, unknown>[];
    columns?: (string | { key: string; title: string; sortable?: boolean })[];
    searchable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    onRowClick?: (row: Record<string, unknown>) => void;
  }
>(({ className, data = [], columns = [], searchable = true, sortable = true, filterable = false, onRowClick, ...props }, ref) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '');
      const bValue = String(b[sortConfig.key] || '');
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        return prevConfig.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const renderCellContent = (value: unknown) => {
    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "secondary"}>{String(value)}</Badge>;
    }
    if (typeof value === 'number') {
      return <span className="font-medium">{value.toLocaleString()}</span>;
    }
    return String(value);
  };

  return (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                const isString = typeof column === 'string';
                const columnKey = isString ? column.toLowerCase() : column.key;
                const columnTitle = isString ? column : column.title;
                const isSortable = isString ? true : (column.sortable !== false);
                
                return (
                  <TableHead key={index}>
                    {sortable && isSortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-medium"
                        onClick={() => handleSort(columnKey)}
                      >
                        {columnTitle}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="font-medium">{columnTitle}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => {
                    const key = typeof column === 'string' ? column.toLowerCase() : column.key;
                    return (
                      <TableCell key={colIndex}>
                        {renderCellContent(row[key])}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {sortedData.length} of {data.length} results</span>
        </div>
      )}
    </div>
  );
});
DataTable.displayName = "DataTable";

export { DataTable };
