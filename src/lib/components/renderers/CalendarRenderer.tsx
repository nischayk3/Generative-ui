"use client";

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarProps } from '../schemas';

interface EventCalendarEvent {
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
}

export const CalendarRenderer: React.FC<any> = (props) => {
  const {
    // Simple calendar props
    mode = 'single',
    selected,
    onSelect,
    // Event calendar props  
    title,
    description,
    events,
    className,
    // Remove non-calendar props
    type,
    id,
    ...calendarProps
  } = props;

  const [date, setDate] = React.useState<Date | undefined>(selected);

  const handleSelect = (day: Date | undefined) => {
    setDate(day);
    if (onSelect && typeof onSelect === 'function') {
      onSelect(day);
    }
  };

  // If events are provided, render as event calendar
  if (events && events.length > 0) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {/* Simple calendar for date selection */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              className="rounded-md border"
            />
            
            {/* Events list */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Upcoming Events</h3>
              {events.map((event: EventCalendarEvent, index: number) => (
                <div key={index} className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    {event.time && <span>🕐 {event.time}</span>}
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-2">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default simple calendar
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSelect}
      className={`rounded-md border ${className || ''}`}
      {...calendarProps}
    />
  );
};
