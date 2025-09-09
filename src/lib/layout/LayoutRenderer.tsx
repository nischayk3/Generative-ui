"use client";

import React, { useMemo } from 'react';
import { ComponentType } from '../components/schemas';
import { DynamicRenderer } from '../components/DynamicRenderer';
import { dashboardGenerator, GeneratedDashboard } from './DashboardGenerator';

interface LayoutRendererProps {
  components: ComponentType[];
  layoutType?: 'auto' | 'dashboard';
  className?: string;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  components,
  layoutType = 'auto',
  className,
}) => {

  const layoutResult = useMemo(() => {
    const isDashboard = layoutType === 'dashboard' || 
                        (layoutType === 'auto' && components.length > 1);

    if (isDashboard) {
      return dashboardGenerator.generateDashboard(components, { layout: 'professional' });
    }
    
    // Fallback for non-dashboard, single-component rendering
    return null;

  }, [components, layoutType]);

  // If it's a dashboard, use the new intelligent generator
  if (layoutResult) {
    const dashboard = layoutResult as GeneratedDashboard;
    return (
      <div className={`${dashboard.styles.container} ${className || ''}`}>
        {dashboard.layout.groups.map((group, groupIndex) => (
          <div key={groupIndex} className={dashboard.styles.group}>
            {group.map((component, itemIndex) => {
              // A major component will be the only one in its group.
              // We make it span both columns of the grid for a full-width effect.
              const itemSpan = group.length === 1 ? 'md:col-span-2' : '';
              return (
                <div key={itemIndex} className={`${dashboard.styles.item} ${itemSpan}`}>
                  <DynamicRenderer
                    component={component}
                    onError={(error, componentType) => {
                      console.error(`Dashboard rendering error for ${componentType}:`, error);
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    );
  }

  // Fallback for rendering single components that are not in a dashboard layout
  return (
    <div className={`p-4 ${className || ''}`}>
      {components.map((component, index) => (
        <DynamicRenderer
          key={index}
          component={component}
          onError={(error, componentType) => {
            console.error(`Rendering error for ${componentType}:`, error);
          }}
        />
      ))}
    </div>
  );
};