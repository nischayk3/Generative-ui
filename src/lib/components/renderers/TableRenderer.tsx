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
import { TableProps } from '../schemas';

interface TableRendererProps extends TableProps {
  title?: string;
  description?: string;
  frameless?: boolean;
}

export const TableRenderer: React.FC<TableRendererProps> = ({
  title,
  description,
  columns,
  rows,
  sortable = false,
  selectable = false,
  pagination = false,
  pageSize = 10,
  frameless = false,
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
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
      
      // Convert to comparable values
      const aStr = String(aVal);
      const bStr = String(bVal);
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortColumn, sortDirection, sortable]);

  const paginatedRows = React.useMemo(() => {
    if (!pagination) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize, pagination]);

  const handleSort = (column: any) => {
    if (!sortable || !column.sortable) return;
    if (sortColumn === column.field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.field);
      setSortDirection('asc');
    }
  };

  const renderTable = () => (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && <TableHead className="w-12">Select</TableHead>}
            {columns.map((column) => (
              <TableHead key={column.field} className={column.sortable && sortable ? 'cursor-pointer' : ''} onClick={() => handleSort(column)} style={{ width: column.width }}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((row, index) => (
            <TableRow key={index}>
              {selectable && <TableCell><input type="checkbox" /></TableCell>}
              {columns.map((column) => (
                <TableCell key={column.field}>{String(row[column.field])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} results
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedRows.length / pageSize), p + 1))} disabled={currentPage >= Math.ceil(sortedRows.length / pageSize)}>
          Next
        </Button>
      </div>
    </div>
  );

  if (frameless) {
    return (
      <div className={className}>
        {renderTable()}
        {pagination && renderPagination()}
      </div>
    );
  }

  return (
    <Card className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {renderTable()}
        {pagination && renderPagination()}
      </CardContent>
    </Card>
  );
};