"use client";

import React, { ReactElement, useMemo } from 'react';
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

  const layoutResult = useMemo(() => {
    const result = generateLayout();
    onLayoutGenerated?.(result);
    return result;
  }, [generateLayout, onLayoutGenerated]);

  // Generate dynamic CSS grid based on component analysis
  const generateDynamicGrid = () => {
    const componentCount = components.length;
    const hasCharts = components.some((c: ComponentType) => c.type === 'chart');
    const hasTables = components.some((c: ComponentType) => c.type === 'table');
    const hasCards = components.some((c: ComponentType) => c.type === 'card');
    const hasForms = components.some((c: ComponentType) => c.type === 'form');

    // Determine optimal grid layout based on component types and count
    let gridTemplateColumns = '1fr';
    let gridTemplateRows = '';
    let gridTemplateAreas = '';

    if (componentCount <= 2) {
      // For 1-2 components, use full width
      gridTemplateColumns = '1fr';
      gridTemplateRows = `repeat(${componentCount}, auto)`;
      gridTemplateAreas = components.map((_, i) => `"component-${i}"`).join('\n');
    } else if (componentCount <= 4) {
      // For 3-4 components, use 2-column layout
      gridTemplateColumns = '1fr 1fr';
      const rows = Math.ceil(componentCount / 2);
      gridTemplateRows = `repeat(${rows}, auto)`;
      
      let areas = '';
      for (let i = 0; i < rows; i++) {
        const start = i * 2;
        const end = Math.min(start + 2, componentCount);
        const rowAreas = Array.from({ length: 2 }, (_, j) => {
          if (start + j < componentCount) {
            return `component-${start + j}`;
          }
          return '.';
        }).join(' ');
        areas += `"${rowAreas}"\n`;
      }
      gridTemplateAreas = areas.trim();
    } else if (componentCount <= 6) {
      // For 5-6 components, use 3-column layout
      gridTemplateColumns = '1fr 1fr 1fr';
      const rows = Math.ceil(componentCount / 3);
      gridTemplateRows = `repeat(${rows}, auto)`;
      
      let areas = '';
      for (let i = 0; i < rows; i++) {
        const start = i * 3;
        const end = Math.min(start + 3, componentCount);
        const rowAreas = Array.from({ length: 3 }, (_, j) => {
          if (start + j < componentCount) {
            return `component-${start + j}`;
          }
          return '.';
        }).join(' ');
        areas += `"${rowAreas}"\n`;
      }
      gridTemplateAreas = areas.trim();
    } else {
      // For 7+ components, use 4-column layout
      gridTemplateColumns = '1fr 1fr 1fr 1fr';
      const rows = Math.ceil(componentCount / 4);
      gridTemplateRows = `repeat(${rows}, auto)`;
      
      let areas = '';
      for (let i = 0; i < rows; i++) {
        const start = i * 4;
        const end = Math.min(start + 4, componentCount);
        const rowAreas = Array.from({ length: 4 }, (_, j) => {
          if (start + j < componentCount) {
            return `component-${start + j}`;
          }
          return '.';
        }).join(' ');
        areas += `"${rowAreas}"\n`;
      }
      gridTemplateAreas = areas.trim();
    }

    return {
      gridTemplateColumns,
      gridTemplateRows,
      gridTemplateAreas,
    };
  };

  const dynamicGrid = generateDynamicGrid();

  // Generate responsive breakpoints
  const responsiveStyles = useMemo(() => {
    const componentCount = components.length;
    const baseStyles = {
      display: 'grid',
      width: '100%',
      minHeight: '100vh',
      gap: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      ...dynamicGrid,
    };

    return {
      base: baseStyles,
      mobile: {
        ...baseStyles,
        gridTemplateColumns: '1fr',
        gap: '1rem',
        padding: '1rem',
      },
      tablet: {
        ...baseStyles,
        gridTemplateColumns: componentCount <= 2 ? '1fr' : '1fr 1fr',
        gap: '1.25rem',
        padding: '1.25rem',
      },
      desktop: baseStyles,
    };
  }, [components.length, dynamicGrid]);

  return (
    <div
      className={`dynamic-layout-container ${className || ''}`}
      style={responsiveStyles.base}
    >
      {components.map((component: ComponentType, index) => (
        <div
          key={`${component.type}-${index}`}
          className="dynamic-layout-item"
          style={{
            gridArea: `component-${index}`,
            width: '100%',
            height: '100%',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DynamicRenderer
            component={component}
            onError={(error, componentType) => {
              console.error(`Layout rendering error for ${componentType}:`, error);
            }}
            onRender={(componentType, props) => {
              console.log(`Rendered ${componentType} in dynamic layout area: component-${index}`);
            }}
          />
        </div>
      ))}
    </div>
  );
};

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

// Higher-order component for layout-aware rendering
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
