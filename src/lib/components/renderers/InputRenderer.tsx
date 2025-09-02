"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputProps } from '../schemas';

export const InputRenderer: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  disabled = false,
  required = false,
  min,
  max,
  step,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        className={className}
        {...props}
      />
    </div>
  );
};
