"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartTool } from "./tools/ChartTool";
import { TableTool } from "./tools/TableTool";
import { FormTool } from "./tools/FormTool";
import { CardTool } from "./tools/CardTool";

interface ToolCall {
  type: "form" | "chart" | "table" | "card";
  data: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

export function ChatInterface() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
      const assistantMessageId = (Date.now() + 1).toString();
      const detectedToolCalls: ToolCall[] = [];

      // Add initial assistant message
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        toolCalls: []
      }]);

      // Stream the response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;

        // Update the assistant message
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: assistantMessage }
            : msg
        ));

        // Check for tool calls in the response
        try {
          // Look for JSON-like structures that might be tool calls
          // The AI often returns JSON wrapped in markdown code blocks
          
          // First, try to extract JSON from markdown code blocks
          const codeBlockMatches = assistantMessage.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/g);
          if (codeBlockMatches) {
            for (const match of codeBlockMatches) {
              try {
                // Extract the JSON content from the code block
                const jsonContent = match.replace(/```(?:json)?\s*/, '').replace(/\s*```/, '');
                const potentialToolCall = JSON.parse(jsonContent);
                if (potentialToolCall.type && ["form", "chart", "table", "card"].includes(potentialToolCall.type)) {
                  console.log("Detected tool call (code block):", potentialToolCall);
                  const toolCall: ToolCall = {
                    type: potentialToolCall.type,
                    data: potentialToolCall
                  };
                  
                  // Check if we already have this tool call
                  if (!detectedToolCalls.some(tc => tc.type === toolCall.type && JSON.stringify(tc.data) === JSON.stringify(toolCall.data))) {
                    detectedToolCalls.push(toolCall);
                    
                    // Update the message with the new tool calls
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, toolCalls: [...detectedToolCalls] }
                        : msg
                    ));
                  }
                  break; // Found a valid tool call, stop searching
                }
              } catch (e) {
                // Not valid JSON, continue searching
                continue;
              }
            }
          } else {
            // If no code blocks found, try to parse the entire message as JSON
            try {
              const potentialToolCall = JSON.parse(assistantMessage);
              if (potentialToolCall.type && ["form", "chart", "table", "card"].includes(potentialToolCall.type)) {
                console.log("Detected tool call (full message):", potentialToolCall);
                const toolCall: ToolCall = {
                  type: potentialToolCall.type,
                  data: potentialToolCall
                };
                
                if (!detectedToolCalls.some(tc => tc.type === toolCall.type && JSON.stringify(tc.data) === JSON.stringify(toolCall.data))) {
                  detectedToolCalls.push(toolCall);
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, toolCalls: [...detectedToolCalls] }
                      : msg
                  ));
                }
              }
            } catch (e) {
              // Full message is not JSON, look for JSON patterns within text
              // Simple regex to find JSON objects (fallback)
              const jsonMatches = assistantMessage.match(/\{[^{}]*"type"[^{}]*\}/g);
              if (jsonMatches) {
                for (const match of jsonMatches) {
                  try {
                    const potentialToolCall = JSON.parse(match);
                    if (potentialToolCall.type && ["form", "chart", "table", "card"].includes(potentialToolCall.type)) {
                      console.log("Detected tool call (pattern match):", potentialToolCall);
                      const toolCall: ToolCall = {
                        type: potentialToolCall.type,
                        data: potentialToolCall
                      };
                      
                      if (!detectedToolCalls.some(tc => tc.type === toolCall.type && JSON.stringify(tc.data) === JSON.stringify(toolCall.data))) {
                        detectedToolCalls.push(toolCall);
                        
                        setMessages(prev => prev.map(msg => 
                          msg.id === assistantMessageId 
                            ? { ...msg, toolCalls: [...detectedToolCalls] }
                            : msg
                        ));
                      }
                      break;
                    }
                  } catch (e) {
                    // Continue searching
                    continue;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Error parsing tool calls:", e);
        }
      }

      reader.releaseLock();
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        toolCalls: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolComponent = (toolCall: ToolCall) => {
    switch (toolCall.type) {
      case "chart":
        const chartProps = toolCall.data;
        return <ChartTool {...chartProps} />;
      
      case "table":
        const tableProps = toolCall.data;
        return <TableTool {...tableProps} />;
      
      case "form":
        const formProps = toolCall.data;
        return <FormTool {...formProps} />;
      
      case "card":
        const cardProps = toolCall.data;
        return <CardTool {...cardProps} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto bg-white">
      <header className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-black">HyperGen UI</h1>
        <p className="text-gray-600 text-sm mt-1">
          Generate interactive components with natural language
        </p>
      </header>
      
      <div className="flex-1 flex flex-col">
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
                      ? message.content.replace(/```json[\s\S]*?```/g, '').replace(/\{[\s\S]*?"type"[\s\S]*?\}/g, '').trim() || "I've generated the component for you!"
                      : message.content
                    }
                  </div>
                  
                  {/* Render components inline with AI response - FULL WIDTH */}
                  {message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-4 space-y-4 w-full">
                      {message.toolCalls.map((toolCall, index) => (
                        <div key={index} className="w-full">
                          {renderToolComponent(toolCall)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>AI is thinking...</span>
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
