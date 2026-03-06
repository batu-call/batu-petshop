"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Sparkles, X, Send, Bot, User, Loader2, ChevronDown, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type ProductCard = {
  _id: string;
  product_name: string;
  price: number;
  salePrice?: number | null;
  image?: { url: string }[];
  slug?: string;
  category?: string;
  stock?: number;
  sold?: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
};

const QUICK_QUESTIONS = [
  "How many orders this month?",
  "Best selling products?",
  "Low stock products?",
  "Top customers?",
  "Orders by city?",
  "Cancelled orders today?",
];

// AI cevabından JSON ürünleri parse et
const parseMessage = (content: string): { text: string; products: ProductCard[] } => {
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      const products = Array.isArray(parsed) ? parsed : parsed.products || [];
      const text = content.replace(/```json[\s\S]*?```/, "").trim();
      return { text, products };
    }
  } catch {}
  return { text: content, products: [] };
};

// Markdown benzeri metni okunabilir hale getir
const renderText = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Başlık ##
    if (line.startsWith("## ")) {
      return <p key={i} className="font-bold text-[#393E46] text-sm mt-2 mb-1">{line.replace("## ", "")}</p>;
    }
    // Başlık #
    if (line.startsWith("# ")) {
      return <p key={i} className="font-bold text-[#393E46] text-base mt-2 mb-1">{line.replace("# ", "")}</p>;
    }
    // Bullet **bold**
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.replace(/^[-*] /, "");
      return (
        <div key={i} className="flex items-start gap-1.5 my-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#393E46]/40 mt-1.5 flex-shrink-0" />
          <span className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{
            __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        </div>
      );
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      const content = line.replace(/^\d+\. /, "");
      return (
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="w-5 h-5 rounded-full bg-[#393E46] text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{num}</span>
          <span className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{
            __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        </div>
      );
    }
    // Boş satır
    if (line.trim() === "") return <div key={i} className="h-1" />;
    // Normal satır
    return (
      <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{
        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      }} />
    );
  });
};

// Admin ürün kartı — slug ile detaya gider
const AdminProductCard = ({ product }: { product: ProductCard }) => {
  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const href = product.slug ? `/Products/${product.slug}` : `/AllProduct`;

  return (
    <Link href={href} target="_blank">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-[#393E46]/30 transition-all duration-200 hover:scale-[1.02] group flex flex-col">
        {/* Image */}
        <div className="relative w-full h-20 bg-gray-50 overflow-hidden">
          {product.image?.[0]?.url ? (
            <Image
              src={product.image[0].url}
              alt={product.product_name}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={20} className="text-gray-300" />
            </div>
          )}
          {discountPercent > 0 && (
            <span className="absolute top-1 left-0 bg-[#D6EED6] text-[#393E46] text-[8px] font-bold pl-1.5 pr-2 py-0.5 rounded-r-full">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2 flex flex-col gap-1 flex-1">
          <p className="text-[#393E46] text-[11px] font-semibold line-clamp-2 leading-tight">
            {product.product_name}
          </p>

          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex flex-col">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-gray-300 text-[9px] line-through">${product.price.toFixed(2)}</span>
                  <span className="text-[#393E46] text-xs font-bold">${product.salePrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-[#393E46] text-xs font-bold">
                  {product.price ? `$${product.price.toFixed(2)}` : "—"}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end gap-0.5">
              {product.stock !== undefined && (
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                  product.stock < 5 ? "bg-red-50 text-red-400" :
                  product.stock < 20 ? "bg-yellow-50 text-yellow-500" :
                  "bg-green-50 text-green-500"
                }`}>
                  Stock: {product.stock}
                </span>
              )}
              {product.sold !== undefined && (
                <span className="text-[9px] text-gray-400">Sold: {product.sold}</span>
              )}
            </div>
          </div>
        </div>

        {/* View link */}
        <div className="px-2 pb-2">
          <div className="flex items-center gap-1 text-[9px] text-gray-400 group-hover:text-[#393E46] transition-colors">
            <ExternalLink size={9} />
            <span>View product</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const AdminChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello Admin! 👋 Ask me anything about your store — orders, products, customers, revenue.",
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
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/admin/chat`,
        { message: messageText },
        { withCredentials: true }
      );

      const { text, products } = parseMessage(data.answer);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: text,
          products: products.length > 0 ? products : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
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

  const clearChat = () => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hello Admin! 👋 Ask me anything about your store.",
    }]);
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] sm:w-[420px] transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: "540px" }}>

          {/* Header */}
          <div className="bg-[#393E46] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D6EED6]/20 border border-[#D6EED6]/40 flex items-center justify-center">
                <Sparkles size={15} className="text-[#D6EED6]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Admin AI Assistant</p>
                <p className="text-gray-400 text-[10px]">Powered by Groq</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat}
                className="text-gray-400 hover:text-white text-[10px] px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
                Clear
              </button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full w-7 h-7">
                <ChevronDown size={14} />
              </Button>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} disabled={isLoading}
                className="flex-shrink-0 text-[10px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium hover:bg-[#393E46] hover:text-white hover:border-[#393E46] transition-all duration-200 disabled:opacity-40">
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-2">
                <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === "assistant" ? "bg-[#393E46]" : "bg-[#D6EED6]"
                  }`}>
                    {msg.role === "assistant"
                      ? <Bot size={12} className="text-white" />
                      : <User size={12} className="text-[#393E46]" />
                    }
                  </div>

                  {/* Bubble */}
                  {msg.content && (
                    <div className={`max-w-[82%] px-3 py-2.5 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-[#393E46] text-white rounded-br-sm text-sm leading-relaxed"
                        : "bg-gray-50 border border-gray-100 rounded-bl-sm"
                    }`}>
                      {msg.role === "user"
                        ? msg.content
                        : <div className="space-y-0.5">{renderText(msg.content)}</div>
                      }
                    </div>
                  )}
                </div>

                {/* Ürün Kartları */}
                {msg.products && msg.products.length > 0 && (
                  <div className="ml-8">
                    <p className="text-[10px] text-gray-400 mb-1.5 font-medium">
                      {msg.products.length} product{msg.products.length > 1 ? "s" : ""} found
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {msg.products.slice(0, 6).map((product) => (
                        <AdminProductCard key={product._id} product={product} />
                      ))}
                    </div>
                    {msg.products.length > 6 && (
                      <Link href="/AllProduct"
                        className="block text-center text-xs text-[#393E46] font-medium mt-2 hover:underline">
                        View all {msg.products.length} products →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#393E46] transition-colors duration-200">
              <input ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask about your store..." disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} size="icon"
                className="w-7 h-7 bg-[#393E46] hover:bg-[#2a2f36] text-white rounded-lg flex-shrink-0 disabled:opacity-40">
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#393E46] shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95">
        <div className={`transition-all duration-300 absolute ${isOpen ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}>
          <Sparkles size={22} className="text-[#D6EED6]" />
        </div>
        <div className={`transition-all duration-300 absolute ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
          <X size={22} className="text-white" />
        </div>
      </button>
    </>
  );
};

export default AdminChatWidget;