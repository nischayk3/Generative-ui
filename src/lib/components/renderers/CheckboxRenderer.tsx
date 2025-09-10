"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export const CheckboxRenderer: React.FC<any> = (props) => {
  const { label, checked, disabled, required, onCheckedChange, className, ...checkboxProps } = props;
  
  const [isChecked, setIsChecked] = React.useState(checked || false);

  const handleCheckedChange = (value: boolean) => {
    setIsChecked(value);
    if (onCheckedChange && typeof onCheckedChange === 'function') {
      onCheckedChange(value);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        required={required}
        {...checkboxProps}
      />
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
    </div>
  );
};
