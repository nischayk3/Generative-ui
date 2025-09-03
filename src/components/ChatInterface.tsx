"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { DynamicRenderer } from "@/src/lib/components/DynamicRenderer";
import { LayoutRenderer } from "@/src/lib/layout/LayoutRenderer";
import { componentRegistry } from "@/src/lib/components/ComponentRegistry";

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

  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [renderedComponents, setRenderedComponents] = useState<Set<string>>(new Set());





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
  }, []);

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

        </div>


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
