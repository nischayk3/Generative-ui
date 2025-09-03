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

  // Simplified adaptive grid generation
  const generateAdaptiveGrid = () => {
    const componentCount = components.length;

    // Adaptive column calculation based on component count and screen size considerations
    const getGridColumns = (count: number): string => {
      if (count <= 1) return 'grid-cols-1';
      if (count <= 3) return 'grid-cols-1 md:grid-cols-2';
      if (count <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    return {
      gridClass: `${getGridColumns(componentCount)} gap-4 md:gap-6 lg:gap-8`,
      componentCount,
    };
  };

  const adaptiveGrid = generateAdaptiveGrid();

  // Simplified responsive styles
  const responsiveStyles = useMemo(() => {
    return {
      container: `grid ${adaptiveGrid.gridClass} w-full min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50`,
      component: 'w-full h-full min-h-[200px]',
    };
  }, [adaptiveGrid]);

  return (
    <div
      className={`dynamic-layout-container ${responsiveStyles.container} ${className || ''}`}
    >
      {components.map((component, index) => (
        <div
          key={`${component.type}-${index}`}
          className={`dynamic-layout-item ${responsiveStyles.component} flex flex-col`}
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
