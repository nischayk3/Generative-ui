"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  isLoading?: boolean;
  isRendered?: boolean;
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
  onRenderComponent
}: {
  message: Message;
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
                  const isLoading = toolCall.isLoading;
                  const isRendered = toolCall.isRendered;
                  const key = `${message.id}-${toolCall.type}-${index}`;

                  return (
                    <div key={key} className="w-full">
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

const detailedDashboardPrompt = `Generate a comprehensive portfolio analytics dashboard.

At the top, create a section with the title "Portfolio Analytics Dashboard" and a description "Overview of performance, allocation, and risk metrics. A concise view of your portfolio KPIs, recent performance, allocation breakdowns, and actionable insights."

Below this, create four distinct summary cards arranged in a grid:
1.  **Card 1 (Total Value):** Display "$128.4k" as the main value and "Total Value" as the label. Include a small line chart sparkline showing a positive trend. Add a document icon.
2.  **Card 2 (YTD Return):** Display "+11.2%" as the main value and "YTD Return" as the label. Include a small area chart sparkline showing an upward trend. Add a chart icon.
3.  **Card 3 (Sharpe Ratio):** Display "0.92" as the main value and "Sharpe Ratio" as the label. Include a small bar chart sparkline. Add a refresh icon.
4.  **Card 4 (Holdings):** Display "12" as the main value and "Holdings" as the label. Include a small bar chart sparkline. Add a grid icon.

Below the summary cards, create a large line chart titled "Equity Curve" showing "Last 12 months" performance. The chart should display "Portfolio Value" over months (Jan-Jun).

To the right of the main chart, create a summary section with the title "Summary Key highlights". Inside this section, list the following key highlights as bullet points:
- Outperformed benchmark by 2.3% YTD
- Risk-adjusted returns improving for 3 months
- Cash buffer at 6% for flexibility

Below the bullet points in the summary section, add two buttons: "Rebalance" and "Add Funds".

Ensure the dashboard uses a dark theme and leverages shadcn/ui components for a professional and modern look.`;

const ChatInterfaceInner = React.memo(() => {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  

  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);


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

    // Check for trigger phrase and expand prompt
    if (userMessage.content.toLowerCase().includes("generate a professional dashboard")) {
      userMessage.content = detailedDashboardPrompt;
    }

    setInput("");

    setMessages(prevMessages => [...prevMessages, userMessage]);

    setIsLoading(true);
    setProgress(10);
    setCurrentStatus("Analyzing your request...");
    
    const assistantMessageId = (Date.now() + 1).toString();
    let assistantMessageContent = "";
    const detectedToolCalls: ToolCall[] = [];

    // Add initial assistant message with placeholder tool call to show shimmer immediately
    setMessages(prevMessages => [...prevMessages, {
      id: assistantMessageId,
      role: "assistant" as const,
      content: "",
      toolCalls: [{
        type: "chart", // Placeholder type, will be updated with actual type
        data: { type: "chart" } as ComponentType,
        isLoading: true, // Mark as loading
        isRendered: false,
      }]
    }]);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messagesRef.current, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkCount++;
        const chunk = new TextDecoder().decode(value);
        assistantMessageContent += chunk;

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

        try {
          const supportedTypes = ["form", "chart", "table", "card", "avatar"];
          const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
          const codeBlockMatches = assistantMessageContent.match(codeBlockRegex);

          if (codeBlockMatches) {
            for (const match of codeBlockMatches) {
              try {
                const jsonContent = match.replace(/```(?:json)?\s*/, '').replace(/\s*```/, '');
                const potentialToolCall = JSON.parse(jsonContent);

                if (potentialToolCall.type && supportedTypes.includes(potentialToolCall.type)) {
                  const newToolCall: ToolCall = {
                    type: potentialToolCall.type,
                    data: potentialToolCall,
                    isLoading: false, // No longer loading
                    isRendered: true, // Now rendered
                  };

                  const isDuplicate = detectedToolCalls.some(tc =>
                    tc.type === newToolCall.type &&
                    JSON.stringify(tc.data) === JSON.stringify(newToolCall.data)
                  );

                  if (!isDuplicate) {
                    detectedToolCalls.push(newToolCall);
                    
                    setMessages(prevMessages => prevMessages.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, toolCalls: [...detectedToolCalls] }
                        : msg
                    ));
                    
                    break; // Keep break for now to avoid multiple setMessages calls per stream
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

      setMessages(prevMessages => prevMessages.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: assistantMessageContent.trim() }
          : msg
      ));

      setProgress(100);
      setCurrentStatus("Component ready!");
      setShowSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStatus("");
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: "Sorry, I encountered an error. Please try again.", 
              toolCalls: msg.toolCalls?.map(tc => ({ ...tc, isLoading: false })) || [] // Stop loading on error
            }
          : msg
      ));
      setProgress(0);
      setCurrentStatus("");
      setIsLoading(false);
    }
  }, [input, isLoading]);

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
    onRenderComponent: renderToolComponent
  }), [renderToolComponent]);

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
