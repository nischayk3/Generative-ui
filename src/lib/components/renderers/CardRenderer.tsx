"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicRenderer } from '../DynamicRenderer';
import { ComponentType } from '../schemas';
import { componentRegistry } from '../ComponentRegistry';

interface CardRendererProps {
  title?: string;
  description?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  components?: any[];
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  layout?: 'default' | 'grid' | 'sidebar' | 'dashboard';
  frameless?: boolean; // New prop
  className?: string;
  [key: string]: any;
}

export const CardRenderer: React.FC<CardRendererProps> = ({
  title,
  description,
  content,
  footer,
  components,
  variant = 'default',
  layout = 'default',
  frameless = false, // Default to false
  className,
  ...props
}) => {

  const renderContent = () => {
    if (!content && (!components || components.length === 0)) return null;

    const contentToRender = content || (
      <div className="space-y-4">
        {components?.map((component: any, index: number) => {
          const componentType = component?.type;
          if (!componentType || !componentRegistry.isComponentAvailable(componentType)) {
            return <div key={`unknown-${index}`} className="text-xs text-red-500">Unknown component: {componentType}</div>;
          }
          // Pass frameless prop to nested components
          return <DynamicRenderer key={`${componentType}-${index}`} component={{...component, frameless: true}} />;
        })}
      </div>
    );

    if (React.isValidElement(contentToRender)) return contentToRender;
    return <span>{String(contentToRender)}</span>;
  };

  const renderFooter = () => {
    if (!footer) return null;
    if (React.isValidElement(footer)) return footer;
    return <span>{String(footer)}</span>;
  };

  // If frameless, render only the content, without the card shell.
  if (frameless) {
    return <div className={className}>{renderContent()}</div>;
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated': return 'shadow-lg border-0';
      case 'outlined': return 'border-2 shadow-none';
      case 'filled': return 'bg-gray-50 border-0';
      default: return '';
    }
  };

  return (
    <Card className={`${getVariantClasses()} ${className || ''} w-full h-full flex flex-col`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="flex-1">
        {renderContent()}
      </CardContent>

      {footer && (
        <div className="px-6 pb-4 border-t pt-4">
          {renderFooter()}
        </div>
      )}
    </Card>
  );
};