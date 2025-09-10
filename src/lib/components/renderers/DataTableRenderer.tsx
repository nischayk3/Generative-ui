"use client";

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const DataTableRenderer: React.FC<any> = (props) => {
  const { 
    title,
    description,
    data = [],
    columns = [],
    searchable = true,
    sortable = true,
    filterable = false,
    onRowClick,
    className,
    ...dataTableProps 
  } = props;

  // Transform columns if they're simple strings or objects with different property names
  const processedColumns = columns.map((col: any) => {
    if (typeof col === 'string') {
      return {
        key: col.toLowerCase().replace(/\s+/g, ''),
        title: col,
        sortable: true
      };
    }
    
    // Handle objects with header/field properties (common LLM output format)
    if (col.header && col.field) {
      return {
        key: col.field,
        title: col.header,
        sortable: col.sortable !== false
      };
    }
    
    // Handle objects with title/key properties (our expected format) 
    if (col.title && col.key) {
      return col;
    }
    
    // Fallback: try to map common property names
    return {
      key: col.key || col.field || col.accessor || col.dataIndex || 'unknown',
      title: col.title || col.header || col.label || col.name || 'Unknown',
      sortable: col.sortable !== false
    };
  });

  // If no columns provided, infer from data
  const inferredColumns = processedColumns.length > 0 
    ? processedColumns 
    : data.length > 0 
      ? Object.keys(data[0]).map(key => ({
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          sortable: true
        }))
      : [];

  const handleRowClick = (row: any) => {
    if (onRowClick && typeof onRowClick === 'function') {
      onRowClick(row);
    }
  };

  const content = (
    <DataTable
      data={data}
      columns={inferredColumns}
      searchable={searchable}
      sortable={sortable}
      filterable={filterable}
      onRowClick={handleRowClick}
      className={className}
      {...dataTableProps}
    />
  );

  // If title or description provided, wrap in card
  if (title || description) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};
