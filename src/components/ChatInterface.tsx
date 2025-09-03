"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import { componentRegistry } from "@/src/lib/components/ComponentRegistry";
import { DynamicRenderer } from "@/src/lib/components/DynamicRenderer";
import { LayoutRenderer } from "@/src/lib/layout/LayoutRenderer";
import { dashboardGenerator, GeneratedDashboard } from "@/src/lib/layout/DashboardGenerator";
import { ComponentWithType } from "@/src/lib/layout/LayoutEngine";
import { ComponentType } from "@/src/lib/components/schemas";
import { ErrorBoundary } from "./ErrorBoundary";
import { SkeletonLoader } from "./SkeletonLoader";

interface ToolCall {
  type: string;
  data: ComponentType;
}

// Separate input component to prevent chat re-renders on typing
const ChatInput = React.memo(({
  input,
  onInputChange,
  onSubmit,
  isLoading
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  }, [onInputChange]);

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-gray-200">
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me to create charts, tables, forms, or cards..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  dashboard?: GeneratedDashboard;
  layoutComponents?: ComponentWithType[];
}

// Separate component for rendering individual messages
const MessageItem = React.memo(({
  message,
  loadingComponents,
  renderedComponents,
  onRenderComponent
}: {
  message: Message;
  loadingComponents: Set<string>;
  renderedComponents: Set<string>;
  onRenderComponent: (toolCall: ToolCall) => React.ReactNode;
}) => {
  // Memoize expensive rendering functions to prevent child re-renders
  const renderDashboard = useCallback((dashboard: GeneratedDashboard) => {
    // Use adaptive grid classes instead of hardcoded styles
    const getAdaptiveGridClasses = (componentCount: number): string => {
      if (componentCount <= 1) return 'grid-cols-1';
      if (componentCount <= 3) return 'grid-cols-1 md:grid-cols-2';
      if (componentCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    return (
      <div className="mt-4 w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{dashboard.config.title}</h3>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-gray-600">
              Layout: {dashboard.config.layout}
            </span>
            <span className="text-sm text-gray-600">
              Components: {dashboard.metrics.totalComponents}
            </span>
            <span className="text-sm text-gray-600">
              Efficiency: {Math.round(dashboard.metrics.layoutEfficiency)}%
            </span>
          </div>
        </div>

        {/* Use CSS Grid classes instead of inline styles for better responsiveness */}
        <div className={`
          dashboard-container
          grid
          ${getAdaptiveGridClasses(dashboard.components.length)}
          gap-4 md:gap-6 lg:gap-8
          w-full
          min-h-screen
          p-4 md:p-6 lg:p-8
          auto-rows-fr
        `}>
          {dashboard.components.map((component, index) => {
            const componentStyles = JSON.parse(dashboard.styles.components);
            const componentClass = `${componentStyles[component.type] || 'p-4 bg-white rounded-lg shadow-sm border border-gray-200'} dashboard-component w-full h-full min-h-[200px] flex flex-col`;
            return (
              <div
                key={`${component.type}-${index}`}
                className={componentClass}
              >
                <DynamicRenderer
                  component={component as ComponentType}
                  onError={(error, componentType) => {
                    console.error(`Dashboard component error: ${componentType}`, error);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }, []);

  const renderLayoutComponents = useCallback((layoutComponents: ComponentWithType[]) => {
    return (
      <div className="mt-4 w-full">
        <LayoutRenderer
          components={layoutComponents as ComponentType[]}
          layoutType="auto"
          userPreferences={{
            theme: 'light',
            density: 'comfortable',
          }}
        />
      </div>
    );
  }, []);

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`${
          message.role === "user"
            ? "bg-blue-500 text-white max-w-xs"
            : "bg-gray-100 text-black w-full max-w-none"
        } rounded-lg p-3`}
      >
        <div className="whitespace-pre-wrap">
          {message.role === "assistant"
            ? (message.toolCalls && message.toolCalls.length > 0
                ? "Generating your component..."
                : "I've generated the component for you!")
            : message.content
          }
        </div>

        {/* Render components inline with AI response - FULL WIDTH */}
        {message.role === "assistant" && (
          <>
            {/* Render individual tool calls */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-4 space-y-4 w-full">
                {message.toolCalls.map((toolCall, index) => {
                  const componentKey = `${message.id}-${toolCall.type}-${index}`;
                  const isLoading = loadingComponents.has(componentKey);
                  const isRendered = renderedComponents.has(componentKey);

                  return (
                    <div key={componentKey} className="w-full">
                      {isLoading ? (
                        <SkeletonLoader type={toolCall.type} />
                      ) : isRendered ? (
                        onRenderComponent(toolCall)
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Render dashboard if available */}
            {message.dashboard && renderDashboard(message.dashboard)}

            {/* Render layout components if available */}
            {message.layoutComponents && message.layoutComponents.length > 0 &&
              renderLayoutComponents(message.layoutComponents)}
          </>
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const ChatInterfaceInner = React.memo(() => {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [renderedComponents, setRenderedComponents] = useState<Set<string>>(new Set());

  // Memoize available components to prevent unnecessary recalculations
  const availableComponents = useMemo(() => componentRegistry.getAllComponents(), []);

  // Demo function for portfolio analytics dashboard
  const generatePortfolioDemo = useCallback(() => {
    const demoDashboard = dashboardGenerator.generatePortfolioDashboard([]);
    
    const demoMessage: Message = {
      id: Date.now().toString(),
      role: "assistant" as const,
      content: "I've generated a professional portfolio analytics dashboard for you!",
      dashboard: demoDashboard,
    };

    setMessages(prev => [...prev, demoMessage]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define handleSubmit before any conditional returns to maintain hook order
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim()
    };

    // Clear input immediately
    setInput("");

    // Add user message and prepare messages for API
    const currentMessages = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    setProgress(10);
    setCurrentStatus("Analyzing your request...");
    // Don't clear previous rendered components - preserve them
    // setRenderedComponents(new Set());
    
    // Create assistant message ID early so it's accessible in catch block
    const assistantMessageId = (Date.now() + 1).toString();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentMessages
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let assistantMessage = "";
      const detectedToolCalls: ToolCall[] = [];

      // Add initial assistant message with placeholder tool call to show shimmer immediately
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        toolCalls: [{
          type: "chart", // Placeholder type, will be updated with actual type
          data: { type: "chart" } as ComponentType
        }]
      }]);
      
      // Show shimmer immediately
      setLoadingComponents(new Set([`${assistantMessageId}-chart-0`]));

      // Stream the response
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkCount++;
        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;

        // Update progress and status based on streaming
        if (chunkCount === 1) {
          setProgress(30);
          setCurrentStatus("Generating component structure...");
        } else if (chunkCount === 3) {
          setProgress(60);
          setCurrentStatus("Building interactive elements...");
        } else if (chunkCount > 5) {
          setProgress(80);
          setCurrentStatus("Finalizing your component...");
        }

        // Don't update message content with raw streaming JSON
        // We only need to parse it for tool calls, not display it

        // Check for tool calls in the response - simplified and robust
        try {
          const supportedTypes = ["form", "chart", "table", "card", "avatar"];

          // Look for JSON code blocks
          const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
          const codeBlockMatches = assistantMessage.match(codeBlockRegex);

          if (codeBlockMatches) {
            for (const match of codeBlockMatches) {
              try {
                const jsonContent = match.replace(/```(?:json)?\s*/, '').replace(/\s*```/, '');
                const potentialToolCall = JSON.parse(jsonContent);

                if (potentialToolCall.type && supportedTypes.includes(potentialToolCall.type)) {
                  const toolCall: ToolCall = {
                    type: potentialToolCall.type,
                    data: potentialToolCall
                  };

                  // Check for duplicates
                  const isDuplicate = detectedToolCalls.some(tc =>
                    tc.type === toolCall.type &&
                    JSON.stringify(tc.data) === JSON.stringify(toolCall.data)
                  );

                  if (!isDuplicate) {
                    detectedToolCalls.push(toolCall);
                    
                    // Update the message with actual tool calls
                    setMessages(prev => prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, toolCalls: [...detectedToolCalls] }
                        : msg
                    ));
                    
                    // Remove shimmer and render component immediately
                    setLoadingComponents(new Set());
                    setRenderedComponents(prev => new Set([...prev, `${assistantMessageId}-${toolCall.type}-0`]));
                    break;
                  }
                }
              } catch {
                continue;
              }
            }
          }
        } catch (e) {
          console.error("Error parsing tool calls:", e);
        }
      }

      reader.releaseLock();

      // Completion
      setProgress(100);
      setCurrentStatus("Component ready!");
      setShowSuccess(true);
      setIsLoading(false); // Ensure loading is set to false
      setTimeout(() => {
        setProgress(0);
        setCurrentStatus("");
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: "Sorry, I encountered an error. Please try again.", toolCalls: [] }
          : msg
      ));
      setProgress(0);
      setCurrentStatus("");
      setIsLoading(false);
      // Remove shimmer on error
      setLoadingComponents(new Set());
    }
  }, [input, isLoading, messages]);

  // Simplified input change handler
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);



  // Memoize help toggle
  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  const renderToolComponent = useCallback((toolCall: ToolCall) => {
    // Validate component type using new registry
    if (!componentRegistry.isComponentAvailable(toolCall.type)) {
      const componentInfo = componentRegistry.getComponent(toolCall.type);

      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
          <div className="flex items-center">
            <div className="text-yellow-600 text-lg mr-2">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800">Component Not Available</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {componentInfo
                  ? `The "${componentInfo.metadata.name}" component is not yet implemented.`
                  : `"${toolCall.type}" is not a recognized component type.`
                }
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Available components: {availableComponents.map(c => c.metadata.type).join(', ')}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Use dynamic renderer for all components
    return (
      <DynamicRenderer
        component={toolCall.data}
        onError={(error, componentType) => {
          console.error(`Error rendering ${componentType}:`, error);
        }}
        onRender={(componentType) => {
          console.log(`Successfully rendered ${componentType}`);
        }}
      />
    );
  }, [availableComponents]);

  // Memoize stable props to prevent MessageItem re-renders
  const stableMessageProps = useMemo(() => ({
    loadingComponents,
    renderedComponents,
    onRenderComponent: renderToolComponent
  }), [loadingComponents, renderedComponents, renderToolComponent]);

  // Memoize rendered messages to prevent unnecessary re-renders
  const renderedMessages = useMemo(() => {
    return messages.map((message) => (
      <MessageItem
        key={message.id}
        message={message}
        {...stableMessageProps}
      />
    ));
  }, [messages, stableMessageProps]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen flex flex-col max-w-6xl mx-auto bg-white">
        <header className="border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-black">HyperGen UI</h1>
          <p className="text-gray-600 text-sm mt-1">
            Generate interactive components with natural language
          </p>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto bg-white">
      <header className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">HyperGen UI</h1>
            <p className="text-gray-600 text-sm mt-1">
              Generate interactive components with natural language
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePortfolioDemo}
              className="flex items-center gap-2"
            >
              🚀 Portfolio Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2"
            >
              <InfoIcon className="h-4 w-4" />
              Components
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <Collapsible open={showHelp} onOpenChange={toggleHelp}>
          <CollapsibleContent className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Available Components</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableComponents.map((component) => (
                  <div key={component.metadata.type} className="bg-white rounded-md p-3 border">
                    <h4 className="font-medium text-sm text-gray-900">{component.metadata.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{component.metadata.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {component.metadata.category}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-700 mt-3">
                💡 Try asking: &ldquo;Create a chart/table/form/card for...&rdquo; or &ldquo;Generate a dashboard showing...&rdquo;
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </header>
      
      <div className="flex-1 flex flex-col">
        {/* Success Notification */}
        {showSuccess && (
          <div className="px-4 py-2">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✨ Component generated successfully! Check it out below.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderedMessages}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black rounded-lg p-4 max-w-xs w-full">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm font-medium">
                        {currentStatus || "AI is thinking..."}
                      </span>
                    </div>
                    {progress > 0 && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-600 text-center">
                          {progress}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <ChatInput
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
});

ChatInterfaceInner.displayName = 'ChatInterfaceInner';

export function ChatInterface() {
  return (
    <ErrorBoundary>
      <ChatInterfaceInner key="chat-interface-main" />
    </ErrorBoundary>
  );
}

// Add display name for debugging
ChatInterfaceInner.displayName = 'ChatInterfaceInner';
