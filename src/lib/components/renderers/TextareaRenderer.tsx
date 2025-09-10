"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

export const TextareaRenderer: React.FC<any> = (props) => {
  const { label, placeholder, value, onChange, disabled, required, rows = 3, className, ...textareaProps } = props;
  
  const [textValue, setTextValue] = React.useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    if (onChange && typeof onChange === 'function') {
      onChange(e);
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
      <Textarea
        placeholder={placeholder}
        value={textValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
        {...textareaProps}
      />
    </div>
  );
};
