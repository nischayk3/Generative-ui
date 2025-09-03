"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUpIcon, ChevronDownIcon, SearchIcon, DownloadIcon, FilterIcon } from "lucide-react";

interface TableColumn {
  header: string;
  field: string;
  sortable?: boolean;
  width?: string;
}

interface TableToolProps {
  title?: string;
  description?: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

type SortOrder = "asc" | "desc" | null;

export const TableTool = ({ title, description, columns, rows }: TableToolProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return rows;
    
    return rows.filter(row =>
      columns.some(column =>
        String(row[column.field])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [rows, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortOrder) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle different data types
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortOrder === "asc") {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortColumn, sortOrder]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (columnField: string) => {
    if (sortColumn === columnField) {
      setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc");
    } else {
      setSortColumn(columnField);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (columnField: string) => {
    if (sortColumn !== columnField) return null;
    
    if (sortOrder === "asc") {
      return <ChevronUpIcon className="h-4 w-4" />;
    } else if (sortOrder === "desc") {
      return <ChevronDownIcon className="h-4 w-4" />;
    }
    return null;
  };

  const getCellValue = (value: unknown, fieldName: string) => {
    if (value === null || value === undefined) return "-";
    
    const stringValue = String(value);
    
    // Handle status fields with badges
    if (fieldName.toLowerCase().includes('status')) {
      const lowerValue = stringValue.toLowerCase();
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      
      if (lowerValue.includes('active') || lowerValue.includes('complete') || lowerValue.includes('success')) {
        variant = "default";
      } else if (lowerValue.includes('pending') || lowerValue.includes('waiting')) {
        variant = "secondary";
      } else if (lowerValue.includes('error') || lowerValue.includes('failed') || lowerValue.includes('inactive')) {
        variant = "destructive";
      } else {
        variant = "outline";
      }
      
      return <Badge variant={variant}>{stringValue}</Badge>;
    }
    
    // Handle email fields
    if (fieldName.toLowerCase().includes('email')) {
      return (
        <a href={`mailto:${stringValue}`} className="text-blue-600 hover:text-blue-800 underline">
          {stringValue}
        </a>
      );
    }
    
    // Handle long text with truncation
    if (stringValue.length > 50) {
      return (
        <div className="max-w-xs">
          <span title={stringValue} className="block truncate">
            {stringValue}
          </span>
        </div>
      );
    }
    
    return stringValue;
  };

  const exportData = () => {
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...rows.map(row => 
        columns.map(col => `"${row[col.field] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'table'}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Safety check: if no data provided, show a message
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return (
      <Card className="w-full my-4">
        <CardHeader>
          <CardTitle className="text-black">{title || "Data Table"}</CardTitle>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-600 text-lg">No data available to display</p>
            <p className="text-gray-500 text-sm">Try adding some data to see the table</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safety check: if no columns provided, show a message
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return (
      <Card className="w-full my-4">
        <CardHeader>
          <CardTitle className="text-black">{title || "Data Table"}</CardTitle>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🔧</div>
            <p className="text-gray-600 text-lg">No columns defined for the table</p>
            <p className="text-gray-500 text-sm">Please define table columns to display data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-none my-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-black">{title || "Data Table"}</CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 w-full">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span>Showing {filteredData.length} of {rows.length} entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column, index) => (
                  <TableHead 
                    key={index} 
                    className={`cursor-pointer hover:bg-gray-100 transition-colors ${column.width ? `w-${column.width}` : ''}`}
                    onClick={() => handleSort(column.field)}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      {column.header}
                      {getSortIcon(column.field)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="py-3">
                      {getCellValue(row[column.field], column.field)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
