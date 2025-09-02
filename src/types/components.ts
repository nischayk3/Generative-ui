export interface CardAction {
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  action: string;
}

export interface CardBadge {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export interface CardField {
  name: string;
  label: string;
  value: string | number;
  icon?: string;
}

export interface CardSection {
  type: "section";
  title: string;
  fields?: CardField[];
  components?: ComponentData[];
  variant?: "default" | "info" | "success" | "warning";
  layout?: "grid" | "list" | "compact";
}

export interface CardTabs {
  type: "tabs";
  tabs: Array<{
    title: string;
    content: ComponentData[];
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface TableColumn {
  header: string;
  field: string;
  sortable?: boolean;
  width?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ComponentData {
  type: "section" | "tabs" | "table" | "chart" | "form";
  title?: string;
  description?: string;
  fields?: CardField[];
  components?: ComponentData[];
  variant?: string;
  layout?: string;
  // Chart specific
  chartType?: string;
  data?: ChartData;
  // Table specific
  columns?: TableColumn[];
  rows?: Record<string, unknown>[];
  // Form specific
  submitText?: string;
  // Generic
  [key: string]: unknown;
}

export interface CardToolProps {
  title: string;
  description?: string;
  content?: string;
  components?: ComponentData[];
  actions?: CardAction[];
  badges?: CardBadge[];
  imageUrl?: string;
  variant?: "default" | "elevated" | "outlined" | "filled";
  layout?: "default" | "grid" | "sidebar" | "dashboard";
}

export interface ChartToolProps {
  title?: string;
  description?: string;
  chartType?: "bar" | "line" | "pie" | "area";
  data: ChartData;
}

export interface TableToolProps {
  title?: string;
  description?: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

export interface FormToolProps {
  title?: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
}

export interface ToolCall {
  type: "form" | "chart" | "table" | "card";
  data: ComponentData;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}
