"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeProps } from '../schemas';

export const BadgeRenderer: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <Badge
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </Badge>
  );
};
