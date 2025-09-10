"use client";

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const PaginationRenderer: React.FC<any> = (props) => {
  const { 
    totalItems = 100,
    pageSize = 10,
    currentPage = 1,
    onPageChange,
    showPrevious = true,
    showNext = true,
    showEllipsis = true,
    className,
    ...paginationProps 
  } = props;

  const totalPages = Math.ceil(totalItems / pageSize);
  const [page, setPage] = React.useState(currentPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setPage(newPage);
    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(newPage);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col items-center space-y-4">
      <Pagination className={className} {...paginationProps}>
        <PaginationContent>
          {showPrevious && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          )}
          
          {visiblePages.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(pageNum as number)}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          {showNext && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(page + 1)}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
      
      <div className="text-sm text-muted-foreground">
        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} results
      </div>
    </div>
  );
};
