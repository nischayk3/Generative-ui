import { ComponentWithType } from './LayoutEngine';
import { componentRegistry } from '../components/ComponentRegistry';

export interface DashboardConfig {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'grid' | 'masonry' | 'sidebar';
  density?: 'compact' | 'comfortable' | 'spacious';
  showNavigation?: boolean;
  showFooter?: boolean;
  maxColumns?: number;
}

export interface DashboardMetrics {
  totalComponents: number;
  layoutEfficiency: number;
  visualBalance: number;
  accessibilityScore: number;
  performanceRating: number;
}

export interface GeneratedDashboard {
  config: DashboardConfig;
  components: ComponentWithType[];
  layout: {
    gridTemplate: string;
    areas: Record<string, string>;
    responsive: Record<string, string>;
  };
  metrics: DashboardMetrics;
  styles: {
    container: string;
    spacing: string;
    grid: string;
    components: string;
  };
}

export class DashboardGenerator {
  private static instance: DashboardGenerator;

  private constructor() {}

  public static getInstance(): DashboardGenerator {
    if (!DashboardGenerator.instance) {
      DashboardGenerator.instance = new DashboardGenerator();
    }
    return DashboardGenerator.instance;
  }

  public generateDashboard(
    components: ComponentWithType[],
    config: DashboardConfig = {}
  ): GeneratedDashboard {
    const defaultConfig: Required<DashboardConfig> = {
      title: 'Dashboard',
      theme: 'light',
      layout: 'grid',
      density: 'comfortable',
      showNavigation: false,
      showFooter: false,
      maxColumns: 3,
      ...config,
    };

    // Analyze components for optimal arrangement
    const analysis = this.analyzeComponents(components);

    // Generate intelligent layout
    const layout = this.generateIntelligentLayout(components, analysis, defaultConfig);

    // Apply professional styling
    const styles = this.generateProfessionalStyles(defaultConfig, analysis);

    // Calculate metrics
    const metrics = this.calculateMetrics(components, layout, defaultConfig);

    return {
      config: defaultConfig,
      components,
      layout,
      metrics,
      styles,
    };
  }

  private analyzeComponents(components: ComponentWithType[]) {
    const analysis = {
      hasCharts: false,
      hasTables: false,
      hasForms: false,
      hasCards: false,
      hasNavigation: false,
      dataComponents: 0,
      interactiveComponents: 0,
      displayComponents: 0,
      priorityOrder: [] as string[],
      contentDensity: 'medium' as 'low' | 'medium' | 'high',
    };

    components.forEach(component => {
      switch (component.type) {
        case 'chart':
          analysis.hasCharts = true;
          analysis.dataComponents++;
          analysis.priorityOrder.push('chart');
          break;
        case 'table':
          analysis.hasTables = true;
          analysis.dataComponents++;
          analysis.priorityOrder.push('table');
          break;
        case 'form':
          analysis.hasForms = true;
          analysis.interactiveComponents++;
          analysis.priorityOrder.push('form');
          break;
        case 'card':
          analysis.hasCards = true;
          analysis.displayComponents++;
          analysis.priorityOrder.push('card');
          break;
        case 'navigation':
          analysis.hasNavigation = true;
          analysis.priorityOrder.unshift('navigation');
          break;
        default:
          analysis.displayComponents++;
      }
    });

    // Determine content density
    const totalComponents = components.length;
    if (totalComponents <= 3) {
      analysis.contentDensity = 'low';
    } else if (totalComponents >= 8) {
      analysis.contentDensity = 'high';
    }

    return analysis;
  }

  private generateIntelligentLayout(
    components: ComponentWithType[],
    analysis: any,
    config: Required<DashboardConfig>
  ) {
    let gridTemplate = '';
    let areas: Record<string, string> = {};
    let responsive: Record<string, string> = {};

    switch (config.layout) {
      case 'sidebar':
        if (analysis.hasNavigation) {
          gridTemplate = `
            "nav main main"
            "nav content content"
          `;
          areas = {
            navigation: 'nav',
            main: 'main',
            content: 'content',
          };
          responsive = {
            mobile: `
              "main"
              "content"
              "nav"
            `,
          };
        } else {
          gridTemplate = `
            "sidebar main main"
            "sidebar content content"
          `;
          areas = {
            sidebar: 'sidebar',
            main: 'main',
            content: 'content',
          };
        }
        break;

      case 'masonry':
        gridTemplate = 'auto-fill';
        areas = {};
        responsive = {
          mobile: 'auto-fill',
          tablet: 'auto-fill',
        };
        break;

      default: // grid - Improved space utilization
        const columns = Math.min(config.maxColumns, Math.ceil(Math.sqrt(components.length)));
        const rows = Math.ceil(components.length / columns);
        
        // Create a simple grid template
        gridTemplate = `"${Array(columns).fill('auto').join(' ')}"`;

        // Create intelligent grid areas based on component types and position
        components.forEach((component, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
          areas[component.type] = `auto`;
        });

        responsive = {
          mobile: `"auto"`,
          tablet: `"auto auto"`,
          desktop: `"auto auto auto auto"`,
        };
    }

    return {
      gridTemplate: gridTemplate.trim(),
      areas,
      responsive,
    };
  }

  private generateProfessionalStyles(config: Required<DashboardConfig>, analysis: any) {
    // Base container styles
    const container = `
      min-h-screen
      bg-gradient-to-br from-gray-50 to-gray-100
      ${config.theme === 'dark' ? 'dark from-gray-900 to-gray-800' : ''}
      p-6
      ${config.density === 'compact' ? 'gap-3' : config.density === 'spacious' ? 'gap-8' : 'gap-6'}
    `;

    // Component spacing based on density
    const spacing = {
      compact: 'space-y-3',
      comfortable: 'space-y-6',
      spacious: 'space-y-8',
    };

    const spacingStr = spacing[config.density];

    // Grid styles
    const grid = `
      grid
      ${config.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
      ${config.layout === 'sidebar' ? 'grid-cols-1 lg:grid-cols-4' : ''}
      ${config.layout === 'masonry' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
      gap-6
    `;

    // Component styles as string
    const components = JSON.stringify({
      card: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        hover:shadow-xl
        transition-shadow duration-300
        ${config.density === 'compact' ? 'p-4' : 'p-6'}
      `,
      chart: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        ${config.density === 'compact' ? 'p-3' : 'p-6'}
      `,
      table: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        overflow-hidden
      `,
      form: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        ${config.density === 'compact' ? 'p-4' : 'p-6'}
      `,
    });

    return {
      container,
      spacing: spacingStr,
      grid,
      components,
    };
  }

  private calculateMetrics(
    components: ComponentWithType[],
    layout: any,
    config: Required<DashboardConfig>
  ): DashboardMetrics {
    const totalComponents = components.length;

    // Layout efficiency (how well components fit the layout)
    const layoutEfficiency = Math.min(100, (totalComponents / 9) * 100);

    // Visual balance (distribution of component types)
    const typeDistribution = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueTypes = Object.keys(typeDistribution).length;
    const visualBalance = Math.min(100, (uniqueTypes / totalComponents) * 100);

    // Accessibility score (presence of semantic components)
    const hasSemantic = components.some(c =>
      ['card', 'form', 'table', 'navigation'].includes(c.type)
    );
    const accessibilityScore = hasSemantic ? 85 : 60;

    // Performance rating (based on component complexity)
    const complexComponents = components.filter(c =>
      ['chart', 'table', 'form'].includes(c.type)
    ).length;
    const performanceRating = Math.max(60, 100 - (complexComponents * 10));

    return {
      totalComponents,
      layoutEfficiency,
      visualBalance,
      accessibilityScore,
      performanceRating,
    };
  }

  // Advanced dashboard generation methods
  public generateMetricsDashboard(data: any[]): GeneratedDashboard {
    const components: ComponentWithType[] = [
      {
        type: 'card',
        title: 'Key Metrics',
        description: 'Important performance indicators',
        variant: 'elevated',
      },
      {
        type: 'chart',
        title: 'Performance Trend',
        description: 'Performance over time',
        chartType: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Performance',
            data: data.map(d => d.value || Math.random() * 100),
            backgroundColor: '#4CAF50',
          }],
        },
      },
      {
        type: 'table',
        title: 'Recent Activity',
        description: 'Latest updates and changes',
        columns: [
          { header: 'Date', field: 'date' },
          { header: 'Action', field: 'action' },
          { header: 'Status', field: 'status' },
        ],
        rows: data.slice(0, 5).map((d, i) => ({
          date: new Date().toLocaleDateString(),
          action: `Action ${i + 1}`,
          status: 'Completed',
        })),
      },
    ];

    return this.generateDashboard(components, {
      title: 'Metrics Dashboard',
      layout: 'grid',
      density: 'comfortable',
    });
  }

  public generateAnalyticsDashboard(data: any[]): GeneratedDashboard {
    const components: ComponentWithType[] = [
      {
        type: 'card',
        title: 'Analytics Overview',
        description: 'Key insights and trends',
        variant: 'elevated',
      },
      {
        type: 'chart',
        title: 'Data Distribution',
        description: 'Distribution of key metrics',
        chartType: 'bar',
        data: {
          labels: data.map(d => d.label || `Item ${d.id}`).slice(0, 6),
          datasets: [{
            label: 'Values',
            data: data.map(d => d.value || Math.random() * 100).slice(0, 6),
            backgroundColor: '#2196F3',
          }],
        },
      },
      {
        type: 'chart',
        title: 'Trend Analysis',
        description: 'Trend analysis over time',
        chartType: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Trend',
            data: [20, 45, 28, 80],
            backgroundColor: '#FF9800',
          }],
        },
      },
      {
        type: 'table',
        title: 'Detailed Breakdown',
        description: 'Detailed data breakdown',
        columns: [
          { header: 'Category', field: 'category' },
          { header: 'Value', field: 'value' },
          { header: 'Percentage', field: 'percentage' },
        ],
        rows: data.slice(0, 8).map((d, i) => ({
          category: d.label || `Category ${i + 1}`,
          value: d.value || Math.floor(Math.random() * 1000),
          percentage: `${Math.floor(Math.random() * 100)}%`,
        })),
      },
    ];

    return this.generateDashboard(components, {
      title: 'Analytics Dashboard',
      layout: 'sidebar',
      density: 'comfortable',
    });
  }

  public optimizeDashboard(dashboard: GeneratedDashboard): GeneratedDashboard {
    // Apply performance optimizations
    if (dashboard.metrics.performanceRating < 70) {
      // Reduce complex components
      dashboard.components = dashboard.components.filter(c =>
        !['chart', 'table'].includes(c.type) || dashboard.components.length <= 6
      );
    }

    // Improve accessibility
    if (dashboard.metrics.accessibilityScore < 80) {
      // Ensure semantic structure
      const hasNavigation = dashboard.components.some(c => c.type === 'navigation');
      if (!hasNavigation && dashboard.config.showNavigation) {
        dashboard.components.unshift({
          type: 'navigation',
          items: [
            { label: 'Dashboard', href: '#' },
            { label: 'Analytics', href: '#' },
            { label: 'Settings', href: '#' },
          ],
        });
      }
    }

    // Recalculate metrics after optimization
    dashboard.metrics = this.calculateMetrics(
      dashboard.components,
      dashboard.layout,
      dashboard.config as Required<DashboardConfig>
    );

    return dashboard;
  }
}

export const dashboardGenerator = DashboardGenerator.getInstance();
