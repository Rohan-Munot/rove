"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();

  if (!session) {
    return (
      <Button onClick={() => signIn.social({ provider: "google" })}>
        Login
      </Button>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((message) => (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role === "user" ? "User: " : "AI: "}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
              }
            })}
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage({ text: input });
            setInput("");
          }}
        >
          <input
            className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </form>
      </div>
      <Button onClick={() => signOut()}>Logout</Button>
    </>
  );
}
