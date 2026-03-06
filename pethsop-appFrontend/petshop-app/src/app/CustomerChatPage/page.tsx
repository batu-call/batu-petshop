"use client";
import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_ACTIONS = [
  { emoji: "🔥", label: "Hot Deals", message: "What are the current hot deals?" },
  { emoji: "🐱", label: "Cat Products", message: "Show me cat products" },
  { emoji: "🐶", label: "Dog Products", message: "Show me dog products" },
  { emoji: "📦", label: "My Orders", message: "Show my recent orders" },
  { emoji: "⭐", label: "Best Rated", message: "What are the best rated products?" },
  { emoji: "💰", label: "On Sale", message: "What products are on sale?" },
];

const CustomerChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey there! 🐾 Welcome to our pet store assistant. I can help you find products, check deals, or track your orders. What are you looking for today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/customer/chat`,
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
          content: "Oops! Something went wrong. Please try again 🐾",
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-[#393E46] px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-300 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#D6EED6]/20 border border-[#D6EED6]/40 flex items-center justify-center">
          <Bot size={18} className="text-[#D6EED6]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Pet Store Assistant</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-gray-300 text-[10px]">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => sendMessage(action.message)}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#393E46] hover:text-white hover:border-[#393E46] transition-all duration-200 disabled:opacity-40"
          >
            <span>{action.emoji}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === "assistant" ? "bg-[#393E46]" : "bg-[#D6EED6]"
            }`}>
              {msg.role === "assistant"
                ? <Bot size={15} className="text-white" />
                : <User size={15} className="text-[#393E46]" />
              }
            </div>

            <div className="flex flex-col gap-1">
              <div className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#393E46] text-white rounded-br-sm"
                  : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
              <p className={`text-[10px] text-gray-300 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
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

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#393E46] transition-colors duration-200">
          <MessageCircle size={16} className="text-gray-300 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, deals, orders..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="w-8 h-8 bg-[#393E46] hover:bg-[#2a2f36] text-white rounded-xl flex-shrink-0 disabled:opacity-40"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerChatPage;