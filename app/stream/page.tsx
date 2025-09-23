"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompletion } from "@ai-sdk/react";
const Page = () => {
  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    complete,
    completion,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: "/api/stream",
  });
  return (
    <div className="flex h-screen flex-col items-center justify-end">
      {/* Dispaly for stream */}
      {error && (
        <div className="whitespace-pre-wrap text-red-500">{error.message}</div>
      )}
      {completion && (
        <div className="whitespace-pre-wrap max-w-3xl mx-auto p-4 mb-10">
          {completion}
        </div>
      )}
      {isLoading && !completion && (
        <div className="whitespace-pre-wrap">Loading...</div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setInput("");
          handleSubmit();
        }}
      >
        <div className="flex items-center gap-2 p-3">
          <Input
            type="text"
            placeholder="Enter your prompt"
            value={input}
            onChange={handleInputChange}
          />
          {isLoading ? (
            <Button onClick={stop}>Stop</Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Page;
