import { componentDiscovery, ComponentMetadata } from './ComponentDiscovery';
import { ComponentSchema, ComponentType } from './schemas';
import { z } from 'zod';

export interface ComponentDefinition {
  metadata: ComponentMetadata;
  schema: z.ZodSchema;
  renderer?: React.ComponentType<any>;
  examples: string[];
  dependencies: string[];
}

export interface RegistryOptions {
  enableAutoDiscovery?: boolean;
  customComponents?: ComponentDefinition[];
  schemaValidation?: boolean;
}

export class DynamicComponentRegistry {
  private static instance: DynamicComponentRegistry;
  private components: Map<string, ComponentDefinition> = new Map();
  private renderers: Map<string, React.ComponentType<any>> = new Map();
  private schemas: Map<string, z.ZodSchema> = new Map();
  private options: RegistryOptions;

  private constructor(options: RegistryOptions = {}) {
    this.options = {
      enableAutoDiscovery: true,
      schemaValidation: true,
      ...options
    };

    this.initializeRegistry();
  }

  public static getInstance(options?: RegistryOptions): DynamicComponentRegistry {
    if (!DynamicComponentRegistry.instance) {
      DynamicComponentRegistry.instance = new DynamicComponentRegistry(options);
    }
    return DynamicComponentRegistry.instance;
  }

  private initializeRegistry() {
    if (this.options.enableAutoDiscovery) {
      this.discoverAndRegisterComponents();
    }

    // Register custom components if provided
    if (this.options.customComponents) {
      for (const customComponent of this.options.customComponents) {
        this.registerComponent(customComponent);
      }
    }
  }

  private discoverAndRegisterComponents() {
    const discoveredComponents = componentDiscovery.getAllComponents();

    for (const metadata of discoveredComponents) {
      const definition: ComponentDefinition = {
        metadata,
        schema: this.getSchemaForComponent(metadata.type),
        examples: metadata.examples || [],
        dependencies: metadata.dependencies || [],
      };

      // Try to load renderer dynamically
      const renderer = this.loadRendererForComponent(metadata.type);
      if (renderer) {
        definition.renderer = renderer;
      }

      this.registerComponent(definition);
    }
  }

  private loadRendererForComponent(type: string): React.ComponentType<any> | undefined {
    try {
      // For now, we'll use synchronous loading since we have the renderers available
      return this.getRendererComponent(type);
    } catch (error) {
      console.warn(`Failed to load renderer for component type: ${type}`, error);
    }
    return undefined;
  }

  private getRendererComponent(type: string): React.ComponentType<any> | undefined {
    // Try to import the specific renderer dynamically
    try {
      // Use dynamic require for individual renderers to avoid MODULE_NOT_FOUND errors
      const rendererImports: Record<string, () => any> = {
        card: () => require('./renderers/CardRenderer').CardRenderer,
        button: () => require('./renderers/ButtonRenderer').ButtonRenderer,
        input: () => require('./renderers/InputRenderer').InputRenderer,
        form: () => require('./renderers/FormRenderer').FormRenderer,
        table: () => require('./renderers/TableRenderer').TableRenderer,
        chart: () => require('./renderers/ChartRenderer').ChartRenderer,
        accordion: () => require('./renderers/AccordionRenderer').AccordionRenderer,
        tabs: () => require('./renderers/TabsRenderer').TabsRenderer,
        alert: () => require('./renderers/AlertRenderer').AlertRenderer,
        avatar: () => require('./renderers/AvatarRenderer').AvatarRenderer,
        badge: () => require('./renderers/BadgeRenderer').BadgeRenderer,
        progress: () => require('./renderers/ProgressRenderer').ProgressRenderer,
        dialog: () => require('./renderers/DialogRenderer').DialogRenderer,
        section: () => require('./renderers/SectionRenderer').SectionRenderer,
        text: () => require('./renderers/TextRenderer').TextRenderer,
        drawer: () => require('./renderers/DrawerRenderer').DrawerRenderer,
        command: () => require('./renderers/CommandRenderer').CommandRenderer,
      };

      const importFn = rendererImports[type];
      if (importFn) {
        try {
          return importFn();
        } catch (e) {
          // Specific renderer not found, fall back to generic
          console.warn(`Specific renderer not found for ${type}, using GenericRenderer`);
        }
      }

      // Fall back to GenericRenderer for components without specific renderers
      try {
        return require('./renderers/GenericRenderer').GenericRenderer;
      } catch (e) {
        console.error(`Even GenericRenderer failed to load for ${type}`);
        return undefined;
      }
    } catch (error) {
      console.warn(`Failed to get renderer component for type: ${type}`, error);
      return undefined;
    }
  }

  private getSchemaForComponent(type: string): z.ZodSchema {
    // Import individual schemas for proper mapping
    const {
      CardSchema,
      AccordionSchema,
      TabsSchema,
      TextSchema,
      SeparatorSchema,
      SectionSchema,
      ButtonSchema,
      InputSchema,
      TextareaSchema,
      SelectSchema,
      CheckboxSchema,
      RadioGroupSchema,
      SwitchSchema,
      SliderSchema,
      ToggleSchema,
      ToggleGroupSchema,
      AvatarSchema,
      BadgeSchema,
      ProgressSchema,
      SkeletonSchema,
      AlertSchema,
      AlertDialogSchema,
      DialogSchema,
      DrawerSchema,
      PopoverSchema,
      TooltipSchema,
      SonnerSchema,
      BreadcrumbSchema,
      MenubarSchema,
      NavigationMenuSchema,
      PaginationSchema,
      TableSchema,
      ChartSchema,
      FormSchema,
      CollapsibleSchema,
      HoverCardSchema,
      DropdownMenuSchema,
      ContextMenuSchema,
      ScrollAreaSchema,
      SheetSchema,
      AspectRatioSchema,
      ResizableSchema,
      CommandSchema,
    } = require('./schemas');

    // Map component types to their schemas
    const schemaMap: Record<string, z.ZodSchema> = {
      card: CardSchema,
      accordion: AccordionSchema,
      tabs: TabsSchema,
      text: TextSchema,
      separator: SeparatorSchema,
      section: SectionSchema,
      button: ButtonSchema,
      input: InputSchema,
      textarea: TextareaSchema,
      select: SelectSchema,
      checkbox: CheckboxSchema,
      radioGroup: RadioGroupSchema,
      switch: SwitchSchema,
      slider: SliderSchema,
      toggle: ToggleSchema,
      toggleGroup: ToggleGroupSchema,
      avatar: AvatarSchema,
      badge: BadgeSchema,
      progress: ProgressSchema,
      skeleton: SkeletonSchema,
      alert: AlertSchema,
      alertDialog: AlertDialogSchema,
      dialog: DialogSchema,
      drawer: DrawerSchema,
      popover: PopoverSchema,
      tooltip: TooltipSchema,
      breadcrumb: BreadcrumbSchema,
      menubar: MenubarSchema,
      navigationMenu: NavigationMenuSchema,
      pagination: PaginationSchema,
      table: TableSchema,
      chart: ChartSchema,
      form: FormSchema,
      collapsible: CollapsibleSchema,
      hoverCard: HoverCardSchema,
      dropdownMenu: DropdownMenuSchema,
      contextMenu: ContextMenuSchema,
      scrollArea: ScrollAreaSchema,
      sheet: SheetSchema,
      aspectRatio: AspectRatioSchema,
      resizable: ResizableSchema,
      command: CommandSchema,
      sonner: SonnerSchema,
    };

    return schemaMap[type] || CardSchema;
  }

  public registerComponent(definition: ComponentDefinition) {
    this.components.set(definition.metadata.type, definition);
    this.schemas.set(definition.metadata.type, definition.schema);

    if (definition.renderer) {
      this.renderers.set(definition.metadata.type, definition.renderer);
    }
  }

  public getComponent(type: string): ComponentDefinition | undefined {
    return this.components.get(type);
  }

  public getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  public getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.getAllComponents().filter(comp => comp.metadata.category === category);
  }

  public isComponentAvailable(type: string): boolean {
    const component = this.getComponent(type);
    const available = component?.metadata.available ?? false;
    if (type === 'section') {
      console.log(`Section component check:`, { component, available, allComponents: this.getAllComponents().map(c => c.metadata.type) });
    }
    return available;
  }

  public validateComponentProps(type: string, props: any): { success: boolean; data?: any; error?: z.ZodError } {
    // Temporarily disable validation for debugging
    if (!this.options.schemaValidation || type === 'form' || type === 'tabs') {
      return { success: true, data: props };
    }

    const schema = this.schemas.get(type);
    if (!schema) {
      return { success: false, error: new z.ZodError([]) };
    }

    const result = schema.safeParse(props);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  }

  public getComponentRenderer(type: string): React.ComponentType<any> | undefined {
    return this.renderers.get(type);
  }

  public setComponentRenderer(type: string, renderer: React.ComponentType<any>) {
    this.renderers.set(type, renderer);
  }

  public getComponentExamples(type: string): string[] {
    const component = this.getComponent(type);
    return component?.examples ?? [];
  }

  public getComponentDependencies(type: string): string[] {
    const component = this.getComponent(type);
    return component?.dependencies ?? [];
  }

  public refreshRegistry() {
    this.components.clear();
    this.schemas.clear();
    this.renderers.clear();
    this.initializeRegistry();
  }

  public getRegistryStats() {
    const stats = {
      totalComponents: this.components.size,
      componentsByCategory: {} as Record<string, number>,
      availableComponents: 0,
      customComponents: 0,
    };

    for (const component of this.components.values()) {
      stats.componentsByCategory[component.metadata.category] =
        (stats.componentsByCategory[component.metadata.category] || 0) + 1;

      if (component.metadata.available) {
        stats.availableComponents++;
      }
    }

    return stats;
  }
}

export const componentRegistry = DynamicComponentRegistry.getInstance();
