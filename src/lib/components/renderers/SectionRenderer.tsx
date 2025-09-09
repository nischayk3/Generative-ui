"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionProps } from '../schemas';
import { DynamicRenderer } from '../DynamicRenderer';
import { ComponentType } from '../schemas';

export const SectionRenderer: React.FC<SectionProps> = ({
  title,
  content,
  fields,
  components,
  layout = 'default',
  className,
  ...props
}) => {
  const renderContent = () => {
    if (!content) return null;
    if (React.isValidElement(content)) return content;
    if (typeof content === 'string') {
      return <p className="text-sm text-gray-700">{content}</p>;
    }
    return null;
  };

  const renderFields = () => {
    if (!fields || fields.length === 0) return null;

    return (
      <div className="space-y-2">
        {fields.map((field: any, index: number) => {
          if (typeof field === 'object' && field.type) {
            return (
              <DynamicRenderer
                key={`field-${index}`}
                component={field as ComponentType}
                onError={(error, componentType) => {
                  console.error(`Section field error: ${componentType}`, error);
                }}
              />
            );
          }

          if (typeof field === 'object' && field.label && field.value) {
            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">{field.label}:</span>
                <span className="text-gray-900">{field.value}</span>
              </div>
            );
          }

          return (
            <div key={index} className="text-sm text-gray-700">
              {typeof field === 'string' ? field : JSON.stringify(field)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderComponents = () => {
    if (!components || components.length === 0) return null;

    const getLayoutClasses = () => {
      const componentCount = components.length;
      if (layout === 'grid' && componentCount > 0) {
        let gridClasses = 'grid-cols-1';
        if (componentCount >= 2) gridClasses += ' md:grid-cols-2';
        if (componentCount >= 3) gridClasses += ' lg:grid-cols-3';
        return `grid ${gridClasses} gap-6`;
      }
      return 'space-y-4'; // Default to vertical stacking
    };

    return (
      <div className={getLayoutClasses()}>
        {components.map((component: any, index: number) => {
          if (typeof component === 'object' && component.type) {
            return (
              <DynamicRenderer
                key={`component-${index}`}
                component={component as ComponentType}
                onError={(error, componentType) => {
                  console.error(`Section component error: ${componentType}`, error);
                }}
              />
            );
          }

          return (
            <div key={index} className="text-sm text-gray-700">
              {typeof component === 'string' ? component : JSON.stringify(component)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={className} {...props}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-6">
          {renderContent()}
          {renderFields()}
          {renderComponents()}
        </div>
      </CardContent>
    </Card>
  );
};