"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Sparkles, Trash2, TrendingUp, Package, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const SUGGESTION_CATEGORIES = [
  {
    icon: TrendingUp,
    label: "Revenue",
    questions: ["Total revenue this month?", "Revenue by last 7 days?", "Average order value?"],
  },
  {
    icon: Package,
    label: "Products",
    questions: ["Best selling products?", "Low stock alerts?", "Products on sale?"],
  },
  {
    icon: Users,
    label: "Customers",
    questions: ["Top 5 customers?", "New customers this month?", "Most loyal customers?"],
  },
  {
    icon: MapPin,
    label: "Location",
    questions: ["Orders by city?", "Which city orders most?", "Revenue by region?"],
  },
];

const AdminChatPage = () => {
  const router = useRouter();
  const { admin } = useAdminAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (admin === null) {
      router.push("/");
    }
  }, [admin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/admin/chat`,
        { message: messageText },
        { withCredentials: true }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#393E46] flex items-center justify-center">
            <Sparkles size={18} className="text-[#D6EED6]" />
          </div>
          <div>
            <h1 className="text-[#393E46] font-bold text-lg">Admin AI Assistant</h1>
            <p className="text-gray-400 text-xs">Ask anything about your store data</p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setMessages([])}
            className="text-gray-400 hover:text-red-400 hover:bg-red-50 gap-1.5 text-sm"
          >
            <Trash2 size={14} />
            Clear chat
          </Button>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6">

        {/* Empty state with suggestions */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#393E46] flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-[#D6EED6]" />
              </div>
              <h2 className="text-[#393E46] font-bold text-2xl mb-2">What can I help you with?</h2>
              <p className="text-gray-400 text-sm">Ask me about orders, products, customers, or revenue</p>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap justify-center">
              {SUGGESTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.label
                      ? "bg-[#393E46] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#393E46] hover:text-[#393E46]"
                  }`}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
              {(activeCategory
                ? SUGGESTION_CATEGORIES.find((c) => c.label === activeCategory)?.questions || []
                : SUGGESTION_CATEGORIES.flatMap((c) => c.questions.slice(0, 1))
              ).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 text-left hover:border-[#393E46] hover:text-[#393E46] hover:shadow-sm transition-all duration-200 font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {!isEmpty && (
          <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  msg.role === "assistant" ? "bg-[#393E46]" : "bg-[#D6EED6]"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot size={15} className="text-white" />
                    : <User size={15} className="text-[#393E46]" />
                  }
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#393E46] text-white rounded-br-sm"
                    : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-sm"
                }`}>
                  {msg.content}
                  <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-gray-400" : "text-gray-300"}`}>
                    {msg.timestamp.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#393E46] flex items-center justify-center">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className={`${isEmpty ? "mt-8" : ""}`}>
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-[#393E46] shadow-sm transition-colors duration-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about orders, products, revenue..."
              className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 bg-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-[#393E46] hover:bg-[#2a2f36] text-white rounded-xl px-4 h-9 text-sm font-medium disabled:opacity-40 gap-1.5"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </div>
          <p className="text-center text-gray-300 text-[10px] mt-2">AI can make mistakes. Always verify critical data.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;