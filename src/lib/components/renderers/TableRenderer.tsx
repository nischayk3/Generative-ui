"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableProps, TableColumn } from '../schemas';

export const TableRenderer: React.FC<TableProps> = ({
  title,
  description,
  columns,
  rows,
  sortable = false,
  selectable = false,
  pagination = false,
  pageSize = 10,
  className,
  ...props
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const sortedRows = React.useMemo(() => {
    if (!sortColumn || !sortable) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortColumn, sortDirection, sortable]);

  const paginatedRows = React.useMemo(() => {
    if (!pagination) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize, pagination]);

  const handleSort = (column: TableColumn) => {
    if (!sortable || !column.sortable) return;

    if (sortColumn === column.field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.field);
      setSortDirection('asc');
    }
  };

  const renderCellValue = (row: Record<string, unknown>, column: TableColumn) => {
    const value = row[column.field];
    if (value === null || value === undefined) return '-';

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <Card className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>
        <div className="rounded-md border w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && <TableHead className="w-12">Select</TableHead>}
                {columns.map((column) => (
                  <TableHead
                    key={column.field}
                    className={column.sortable && sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                    onClick={() => handleSort(column)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortable && sortColumn === column.field && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.map((row, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {renderCellValue(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedRows.length)} of{' '}
              {sortedRows.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(sortedRows.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(sortedRows.length / pageSize)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
