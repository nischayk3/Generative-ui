import { ComponentType } from '../components/schemas';

export interface LayoutContext {
  intent: 'dashboard' | 'form' | 'analytics' | 'data' | 'profile' | 'settings' | 'generic';
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'large';
  componentCount: number;
  hasCharts: boolean;
  hasTables: boolean;
  hasForms: boolean;
  hasCards: boolean;
  priorityComponents: string[];
}

export interface ComponentWithType {
  type: string;
  [key: string]: any;
}

export interface LayoutPattern {
  name: string;
  description: string;
  gridTemplate: string;
  componentMapping: Record<string, string>;
  breakpoints: Record<string, string>;
  spacing: string;
  containerClasses: string;
}

export interface LayoutResult {
  pattern: LayoutPattern;
  componentLayouts: Array<{
    component: ComponentWithType;
    gridArea: string;
    classes: string;
  }>;
  containerClasses: string;
}

export class LayoutEngine {
  private static instance: LayoutEngine;
  private patterns: Map<string, LayoutPattern> = new Map();

  private constructor() {
    this.initializePatterns();
  }

  public static getInstance(): LayoutEngine {
    if (!LayoutEngine.instance) {
      LayoutEngine.instance = new LayoutEngine();
    }
    return LayoutEngine.instance;
  }

  private initializePatterns() {
    // Portfolio Analytics Dashboard - Primary pattern for portfolio dashboards
    this.patterns.set('portfolio-analytics', {
      name: 'Portfolio Analytics Dashboard',
      description: 'Optimized layout for portfolio and financial dashboards with full space utilization',
      gridTemplate: `
        "title title title title"
        "metrics metrics metrics metrics"
        "chart chart chart chart"
        "table table table table"
      `,
      componentMapping: {
        card: 'metrics',
        chart: 'chart',
        table: 'table',
        form: 'metrics',
        text: 'title',
      },
      breakpoints: {
        mobile: `
          "title"
          "metrics"
          "chart"
          "table"
        `,
        tablet: `
          "title title"
          "metrics metrics"
          "chart chart"
          "table table"
        `,
      },
      spacing: 'gap-6',
      containerClasses: 'grid min-h-screen w-full p-6 bg-gray-50',
    });

    // Dashboard Patterns - Improved space utilization
    this.patterns.set('dashboard-metrics', {
      name: 'Dashboard with Metrics',
      description: 'Professional dashboard with metrics cards and charts',
      gridTemplate: `
        "metrics metrics metrics metrics"
        "charts charts charts charts"
        "table table table table"
      `,
      componentMapping: {
        card: 'metrics',
        chart: 'charts',
        table: 'table',
        form: 'metrics',
      },
      breakpoints: {
        mobile: `
          "metrics"
          "charts"
          "table"
        `,
        tablet: `
          "metrics metrics"
          "charts charts"
          "table table"
        `,
      },
      spacing: 'gap-6',
      containerClasses: 'grid min-h-screen w-full p-6 bg-gray-50',
    });

    this.patterns.set('dashboard-analytics', {
      name: 'Analytics Dashboard',
      description: 'Data-heavy dashboard for analytics and reporting',
      gridTemplate: `
        "header header header header"
        "main main main main"
        "charts charts charts charts"
      `,
      componentMapping: {
        card: 'header',
        chart: 'charts',
        table: 'main',
        form: 'main',
      },
      breakpoints: {
        mobile: `
          "header"
          "main"
          "charts"
        `,
        tablet: `
          "header header"
          "main main"
          "charts charts"
        `,
      },
      spacing: 'gap-4',
      containerClasses: 'grid min-h-screen w-full p-6',
    });

    // Form Patterns
    this.patterns.set('form-single-column', {
      name: 'Single Column Form',
      description: 'Clean single column layout for forms',
      gridTemplate: `
        "form"
        "actions"
      `,
      componentMapping: {
        form: 'form',
        button: 'actions',
        card: 'form',
      },
      breakpoints: {},
      spacing: 'gap-4',
      containerClasses: 'grid max-w-2xl mx-auto p-6 w-full',
    });

    this.patterns.set('form-two-column', {
      name: 'Two Column Form',
      description: 'Responsive two-column form layout',
      gridTemplate: `
        "form actions"
      `,
      componentMapping: {
        form: 'form',
        button: 'actions',
        card: 'form',
      },
      breakpoints: {
        mobile: `
          "form"
          "actions"
        `,
      },
      spacing: 'gap-6',
      containerClasses: 'grid grid-cols-1 md:grid-cols-3 gap-6 p-6 w-full',
    });

    // Data Patterns
    this.patterns.set('data-table-focused', {
      name: 'Data Table Focused',
      description: 'Layout optimized for data tables with filters',
      gridTemplate: `
        "filters filters filters filters"
        "table table table table"
        "pagination pagination pagination pagination"
      `,
      componentMapping: {
        table: 'table',
        form: 'filters',
        button: 'pagination',
        card: 'filters',
      },
      breakpoints: {},
      spacing: 'gap-4',
      containerClasses: 'grid p-6 w-full',
    });

    // Generic Patterns - Improved space utilization
    this.patterns.set('grid-responsive', {
      name: 'Responsive Grid',
      description: 'Adaptive grid that maximizes space utilization based on component count',
      gridTemplate: '', // Will be generated dynamically
      componentMapping: {},
      breakpoints: {
        mobile: '1fr',
        tablet: 'repeat(2, 1fr)',
        desktop: 'repeat(auto-fit, minmax(300px, 1fr))',
        large: 'repeat(auto-fit, minmax(350px, 1fr))',
      },
      spacing: 'gap-6',
      containerClasses: 'grid p-6 w-full min-h-screen auto-rows-fr',
    });

    // Removed sidebar layout - no sidebar patterns needed
  }

  public analyzeContext(components: ComponentWithType[], currentScreenSize: LayoutContext['screenSize']): LayoutContext {
    const componentTypes = components.map(c => c.type);
    const hasCharts = componentTypes.includes('chart');
    const hasTables = componentTypes.includes('table');
    const hasForms = componentTypes.includes('form');
    const hasCards = componentTypes.includes('card');

    // Determine intent based on component composition
    let intent: LayoutContext['intent'] = 'generic';

    if (hasCharts && hasCards && componentTypes.length >= 3) {
      intent = 'dashboard';
    } else if (hasForms && componentTypes.length <= 2) {
      intent = 'form';
    } else if (hasCharts && hasTables) {
      intent = 'analytics';
    } else if (hasTables && componentTypes.length >= 2) {
      intent = 'data';
    }

    return {
      intent,
      screenSize: currentScreenSize,
      componentCount: components.length,
      hasCharts,
      hasTables,
      hasForms,
      hasCards,
      priorityComponents: this.determinePriorityComponents(componentTypes),
    };
  }

  private determinePriorityComponents(types: string[]): string[] {
    const priority: Record<string, number> = {
      chart: 3,
      table: 3,
      form: 2,
      card: 1,
      button: 1,
      input: 1,
    };

    return types
      .filter(type => priority[type])
      .sort((a, b) => (priority[b] || 0) - (priority[a] || 0));
  }

  public generateLayout(components: ComponentWithType[], currentScreenSize: LayoutContext['screenSize']): LayoutResult {
    const context = this.analyzeContext(components, currentScreenSize);
    const pattern = this.selectPattern(context);

    const componentLayouts = components.map((component, index) => {
      const gridArea = this.assignGridArea(component, pattern, index, context);
      const classes = this.generateComponentClasses(component, gridArea, pattern);

      return {
        component,
        gridArea,
        classes,
      };
    });

    return {
      pattern,
      componentLayouts,
      containerClasses: this.generateContainerClasses(pattern, context),
    };
  }

  private selectPattern(context: LayoutContext): LayoutPattern {
    // Pattern selection logic based on context
    if (context.intent === 'dashboard' && context.hasCharts) {
      // Check if this looks like a portfolio dashboard
      if (context.componentCount >= 4 && context.hasCards && context.hasTables) {
        return this.patterns.get('portfolio-analytics')!;
      }
      return this.patterns.get('dashboard-metrics')!;
    }

    if (context.intent === 'form') {
      return context.componentCount <= 2
        ? this.patterns.get('form-single-column')!
        : this.patterns.get('form-two-column')!;
    }

    if (context.intent === 'analytics') {
      return this.patterns.get('dashboard-analytics')!;
    }

    if (context.intent === 'data' && context.hasTables) {
      return this.patterns.get('data-table-focused')!;
    }

    // Default to responsive grid for optimal space utilization
    return this.patterns.get('grid-responsive')!;
  }

  private assignGridArea(
    component: ComponentWithType,
    pattern: LayoutPattern,
    index: number,
    context: LayoutContext
  ): string {
    // Use explicit mapping if available
    if (pattern.componentMapping[component.type]) {
      return pattern.componentMapping[component.type];
    }

    // Intelligent assignment based on component type and position
    switch (component.type) {
      case 'chart':
        return context.intent === 'dashboard' ? 'charts' : 'chart';
      case 'table':
        return 'table';
      case 'form':
        return context.intent === 'form' ? 'form' : 'main';
      case 'card':
        return context.intent === 'dashboard' ? 'metrics' : 'auto';
      case 'button':
        return 'actions';
      case 'text':
        return 'title';
      default:
        return `area-${index}`;
    }
  }

  private generateComponentClasses(
    component: ComponentWithType,
    gridArea: string,
    pattern: LayoutPattern
  ): string {
    let classes = `grid-area: ${gridArea}; `;

    // Component-specific styling with improved space utilization
    switch (component.type) {
      case 'card':
        classes += 'shadow-sm border border-gray-200 rounded-lg h-full min-h-[200px] flex flex-col';
        break;
      case 'chart':
        classes += 'bg-white p-4 rounded-lg shadow-sm h-full min-h-[300px] flex flex-col';
        break;
      case 'table':
        classes += 'overflow-x-auto h-full min-h-[400px] flex flex-col';
        break;
      case 'form':
        classes += 'space-y-4 h-full min-h-[300px] flex flex-col';
        break;
      case 'text':
        classes += 'text-2xl font-bold text-gray-900 mb-4';
        break;
      default:
        classes += 'p-4 bg-white rounded-lg shadow-sm h-full min-h-[200px] flex flex-col';
    }

    return classes;
  }

  private generateContainerClasses(pattern: LayoutPattern, context: LayoutContext): string {
    let classes = pattern.containerClasses;

    // Add responsive grid styles with dynamic column generation
    classes += ` ${pattern.spacing}`;

    // Generate adaptive grid columns based on component count and screen size
    const getGridColumns = (screenSize: string, componentCount: number): string => {
      switch (screenSize) {
        case 'mobile':
          return 'grid-cols-1';
        case 'tablet':
          return componentCount <= 2 ? 'grid-cols-1' : 'grid-cols-2';
        case 'desktop':
        case 'large':
        default:
          if (componentCount <= 1) return 'grid-cols-1';
          if (componentCount <= 3) return 'grid-cols-2';
          if (componentCount <= 6) return 'grid-cols-3';
          return 'grid-cols-4';
      }
    };

    const gridColsClass = getGridColumns(context.screenSize, context.componentCount);
    classes += ` ${gridColsClass}`;

    return classes.trim();
  }

  // Advanced layout optimization
  public optimizeLayout(result: LayoutResult, userPreferences?: any): LayoutResult {
    // Apply user preferences
    if (userPreferences?.theme) {
      result.containerClasses += ` theme-${userPreferences.theme}`;
    }

    if (userPreferences?.density) {
      result.containerClasses += ` density-${userPreferences.density}`;
    }

    // Optimize component positioning based on visual hierarchy
    result.componentLayouts = result.componentLayouts.map(layout => ({
      ...layout,
      classes: this.optimizeComponentClasses(layout.classes, userPreferences),
    }));

    return result;
  }

  private optimizeComponentClasses(classes: string, preferences?: any): string {
    if (preferences?.reduceMotion) {
      classes += ' transition-none';
    }

    if (preferences?.highContrast) {
      classes += ' border-2 border-gray-900';
    }

    return classes;
  }

  // Get all available patterns
  public getPatterns(): LayoutPattern[] {
    return Array.from(this.patterns.values());
  }

  // Get pattern by name
  public getPattern(name: string): LayoutPattern | undefined {
    return this.patterns.get(name);
  }

  // Add custom pattern
  public addPattern(name: string, pattern: LayoutPattern): void {
    this.patterns.set(name, pattern);
  }
}

export const layoutEngine = LayoutEngine.getInstance();
