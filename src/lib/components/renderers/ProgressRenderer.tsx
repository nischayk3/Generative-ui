"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ProgressProps } from '../schemas';

export const ProgressRenderer: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  ...props
}) => {
  return (
    <Progress
      value={value}
      max={max}
      className={className}
      {...props}
    />
  );
};
