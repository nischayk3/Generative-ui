"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeProps } from '../schemas';

export const BadgeRenderer: React.FC<BadgeProps> = ({
  children,
  text,
  variant = 'default',
  className,
  ...props
}) => {
  // Use children if provided, otherwise use text
  const badgeContent = children || text || '';

  return (
    <Badge
      variant={variant}
      className={className}
      {...props}
    >
      {badgeContent}
    </Badge>
  );
};
