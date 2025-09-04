"use client";

import React, { ReactElement, useMemo, useState, useEffect, useCallback } from 'react';
import { LayoutEngine, LayoutResult, ComponentWithType } from './LayoutEngine';
import { ComponentType } from '../components/schemas';
import { DynamicRenderer } from '../components/DynamicRenderer';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'large'>('desktop');

  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setScreenSize('mobile');
    } else if (width >= 768 && width < 1024) {
      setScreenSize('tablet');
    } else if (width >= 1024 && width < 1440) {
      setScreenSize('desktop');
    } else {
      setScreenSize('large');
    }
  }, []);

  useEffect(() => {
    updateScreenSize(); // Set initial size
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  return screenSize;
};

interface LayoutRendererProps {
  components: ComponentType[];
  layoutType?: 'auto' | 'dashboard' | 'form' | 'analytics' | 'data' | 'profile' | 'settings' | 'generic';
  userPreferences?: {
    theme?: 'light' | 'dark';
    density?: 'compact' | 'comfortable' | 'spacious';
    reduceMotion?: boolean;
    highContrast?: boolean;
    screenSize?: 'mobile' | 'tablet' | 'desktop' | 'large';
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
  const currentScreenSize = useScreenSize();

  // Generate layout based on components and preferences
  const generateLayout = React.useCallback(() => {
    let result: LayoutResult;

    if (layoutType === 'auto') {
      result = layoutEngine.generateLayout(components as ComponentWithType[], currentScreenSize);
    } else {
      // Force specific layout type by modifying context
      const context = layoutEngine.analyzeContext(components as ComponentWithType[], currentScreenSize);
      context.intent = layoutType as any;
      result = layoutEngine.generateLayout(components as ComponentWithType[], currentScreenSize);
    }

    // Optimize layout with user preferences
    if (userPreferences) {
      result = layoutEngine.optimizeLayout(result, userPreferences);
    }

    return result;
  }, [components, layoutType, userPreferences, layoutEngine, currentScreenSize]);

  const layoutResult = useMemo(() => {
    const result = generateLayout();
    onLayoutGenerated?.(result);
    return result;
  }, [generateLayout, onLayoutGenerated]);

  return (
    <div
      className={`dynamic-layout-container ${layoutResult.containerClasses} ${className || ''}`}
      style={layoutResult.pattern.gridTemplate ? { gridTemplateAreas: layoutResult.pattern.gridTemplate } : undefined}
    >
      {layoutResult.componentLayouts.map((layoutItem, index) => (
        <div
          key={`${layoutItem.component.type}-${index}`}
          className={`dynamic-layout-item ${layoutItem.classes} flex flex-col`}
        >
          <DynamicRenderer
            component={layoutItem.component}
            onError={(error, componentType) => {
              console.error(`Layout rendering error for ${componentType}:`, error);
            }}
            onRender={(componentType, props) => {
              console.log(`Rendered ${componentType} in dynamic layout area: ${layoutItem.gridArea}`);
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
