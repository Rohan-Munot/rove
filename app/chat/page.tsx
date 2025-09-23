"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, CheckCircle, Loader2, Send, User, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage as Message } from "../api/stream/route"; // Renamed to avoid conflict

// Define the structure of a tool part for clarity
type ToolPart = Extract<Message["parts"][number], { type: `tool-${string}` }>;

const Page = () => {
  const [input, setInput] = useState("");
  const { error, stop, status, messages, sendMessage } = useChat<Message>({
    transport: new DefaultChatTransport({
      api: "/api/stream",
    }),
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Find the last assistant message to extract tool statuses
  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop();
  const toolParts =
    lastAssistantMessage?.parts.filter((part): part is ToolPart =>
      part.type.startsWith("tool-")
    ) ?? [];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {status === "streaming" && <TypingIndicator />}
        </div>

        {/* Fixed Input Form at the bottom */}
        <div className="bg-white border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input });
              setInput("");
            }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            {error && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {error.message}
              </div>
            )}
            <Input
              type="text"
              placeholder="Plan a 5-day trip to Tokyo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-base text-black"
              disabled={status !== "ready"}
            />
            {status === "streaming" ? (
              <Button onClick={stop} variant="destructive">
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={status !== "ready" || !input}>
                <Send className="w-5 h-5" />
              </Button>
            )}
          </form>
        </div>
      </main>

      {/* Tool Status Side Panel */}
      <aside className="w-96 border-l bg-white p-6 hidden lg:block overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Assistant Status
          </h2>
        </div>
        <div className="space-y-4">
          {toolParts.length > 0 ? (
            toolParts.map((part, index) => (
              <ToolStatus key={index} part={part} />
            ))
          ) : (
            <div className="text-center text-gray-500 pt-8">
              <p>No active tasks.</p>
              <p className="text-sm">Tools will appear here when used.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

// ## Sub-component for rendering a single chat message
const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-4 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-2xl p-3 rounded-lg ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.parts.map((part, index) => {
          // Only render text and final tool outputs in the main chat
          switch (part.type) {
            case "text":
              return (
                <div key={index} className="whitespace-pre-wrap">
                  {part.text}
                </div>
              );
            case "tool-get_location_info":
            case "tool-search_activities":
            case "tool-get_cost_estimation":
            case "tool-search_transportation":
            case "tool-search_restaurants":
            case "tool-search_accommodation":
              return part.state === "output-available" ? (
                <ToolOutput key={index} part={part} />
              ) : null; // Progress is shown in the side panel
            default:
              return null;
          }
        })}
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// ## Sub-component for rendering tool results in a chat message
const ToolOutput = ({
  part,
}: {
  part: ToolPart & { state: "output-available" };
}) => {
  const toolInfo = {
    "tool-get_location_info": {
      title: "🌐 Location Information",
      color: "blue",
    },
    "tool-search_activities": {
      title: "🎯 Activity Suggestions",
      color: "purple",
    },
    "tool-get_cost_estimation": {
      title: "💰 Cost Estimation",
      color: "orange",
    },
    "tool-search_transportation": {
      title: "✈️ Transportation Options",
      color: "indigo",
    },
    "tool-search_restaurants": {
      title: "🍽️ Restaurant Suggestions",
      color: "pink",
    },
    "tool-search_accommodation": {
      title: "🏨 Accommodation Options",
      color: "teal",
    },
  };

  const { title } = toolInfo[part.type];

  return (
    <div className="bg-white/80 border rounded-lg p-3 mt-2 text-black">
      <div className={`font-semibold text-sm text-gray-700 mb-2`}>{title}</div>
      <ul className="space-y-2">
        {part.output.results.map((result: any, idx: number) => (
          <li key={idx}>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 hover:underline break-words text-sm`}
            >
              {result.title}
            </a>
            {result.content && (
              <p className="text-xs text-gray-600 mt-1">{result.content}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ## Sub-component for the side panel, showing tool progress
const ToolStatus = ({ part }: { part: ToolPart }) => {
  const toolLabels: Record<string, string> = {
    "tool-get_location_info": "Getting Location Info",
    "tool-search_activities": "Searching Activities",
    "tool-get_cost_estimation": "Estimating Costs",
    "tool-search_transportation": "Finding Transportation",
    "tool-search_restaurants": "Finding Restaurants",
    "tool-search_accommodation": "Searching Accommodation",
  };

  const label = toolLabels[part.type] || "Processing tool...";

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      {part.state === "input-streaming" || part.state === "input-available" ? (
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-500" />
      )}
      <span className="text-gray-700 text-sm font-medium">{label}</span>
    </div>
  );
};

// ## Sub-component for the typing indicator
const TypingIndicator = () => (
  <div className="flex items-start gap-4">
    <Avatar className="w-8 h-8 border">
      <AvatarFallback>
        <Bot size={18} />
      </AvatarFallback>
    </Avatar>
    <div className="max-w-2xl p-3 rounded-lg bg-gray-100 text-gray-800">
      <div className="flex items-center justify-center gap-1.5">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  </div>
);

export default Page;
