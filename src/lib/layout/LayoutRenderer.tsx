"use client";

import React, { ReactElement } from 'react';
import { LayoutEngine, LayoutResult, ComponentWithType } from './LayoutEngine';
import { ComponentType } from '../components/schemas';
import { DynamicRenderer } from '../components/DynamicRenderer';

interface LayoutRendererProps {
  components: ComponentType[];
  layoutType?: 'auto' | 'dashboard' | 'form' | 'analytics' | 'data' | 'profile' | 'settings' | 'generic';
  userPreferences?: {
    theme?: 'light' | 'dark';
    density?: 'compact' | 'comfortable' | 'spacious';
    reduceMotion?: boolean;
    highContrast?: boolean;
  };
  className?: string;
  onLayoutGenerated?: (layout: LayoutResult) => void;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  components,
  layoutType = 'auto',
  userPreferences,
  className,
  onLayoutGenerated,
}) => {
  const layoutEngine = LayoutEngine.getInstance();

  // Generate layout based on components and preferences
  const generateLayout = React.useCallback(() => {
    let result: LayoutResult;

    if (layoutType === 'auto') {
      result = layoutEngine.generateLayout(components as ComponentWithType[]);
    } else {
      // Force specific layout type by modifying context
      const context = layoutEngine.analyzeContext(components as ComponentWithType[]);
      context.intent = layoutType as any;
      result = layoutEngine.generateLayout(components as ComponentWithType[]);
    }

    // Optimize layout with user preferences
    if (userPreferences) {
      result = layoutEngine.optimizeLayout(result, userPreferences);
    }

    return result;
  }, [components, layoutType, userPreferences, layoutEngine]);

  const layoutResult = React.useMemo(() => {
    const result = generateLayout();
    onLayoutGenerated?.(result);
    return result;
  }, [generateLayout, onLayoutGenerated]);

  // Generate CSS custom properties for grid areas
  const generateGridStyles = () => {
    const styles: Record<string, string> = {};

    // Desktop styles
    styles['--grid-template-areas'] = layoutResult.pattern.gridTemplate
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Mobile styles
    if (layoutResult.pattern.breakpoints.mobile) {
      styles['--grid-template-areas-mobile'] = layoutResult.pattern.breakpoints.mobile
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Tablet styles
    if (layoutResult.pattern.breakpoints.tablet) {
      styles['--grid-template-areas-tablet'] = layoutResult.pattern.breakpoints.tablet
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return styles;
  };

  const gridStyles = generateGridStyles();

  return (
    <div
      className={`${layoutResult.containerClasses} ${className || ''}`}
      style={{
        ...gridStyles,
        gridTemplateAreas: 'var(--grid-template-areas, auto)',
      }}
    >
      {layoutResult.componentLayouts.map((layout, index) => (
        <div
          key={`${layout.component.type}-${index}`}
          className="layout-item"
          style={{
            gridArea: layout.gridArea,
            ...parseLayoutClasses(layout.classes),
          }}
        >
          <DynamicRenderer
            component={layout.component}
            onError={(error, componentType) => {
              console.error(`Layout rendering error for ${componentType}:`, error);
            }}
            onRender={(componentType, props) => {
              console.log(`Rendered ${componentType} in layout area: ${layout.gridArea}`);
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Utility function to parse layout classes into style object
function parseLayoutClasses(classes: string): Record<string, string> {
  const styles: Record<string, string> = {};
  const classArray = classes.split(';').map(c => c.trim()).filter(c => c);

  for (const classItem of classArray) {
    if (classItem.includes(':')) {
      const [property, value] = classItem.split(':').map(s => s.trim());
      if (property && value) {
        // Convert CSS property names
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        styles[cssProperty] = value;
      }
    }
  }

  return styles;
}

// Utility function to render components with automatic layout detection
export const renderWithAutoLayout = (
  components: ComponentType[],
  options?: {
    layoutType?: 'auto' | 'dashboard' | 'form' | 'analytics' | 'data' | 'profile' | 'settings' | 'generic';
    userPreferences?: LayoutRendererProps['userPreferences'];
    className?: string;
    onLayoutGenerated?: (layout: LayoutResult) => void;
  }
): ReactElement => {
  return (
    <LayoutRenderer
      components={components}
      layoutType={options?.layoutType || 'auto'}
      userPreferences={options?.userPreferences}
      className={options?.className}
      onLayoutGenerated={options?.onLayoutGenerated}
    />
  );
};

// Higher-order component for layout-aware rendering - Simplified to fix type issues
export const withLayout = <P extends object>(
  Component: React.ComponentType<P>,
  layoutOptions?: {
    type?: 'auto' | 'dashboard' | 'form' | 'analytics' | 'data' | 'profile' | 'settings' | 'generic';
    preferences?: LayoutRendererProps['userPreferences'];
  }
) => {
  return React.forwardRef<any, P>((props, ref) => {
    // Extract components from props if they exist
    const components = (props as any).components || [];
    const hasComponents = Array.isArray(components) && components.length > 0;

    if (hasComponents) {
      return (
        <LayoutRenderer
          components={components}
          layoutType={layoutOptions?.type || 'auto'}
          userPreferences={layoutOptions?.preferences}
        />
      );
    }

    // Use proper type assertion to fix the HOC type issue
    return <Component {...(props as P)} ref={ref} />;
  });
};

// Hook for using layout engine in functional components
export const useLayoutEngine = () => {
  const layoutEngine = LayoutEngine.getInstance();

  return {
    generateLayout: (components: ComponentType[]) => layoutEngine.generateLayout(components as ComponentWithType[]),
    analyzeContext: (components: ComponentType[]) => layoutEngine.analyzeContext(components as ComponentWithType[]),
    getPatterns: () => layoutEngine.getPatterns(),
    getPattern: (name: string) => layoutEngine.getPattern(name),
  };
};

export default LayoutRenderer;
