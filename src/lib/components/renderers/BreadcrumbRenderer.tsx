"use client";

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const BreadcrumbRenderer: React.FC<any> = (props) => {
  const { items = [], separator, className, ...breadcrumbProps } = props;

  const renderBreadcrumbItem = (item: any, index: number, isLast: boolean) => {
    return (
      <React.Fragment key={index}>
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{item.title || item.label || item}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={item.href || "#"}>
              {item.title || item.label || item}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  };

  return (
    <Breadcrumb className={className} {...breadcrumbProps}>
      <BreadcrumbList>
        {items.map((item: any, index: number) => {
          const isLast = index === items.length - 1;
          return renderBreadcrumbItem(item, index, isLast);
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
