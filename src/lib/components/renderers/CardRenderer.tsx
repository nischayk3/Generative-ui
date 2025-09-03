"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardProps } from '../schemas';
import { DynamicRenderer } from '../DynamicRenderer';
import { ComponentType } from '../schemas';
import { componentRegistry } from '../ComponentRegistry';

// Helper function to safely render unknown content
const renderUnknownContent = (content: unknown): React.ReactElement | null => {
  if (content === null || content === undefined) {
    return null;
  }

  if (typeof content === 'string') {
    return React.createElement('span', null, content);
  }

  if (typeof content === 'number' || typeof content === 'boolean') {
    return React.createElement('span', null, String(content));
  }

  if (React.isValidElement(content)) {
    return content;
  }

  if (Array.isArray(content)) {
    return React.createElement('div', null,
      content.map((item, index) =>
        React.createElement('div', { key: index }, renderUnknownContent(item))
      )
    );
  }

  if (typeof content === 'object') {
    return React.createElement('pre', { className: 'text-sm' }, JSON.stringify(content, null, 2));
  }

  return React.createElement('span', null, String(content));
};

interface CardRendererProps {
  title?: string;
  description?: string;
  content?: unknown;
  footer?: unknown;
  components?: any[];
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  layout?: 'default' | 'grid' | 'sidebar' | 'dashboard';
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
  className,
  ...props
}) => {
  // Safely render content and footer
  const renderContent = () => {
    if (!content) return null;
    return renderUnknownContent(content);
  };

  const renderComponents = () => {
    if (!components || components.length === 0) return null;
    return (
      <div className="space-y-4">
        {components.map((component: any, index: number) => {
          // Validate component before rendering
          const componentType = component?.type;
          console.log(`Checking component type: ${componentType}, available: ${componentRegistry.isComponentAvailable(componentType)}`);
          if (!componentType || !componentRegistry.isComponentAvailable(componentType)) {
            console.warn(`Unknown component type: ${componentType}, skipping component at index ${index}`);
            console.log('Available components:', componentRegistry.getAllComponents().map(c => c.metadata.type));
            return (
              <div key={`unknown-${index}`} className="p-4 border border-yellow-200 rounded-md bg-yellow-50">
                <p className="text-yellow-800 text-sm">
                  Unknown component type: {componentType}
                </p>
              </div>
            );
          }

          try {
            const validation = componentRegistry.validateComponentProps(componentType, component);
            if (!validation.success) {
              console.error(`Component validation failed for ${componentType} at index ${index}:`, {
                component,
                error: validation.error?.format?.() || validation.error
              });

              // Try to render with the original data if validation fails
              return (
                <DynamicRenderer
                  key={`${componentType}-${index}`}
                  component={component as ComponentType}
                  onError={(error, type) => {
                    console.error(`Card component error for ${type}:`, error);
                  }}
                />
              );
            }

            return (
              <DynamicRenderer
                key={`${componentType}-${index}`}
                component={validation.data as ComponentType}
                onError={(error, componentType) => {
                  console.error(`Card component error: ${componentType}`, error);
                }}
              />
            );
          } catch (error) {
            console.error(`Unexpected error rendering component ${componentType} at index ${index}:`, error);
            return (
              <div key={`error-${index}`} className="p-4 border border-red-200 rounded-md bg-red-50">
                <p className="text-red-800 text-sm">
                  Error rendering {componentType} component: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;
    return renderUnknownContent(footer);
  };
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg border-0';
      case 'outlined':
        return 'border-2 shadow-none';
      case 'filled':
        return 'bg-gray-50 border-0';
      default:
        return '';
    }
  };

  const getLayoutClasses = () => {
    // Calculate adaptive grid based on component count for better space utilization
    const getAdaptiveGrid = (componentCount: number = 0): string => {
      if (componentCount <= 1) return 'grid-cols-1';
      if (componentCount <= 3) return 'grid-cols-1 md:grid-cols-2';
      if (componentCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    const componentCount = components?.length || 0;

    // For dashboard layout with nested components, let the nested components handle their own layout
    // Don't apply grid to the card itself to prevent conflicts
    if (layout === 'dashboard' && componentCount > 0) {
      // Check if any nested component has its own layout that would conflict
      const hasNestedLayout = components?.some(comp =>
        comp && typeof comp === 'object' &&
        (comp.layout === 'grid' || comp.layout === 'dashboard' || (comp.components && comp.components.length > 0))
      );

      if (hasNestedLayout) {
        return 'w-full'; // Don't apply grid layout to avoid conflicts
      }
    }

    switch (layout) {
      case 'grid':
        return `grid ${getAdaptiveGrid(componentCount)} gap-4 w-full`;
      case 'sidebar':
        return 'flex flex-col md:flex-row w-full';
      case 'dashboard':
        // Use adaptive grid for simple cases or when no nested layouts exist
        return `grid ${getAdaptiveGrid(componentCount)} gap-6 w-full`;
      default:
        return 'w-full';
    }
  };

  return (
    <Card className={`${getVariantClasses()} ${getLayoutClasses()} ${className || ''} w-full h-full min-h-[200px]`} {...props}>
      {(title || description) && (
        <CardHeader className="pb-4">
          {title && <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>}
          {description && <CardDescription className="text-sm text-gray-600">{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {renderContent()}
          {renderComponents()}
        </div>
      </CardContent>

      {renderFooter() && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          {renderFooter()}
        </div>
      )}
    </Card>
  );
};
