"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import { ChartTool } from "./tools/ChartTool";
import { TableTool } from "./tools/TableTool";
import { FormTool } from "./tools/FormTool";
import { CardTool } from "./tools/CardTool";
import { isComponentSupported, getComponentByType, getAvailableComponents } from "@/src/lib/componentRegistry";
import { ErrorBoundary } from "./ErrorBoundary";
import { SkeletonLoader } from "./SkeletonLoader";

interface ToolCall {
  type: "form" | "chart" | "table" | "card" | "avatar";
  data: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

function ChatInterfaceInner() {
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

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // No artificial delay - components render immediately when ready

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setProgress(10);
    setCurrentStatus("Analyzing your request...");
    // Clear previous rendered components for new request
    setRenderedComponents(new Set());
    
    // Create assistant message ID early so it's accessible in catch block
    const assistantMessageId = (Date.now() + 1).toString();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
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
        role: "assistant",
        content: "",
        toolCalls: [{
          type: "chart", // Placeholder type, will be updated with actual type
          data: {}
        }]
      }]);
      
      // Show shimmer immediately
      setLoadingComponents(new Set([`${assistantMessageId}-chart`]));

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
                    setRenderedComponents(new Set([`${assistantMessageId}-${toolCall.type}`]));
                    break;
                  }
                }
              } catch (e) {
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
  };

  const renderToolComponent = (toolCall: ToolCall, messageId?: string) => {
    // Validate component type using registry
    if (!isComponentSupported(toolCall.type)) {
      const componentInfo = getComponentByType(toolCall.type);
      const supportedTypes = ['chart', 'table', 'form', 'card', 'avatar'];

      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
          <div className="flex items-center">
            <div className="text-yellow-600 text-lg mr-2">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800">Component Not Available</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {componentInfo
                  ? `The "${componentInfo.name}" component is not yet implemented.`
                  : `"${toolCall.type}" is not a recognized component type.`
                }
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Currently supported: {supportedTypes.join(', ')}
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (toolCall.type) {
      case "chart":
        return <ChartTool {...toolCall.data} />;
      case "table":
        return <TableTool {...toolCall.data} />;
      case "form":
        return <FormTool {...toolCall.data} />;
      case "card":
        return <CardTool {...toolCall.data} />;
      case "avatar":
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 my-4 max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                {toolCall.data.fallback || '👤'}
              </div>
              {toolCall.data.name && (
                <div>
                  <h4 className="font-semibold text-black">{toolCall.data.name}</h4>
                  {toolCall.data.description && (
                    <p className="text-sm text-gray-600">{toolCall.data.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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

        <Collapsible open={showHelp} onOpenChange={setShowHelp}>
          <CollapsibleContent className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Available Components</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getAvailableComponents().map((component) => (
                  <div key={component.type} className="bg-white rounded-md p-3 border">
                    <h4 className="font-medium text-sm text-gray-900">{component.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{component.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {component.category}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-700 mt-3">
                💡 Try asking: "Create a chart/table/form/card for..." or "Generate a dashboard showing..."
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
            {messages.map((message) => (
              <div
                key={message.id}
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
                  {message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-4 space-y-4 w-full">
                      {message.toolCalls.map((toolCall, index) => {
                        const componentKey = `${message.id}-${toolCall.type}`;
                        const isLoading = loadingComponents.has(componentKey);
                        const isRendered = renderedComponents.has(componentKey);

                        return (
                          <div key={index} className="w-full">
                            {isLoading ? (
                              <SkeletonLoader type={toolCall.type} />
                            ) : isRendered ? (
                              renderToolComponent(toolCall, message.id)
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
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
          
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to create charts, tables, forms, or cards..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ChatInterface() {
  return (
    <ErrorBoundary>
      <ChatInterfaceInner />
    </ErrorBoundary>
  );
}
