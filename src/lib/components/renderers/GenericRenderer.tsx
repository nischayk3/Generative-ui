"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComponentProps } from '../schemas';

export const GenericRenderer: React.FC<ComponentProps> = ({
  type,
  title,
  description,
  className,
  children,
  ...props
}) => {
  // Extract displayable props
  const displayableProps = Object.entries(props).filter(([key, value]) => {
    // Skip internal props and functions
    if (key.startsWith('_') || typeof value === 'function') return false;
    // Skip complex objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) return false;
    return true;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Badge variant="secondary">{type}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {children && <div className="mb-4">{children}</div>}

        {displayableProps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Properties:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displayableProps.map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-800">
                    {Array.isArray(value)
                      ? value.join(', ')
                      : String(value)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            This is a generic renderer for the <strong>{type}</strong> component.
            A specific renderer is not yet implemented.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
