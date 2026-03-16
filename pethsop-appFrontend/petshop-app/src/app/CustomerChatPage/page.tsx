"use client";
import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Send, Bot, Loader2, MessageCircle, ArrowLeft, ShoppingCart, Star, Tag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AuthContext } from "@/app/context/authContext";
import { useCart } from "@/app/context/cartContext";


type ProductCard = {
  _id: string;
  product_name: string;
  price: number;
  salePrice?: number | null;
  image: { url: string; publicId?: string }[];
  slug: string;
  category: string;
  stock: number;
};

type OrderItem = {
  product: { _id: string; product_name: string; image: { url: string }[]; slug: string };
  quantity: number;
  price: number;
  name?: string;
};

type OrderCard = {
  _id: string;
  status: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  tracking?: { trackingNumber?: string; cargoCompany?: string; trackingUrl?: string; estimatedDelivery?: string | null };
  createdAt: string;
  items: OrderItem[];
};

type ParsedContent = {
  text: string;
  products: ProductCard[];
  orders: OrderCard[];
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};


const QUICK_ACTIONS = [
  { emoji: "🔥", label: "Hot Deals",   message: "What are the current hot deals?" },
  { emoji: "🐱", label: "Cat",         message: "Show me cat products" },
  { emoji: "🐶", label: "Dog",         message: "Show me dog products" },
  { emoji: "📦", label: "My Orders",   message: "Show my recent orders" },
  { emoji: "⭐", label: "Best Rated",  message: "What are the best rated products?" },
  { emoji: "💰", label: "On Sale",     message: "What products are on sale?" },
];


const parseMessageContent = (content: string): ParsedContent => {
  const products: ProductCard[] = [];
  const orders: OrderCard[]     = [];
  let text = content;

  const jsonBlocks = [...content.matchAll(/```json\s*([\s\S]*?)```/g)];
  for (const block of jsonBlocks) {
    try {
      const parsed = JSON.parse(block[1].trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) { text = text.replace(block[0], "").trim(); continue; }
      if (arr[0]?.product_name !== undefined) products.push(...arr);
      else if (arr[0]?.status !== undefined)  orders.push(...arr);
      text = text.replace(block[0], "").trim();
    } catch { /* leave as-is */ }
  }

  return { text: text.trim(), products, orders };
};


const RichText = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        );

        // Bullet points
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#57B394] flex-shrink-0" />
              <span className="text-sm leading-relaxed text-gray-700">{parts}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = line.trim().match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#393E46]/10 text-[#393E46] text-[10px] font-bold flex items-center justify-center mt-0.5">{numMatch[1]}</span>
              <span className="text-sm leading-relaxed text-gray-700">{parts}</span>
            </div>
          );
        }

        // Tip line
        if (line.toLowerCase().startsWith("tip:") || line.includes("💡")) {
          return (
            <div key={i} className="flex gap-2 items-start bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-1">
              <span className="text-sm">💡</span>
              <span className="text-sm leading-relaxed text-amber-800">{line.replace(/^tip:/i, "").replace("💡", "").trim()}</span>
            </div>
          );
        }

        return <p key={i} className="text-sm leading-relaxed text-gray-700">{parts}</p>;
      })}
    </div>
  );
};


const ProductCardUI = ({ product, onAddToCart, addingId }: { product: ProductCard; onAddToCart: (id: string) => void; addingId: string | null }) => {
  const discount = product.salePrice && product.salePrice < product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link href={`/Products/${product.slug}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="relative w-full h-32 bg-gray-50 overflow-hidden">
          {product.image?.[0]?.url ? (
            <Image
              src={product.image[0].url}
              alt={product.product_name}
              fill
              sizes="200px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={28} className="text-gray-300" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock < 6 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              {product.stock} left
            </span>
          )}
        </div>

        <div className="p-2.5">
          <p className="text-xs font-semibold text-gray-800 truncate leading-tight mb-1">{product.product_name}</p>
          <div className="flex items-center justify-between gap-1">
            <div className="flex flex-col">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-[10px] line-through text-gray-400">${product.price.toFixed(2)}</span>
                  <span className="text-sm font-bold text-[#393E46]">${product.salePrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-[#393E46]">${product.price.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product._id); }}
              disabled={addingId === product._id}
              className="w-7 h-7 rounded-xl bg-[#D6EED6] hover:bg-[#393E46] text-[#393E46] hover:text-white flex items-center justify-center transition-all duration-200 disabled:opacity-50 flex-shrink-0"
            >
              {addingId === product._id
                ? <Loader2 size={12} className="animate-spin" />
                : <ShoppingCart size={12} />
              }
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};


const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const OrderCardUI = ({ order }: { order: OrderCard }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50 bg-gray-50/50">
      <span className="text-[10px] text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}>
        {order.status}
      </span>
    </div>
    <div className="p-3 space-y-2">
      <div className="flex gap-1.5">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
            {item.product?.image?.[0]?.url
              ? <Image src={item.product.image[0].url} alt={item.product.product_name} fill sizes="40px" className="object-cover" />
              : <Package size={14} className="m-auto text-gray-400" />
            }
            {item.quantity > 1 && (
              <span className="absolute bottom-0 right-0 bg-[#393E46] text-white text-[8px] font-bold px-1 rounded-tl-md">x{item.quantity}</span>
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-100">
            <span className="text-[10px] text-gray-500 font-semibold">+{order.items.length - 3}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Tag size={10} />
          <span>{new Date(order.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <span className="text-sm font-bold text-[#393E46]">${order.totalAmount.toFixed(2)}</span>
      </div>
      {order.tracking?.trackingNumber && (
        <div className="text-[10px] text-blue-500 truncate">
          Tracking: {order.tracking.trackingNumber}
        </div>
      )}
    </div>
  </div>
);


const MessageBubble = ({
  msg,
  userAvatar,
  onAddToCart,
  addingId,
}: {
  msg: Message;
  userAvatar?: string | null;
  onAddToCart: (id: string) => void;
  addingId: string | null;
}) => {
  const isUser = msg.role === "user";
  const parsed = isUser ? null : parseMessageContent(msg.content);

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8">
        {isUser ? (
          userAvatar ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#D6EED6]">
              <Image src={userAvatar} alt="You" fill sizes="32px" className="object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#D6EED6] flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-[#393E46] text-xs font-bold">U</span>
            </div>
          )
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center border-2 border-white shadow-sm">
            <Bot size={15} className="text-[#D6EED6]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[80%] sm:max-w-sm md:max-w-md ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <div className="bg-[#393E46] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
            {msg.content}
          </div>
        ) : (
          <>
            {parsed?.text && (
              <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                <RichText text={parsed.text} />
              </div>
            )}

            {parsed?.products && parsed.products.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {parsed.products.map((p) => (
                  <ProductCardUI key={p._id} product={p} onAddToCart={onAddToCart} addingId={addingId} />
                ))}
              </div>
            )}

            {parsed?.orders && parsed.orders.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                {parsed.orders.map((o) => (
                  <OrderCardUI key={o._id} order={o} />
                ))}
              </div>
            )}
          </>
        )}

        <p className={`text-[10px] text-gray-300 px-1 ${isUser ? "text-right" : "text-left"}`}>
          {msg.timestamp.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};


const CustomerChatPage = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();

  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    role: "assistant",
    content: `Hey there! 🐾 Welcome to Batu Pet Shop assistant.\nI can help you find products, check deals, or track your orders.\n\nWhat are you looking for today?`,
    timestamp: new Date(),
  }]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [addingId, setAddingId]     = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleAddToCart = useCallback(async (productId: string) => {
    if (addingId === productId) return;
    setAddingId(productId);
    try { await addToCart(productId); }
    finally { setAddingId(null); }
  }, [addingId, addToCart]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/customer/chat`,
        { message: messageText, sessionId },
        { withCredentials: true }
      );
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! Something went wrong. Please try again 🐾",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-[#393E46] px-4 py-3 flex items-center gap-3 shadow-md">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#D6EED6]/10 border border-[#D6EED6]/30 flex items-center justify-center">
          <Bot size={18} className="text-[#D6EED6]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Pet Store Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-gray-400 text-[10px]">Always here to help</p>
          </div>
        </div>
        {user?.avatar && (
          <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-[#D6EED6]/40 flex-shrink-0">
            <Image src={user.avatar} alt="You" fill sizes="28px" className="object-cover" />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
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
          <MessageBubble
            key={msg.id}
            msg={msg}
            userAvatar={user?.avatar}
            onAddToCart={handleAddToCart}
            addingId={addingId}
          />
        ))}

        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
              <Bot size={15} className="text-[#D6EED6]" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-[#D6EED6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-[#D6EED6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-[#D6EED6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#393E46] focus-within:bg-white transition-all duration-200">
          <MessageCircle size={15} className="text-gray-300 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask about products, deals, orders..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="w-8 h-8 bg-[#393E46] hover:bg-[#2a2f36] text-white rounded-xl flex-shrink-0 disabled:opacity-40 transition-all duration-200"
          >
            {isLoading
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} className={input.trim() ? "translate-x-0" : ""} />
            }
          </Button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-1.5">Powered by Batu Pet Shop AI</p>
      </div>
    </div>
  );
};

export default CustomerChatPage;