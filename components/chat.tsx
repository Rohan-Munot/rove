"use client";

import { UIMessage } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat({
  id,
  initialMessages,
}: { id?: string | undefined; initialMessages?: UIMessage[] } = {}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage: UIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        parts: [{ type: "text", text: input }],
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, id }),
        });

        const data = await response.json();

        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="space-y-4 max-h-96 overflow-y-auto p-4 border rounded-lg bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border"
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {m.role === "user" ? "You" : "AI"}
              </div>
              <div className="text-sm">
                {m.parts
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("")}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white text-gray-800 border">
              <div className="text-sm">AI is typing...</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
