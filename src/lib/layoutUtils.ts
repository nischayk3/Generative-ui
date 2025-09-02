// Simple Layout Intelligence - KISS Approach
export interface LayoutConfig {
  type: 'grid' | 'flex' | 'single';
  columns?: number;
  gap?: string;
  responsive?: boolean;
  componentSizing?: Record<string, string>;
}

export interface ComponentLayout {
  componentType: string;
  size: 'small' | 'medium' | 'large' | 'full';
  priority: number;
}

// Smart layout determination based on component types
export function determineLayout(components: ComponentLayout[]): LayoutConfig {
  if (!components || components.length === 0) {
    return { type: 'single' };
  }

  // Single component - full width
  if (components.length === 1) {
    return {
      type: 'single',
      responsive: true
    };
  }

  // Analyze component types and sizes
  const hasLargeComponent = components.some(comp =>
    comp.size === 'large' || comp.size === 'full'
  );

  const hasDataComponents = components.some(comp =>
    comp.componentType === 'chart' || comp.componentType === 'table'
  );

  // Dashboard-like layout for mixed components
  if (hasDataComponents && components.length >= 3) {
    return {
      type: 'grid',
      columns: 2,
      gap: '1rem',
      responsive: true,
      componentSizing: {
        chart: 'col-span-2',
        table: 'col-span-2',
        form: 'col-span-1',
        card: 'col-span-1'
      }
    };
  }

  // Two-column layout for forms and complementary components
  if (components.length === 2) {
    return {
      type: 'grid',
      columns: 2,
      gap: '1rem',
      responsive: true,
      componentSizing: {
        form: 'col-span-2 md:col-span-1',
        chart: 'col-span-2 md:col-span-1',
        table: 'col-span-2',
        card: 'col-span-2 md:col-span-1'
      }
    };
  }

  // Three-column layout for compact layouts
  if (components.length === 3) {
    return {
      type: 'grid',
      columns: 3,
      gap: '0.75rem',
      responsive: true,
      componentSizing: {
        form: 'col-span-3 md:col-span-1',
        chart: 'col-span-3 md:col-span-2',
        table: 'col-span-3',
        card: 'col-span-3 md:col-span-1'
      }
    };
  }

  // Default grid layout
  return {
    type: 'grid',
    columns: Math.min(components.length, 3),
    gap: '1rem',
    responsive: true
  };
}

// Utility function to get responsive classes
export function getResponsiveClasses(layout: LayoutConfig, componentType: string): string {
  if (!layout.responsive) {
    return '';
  }

  const sizing = layout.componentSizing?.[componentType];
  if (sizing) {
    return sizing;
  }

  // Default responsive behavior
  switch (componentType) {
    case 'table':
      return 'col-span-full';
    case 'chart':
      return 'col-span-full md:col-span-1';
    case 'form':
      return 'col-span-full md:col-span-1';
    case 'card':
      return 'col-span-full md:col-span-1';
    default:
      return 'col-span-full md:col-span-1';
  }
}

// Generate CSS classes for layout
export function generateLayoutClasses(layout: LayoutConfig): string {
  switch (layout.type) {
    case 'grid':
      const cols = layout.columns || 1;
      const responsiveCols = layout.responsive
        ? `grid-cols-1 md:grid-cols-${Math.min(cols, 3)} lg:grid-cols-${cols}`
        : `grid-cols-${cols}`;

      return `grid ${responsiveCols} gap-${layout.gap?.replace('.', '-') || '4'}`;

    case 'flex':
      return `flex flex-wrap gap-${layout.gap?.replace('.', '-') || '4'}`;

    case 'single':
    default:
      return 'w-full';
  }
}

// Auto-arrange components based on their characteristics
export function arrangeComponents(componentTypes: string[]): ComponentLayout[] {
  return componentTypes.map((type, index) => {
    let size: 'small' | 'medium' | 'large' | 'full' = 'medium';
    let priority = 1;

    // Determine size based on component type
    switch (type) {
      case 'table':
        size = 'full';
        priority = 3;
        break;
      case 'chart':
        size = 'large';
        priority = 2;
        break;
      case 'form':
        size = 'medium';
        priority = 1;
        break;
      case 'card':
        size = 'small';
        priority = 1;
        break;
    }

    return {
      componentType: type,
      size,
      priority
    };
  });
}
