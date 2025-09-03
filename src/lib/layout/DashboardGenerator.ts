import { ComponentWithType } from './LayoutEngine';
import { componentRegistry } from '../components/ComponentRegistry';

export interface DashboardConfig {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'grid' | 'masonry' | 'sidebar' | 'professional' | 'analytics' | 'portfolio';
  density?: 'compact' | 'comfortable' | 'spacious';
  showNavigation?: boolean;
  showFooter?: boolean;
  maxColumns?: number;
  spaceUtilization?: 'maximize' | 'balanced' | 'minimal';
}

export interface DashboardMetrics {
  totalComponents: number;
  layoutEfficiency: number;
  visualBalance: number;
  accessibilityScore: number;
  performanceRating: number;
  spaceUtilization: number;
}

export interface GeneratedDashboard {
  config: DashboardConfig;
  components: ComponentWithType[];
  layout: {
    gridTemplate: string;
    areas: Record<string, string>;
    responsive: Record<string, string>;
    spaceOptimization: string;
  };
  metrics: DashboardMetrics;
  styles: {
    container: string;
    spacing: string;
    grid: string;
    components: string;
    responsive: string;
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
      title: 'Professional Dashboard',
      theme: 'light',
      layout: 'professional',
      density: 'comfortable',
      showNavigation: false,
      showFooter: false,
      maxColumns: 4,
      spaceUtilization: 'maximize',
      ...config,
    };

    // Analyze components for optimal arrangement
    const analysis = this.analyzeComponents(components);

    // Generate intelligent layout with maximum space utilization
    const layout = this.generateProfessionalLayout(components, analysis, defaultConfig);

    // Apply professional styling with full space utilization
    const styles = this.generateProfessionalStyles(defaultConfig, analysis);

    // Calculate metrics including space utilization
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
      componentTypes: new Set<string>(),
      estimatedSizes: {} as Record<string, 'small' | 'medium' | 'large'>,
    };

    components.forEach(component => {
      analysis.componentTypes.add(component.type);
      
      switch (component.type) {
        case 'chart':
          analysis.hasCharts = true;
          analysis.dataComponents++;
          analysis.priorityOrder.push('chart');
          analysis.estimatedSizes[component.type] = 'large';
          break;
        case 'table':
          analysis.hasTables = true;
          analysis.dataComponents++;
          analysis.priorityOrder.push('table');
          analysis.estimatedSizes[component.type] = 'large';
          break;
        case 'form':
          analysis.hasForms = true;
          analysis.interactiveComponents++;
          analysis.priorityOrder.push('form');
          analysis.estimatedSizes[component.type] = 'medium';
          break;
        case 'card':
          analysis.hasCards = true;
          analysis.displayComponents++;
          analysis.priorityOrder.push('card');
          analysis.estimatedSizes[component.type] = 'small';
          break;
        case 'navigation':
          analysis.hasNavigation = true;
          analysis.priorityOrder.unshift('navigation');
          analysis.estimatedSizes[component.type] = 'small';
          break;
        default:
          analysis.displayComponents++;
          analysis.estimatedSizes[component.type] = 'medium';
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

  private generateProfessionalLayout(
    components: ComponentWithType[],
    analysis: any,
    config: Required<DashboardConfig>
  ) {
    let gridTemplate = '';
    let areas: Record<string, string> = {};
    let responsive: Record<string, string> = {};
    let spaceOptimization = '';

    // Adaptive layout with maximum space utilization - NO HARDCODED COLUMNS
    const componentCount = components.length;

    // Calculate optimal grid dimensions based on component count and types
    const getOptimalGrid = (count: number, hasLargeComponents: boolean = false): { cols: number, rows: number } => {
      if (count <= 1) return { cols: 1, rows: 1 };
      if (count <= 2) return { cols: 1, rows: 2 }; // Stack vertically for better readability
      if (count <= 4) return { cols: 2, rows: Math.ceil(count / 2) };
      if (count <= 9) return { cols: 3, rows: Math.ceil(count / 3) };
      return { cols: 4, rows: Math.ceil(count / 4) };
    };

    const { cols, rows } = getOptimalGrid(componentCount, analysis.hasCharts || analysis.hasTables);

    // Generate adaptive grid template without empty spaces
    let templateRows = [];
    for (let i = 0; i < rows; i++) {
      const start = i * cols;
      const end = Math.min(start + cols, componentCount);
      const rowComponents = [];

      for (let j = start; j < end; j++) {
        rowComponents.push(`component-${j}`);
        areas[`component-${j}`] = `component-${j}`;
      }

      // Only add the row if it has components (no empty rows)
      if (rowComponents.length > 0) {
        templateRows.push(`"${rowComponents.join(' ')}"`);
      }
    }

    gridTemplate = templateRows.join('\n');

    // Adaptive responsive breakpoints
    responsive = {
      mobile: components.map((_, i) => `"component-${i}"`).join('\n'), // Single column on mobile
      tablet: (() => {
        const tabletCols = componentCount <= 2 ? 1 : 2;
        const tabletRows = Math.ceil(componentCount / tabletCols);
        let tabletTemplate = [];
        for (let i = 0; i < tabletRows; i++) {
          const start = i * tabletCols;
          const end = Math.min(start + tabletCols, componentCount);
          const rowComponents = [];
          for (let j = start; j < end; j++) {
            rowComponents.push(`component-${j}`);
          }
          if (rowComponents.length > 0) {
            tabletTemplate.push(`"${rowComponents.join(' ')}"`);
          }
        }
        return tabletTemplate.join('\n');
      })(),
      desktop: gridTemplate,
    };

    spaceOptimization = `${cols}-column-adaptive`;

    if (config.layout === 'analytics') {
      // Analytics-focused layout
      gridTemplate = `
        "header header header header"
        "metrics metrics metrics metrics"
        "chart chart chart chart"
        "table table table table"
      `.trim();
      
      areas = {
        header: 'header',
        metrics: 'metrics',
        chart: 'chart',
        table: 'table',
      };
      
      spaceOptimization = 'analytics-focused';
      
    } else {
      // Fallback to grid layout
      const columns = Math.min(config.maxColumns, Math.ceil(Math.sqrt(components.length)));
      const rows = Math.ceil(components.length / columns);
      
      gridTemplate = `"${Array(columns).fill('auto').join(' ')}"`;
      
      components.forEach((component, index) => {
        areas[component.type] = `auto`;
      });
      
      spaceOptimization = 'grid-fallback';
    }

    return {
      gridTemplate: gridTemplate.trim(),
      areas,
      responsive,
      spaceOptimization,
    };
  }

  private generateProfessionalStyles(config: Required<DashboardConfig>, analysis: any) {
    // Base container styles with maximum space utilization
    const container = `
      min-h-screen
      w-full
      bg-gradient-to-br from-gray-50 to-gray-100
      ${config.theme === 'dark' ? 'dark from-gray-900 to-gray-800' : ''}
      p-4 md:p-6 lg:p-8
      ${config.density === 'compact' ? 'gap-3' : config.density === 'spacious' ? 'gap-8' : 'gap-6'}
    `;

    // Component spacing based on density
    const spacing = {
      compact: 'space-y-3',
      comfortable: 'space-y-6',
      spacious: 'space-y-8',
    };

    const spacingStr = spacing[config.density];

    // Adaptive grid styles based on space utilization and component types
    const getAdaptiveGrid = (utilization: string, hasLargeComponents: boolean = false): string => {
      const baseClasses = 'grid w-full h-full gap-4 md:gap-6 lg:gap-8 auto-rows-fr';

      switch (utilization) {
        case 'maximize':
          // Use auto-fit for maximum space utilization
          return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
        case 'balanced':
          // Balanced approach with reasonable column counts
          return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
        case 'minimal':
        default:
          // Minimal columns for focused layouts
          return `${baseClasses} grid-cols-1 md:grid-cols-2`;
      }
    };

    const grid = getAdaptiveGrid(config.spaceUtilization, analysis.hasCharts || analysis.hasTables);

    // Professional component styles
    const components = JSON.stringify({
      card: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        hover:shadow-xl
        transition-all duration-300
        ${config.density === 'compact' ? 'p-4' : 'p-6'}
        w-full
        h-full
        min-h-[200px]
        flex flex-col
      `,
      chart: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        ${config.density === 'compact' ? 'p-4' : 'p-6'}
        w-full
        h-full
        min-h-[300px]
        flex flex-col
      `,
      table: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        overflow-hidden
        w-full
        h-full
        min-h-[250px]
        flex flex-col
      `,
      form: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        ${config.density === 'compact' ? 'p-4' : 'p-6'}
        w-full
        h-full
        min-h-[200px]
        flex flex-col
      `,
      navigation: `
        bg-white
        rounded-xl
        shadow-lg
        border border-gray-200
        p-4
        w-full
        h-full
        min-h-[100px]
        flex flex-col
      `,
    });

    // Responsive styles
    const responsive = `
      @media (max-width: 768px) {
        .dashboard-container {
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 1rem;
        }
      }
      
      @media (min-width: 769px) and (max-width: 1024px) {
        .dashboard-container {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 1.5rem;
        }
      }
      
      @media (min-width: 1025px) {
        .dashboard-container {
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          padding: 2rem;
        }
      }
    `;

    return {
      container,
      spacing: spacingStr,
      grid,
      components,
      responsive,
    };
  }

  private calculateMetrics(
    components: ComponentWithType[],
    layout: any,
    config: Required<DashboardConfig>
  ): DashboardMetrics {
    const totalComponents = components.length;

    // Layout efficiency (how well components fit the layout)
    const layoutEfficiency = Math.min(100, (totalComponents / 12) * 100);

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

    // Space utilization score
    const spaceUtilization = config.spaceUtilization === 'maximize' ? 95 : 
                            config.spaceUtilization === 'balanced' ? 80 : 60;

    return {
      totalComponents,
      layoutEfficiency,
      visualBalance,
      accessibilityScore,
      performanceRating,
      spaceUtilization,
    };
  }

  // Portfolio Analytics Dashboard - Professional layout
  public generatePortfolioDashboard(data: any[]): GeneratedDashboard {
    const components: ComponentWithType[] = [
      {
        type: 'card',
        title: 'Key Metrics',
        description: 'Portfolio performance indicators',
        variant: 'elevated',
        content: {
          metrics: [
            { label: 'Total Value', value: '$128.4k', trend: 'up' },
            { label: 'YTD Return', value: '+11.2%', trend: 'up' },
            { label: 'Sharpe Ratio', value: '0.92', trend: 'neutral' },
            { label: 'Holdings', value: '12', trend: 'neutral' },
          ]
        }
      },
      {
        type: 'chart',
        title: 'Equity Curve',
        description: 'Portfolio value over time',
        chartType: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Portfolio Value',
            data: [100, 105, 98, 110, 108, 112],
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
          }],
        },
      },
      {
        type: 'card',
        title: 'Summary',
        description: 'Key highlights and insights',
        content: {
          highlights: [
            'Outperformed benchmark by 2.3% YTD',
            'Risk-adjusted returns improving for 3 months',
            'Cash buffer at 6% for flexibility'
          ],
          actions: ['Rebalance', 'Add Funds']
        }
      },
      {
        type: 'chart',
        title: 'Asset Allocation',
        description: 'Portfolio diversification',
        chartType: 'pie',
        data: {
          labels: ['US Equities', 'Bonds', 'Intl Equities', 'Real Estate', 'Cash', 'Commodities'],
          datasets: [{
            data: [42, 22, 18, 7, 6, 5],
            backgroundColor: ['#4CAF50', '#8BC34A', '#2196F3', '#FF9800', '#9C27B0', '#F44336'],
          }],
        },
      },
      {
        type: 'chart',
        title: 'Risk Analysis',
        description: 'Volatility & drawdown metrics',
        chartType: 'radar',
        data: {
          labels: ['Volatility', 'Drawdown', 'Beta', 'Liquidity', 'Concentration'],
          datasets: [
            {
              label: 'Portfolio',
              data: [65, 70, 80, 85, 60],
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              borderColor: '#4CAF50',
            },
            {
              label: 'Target',
              data: [60, 65, 75, 80, 55],
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              borderColor: '#2196F3',
            },
          ],
        },
      },
      {
        type: 'card',
        title: 'Actions',
        description: 'Quick tasks and recommendations',
        content: {
          tasks: ['Review Drift', 'Rebalance Portfolio', 'Update Goals'],
          priority: 'high'
        }
      },
    ];

    return this.generateDashboard(components, {
      title: 'Portfolio Analytics Dashboard',
      layout: 'portfolio',
      density: 'comfortable',
      spaceUtilization: 'maximize',
    });
  }

  // Analytics Dashboard with maximum space utilization
  public generateAnalyticsDashboard(data: any[]): GeneratedDashboard {
    const components: ComponentWithType[] = [
      {
        type: 'card',
        title: 'Analytics Overview',
        description: 'Key insights and trends',
        variant: 'elevated',
        content: {
          metrics: [
            { label: 'Total Users', value: '45.2k', trend: 'up' },
            { label: 'Conversion Rate', value: '3.2%', trend: 'up' },
            { label: 'Revenue', value: '$89.4k', trend: 'up' },
            { label: 'Growth', value: '+12.4%', trend: 'up' },
          ]
        }
      },
      {
        type: 'chart',
        title: 'User Growth',
        description: 'Monthly user acquisition',
        chartType: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [1200, 1350, 1100, 1500, 1400, 1600],
            backgroundColor: '#2196F3',
            borderColor: '#2196F3',
          }],
        },
      },
      {
        type: 'chart',
        title: 'Revenue Distribution',
        description: 'Revenue by product category',
        chartType: 'doughnut',
        data: {
          labels: ['Product A', 'Product B', 'Product C', 'Product D'],
          datasets: [{
            data: [35, 25, 20, 20],
            backgroundColor: ['#4CAF50', '#8BC34A', '#FF9800', '#9C27B0'],
          }],
        },
      },
      {
        type: 'table',
        title: 'Performance Metrics',
        description: 'Detailed performance breakdown',
        columns: [
          { header: 'Metric', field: 'metric' },
          { header: 'Current', field: 'current' },
          { header: 'Previous', field: 'previous' },
          { header: 'Change', field: 'change' },
        ],
        rows: [
          { metric: 'Page Views', current: '125k', previous: '98k', change: '+27.6%' },
          { metric: 'Bounce Rate', current: '32%', previous: '38%', change: '-15.8%' },
          { metric: 'Avg Session', current: '4m 32s', previous: '3m 45s', change: '+20.9%' },
          { metric: 'Goal Completions', current: '2.4k', previous: '1.8k', change: '+33.3%' },
        ],
      },
      {
        type: 'chart',
        title: 'Conversion Funnel',
        description: 'User journey analysis',
        chartType: 'bar',
        data: {
          labels: ['Visitors', 'Engaged', 'Interested', 'Converted'],
          datasets: [{
            label: 'Users',
            data: [10000, 3500, 1200, 320],
            backgroundColor: '#FF9800',
          }],
        },
      },
      {
        type: 'card',
        title: 'Recommendations',
        description: 'Actionable insights',
        content: {
          insights: [
            'Increase mobile optimization - 45% of users are mobile',
            'Focus on Product A - highest conversion rate',
            'Improve checkout flow - 23% cart abandonment',
            'Enhance content marketing - 67% organic traffic'
          ]
        }
      },
    ];

    return this.generateDashboard(components, {
      title: 'Analytics Dashboard',
      layout: 'analytics',
      density: 'comfortable',
      spaceUtilization: 'maximize',
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

    // Optimize space utilization
    if (dashboard.metrics.spaceUtilization < 80) {
      dashboard.config.spaceUtilization = 'maximize';
      // Regenerate layout with better space utilization
      const analysis = this.analyzeComponents(dashboard.components);
      dashboard.layout = this.generateProfessionalLayout(dashboard.components, analysis, dashboard.config as Required<DashboardConfig>);
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
