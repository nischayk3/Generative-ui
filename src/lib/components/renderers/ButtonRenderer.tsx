"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ButtonProps } from '../schemas';

export const ButtonRenderer: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
};
