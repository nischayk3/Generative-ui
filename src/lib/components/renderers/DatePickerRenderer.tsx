"use client";

import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DatePickerProps } from '../schemas';

export const DatePickerRenderer: React.FC<any> = (props) => {
  const { date, setDate, label, placeholder, required, ...buttonProps } = props;
  
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (setDate && typeof setDate === 'function') {
      setDate(newDate);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="text-sm font-medium text-gray-900">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            {...buttonProps}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder || "Pick a date"}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {required && <span className="text-xs text-gray-500">* Required</span>}
    </div>
  );
};
