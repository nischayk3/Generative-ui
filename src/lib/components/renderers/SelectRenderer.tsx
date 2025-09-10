"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SelectRenderer: React.FC<any> = (props) => {
  const { label, options = [], placeholder, value, onValueChange, disabled, required, className, ...selectProps } = props;
  
  const [selectedValue, setSelectedValue] = React.useState(value);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(newValue);
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className || ''}`}>
      {label && (
        <label className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select 
        value={selectedValue} 
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
        {...selectProps}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: any, index: number) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            
            return (
              <SelectItem key={index} value={optionValue}>
                {optionLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
