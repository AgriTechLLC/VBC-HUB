"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, X, Send, Loader2 } from "lucide-react";

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answerRef = useRef<HTMLPreElement>(null);
  
  // Auto-scroll the answer container when content changes
  useEffect(() => {
    if (answerRef.current && answer) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);
  
  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setAnswer("");
    
    try {
      // Send the query to the API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      
      // Handle non-2xx responses
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get a response");
      }
      
      // Set up streaming response handler
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      
      // Process the streaming response
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        text += decoder.decode(value);
        setAnswer(text);
      }
      
      // Keep the query for context
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }
  
  // Render the collapsed button when closed
  if (!open) {
    return (
      <Button 
        className="fixed bottom-4 right-4 rounded-full p-3 h-12 w-12 flex items-center justify-center shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Bot className="h-5 w-5" />
      </Button>
    );
  }
  
  // Render the expanded chat widget when open
  return (
    <div className="fixed bottom-4 right-4 bg-background border shadow-xl rounded-lg w-80 sm:w-96 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <h3 className="font-medium">VBC-GPT</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Chat content */}
      <div className="flex-1 p-4 max-h-80 overflow-auto">
        {answer ? (
          <pre 
            ref={answerRef}
            className="whitespace-pre-wrap text-sm"
          >
            {answer}
          </pre>
        ) : error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Ask me about Virginia blockchain legislation...
          </p>
        )}
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex items-end gap-2">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a bill..."
          className="resize-none min-h-[60px]"
          disabled={loading}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!query.trim() || loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}