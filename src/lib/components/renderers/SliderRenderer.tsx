"use client";

import React from 'react';
import { Slider } from '@/components/ui/slider';

export const SliderRenderer: React.FC<any> = (props) => {
  const { 
    label, 
    value = [0], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled, 
    className,
    ...sliderProps 
  } = props;
  
  const [sliderValue, setSliderValue] = React.useState(Array.isArray(value) ? value : [value]);

  const handleValueChange = (newValue: number[]) => {
    setSliderValue(newValue);
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(newValue);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className || ''}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-900">{label}</label>
          <span className="text-sm text-gray-600">{sliderValue[0]}</span>
        </div>
      )}
      <Slider
        value={sliderValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
        {...sliderProps}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
