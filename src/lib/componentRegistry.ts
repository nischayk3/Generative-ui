// Simple Component Registry - KISS Approach
export interface ComponentInfo {
  type: string;
  name: string;
  description: string;
  category: 'layout' | 'input' | 'display' | 'feedback' | 'data';
  available: boolean;
  props?: Record<string, any>;
  examples?: string[];
}

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ComponentInfo> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  private initializeRegistry() {
    // Register core components that we currently support
    this.registerComponent({
      type: 'chart',
      name: 'Interactive Chart',
      description: 'Data visualization with multiple chart types',
      category: 'data',
      available: true,
      props: {
        chartType: ['bar', 'line', 'pie', 'area'],
        data: { labels: [], datasets: [] }
      },
      examples: [
        'Create a sales chart showing quarterly performance',
        'Generate a pie chart for market share analysis'
      ]
    });

    this.registerComponent({
      type: 'table',
      name: 'Data Table',
      description: 'Sortable and filterable data table',
      category: 'data',
      available: true,
      props: {
        columns: [],
        rows: [],
        sortable: true,
        filterable: true
      },
      examples: [
        'Create an employee directory table',
        'Generate a product catalog with prices'
      ]
    });

    this.registerComponent({
      type: 'form',
      name: 'Dynamic Form',
      description: 'Interactive form with multiple input types',
      category: 'input',
      available: true,
      props: {
        fields: [],
        submitText: 'Submit'
      },
      examples: [
        'Create a contact form with validation',
        'Generate a registration form with dropdowns'
      ]
    });

    this.registerComponent({
      type: 'card',
      name: 'Content Card',
      description: 'Flexible container for content and components',
      category: 'layout',
      available: true,
      props: {
        title: '',
        components: []
      },
      examples: [
        'Create a dashboard card with metrics',
        'Generate a profile card with user information'
      ]
    });

    // Register newly added components
    this.registerComponent({
      type: 'avatar',
      name: 'User Avatar',
      description: 'Profile picture or user representation',
      category: 'display',
      available: true,
      props: {
        src: '',
        fallback: '',
        size: 'default'
      },
      examples: [
        'Add a profile picture to a user card',
        'Create an avatar for contact information'
      ]
    });

    this.registerComponent({
      type: 'select',
      name: 'Dropdown Select',
      description: 'Single selection from predefined options',
      category: 'input',
      available: true,
      props: {
        options: [],
        placeholder: 'Select an option'
      }
    });

    this.registerComponent({
      type: 'radio',
      name: 'Radio Group',
      description: 'Single choice selection from options',
      category: 'input',
      available: true,
      props: {
        options: []
      }
    });

    this.registerComponent({
      type: 'switch',
      name: 'Toggle Switch',
      description: 'Boolean on/off toggle',
      category: 'input',
      available: true
    });

    this.registerComponent({
      type: 'tabs',
      name: 'Tabbed Interface',
      description: 'Organize content in multiple tabs',
      category: 'layout',
      available: true,
      props: {
        tabs: []
      },
      examples: [
        'Create a dashboard with different sections in tabs',
        'Organize form steps in separate tabs'
      ]
    });

    this.registerComponent({
      type: 'dialog',
      name: 'Modal Dialog',
      description: 'Popup dialog for confirmations and forms',
      category: 'feedback',
      available: true,
      props: {
        title: '',
        description: '',
        trigger: 'Open Dialog'
      },
      examples: [
        'Create a confirmation dialog for form submission',
        'Show detailed information in a modal popup'
      ]
    });

    this.registerComponent({
      type: 'drawer',
      name: 'Slide-out Drawer',
      description: 'Slide-out panel from screen edges',
      category: 'layout',
      available: true,
      props: {
        title: '',
        side: 'right'
      },
      examples: [
        'Create a settings panel that slides from the right',
        'Show additional details in a side drawer'
      ]
    });

    this.registerComponent({
      type: 'command',
      name: 'Command Palette',
      description: 'Searchable command interface',
      category: 'input',
      available: true,
      props: {
        placeholder: 'Type a command...'
      },
      examples: [
        'Create a searchable menu of actions',
        'Build a command palette for quick navigation'
      ]
    });
  }

  public registerComponent(component: ComponentInfo) {
    this.components.set(component.type, component);
  }

  public getComponent(type: string): ComponentInfo | undefined {
    return this.components.get(type);
  }

  public getAllComponents(): ComponentInfo[] {
    return Array.from(this.components.values());
  }

  public getComponentsByCategory(category: string): ComponentInfo[] {
    return this.getAllComponents().filter(comp => comp.category === category);
  }

  public getAvailableComponents(): ComponentInfo[] {
    return this.getAllComponents().filter(comp => comp.available);
  }

  public isComponentAvailable(type: string): boolean {
    const component = this.getComponent(type);
    return component?.available ?? false;
  }

  public getComponentExamples(type: string): string[] {
    const component = this.getComponent(type);
    return component?.examples ?? [];
  }
}

// Export singleton instance
export const componentRegistry = ComponentRegistry.getInstance();

// Helper functions for easy access
export const getAvailableComponents = () => componentRegistry.getAvailableComponents();
export const getComponentByType = (type: string) => componentRegistry.getComponent(type);
export const isComponentSupported = (type: string) => componentRegistry.isComponentAvailable(type);
