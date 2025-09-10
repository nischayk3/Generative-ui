"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';

export const SeparatorRenderer: React.FC<any> = (props) => {
  const { orientation = 'horizontal', className, ...separatorProps } = props;

  return (
    <Separator
      orientation={orientation}
      className={`my-4 ${className || ''}`}
      {...separatorProps}
    />
  );
};
