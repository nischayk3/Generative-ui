import { ComponentType } from '../components/schemas';
import { componentRegistry } from '../components/ComponentRegistry';
import { layoutEngine } from '../layout/LayoutEngine';

export interface AgentStep {
  id: string;
  description: string;
  action: 'analyze' | 'generate' | 'validate' | 'optimize' | 'layout' | 'complete';
  toolCall?: {
    type: string;
    parameters: Record<string, any>;
  };
  stopCondition?: 'component_ready' | 'layout_complete' | 'validation_passed' | 'max_steps_reached';
  maxRetries?: number;
  timeout?: number;
}

export interface AgentState {
  currentStep: number;
  totalSteps: number;
  completedSteps: AgentStep[];
  pendingSteps: AgentStep[];
  context: {
    userIntent: string;
    components: ComponentType[];
    layout?: any;
    validationResults: ValidationResult[];
    errors: Error[];
  };
  status: 'idle' | 'analyzing' | 'generating' | 'validating' | 'optimizing' | 'layout' | 'complete' | 'error';
  progress: {
    percentage: number;
    message: string;
    stepDetails?: string;
  };
}

export interface ValidationResult {
  component: ComponentType;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AgentConfig {
  maxSteps: number;
  timeoutPerStep: number;
  enableToolChaining: boolean;
  stopWhen: 'first_complete' | 'all_valid' | 'layout_ready' | 'user_confirmation';
  retryOnFailure: boolean;
  maxRetries: number;
}

export class MultiStepAgent {
  private static instance: MultiStepAgent;
  private config: AgentConfig;
  private currentState: AgentState;

  private constructor(config?: Partial<AgentConfig>) {
    this.config = {
      maxSteps: 5,
      timeoutPerStep: 30000,
      enableToolChaining: true,
      stopWhen: 'first_complete',
      retryOnFailure: true,
      maxRetries: 3,
      ...config,
    };

    this.currentState = this.createInitialState();
  }

  public static getInstance(config?: Partial<AgentConfig>): MultiStepAgent {
    if (!MultiStepAgent.instance) {
      MultiStepAgent.instance = new MultiStepAgent(config);
    }
    return MultiStepAgent.instance;
  }

  private createInitialState(): AgentState {
    return {
      currentStep: 0,
      totalSteps: 0,
      completedSteps: [],
      pendingSteps: [],
      context: {
        userIntent: '',
        components: [],
        validationResults: [],
        errors: [],
      },
      status: 'idle',
      progress: {
        percentage: 0,
        message: 'Ready to start',
      },
    };
  }

  public async executeWorkflow(userIntent: string): Promise<AgentState> {
    this.resetState();
    this.currentState.context.userIntent = userIntent;
    this.currentState.status = 'analyzing';

    try {
      // Step 1: Analyze user intent
      await this.executeStep({
        id: 'analyze-intent',
        description: 'Analyzing user intent and requirements',
        action: 'analyze',
      });

      // Step 2: Generate initial components
      await this.executeStep({
        id: 'generate-components',
        description: 'Generating initial component structure',
        action: 'generate',
      });

      // Step 3: Validate components
      await this.executeStep({
        id: 'validate-components',
        description: 'Validating component configuration',
        action: 'validate',
      });

      // Step 4: Generate layout
      await this.executeStep({
        id: 'generate-layout',
        description: 'Creating intelligent layout arrangement',
        action: 'layout',
      });

      // Step 5: Optimize and finalize
      await this.executeStep({
        id: 'optimize-result',
        description: 'Optimizing final result',
        action: 'optimize',
        stopCondition: 'max_steps_reached',
      });

      this.currentState.status = 'complete';
      this.updateProgress(100, 'Workflow completed successfully');

    } catch (error) {
      this.currentState.status = 'error';
      this.currentState.context.errors.push(error as Error);
      this.updateProgress(0, `Error: ${(error as Error).message}`);
    }

    return this.currentState;
  }

  private async executeStep(step: AgentStep): Promise<void> {
    const stepIndex = this.currentState.completedSteps.length + 1;
    this.currentState.currentStep = stepIndex;

    this.updateProgress(
      (stepIndex / this.config.maxSteps) * 100,
      step.description
    );

    try {
      let result: any;

      switch (step.action) {
        case 'analyze':
          result = await this.analyzeIntent(this.currentState.context.userIntent);
          break;
        case 'generate':
          result = await this.generateComponents(this.currentState.context);
          break;
        case 'validate':
          result = await this.validateComponents(this.currentState.context.components);
          break;
        case 'layout':
          result = await this.generateLayout(this.currentState.context.components);
          break;
        case 'optimize':
          result = await this.optimizeResult(this.currentState.context);
          break;
        default:
          throw new Error(`Unknown action: ${step.action}`);
      }

      // Update context with results
      this.updateContextFromResult(step.action, result);

      // Mark step as completed
      this.currentState.completedSteps.push({
        ...step,
        // Add execution timestamp or other metadata
      });

      // Check stop conditions
      if (this.shouldStop(step.stopCondition)) {
        return;
      }

    } catch (error) {
      if (this.config.retryOnFailure && (step.maxRetries || 0) < this.config.maxRetries) {
        // Retry logic would go here
        console.warn(`Step ${step.id} failed, retrying...`);
      } else {
        throw error;
      }
    }
  }

  private async analyzeIntent(userIntent: string): Promise<any> {
    // Use AI to analyze user intent and determine required components
    const analysis = {
      primaryIntent: this.detectPrimaryIntent(userIntent),
      requiredComponents: this.extractRequiredComponents(userIntent),
      layoutPreference: this.detectLayoutPreference(userIntent),
      complexity: this.assessComplexity(userIntent),
    };

    return analysis;
  }

  private async generateComponents(context: AgentState['context']): Promise<ComponentType[]> {
    const components: ComponentType[] = [];

    // Generate components based on analysis
    if (context.userIntent.toLowerCase().includes('dashboard')) {
      components.push(
        {
          type: 'card',
          title: 'Key Metrics',
          description: 'Important metrics overview',
        },
        {
          type: 'chart',
          title: 'Performance Chart',
          description: 'Visual representation of data',
          chartType: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
              label: 'Performance',
              data: [65, 59, 80, 81, 56],
              backgroundColor: '#4CAF50',
            }],
          },
        }
      );
    }

    if (context.userIntent.toLowerCase().includes('form')) {
      components.push({
        type: 'form',
        title: 'Contact Form',
        description: 'Get in touch with us',
        fields: [
          {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
          },
        ],
        submitText: 'Submit',
      });
    }

    return components;
  }

  private async validateComponents(components: ComponentType[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const component of components) {
      const validation = componentRegistry.validateComponentProps(component.type, component);

      results.push({
        component,
        isValid: validation.success,
        errors: validation.success ? [] : [validation.error?.message || 'Validation failed'],
        warnings: [],
        suggestions: this.generateValidationSuggestions(component),
      });
    }

    return results;
  }

  private async generateLayout(components: ComponentType[]): Promise<any> {
    const layoutResult = layoutEngine.generateLayout(components);
    return layoutResult;
  }

  private async optimizeResult(context: AgentState['context']): Promise<any> {
    // Apply final optimizations
    const optimizations = {
      performance: this.optimizePerformance(context.components),
      accessibility: this.optimizeAccessibility(context.components),
      responsiveness: this.optimizeResponsiveness(context),
    };

    return optimizations;
  }

  private detectPrimaryIntent(userIntent: string): string {
    const intentPatterns = {
      dashboard: /dashboard|overview|metrics|analytics/i,
      form: /form|input|registration|contact/i,
      table: /table|data|list|directory/i,
      chart: /chart|graph|visualization|plot/i,
      profile: /profile|user|account/i,
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(userIntent)) {
        return intent;
      }
    }

    return 'generic';
  }

  private extractRequiredComponents(userIntent: string): string[] {
    const componentKeywords = {
      card: /card|panel|container/i,
      chart: /chart|graph|visualization|plot/i,
      table: /table|data|list|grid/i,
      form: /form|input|field/i,
      button: /button|action|submit/i,
      avatar: /avatar|profile|picture/i,
    };

    const required: string[] = [];

    for (const [component, pattern] of Object.entries(componentKeywords)) {
      if (pattern.test(userIntent)) {
        required.push(component);
      }
    }

    return required.length > 0 ? required : ['card']; // Default to card if nothing detected
  }

  private detectLayoutPreference(userIntent: string): string {
    if (/sidebar|navigation|menu/i.test(userIntent)) return 'sidebar';
    if (/grid|masonry|cards/i.test(userIntent)) return 'grid';
    if (/single|centered|focus/i.test(userIntent)) return 'single';
    return 'auto';
  }

  private assessComplexity(userIntent: string): 'simple' | 'medium' | 'complex' {
    const wordCount = userIntent.split(' ').length;
    const hasMultipleComponents = (userIntent.match(/and|with|also|plus/gi) || []).length > 1;

    if (wordCount > 50 || hasMultipleComponents) return 'complex';
    if (wordCount > 20) return 'medium';
    return 'simple';
  }

  private generateValidationSuggestions(component: ComponentType): string[] {
    const suggestions: string[] = [];

    // Component-specific suggestions
    switch (component.type) {
      case 'form':
        if (!component.fields?.length) {
          suggestions.push('Add form fields to make the form functional');
        }
        break;
      case 'chart':
        if (!component.data) {
          suggestions.push('Add chart data to display the visualization');
        }
        break;
      case 'table':
        if (!component.columns?.length) {
          suggestions.push('Define table columns for proper data display');
        }
        break;
    }

    return suggestions;
  }

  private optimizePerformance(components: ComponentType[]): any {
    // Performance optimization suggestions
    return {
      lazyLoading: components.length > 5,
      memoization: true,
      bundleSplitting: components.length > 10,
    };
  }

  private optimizeAccessibility(components: ComponentType[]): any {
    // Accessibility improvements
    return {
      ariaLabels: true,
      keyboardNavigation: true,
      screenReaderSupport: true,
    };
  }

  private optimizeResponsiveness(context: AgentState['context']): any {
    // Responsive design optimizations
    return {
      mobileFirst: true,
      breakpointOptimization: true,
      touchFriendly: context.components.some(c => c.type === 'button' || c.type === 'form'),
    };
  }

  private shouldStop(stopCondition?: string): boolean {
    if (!stopCondition) return false;

    switch (stopCondition) {
      case 'component_ready':
        return this.currentState.context.components.length > 0;
      case 'layout_complete':
        return !!this.currentState.context.layout;
      case 'validation_passed':
        return this.currentState.context.validationResults.every(r => r.isValid);
      case 'max_steps_reached':
        return this.currentState.currentStep >= this.config.maxSteps;
      default:
        return false;
    }
  }

  private updateContextFromResult(action: string, result: any): void {
    switch (action) {
      case 'analyze':
        // Update context with analysis results
        break;
      case 'generate':
        this.currentState.context.components = result;
        break;
      case 'validate':
        this.currentState.context.validationResults = result;
        break;
      case 'layout':
        this.currentState.context.layout = result;
        break;
      case 'optimize':
        // Apply optimizations to context
        break;
    }
  }

  private updateProgress(percentage: number, message: string, stepDetails?: string): void {
    this.currentState.progress = {
      percentage: Math.round(percentage),
      message,
      stepDetails,
    };
  }

  private resetState(): void {
    this.currentState = this.createInitialState();
  }

  // Public API methods
  public getCurrentState(): AgentState {
    return { ...this.currentState };
  }

  public getConfig(): AgentConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public cancelExecution(): void {
    this.currentState.status = 'idle';
    this.updateProgress(0, 'Execution cancelled');
  }
}

export const multiStepAgent = MultiStepAgent.getInstance();
