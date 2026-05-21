"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { trackBehavior } from "@/lib/tracking/behavior";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chatLogId?: string;
  rating?: number;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("kds_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("kds_session_id", sessionId);
  }
  return sessionId;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleRating = async (messageId: string, chatLogId: string, rating: number) => {
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m))
      );
      await fetch("/api/chat/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatLogId, rating }),
      });
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Track AI_CHAT event
    trackBehavior("AI_CHAT", { question: currentInput });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          sessionId: getSessionId(),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
        chatLogId: data.chatLogId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[350px] shadow-2xl flex flex-col h-[500px] border-primary/20 animate-in slide-in-from-bottom-5">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-md font-semibold">
                  KDS Assistant
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Luôn sẵn sàng hỗ trợ bạn
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-muted/10">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                <p>Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?</p>
              </div>
            )}
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-background border shadow-sm rounded-tl-sm"
                    }`}>
                    {message.content}
                  </div>
                  {message.role === "assistant" && message.chatLogId && !message.rating && (
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-muted-foreground">Đánh giá câu trả lời:</span>
                      <button onClick={() => handleRating(message.id, message.chatLogId!, 5)} className="text-xs hover:scale-125 transition-transform" title="Tốt">👍</button>
                      <button onClick={() => handleRating(message.id, message.chatLogId!, 1)} className="text-xs hover:scale-125 transition-transform" title="Kém">👎</button>
                    </div>
                  )}
                  {message.role === "assistant" && message.rating && (
                    <div className="flex items-center mt-1 px-1">
                      <span className="text-[10px] text-muted-foreground">Đã đánh giá: {message.rating === 5 ? '👍' : '👎'}</span>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-background border shadow-sm rounded-tl-sm flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-200" />
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-3 border-t bg-background">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center gap-2 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Nhắn tin cho KDS..."
                className="pr-10 rounded-full bg-muted/50 focus-visible:ring-primary/30"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input?.trim()}
                className="absolute right-1 rounded-full w-8 h-8 hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-primary group">
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
      )}
    </div>
  );
}
