"use client";

import React, { Suspense, lazy, ComponentType, ReactElement } from 'react';
import { componentRegistry } from './ComponentRegistry';
import { ComponentType as ComponentProps } from './schemas';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DynamicRendererProps {
  component: ComponentProps;
  fallback?: ReactElement;
  onError?: (error: Error, componentType: string) => void;
  onRender?: (componentType: string, props: any) => void;
}

interface RenderErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentType: string;
}

class RenderErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, componentType: string) => void; componentType: string },
  RenderErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, componentType: props.componentType };
  }

  static getDerivedStateFromError(error: Error): RenderErrorBoundaryState {
    return { hasError: true, error, componentType: '' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DynamicRenderer Error:', error, errorInfo);
    this.props.onError?.(error, this.props.componentType);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to render {this.props.componentType} component: {this.state.error?.message}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

const LoadingFallback: React.FC<{ componentType: string }> = ({ componentType }) => (
  <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
    <div className="flex items-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
      <span className="text-sm text-gray-600">Loading {componentType}...</span>
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);

const ErrorFallback: React.FC<{ componentType: string; error: Error }> = ({ componentType, error }) => (
  <Alert className="border-yellow-200 bg-yellow-50">
    <AlertTriangle className="h-4 w-4 text-yellow-600" />
    <AlertDescription className="text-yellow-800">
      Component "{componentType}" is not available: {error.message}
    </AlertDescription>
  </Alert>
);

// Lazy load component renderers
const componentRenderers = new Map<string, ComponentType<any>>();

const loadComponentRenderer = async (componentType: string): Promise<ComponentType<any> | null> => {
  try {
    // Check if renderer is already loaded
    if (componentRenderers.has(componentType)) {
      return componentRenderers.get(componentType)!;
    }

    // Dynamic import based on component type
    let renderer: ComponentType<any> | null = null;

    switch (componentType) {
      case 'card':
        try {
          const { CardRenderer } = await import('./renderers/CardRenderer');
          renderer = CardRenderer;
        } catch (e) {
          console.warn(`CardRenderer not found, using GenericRenderer`);
        }
        break;
      case 'button':
        try {
          const { ButtonRenderer } = await import('./renderers/ButtonRenderer');
          renderer = ButtonRenderer;
        } catch (e) {
          console.warn(`ButtonRenderer not found, using GenericRenderer`);
        }
        break;
      case 'input':
        try {
          const { InputRenderer } = await import('./renderers/InputRenderer');
          renderer = InputRenderer;
        } catch (e) {
          console.warn(`InputRenderer not found, using GenericRenderer`);
        }
        break;
      case 'form':
        try {
          const { FormRenderer } = await import('./renderers/FormRenderer');
          renderer = FormRenderer;
        } catch (e) {
          console.warn(`FormRenderer not found, using GenericRenderer`);
        }
        break;
      case 'table':
        try {
          const { TableRenderer } = await import('./renderers/TableRenderer');
          renderer = TableRenderer;
        } catch (e) {
          console.warn(`TableRenderer not found, using GenericRenderer`);
        }
        break;
      case 'chart':
        try {
          const { ChartRenderer } = await import('./renderers/ChartRenderer');
          renderer = ChartRenderer;
        } catch (e) {
          console.warn(`ChartRenderer not found, using GenericRenderer`);
        }
        break;
      case 'accordion':
        try {
          const { AccordionRenderer } = await import('./renderers/AccordionRenderer');
          renderer = AccordionRenderer;
        } catch (e) {
          console.warn(`AccordionRenderer not found, using GenericRenderer`);
        }
        break;
      case 'tabs':
        try {
          const { TabsRenderer } = await import('./renderers/TabsRenderer');
          renderer = TabsRenderer;
        } catch (e) {
          console.warn(`TabsRenderer not found, using GenericRenderer`);
        }
        break;
      case 'dialog':
        try {
          const { DialogRenderer } = await import('./renderers/DialogRenderer');
          renderer = DialogRenderer;
        } catch (e) {
          console.warn(`DialogRenderer not found, using GenericRenderer`);
        }
        break;
      case 'alert':
        try {
          const { AlertRenderer } = await import('./renderers/AlertRenderer');
          renderer = AlertRenderer;
        } catch (e) {
          console.warn(`AlertRenderer not found, using GenericRenderer`);
        }
        break;
      case 'avatar':
        try {
          const { AvatarRenderer } = await import('./renderers/AvatarRenderer');
          renderer = AvatarRenderer;
        } catch (e) {
          console.warn(`AvatarRenderer not found, using GenericRenderer`);
        }
        break;
      case 'badge':
        try {
          const { BadgeRenderer } = await import('./renderers/BadgeRenderer');
          renderer = BadgeRenderer;
        } catch (e) {
          console.warn(`BadgeRenderer not found, using GenericRenderer`);
        }
        break;
      case 'progress':
        try {
          const { ProgressRenderer } = await import('./renderers/ProgressRenderer');
          renderer = ProgressRenderer;
        } catch (e) {
          console.warn(`ProgressRenderer not found, using GenericRenderer`);
        }
        break;
      case 'section':
        try {
          const { SectionRenderer } = await import('./renderers/SectionRenderer');
          renderer = SectionRenderer;
        } catch (e) {
          console.warn(`SectionRenderer not found, using GenericRenderer`);
        }
        break;
      case 'text':
        try {
          const { TextRenderer } = await import('./renderers/TextRenderer');
          renderer = TextRenderer;
        } catch (e) {
          console.warn(`TextRenderer not found, using GenericRenderer`);
        }
        break;
      case 'drawer':
        try {
          const { DrawerRenderer } = await import('./renderers/DrawerRenderer');
          renderer = DrawerRenderer;
        } catch (e) {
          console.warn(`DrawerRenderer not found, using GenericRenderer`);
        }
        break;
      case 'command':
        try {
          const { CommandRenderer } = await import('./renderers/CommandRenderer');
          renderer = CommandRenderer;
        } catch (e) {
          console.warn(`CommandRenderer not found, using GenericRenderer`);
        }
        break;
      default:
        // Fallback to generic renderer
        try {
          const { GenericRenderer } = await import('./renderers/GenericRenderer');
          renderer = GenericRenderer;
        } catch (e) {
          console.error(`Even GenericRenderer failed to load for ${componentType}`);
        }
        break;
    }

    if (renderer) {
      componentRenderers.set(componentType, renderer);
    } else {
      // If no specific renderer was found, try the generic one
      try {
        const { GenericRenderer } = await import('./renderers/GenericRenderer');
        renderer = GenericRenderer;
        componentRenderers.set(componentType, renderer);
      } catch (e) {
        console.error(`Failed to load any renderer for ${componentType}`);
      }
    }

    return renderer;
  } catch (error) {
    console.error(`Failed to load renderer for ${componentType}:`, error);
    // Final fallback - try to load generic renderer
    try {
      const { GenericRenderer } = await import('./renderers/GenericRenderer');
      componentRenderers.set(componentType, GenericRenderer);
      return GenericRenderer;
    } catch (finalError) {
      console.error(`Critical error: Could not load any renderer for ${componentType}`);
      return null;
    }
  }
};

const ComponentRenderer: React.FC<{
  component: ComponentProps;
  onRender?: (componentType: string, props: any) => void;
}> = ({ component, onRender }) => {
  const [Renderer, setRenderer] = React.useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadRenderer = async () => {
      try {
        setLoading(true);
        setError(null);

        const renderer = await loadComponentRenderer(component.type);
        if (renderer) {
          setRenderer(() => renderer);
          onRender?.(component.type, component);
        } else {
          throw new Error(`No renderer available for component type: ${component.type}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadRenderer();
  }, [component.type, onRender]);

  if (loading) {
    return <LoadingFallback componentType={component.type} />;
  }

  if (error) {
    return <ErrorFallback componentType={component.type} error={error} />;
  }

  if (!Renderer) {
    return <ErrorFallback componentType={component.type} error={new Error('Renderer not found')} />;
  }

  return <Renderer {...component} />;
};

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  component,
  fallback,
  onError,
  onRender,
}) => {
  // Validate component props
  const validation = componentRegistry.validateComponentProps(component.type, component);

  if (!validation.success) {
    console.error('Component validation failed:', validation.error);
    console.error('Component data:', component);
    console.error('Component type:', component.type);
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Invalid props for {component.type} component: {validation.error?.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Check if component is available
  if (!componentRegistry.isComponentAvailable(component.type)) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Component "{component.type}" is not available
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <RenderErrorBoundary
      componentType={component.type}
      onError={onError}
    >
      <Suspense fallback={fallback || <LoadingFallback componentType={component.type} />}>
        <ComponentRenderer
          component={validation.data}
          onRender={onRender}
        />
      </Suspense>
    </RenderErrorBoundary>
  );
};

// Utility function to render multiple components
export const renderComponents = (
  components: ComponentProps[],
  options?: {
    fallback?: ReactElement;
    onError?: (error: Error, componentType: string) => void;
    onRender?: (componentType: string, props: any) => void;
  }
): ReactElement[] => {
  return components.map((component, index) => (
    <DynamicRenderer
      key={`${component.type}-${index}`}
      component={component}
      fallback={options?.fallback}
      onError={options?.onError}
      onRender={options?.onRender}
    />
  ));
};

// Utility function to render a single component with layout
export const renderComponentWithLayout = (
  component: ComponentProps,
  layout?: 'card' | 'section' | 'full',
  options?: {
    fallback?: ReactElement;
    onError?: (error: Error, componentType: string) => void;
    onRender?: (componentType: string, props: any) => void;
  }
): ReactElement => {
  const wrapperClass = layout === 'card' ? 'p-4 border border-gray-200 rounded-lg' :
                      layout === 'section' ? 'p-6' :
                      'w-full';

  return (
    <div className={wrapperClass}>
      <DynamicRenderer
        component={component}
        fallback={options?.fallback}
        onError={options?.onError}
        onRender={options?.onRender}
      />
    </div>
  );
};

export default DynamicRenderer;
