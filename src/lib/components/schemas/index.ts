import { z } from 'zod';

// Base component schema
export const BaseComponentSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  className: z.string().optional(),
});

// Layout Components
export const CardSchema: z.ZodSchema = BaseComponentSchema.extend({
  type: z.literal('card'),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.unknown().optional(),
  footer: z.unknown().optional(),
  components: z.array(z.any()).optional(), // Allow any object structure for components
  variant: z.enum(['default', 'elevated', 'outlined', 'filled']).optional(),
  layout: z.enum(['default', 'grid', 'sidebar', 'dashboard', 'vertical', 'profile']).optional(),
});

export const AccordionSchema = BaseComponentSchema.extend({
  type: z.literal('accordion'),
  sections: z.array(z.object({
    id: z.string().optional(), // Make id optional as it might not always be provided by AI
    title: z.string(),
    content: z.unknown(),
    disabled: z.boolean().optional(),
  })),
  accordionType: z.enum(['single', 'multiple']).optional(),
  collapsible: z.boolean().optional(),
});

export const TextSchema = BaseComponentSchema.extend({
  type: z.literal('text'),
  content: z.string(),
  variant: z.enum(['default', 'muted', 'lead', 'small']).optional(),
});

export const TabsSchema = BaseComponentSchema.extend({
  type: z.literal('tabs'),
  tabs: z.array(z.object({
    id: z.any().optional(), // Allow any type for id, will handle in component
    title: z.string().optional().default('Tab'),
    content: z.any(),
    disabled: z.boolean().optional(),
  })).transform((tabs) => {
    // Transform tabs to ensure each has a valid id
    return tabs.map((tab, index) => ({
      ...tab,
      id: tab.id ? String(tab.id) : `tab-${index}`,
      title: tab.title || `Tab ${index + 1}`
    }));
  }),
  defaultValue: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
});

export const SeparatorSchema = BaseComponentSchema.extend({
  type: z.literal('separator'),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
});

export const SectionSchema = BaseComponentSchema.extend({
  type: z.literal('section'),
  title: z.string().optional(),
  content: z.any().optional(),
  fields: z.array(z.any()).optional(), // Allow flexible field structure
  components: z.array(z.any()).optional(), // Allow nested components
  layout: z.enum(['default', 'grid', 'compact']).optional(),
});

// Input Components
export const ButtonSchema = BaseComponentSchema.extend({
  type: z.literal('button'),
  children: z.string(),
  variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).optional(),
  size: z.enum(['default', 'sm', 'lg', 'icon']).optional(),
  disabled: z.boolean().optional(),
  onClick: z.function().optional(),
});

export const InputSchema = BaseComponentSchema.extend({
  type: z.literal('input'),
  inputType: z.enum(['text', 'email', 'password', 'number', 'tel', 'url']).optional(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  disabled: z.boolean().optional(),
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export const TextareaSchema = BaseComponentSchema.extend({
  type: z.literal('textarea'),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  disabled: z.boolean().optional(),
  required: z.boolean().optional(),
  rows: z.number().optional(),
});

export const SelectSchema = BaseComponentSchema.extend({
  type: z.literal('select'),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    disabled: z.boolean().optional(),
  })),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  disabled: z.boolean().optional(),
  required: z.boolean().optional(),
});

export const CheckboxSchema = BaseComponentSchema.extend({
  type: z.literal('checkbox'),
  label: z.string().optional(),
  checked: z.boolean().optional(),
  disabled: z.boolean().optional(),
  required: z.boolean().optional(),
});

export const RadioGroupSchema = BaseComponentSchema.extend({
  type: z.literal('radioGroup'),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    disabled: z.boolean().optional(),
  })),
  value: z.string().optional(),
  disabled: z.boolean().optional(),
  required: z.boolean().optional(),
});

export const SwitchSchema = BaseComponentSchema.extend({
  type: z.literal('switch'),
  label: z.string().optional(),
  checked: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

export const SliderSchema = BaseComponentSchema.extend({
  type: z.literal('slider'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  value: z.array(z.number()).optional(),
  disabled: z.boolean().optional(),
});

export const ToggleSchema = BaseComponentSchema.extend({
  type: z.literal('toggle'),
  children: z.any(),
  pressed: z.boolean().optional(),
  disabled: z.boolean().optional(),
  size: z.enum(['default', 'sm', 'lg']).optional(),
});

export const ToggleGroupSchema = BaseComponentSchema.extend({
  type: z.literal('toggleGroup'),
  toggleType: z.enum(['single', 'multiple']).optional(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
  disabled: z.boolean().optional(),
  items: z.array(z.object({
    value: z.string(),
    children: z.unknown(),
    disabled: z.boolean().optional(),
  })),
});

// Display Components
export const AvatarSchema = BaseComponentSchema.extend({
  type: z.literal('avatar'),
  src: z.string().optional(),
  alt: z.string().optional(),
  fallback: z.string().optional(),
  size: z.enum(['sm', 'default', 'lg', 'xl']).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const BadgeSchema = BaseComponentSchema.extend({
  type: z.literal('badge'),
  children: z.string().optional(),
  text: z.string().optional(), // Allow both text and children for flexibility
  variant: z.enum(['default', 'secondary', 'destructive', 'outline']).optional(),
});

export const ProgressSchema = BaseComponentSchema.extend({
  type: z.literal('progress'),
  value: z.number().min(0).max(100).optional(),
  max: z.number().optional(),
});

export const SkeletonSchema = BaseComponentSchema.extend({
  type: z.literal('skeleton'),
  className: z.string().optional(),
});

// Feedback Components
export const AlertSchema = BaseComponentSchema.extend({
  type: z.literal('alert'),
  title: z.string().optional(),
  description: z.string().optional(),
  variant: z.enum(['default', 'destructive']).optional(),
});

export const AlertDialogSchema = BaseComponentSchema.extend({
  type: z.literal('alertDialog'),
  title: z.string(),
  description: z.string(),
  cancelText: z.string().optional(),
  confirmText: z.string().optional(),
  actionText: z.string().optional(), // Keep for backward compatibility
  variant: z.enum(['default', 'destructive']).optional(),
  trigger: z.union([z.string(), z.object({ text: z.string(), variant: z.string().optional() })]).optional(),
  onConfirm: z.function().optional(),
  onCancel: z.function().optional(),
  onAction: z.function().optional(), // Keep for backward compatibility
});

export const DialogSchema = BaseComponentSchema.extend({
  type: z.literal('dialog'),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.any().optional(),
  trigger: z.any().optional(),
  open: z.boolean().optional(),
  onOpenChange: z.function().optional(),
});

export const DrawerSchema = BaseComponentSchema.extend({
  type: z.literal('drawer'),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.any().optional(),
  side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  open: z.boolean().optional(),
  onOpenChange: z.function().optional(),
});


export const SonnerSchema = BaseComponentSchema.extend({
  type: z.literal('sonner'),
  message: z.string(),
  sonnerType: z.enum(['success', 'error', 'warning', 'info']).optional(),
  duration: z.number().optional(),
});

// Navigation Components
export const BreadcrumbSchema = BaseComponentSchema.extend({
  type: z.literal('breadcrumb'),
  items: z.array(z.object({
    label: z.string(),
    href: z.string().optional(),
  })),
});

export const MenubarSchema = BaseComponentSchema.extend({
  type: z.literal('menubar'),
  items: z.array(z.object({
    label: z.string(),
    children: z.any().optional(),
    disabled: z.boolean().optional(),
  })),
});

export const NavigationMenuSchema = BaseComponentSchema.extend({
  type: z.literal('navigationMenu'),
  items: z.array(z.object({
    title: z.string(),
    href: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({
      title: z.string(),
      href: z.string(),
      description: z.string().optional(),
    })).optional(),
  })),
});

export const PaginationSchema = BaseComponentSchema.extend({
  type: z.literal('pagination'),
  currentPage: z.number().min(1),
  totalPages: z.number().min(1),
  onPageChange: z.function().optional(),
  showFirstLast: z.boolean().optional(),
  showPrevNext: z.boolean().optional(),
});

// Data Components
export const TableSchema = BaseComponentSchema.extend({
  type: z.literal('table'),
  columns: z.array(z.object({
    header: z.string(),
    field: z.string(),
    sortable: z.boolean().optional(),
    width: z.string().optional(),
  })),
  rows: z.array(z.record(z.string(), z.unknown())),
  sortable: z.boolean().optional(),
  selectable: z.boolean().optional(),
  pagination: z.boolean().optional(),
  pageSize: z.number().optional(),
});

export const ChartSchema = BaseComponentSchema.extend({
  type: z.literal('chart'),
  title: z.string().optional(),
  description: z.string().optional(),
  chartType: z.enum(['bar', 'line', 'pie', 'area', 'doughnut', 'radar', 'scatter']).optional(),
  data: z.object({
    labels: z.array(z.string()),
    datasets: z.array(z.object({
      label: z.string().optional(),
      data: z.array(z.number()),
      backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
      borderColor: z.union([z.string(), z.array(z.string())]).optional(),
      borderWidth: z.number().optional(),
    })),
  }),
  options: z.record(z.string(), z.unknown()).optional(),
  sparkline: z.boolean().optional(), // Add sparkline prop
});

// Form Component
export const FormSchema = BaseComponentSchema.extend({
  type: z.literal('form'),
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'slider', 'datePicker']),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    value: z.any().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
  })).default([]),
  submitText: z.string().optional(),
  onSubmit: z.function().optional(),
  layout: z.enum(['vertical', 'horizontal', 'grid']).optional(),
});

// Collapsible Component
export const CollapsibleSchema = BaseComponentSchema.extend({
  type: z.literal('collapsible'),
  title: z.string(),
  content: z.any(),
  defaultOpen: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

// Hover Card Component
export const HoverCardSchema = BaseComponentSchema.extend({
  type: z.literal('hoverCard'),
  trigger: z.any(),
  content: z.any(),
  open: z.boolean().optional(),
  onOpenChange: z.function().optional(),
  side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
});

export const DropdownMenuSchema = BaseComponentSchema.extend({
  type: z.literal('dropdownMenu'),
  trigger: z.any(),
  items: z.array(z.object({
    label: z.string(),
    onClick: z.function().optional(),
    disabled: z.boolean().optional(),
    separator: z.boolean().optional(),
    items: z.array(z.object({
      label: z.string(),
      onClick: z.function().optional(),
      disabled: z.boolean().optional(),
    })).optional(),
  })),
  side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
});

// Popover Component
export const PopoverSchema = BaseComponentSchema.extend({
  type: z.literal('popover'),
  trigger: z.any(),
  content: z.any(),
  open: z.boolean().optional(),
  onOpenChange: z.function().optional(),
});

// Tooltip Component
export const TooltipSchema = BaseComponentSchema.extend({
  type: z.literal('tooltip'),
  content: z.string(),
  children: z.any(),
  side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
});

// Context Menu Component
export const ContextMenuSchema = BaseComponentSchema.extend({
  type: z.literal('contextMenu'),
  trigger: z.any(),
  items: z.array(z.object({
    label: z.string(),
    onClick: z.function().optional(),
    disabled: z.boolean().optional(),
    separator: z.boolean().optional(),
  })),
});

// Scroll Area Component
export const ScrollAreaSchema = BaseComponentSchema.extend({
  type: z.literal('scrollArea'),
  children: z.any(),
  height: z.union([z.string(), z.number()]).optional(),
  width: z.union([z.string(), z.number()]).optional(),
});

// Sheet Component
export const SheetSchema = BaseComponentSchema.extend({
  type: z.literal('sheet'),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.any(),
  side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  open: z.boolean().optional(),
  onOpenChange: z.function().optional(),
});

// Aspect Ratio Component
export const AspectRatioSchema = BaseComponentSchema.extend({
  type: z.literal('aspectRatio'),
  ratio: z.number().optional(),
  children: z.any(),
});

// Resizable Component
export const ResizableSchema = BaseComponentSchema.extend({
  type: z.literal('resizable'),
  direction: z.enum(['horizontal', 'vertical']).optional(),
  children: z.any(),
  defaultSize: z.number().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
});

// Calendar Component
export const CalendarSchema = BaseComponentSchema.extend({
  type: z.literal('calendar'),
  // Simple calendar props
  mode: z.enum(['single', 'range']).optional(),
  selected: z.any().optional(),
  onSelect: z.function().optional(),
  // Event calendar props
  title: z.string().optional(),
  description: z.string().optional(),
  events: z.array(z.object({
    title: z.string(),
    date: z.string(),
    time: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  onEventClick: z.string().optional(),
});

// Date Picker Component
export const DatePickerSchema = BaseComponentSchema.extend({
  type: z.literal('datePicker'),
  date: z.any().optional(),
  setDate: z.function().optional(),
});

// Command Component
export const CommandSchema = BaseComponentSchema.extend({
  type: z.literal('command'),
  placeholder: z.string().optional(),
  items: z.array(z.object({
    value: z.string(),
    label: z.string(),
    onSelect: z.function().optional(),
  })),
  emptyText: z.string().optional(),
  onValueChange: z.function().optional(),
});

// Stepper Component
export const StepperSchema = BaseComponentSchema.extend({
  type: z.literal('stepper'),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    content: z.union([
      z.string(),
      z.object({
        type: z.string(),
      }).passthrough()
    ]).optional(),
  })),
  currentStep: z.number().default(0),
  showContent: z.boolean().default(true),
  allowSkip: z.boolean().default(false),
  showNavigation: z.boolean().default(true),
});

// DataTable Component
export const DataTableSchema = BaseComponentSchema.extend({
  type: z.literal('dataTable'),
  title: z.string().optional(),
  description: z.string().optional(),
  data: z.array(z.record(z.string(), z.unknown())),
  columns: z.array(z.union([
    z.string(),
    z.object({
      key: z.string(),
      title: z.string(),
      sortable: z.boolean().optional(),
    }),
    z.object({
      header: z.string(),
      field: z.string(),
      sortable: z.boolean().optional(),
    })
  ])),
  searchable: z.boolean().default(true),
  sortable: z.boolean().default(true),
  filterable: z.boolean().default(false),
});

// Component type validation helper
export const validateComponentByType = (data: any) => {
  if (!data || typeof data !== 'object' || !data.type) {
    return false;
  }

  const componentType = data.type;
  const schemaMap: Record<string, z.ZodSchema> = {
    text: TextSchema,
    card: CardSchema,
    accordion: AccordionSchema,
    tabs: TabsSchema,
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
    sonner: SonnerSchema,
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
    stepper: StepperSchema,
    dataTable: DataTableSchema,
  };

  const schema = schemaMap[componentType];
  if (!schema) {
    return false;
  }

  return schema.safeParse(data);
};

// Simplified union - we'll validate components individually
export const ComponentSchema = z.custom((data: any) => {
  const result = validateComponentByType(data);
  if (result === false) return false;
  return result.success;
}, "Invalid component structure");

export type ComponentType = z.infer<typeof ComponentSchema>;
export type ButtonProps = z.infer<typeof ButtonSchema>;
export type CardProps = z.infer<typeof CardSchema>;
export type FormProps = z.infer<typeof FormSchema>;
export type TableProps = z.infer<typeof TableSchema>;
export type ChartProps = z.infer<typeof ChartSchema>;
export type TabsProps = z.infer<typeof TabsSchema>;
export type SectionProps = z.infer<typeof SectionSchema>;
export type AvatarProps = z.infer<typeof AvatarSchema>;
export type BadgeProps = z.infer<typeof BadgeSchema>;
export type AccordionProps = z.infer<typeof AccordionSchema>;
export type CalendarProps = z.infer<typeof CalendarSchema>;
export type DatePickerProps = z.infer<typeof DatePickerSchema>;
export type DropdownMenuProps = z.infer<typeof DropdownMenuSchema>;
export type PopoverProps = z.infer<typeof PopoverSchema>;
export type TooltipProps = z.infer<typeof TooltipSchema>;
export type ResizableProps = z.infer<typeof ResizableSchema>;
export type StepperProps = z.infer<typeof StepperSchema>;
export type DataTableProps = z.infer<typeof DataTableSchema>;
