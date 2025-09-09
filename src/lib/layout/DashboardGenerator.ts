import { ComponentWithType } from './LayoutEngine';

export interface DashboardConfig {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'professional' | 'analytics';
  density?: 'compact' | 'comfortable' | 'spacious';
}

export interface GeneratedDashboard {
  config: DashboardConfig;
  components: ComponentWithType[];
  layout: {
    groups: ComponentWithType[][];
  };
  styles: {
    container: string;
    group: string;
    item: string;
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
      ...config,
    };

    const layout = this.generateProfessionalLayout(components);
    const styles = this.generateProfessionalStyles(defaultConfig);

    return {
      config: defaultConfig,
      components,
      layout,
      styles,
    };
  }

  private isMajorComponent(component: ComponentWithType): boolean {
    // Tables and non-sparkline charts are considered major components
    if (component.type === 'table') return true;
    if (component.type === 'chart' && !component.sparkline) return true;
    if (component.type === 'tabs') return true;
    return false;
  }

  private generateProfessionalLayout(components: ComponentWithType[]) {
    const groups: ComponentWithType[][] = [];
    let currentMinorGroup: ComponentWithType[] = [];

    components.forEach(component => {
      // If we encounter a major component, push the current group of minor components first.
      if (this.isMajorComponent(component)) {
        if (currentMinorGroup.length > 0) {
          groups.push(currentMinorGroup);
          currentMinorGroup = [];
        }
        // Each major component gets its own group (row).
        groups.push([component]);
      } else {
        // Collect minor components into a group.
        currentMinorGroup.push(component);
      }
    });

    // Push any remaining minor components into the last group.
    if (currentMinorGroup.length > 0) {
      groups.push(currentMinorGroup);
    }

    return { groups };
  }

  private generateProfessionalStyles(config: Required<DashboardConfig>) {
    const container = `
      min-h-screen w-full
      bg-gray-50
      ${config.theme === 'dark' ? 'dark bg-gray-900' : ''}
      p-4 md:p-6 lg:p-8
      flex flex-col
      ${config.density === 'compact' ? 'gap-4' : config.density === 'spacious' ? 'gap-8' : 'gap-6'}
    `;

    // Styles for a group of components (a row)
    const group = `
      grid
      gap-6
      grid-cols-1
      md:grid-cols-2
    `;

    // Styles for a single item within a group
    const item = `
      w-full
      h-full
    `;

    return {
      container,
      group,
      item,
    };
  }
}

export const dashboardGenerator = DashboardGenerator.getInstance();