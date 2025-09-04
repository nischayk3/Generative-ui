import { componentRegistry } from '../components/ComponentRegistry';
import { layoutEngine } from '../layout/LayoutEngine';
import { allPatterns } from '../layout/patterns';

export interface PromptContext {
  userIntent: string;
  availableComponents: string[];
  layoutPatterns: string[];
  previousInteractions?: string[];
  userPreferences?: {
    theme?: 'light' | 'dark';
    density?: 'compact' | 'comfortable';
    accessibility?: boolean;
  };
}

export class AdvancedPrompts {
  private static instance: AdvancedPrompts;

  private constructor() {}

  public static getInstance(): AdvancedPrompts {
    if (!AdvancedPrompts.instance) {
      AdvancedPrompts.instance = new AdvancedPrompts();
    }
    return AdvancedPrompts.instance;
  }

  public generateSystemPrompt(context: PromptContext): string {
    const componentLibrary = this.generateComponentLibrary();
    const layoutPatterns = this.generateLayoutPatterns();
    const bestPractices = this.generateBestPractices();
    const examples = this.generateExamples(context);

    return `
# HyperGen UI Advanced System Prompt

You are an expert UI/UX developer and AI assistant for the HyperGen UI system. You generate professional, interactive web components using JSON specifications with intelligent layout reasoning and multi-step component generation.

## 🎯 CORE MISSION
Transform natural language requests into professional, interactive UI components with intelligent layouts, proper validation, and optimal user experience.

## 📦 COMPONENT LIBRARY

${componentLibrary}

## 🎨 LAYOUT PATTERNS

${layoutPatterns}

## ✨ BEST PRACTICES

${bestPractices}

## 💡 EXAMPLES

${examples}

## 🔧 RESPONSE GUIDELINES

### Multi-Step Generation Process:
1. **Analyze** user intent and identify required components
2. **Plan** layout and component relationships
3. **Generate** individual components with proper props
4. **Validate** component configurations
5. **Optimize** layout and user experience

### Component Structure:
- Always include "type" field for every component
- Use descriptive titles and descriptions
- Include proper validation for form fields
- Add realistic sample data for charts and tables
- Consider component relationships and data flow

### Layout Intelligence:
- Analyze component types to determine optimal arrangements
- Use appropriate layout patterns based on content type
- Ensure responsive design across all screen sizes
- Consider visual hierarchy and information architecture

### Response Format:
When generating components, respond ONLY with valid JSON wrapped in markdown code blocks:

\`\`\`json
{
  "type": "layout",
  "components": [
    {
      "type": "component_type",
      "title": "Component Title",
      "description": "Brief description",
      "properties": {}
    }
  ]
}
\`\`\`

## 🎯 SUCCESS CRITERIA

- Generate components that match user intent exactly
- Use appropriate component types for the use case
- Create professional layouts with proper spacing
- Include validation and error handling
- Ensure responsive design and accessibility
- Provide realistic and meaningful sample data
- Consider performance and user experience optimization

Remember: You are building professional-grade UIs that rival the quality of Thesys-level interfaces. Focus on intelligent component selection, proper layout patterns, and exceptional user experience.
`;
  }

  private generateComponentLibrary(): string {
    const categories = componentRegistry.getComponentsByCategory('layout').concat(
      componentRegistry.getComponentsByCategory('input'),
      componentRegistry.getComponentsByCategory('display'),
      componentRegistry.getComponentsByCategory('feedback'),
      componentRegistry.getComponentsByCategory('navigation'),
      componentRegistry.getComponentsByCategory('data')
    );

    let library = '';

    // Group by category
    const byCategory: Record<string, any[]> = {};
    categories.forEach(comp => {
      if (!byCategory[comp.metadata.category]) {
        byCategory[comp.metadata.category] = [];
      }
      byCategory[comp.metadata.category].push(comp);
    });

    for (const [category, components] of Object.entries(byCategory)) {
      library += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Components\n`;
      components.forEach(comp => {
        library += `- **${comp.metadata.name}** (${comp.metadata.type}): ${comp.metadata.description}\n`;
        if (comp.examples && comp.examples.length > 0) {
          library += `  - Examples: ${comp.examples.join(', ')}\n`;
        }
      });
      library += '\n';
    }

    return library;
  }

  private generateLayoutPatterns(): string {
    let patterns = '';

    for (const [key, pattern] of Object.entries(allPatterns)) {
      patterns += `### ${pattern.name}\n`;
      patterns += `- **Description**: ${pattern.description}\n`;
      patterns += `- **Use Case**: ${this.getPatternUseCase(key)}\n`;
      patterns += `- **Components**: ${Object.keys(pattern.componentMapping).join(', ')}\n\n`;
    }

    return patterns;
  }

  private getPatternUseCase(patternKey: string): string {
    const useCases: Record<string, string> = {
      executive: 'High-level business dashboards with KPIs and metrics',
      analytics: 'Data analysis interfaces with multiple visualizations',
      operational: 'Real-time monitoring and operational dashboards',
      wizard: 'Multi-step processes with progress tracking',
      registration: 'User onboarding and account creation flows',
      dataExplorer: 'Advanced data filtering and exploration',
      reportBuilder: 'Interactive report generation and customization',
      userProfile: 'Personal information and settings management',
      applicationSettings: 'Complex configuration and preference management',
      masonry: 'Content-rich interfaces with varied content sizes',
      magazine: 'Content-focused layouts with hero sections',
    };

    return useCases[patternKey] || 'General purpose layout';
  }

  private generateBestPractices(): string {
    return `
### Component Selection
- Choose components based on user intent and data type
- Prefer specific components over generic ones when possible
- Consider the relationship between components and data flow
- Use appropriate input types for better user experience

### Layout Design
- Analyze content type to determine optimal layout pattern
- Ensure proper visual hierarchy with spacing and typography
- Consider responsive behavior across different screen sizes
- Use grid systems for organized, professional appearance

### Data & Content
- Provide realistic sample data that matches the context
- Include appropriate validation for form inputs
- Consider data relationships and dependencies
- Use meaningful labels and descriptions

### User Experience
- Ensure accessibility with proper ARIA labels and keyboard navigation
- Provide clear feedback for user interactions
- Consider loading states and error handling
- Optimize for performance with lazy loading when appropriate

### Responsive Design
- Design mobile-first with progressive enhancement
- Use appropriate breakpoints for different screen sizes
- Ensure touch-friendly interactions on mobile devices
- Test layouts across various device types

### Validation & Error Handling
- Include client-side validation for form inputs
- Provide clear error messages and recovery suggestions
- Handle edge cases and unexpected user input
- Implement proper fallback states for errors
`;
  }

  private generateExamples(context: PromptContext): string {
    const examples = [
      {
        request: 'Create a sales dashboard',
        response: {
          type: 'layout',
          pattern: 'analytics',
          components: [
            {
              type: 'card',
              title: 'Sales Metrics',
              description: 'Key performance indicators',
              variant: 'elevated',
            },
            {
              type: 'chart',
              title: 'Monthly Sales',
              description: 'Sales trend over time',
              chartType: 'line',
              data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Sales',
                  data: [12000, 19000, 15000, 25000, 22000, 30000],
                  backgroundColor: '#4CAF50',
                }],
              },
            },
            {
              type: 'table',
              title: 'Top Products',
              description: 'Best performing products',
              columns: [
                { header: 'Product', field: 'product' },
                { header: 'Sales', field: 'sales' },
                { header: 'Growth', field: 'growth' },
              ],
              rows: [
                { product: 'Product A', sales: 15000, growth: '12%' },
                { product: 'Product B', sales: 12000, growth: '8%' },
              ],
            },
          ],
        },
      },
      {
        request: 'Build a contact form',
        response: {
          type: 'layout',
          pattern: 'registration',
          components: [
            {
              type: 'form',
              title: 'Contact Us',
              description: 'Get in touch with our team',
              fields: [
                {
                  name: 'name',
                  label: 'Full Name',
                  type: 'text',
                  required: true,
                  placeholder: 'Enter your full name',
                },
                {
                  name: 'email',
                  label: 'Email Address',
                  type: 'email',
                  required: true,
                  placeholder: 'your.email@example.com',
                },
                {
                  name: 'message',
                  label: 'Message',
                  type: 'textarea',
                  required: true,
                  placeholder: 'Tell us how we can help...',
                },
              ],
              submitText: 'Send Message',
            },
          ],
        },
      },
      {
        request: 'Create a user profile page',
        response: {
          type: 'layout',
          pattern: 'userProfile',
          components: [
            {
              type: 'avatar',
              name: 'John Doe',
              description: 'Software Developer',
              size: 'large',
              src: 'https://example.com/avatar.jpg',
            },
            {
              type: 'card',
              title: 'Personal Information',
              description: 'User details and contact information',
              components: [
                {
                  type: 'text',
                  content: 'Email: john.doe@example.com',
                },
                {
                  type: 'text',
                  content: 'Location: San Francisco, CA',
                },
                {
                  type: 'text',
                  content: 'Joined: January 2024',
                },
              ],
            },
            {
              type: 'tabs',
              tabs: [
                {
                  title: 'Posts',
                  content: [
                    {
                      type: 'card',
                      title: 'Recent Activity',
                      description: 'Latest posts and updates',
                    },
                  ],
                },
                {
                  title: 'Settings',
                  content: [
                    {
                      type: 'form',
                      title: 'Account Settings',
                      fields: [
                        {
                          name: 'notifications',
                          label: 'Email Notifications',
                          type: 'switch',
                        },
                        {
                          name: 'theme',
                          label: 'Theme Preference',
                          type: 'select',
                          options: ['Light', 'Dark', 'Auto'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        request: 'Generate a two-column contact form',
        response: {
          type: 'form',
          title: 'Contact Information',
          description: 'Please fill out your details',
          layout: 'grid',
          fields: [
            {"name": "firstName", "label": "First Name", "type": "text", "required": true, "placeholder": "Enter your first name"},
            {"name": "lastName", "label": "Last Name", "type": "text", "required": true, "placeholder": "Enter your last name"},
            {"name": "email", "label": "Email Address", "type": "email", "required": true, "placeholder": "your.email@example.com"},
            {"name": "phone", "label": "Phone Number", "type": "tel", "required": false, "placeholder": "Enter your phone number"},
            {"name": "message", "label": "Message", "type": "textarea', "required": true, "placeholder": "Your message..."},
            {"name": "subscribe", "label": "Subscribe to newsletter", "type": "checkbox", "required": false}
          ],
          submitText: 'Send Message'
        }
      },
    ];

    let examplesText = '';
    examples.forEach((example, index) => {
      examplesText += `### Example ${index + 1}: ${example.request}\n`;
      examplesText += '```json\n' + JSON.stringify(example.response, null, 2) + '\n```\n\n';
    });

    return examplesText;
  }

  public generateContextAwarePrompt(context: PromptContext): string {
    const basePrompt = this.generateSystemPrompt(context);

    // Add context-specific instructions
    let contextInstructions = '';

    if (context.userPreferences) {
      contextInstructions += '\n## 🎨 USER PREFERENCES\n';
      if (context.userPreferences.theme) {
        contextInstructions += `- Theme: ${context.userPreferences.theme}\n`;
      }
      if (context.userPreferences.density) {
        contextInstructions += `- Density: ${context.userPreferences.density}\n`;
      }
      if (context.userPreferences.accessibility) {
        contextInstructions += `- Accessibility: Enabled (include ARIA labels, keyboard navigation)\n`;
      }
    }

    if (context.previousInteractions && context.previousInteractions.length > 0) {
      contextInstructions += '\n## 📝 CONVERSATION HISTORY\n';
      context.previousInteractions.forEach((interaction, index) => {
        contextInstructions += `${index + 1}. ${interaction}\n`;
      });
    }

    return basePrompt + contextInstructions;
  }

  public generateComponentSpecificPrompt(componentType: string): string {
    const component = componentRegistry.getComponent(componentType);
    if (!component) {
      return `Generate a ${componentType} component with appropriate props and configuration.`;
    }

    const examples = componentRegistry.getComponentExamples(componentType);

    let prompt = `Generate a ${component.metadata.name} component with the following specifications:

## Component Details
- **Type**: ${component.metadata.type}
- **Category**: ${component.metadata.category}
- **Description**: ${component.metadata.description}

## Required Props
${this.generateSchemaDescription(component.schema)}

## Usage Examples
${examples.map(example => `- ${example}`).join('\n')}

## Guidelines
- Include all required props
- Add realistic sample data
- Ensure proper validation
- Consider responsive design
- Follow accessibility best practices

Generate the component JSON configuration:`;

    return prompt;
  }

  private generateSchemaDescription(schema: any): string {
    if (!schema) return 'Standard component props (title, description, etc.)';

    // This would generate a description of the schema requirements
    // For now, return a generic description
    return `- Include appropriate props based on component type
- Add validation where necessary
- Provide meaningful default values
- Consider component-specific requirements`;
  }
}

export const advancedPrompts = AdvancedPrompts.getInstance();
