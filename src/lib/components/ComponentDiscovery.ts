import { z } from 'zod';

export interface ComponentMetadata {
  type: string;
  name: string;
  description: string;
  category: 'layout' | 'input' | 'display' | 'feedback' | 'navigation' | 'data';
  available: boolean;
  filePath: string;
  propsSchema?: z.ZodSchema;
  examples?: string[];
  dependencies?: string[];
}

export interface ComponentCategory {
  name: string;
  description: string;
  components: string[];
}

export class ComponentDiscovery {
  private static instance: ComponentDiscovery;
  private components: Map<string, ComponentMetadata> = new Map();
  private categories: Map<string, ComponentCategory> = new Map();
  private componentSchemas: Map<string, z.ZodSchema> = new Map();

  private constructor() {
    this.initializeCategories();
    this.registerStaticComponents();
    this.generateSchemas();
  }

  public static getInstance(): ComponentDiscovery {
    if (!ComponentDiscovery.instance) {
      ComponentDiscovery.instance = new ComponentDiscovery();
    }
    return ComponentDiscovery.instance;
  }

  private initializeCategories() {
    this.categories.set('layout', {
      name: 'Layout Components',
      description: 'Components for structuring and organizing content',
      components: []
    });

    this.categories.set('input', {
      name: 'Input Components',
      description: 'Components for user input and form controls',
      components: []
    });

    this.categories.set('display', {
      name: 'Display Components',
      description: 'Components for displaying content and data',
      components: []
    });

    this.categories.set('feedback', {
      name: 'Feedback Components',
      description: 'Components for user feedback and notifications',
      components: []
    });

    this.categories.set('navigation', {
      name: 'Navigation Components',
      description: 'Components for navigation and menu systems',
      components: []
    });

    this.categories.set('data', {
      name: 'Data Components',
      description: 'Components for data visualization and tables',
      components: []
    });
  }

  private registerStaticComponents() {
    // Static registry of all installed shadcn/ui components
    const staticComponents = [
      // Layout Components
      'accordion', 'card', 'collapsible', 'section', 'separator', 'sheet', 'tabs',
      'aspectRatio', 'resizable',

      // Input Components
      'input', 'textarea', 'select', 'checkbox', 'radioGroup', 'switch',
      'slider', 'form', 'command', 'toggle', 'toggleGroup',

      // Display Components
      'avatar', 'badge', 'progress', 'skeleton', 'text', 'hoverCard',

      // Feedback Components
      'alert', 'alertDialog', 'dialog', 'drawer', 'popover', 'tooltip',
      'sonner',

      // Navigation Components
      'breadcrumb', 'menubar', 'navigationMenu', 'pagination',
      'dropdownMenu', 'contextMenu',

      // Data Components
      'table', 'chart',

      // Button Component
      'button',

      // Label Component
      'label',
    ];

    for (const componentType of staticComponents) {
      const metadata = this.createComponentMetadata(componentType, componentType);
      this.components.set(componentType, metadata);

      if (componentType === 'section') {
        console.log('Registering section component:', metadata);
      }

      // Add to appropriate category
      const category = this.determineCategory(componentType);
      if (category) {
        this.categories.get(category)?.components.push(componentType);
      }
    }
  }

  private normalizeComponentName(fileName: string): string {
    // Convert kebab-case to camelCase and remove hyphens
    return fileName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private determineCategory(componentType: string): string {
    const categoryMap: Record<string, string> = {
      // Layout
      'accordion': 'layout',
      'card': 'layout',
      'collapsible': 'layout',
      'separator': 'layout',
      'sheet': 'layout',
      'tabs': 'layout',
      'aspectRatio': 'layout',
      'resizable': 'layout',

      // Input
      'input': 'input',
      'textarea': 'textarea',
      'select': 'input',
      'checkbox': 'input',
      'radioGroup': 'input',
      'switch': 'input',
      'slider': 'input',
      'form': 'input',
      'command': 'input',
      'toggle': 'input',
      'toggleGroup': 'input',

      // Display
      'avatar': 'display',
      'badge': 'display',
      'progress': 'display',
      'skeleton': 'display',
      'hoverCard': 'display',

      // Feedback
      'alert': 'feedback',
      'alertDialog': 'feedback',
      'dialog': 'feedback',
      'drawer': 'feedback',
      'popover': 'feedback',
      'tooltip': 'feedback',
      'sonner': 'feedback',

      // Navigation
      'breadcrumb': 'navigation',
      'menubar': 'navigation',
      'navigationMenu': 'navigation',
      'pagination': 'navigation',
      'dropdownMenu': 'navigation',
      'contextMenu': 'navigation',

      // Data
      'table': 'data',
      'chart': 'data',
    };

    return categoryMap[componentType] || 'display';
  }

  private createComponentMetadata(type: string, fileName: string): ComponentMetadata {
    const descriptions: Record<string, string> = {
      accordion: 'Collapsible content panels for organizing information',
      alert: 'Informational messages and notifications',
      alertDialog: 'Modal dialogs for important confirmations',
      avatar: 'User profile pictures and representations',
      badge: 'Small status indicators and labels',
      breadcrumb: 'Navigation breadcrumb trails',
      button: 'Interactive buttons for actions',
      card: 'Container for content and actions',
      checkbox: 'Boolean selection controls',
      collapsible: 'Expandable content sections',
      command: 'Searchable command interfaces',
      contextMenu: 'Right-click context menus',
      dialog: 'Modal dialogs for interactions',
      drawer: 'Slide-out panels from screen edges',
      dropdownMenu: 'Dropdown menu components',
      form: 'Form containers and validation',
      hoverCard: 'Cards that appear on hover',
      input: 'Text input fields',
      label: 'Form field labels',
      menubar: 'Horizontal menu bars',
      navigationMenu: 'Complex navigation structures',
      pagination: 'Page navigation controls',
      popover: 'Floating content containers',
      progress: 'Progress indicators',
      radioGroup: 'Single selection from options',
      resizable: 'Resizable panel components',
      scrollArea: 'Custom scrollable areas',
      select: 'Dropdown selection components',
      separator: 'Visual content separators',
      sheet: 'Slide-out sheet panels',
      skeleton: 'Loading state placeholders',
      slider: 'Range selection controls',
      sonner: 'Toast notification system',
      switch: 'Toggle switches',
      table: 'Data table components',
      tabs: 'Tabbed content organization',
      textarea: 'Multi-line text input',
      toggle: 'Toggle buttons',
      toggleGroup: 'Grouped toggle controls',
      tooltip: 'Informational tooltips',
      chart: 'Data visualization charts and graphs',
    };

    return {
      type,
      name: this.formatComponentName(type),
      description: descriptions[type] || `${this.formatComponentName(type)} component`,
      category: this.determineCategory(type) as any,
      available: true,
      filePath: `components/ui/${fileName}.tsx`,
      examples: this.generateExamples(type),
    };
  }

  private formatComponentName(type: string): string {
    // Convert camelCase to Title Case
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private generateExamples(componentType: string): string[] {
    const examples: Record<string, string[]> = {
      button: [
        'Create a primary action button',
        'Add a cancel button with outline style'
      ],
      input: [
        'Create a text input for user names',
        'Add an email input with validation'
      ],
      card: [
        'Create a user profile card',
        'Build a product information card'
      ],
      table: [
        'Display employee directory data',
        'Create a product catalog table'
      ],
      form: [
        'Build a contact form',
        'Create a registration form with validation'
      ],
      chart: [
        'Generate sales performance charts',
        'Create data visualization for analytics'
      ]
    };

    return examples[componentType] || [
      `Create a ${componentType} component`,
      `Use ${componentType} for ${this.determineCategory(componentType)} purposes`
    ];
  }

  private generateSchemas() {
    // Generate Zod schemas for common component props
    this.componentSchemas.set('button', z.object({
      variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).optional(),
      size: z.enum(['default', 'sm', 'lg', 'icon']).optional(),
      children: z.string().optional(),
      disabled: z.boolean().optional(),
    }));

    this.componentSchemas.set('input', z.object({
      type: z.enum(['text', 'email', 'password', 'number']).optional(),
      placeholder: z.string().optional(),
      disabled: z.boolean().optional(),
      required: z.boolean().optional(),
    }));

    this.componentSchemas.set('card', z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      children: z.any().optional(),
      variant: z.enum(['default', 'elevated', 'outlined', 'filled']).optional(),
    }));

    // Add more schemas as needed
  }

  // Public API methods
  public getComponent(type: string): ComponentMetadata | undefined {
    return this.components.get(type);
  }

  public getAllComponents(): ComponentMetadata[] {
    return Array.from(this.components.values());
  }

  public getComponentsByCategory(category: string): ComponentMetadata[] {
    return this.getAllComponents().filter(comp => comp.category === category);
  }

  public getCategories(): ComponentCategory[] {
    return Array.from(this.categories.values());
  }

  public isComponentAvailable(type: string): boolean {
    const component = this.getComponent(type);
    return component?.available ?? false;
  }

  public getComponentSchema(type: string): z.ZodSchema | undefined {
    return this.componentSchemas.get(type);
  }

  public getComponentExamples(type: string): string[] {
    const component = this.getComponent(type);
    return component?.examples ?? [];
  }

  public refreshDiscovery() {
    this.components.clear();
    this.registerStaticComponents();
    this.generateSchemas();
  }
}

export const componentDiscovery = ComponentDiscovery.getInstance();
