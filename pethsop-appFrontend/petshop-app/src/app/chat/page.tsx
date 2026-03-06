"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "@/app/context/authContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  orders?: Order[];
  timestamp: Date;
};

type Product = {
  _id: string;
  product_name: string;
  price: number;
  salePrice?: number | null;
  image: { url: string }[];
  slug: string;
  category: string;
  stock: number;
};

type OrderItem = {
  product: {
    _id: string;
    product_name: string;
    image: { url: string }[];
    slug: string;
  };
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: { city?: string; country?: string };
};

const parseMessage = (
  content: string,
): { text: string; products: Product[]; orders: Order[] } => {
  const empty = {
    text: content,
    products: [] as Product[],
    orders: [] as Order[],
  };

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  let rawJson = fenced ? fenced[1].trim() : null;

  if (!rawJson) {
    const bracket = content.match(/(\[[\s\S]*\])/);
    rawJson = bracket ? bracket[1].trim() : null;
  }

  if (!rawJson) return empty;

  const repair = (s: string): string => {
    const last = s.lastIndexOf("}");
    if (last === -1) return s;
    const sliced = s.slice(0, last + 1).trimEnd();
    return sliced.endsWith("]") ? sliced : sliced + "]";
  };

  const tryParse = (s: string): any[] | null => {
    try {
      const r = JSON.parse(s);
      return Array.isArray(r) ? r : null;
    } catch {
      return null;
    }
  };

  const arr = tryParse(rawJson) ?? tryParse(repair(rawJson));
  if (!arr || arr.length === 0) return empty;

  const valid = arr.filter(
    (item: any) => item && typeof item === "object" && item._id,
  );
  if (valid.length === 0) return empty;

  const text = fenced
    ? content.replace(/```(?:json)?[\s\S]*?```/, "").trim()
    : content.replace(/\[[\s\S]*\]/, "").trim();

  if ("status" in valid[0] && "totalAmount" in valid[0]) {
    return { text, products: [], orders: valid as Order[] };
  }
  return { text, products: valid as Product[], orders: [] };
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  pending: {
    label: "Processing",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    Icon: Clock,
  },
  paid: {
    label: "Paid",
    color: "text-[#97cba9]",
    bg: "bg-[#97cba9]/10 border-[#97cba9]/30",
    Icon: CheckCircle,
  },
  shipped: {
    label: "Shipped",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    Icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-[#97cba9]",
    bg: "bg-[#97cba9]/10 border-[#97cba9]/30",
    Icon: Package,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
    Icon: XCircle,
  },
};

const UserAvatar = ({
  avatarUrl,
  size = 7,
}: {
  avatarUrl?: string | null;
  size?: number;
}) => {
  const sizeClass = `w-${size} h-${size}`;
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="User avatar"
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full flex-shrink-0 flex items-center justify-center shadow-sm bg-[#D6EED6]`}
    >
      <User size={size * 1.8} className="text-[#393E46]" />
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const discount =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <Link href={`/Products/${product.slug}`}>
      <div className="group flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-2.5 hover:border-[#393E46] hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="relative flex-shrink-0">
          <img
            src={product.image?.[0]?.url || "/placeholder.png"}
            alt={product.product_name}
            className="w-14 h-14 object-cover rounded-xl"
          />
          {discount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#97cba9] text-[#393E46] text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
              -{discount}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {product.product_name}
          </p>
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {product.category}
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                Out of stock
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {product.salePrice && product.salePrice < product.price ? (
              <>
                <span className="text-sm font-bold text-[#393E46]">
                  ${product.salePrice}
                </span>
                <span className="text-[11px] text-gray-400 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-[#393E46]">
                ${product.price}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-gray-50 group-hover:bg-[#393E46] flex items-center justify-center transition-colors duration-200">
          <ChevronRight
            size={13}
            className="text-gray-400 group-hover:text-white transition-colors duration-200"
          />
        </div>
      </div>
    </Link>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const st = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = st.Icon;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/orders/${order._id}`}>
      <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#97cba9]/30 transition-all duration-200 cursor-pointer">
        <div className="bg-gradient-to-r from-gray-50 to-white px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <Package size={11} className="text-gray-400" />
            <span className="text-[10px] text-gray-400 font-mono tracking-wider">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${st.color} ${st.bg}`}
          >
            <StatusIcon size={10} />
            {st.label}
          </span>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex -space-x-2.5">
              {order.items?.slice(0, 3).map((item, i) => (
                <img
                  key={i}
                  src={item.product?.image?.[0]?.url || "/placeholder.png"}
                  alt={item.product?.product_name || "product"}
                  className="w-10 h-10 object-cover rounded-xl border-2 border-white shadow-sm"
                />
              ))}
              {(order.items?.length || 0) > 3 && (
                <div className="w-10 h-10 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                  <span className="text-[10px] text-gray-500 font-bold">
                    +{order.items.length - 3}
                  </span>
                </div>
              )}
            </div>
            <p className="flex-1 text-[11px] text-gray-500 truncate">
              {order.items
                ?.map((i) => i.product?.product_name)
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={9} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#97cba9]">
                ${order.totalAmount.toFixed(2)}
              </span>
              <div className="w-6 h-6 rounded-lg bg-gray-50 group-hover:bg-[#97cba9] flex items-center justify-center transition-colors duration-200">
                <ChevronRight
                  size={11}
                  className="text-gray-400 group-hover:text-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const RichText = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const lines = text.split("\n").filter((l) => l.trim());
  const renderInline = (t: string) =>
    t.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong
          key={j}
          className={isUser ? "font-semibold" : "font-semibold text-gray-900"}
        >
          {p.slice(2, -2)}
        </strong>
      ) : (
        p
      ),
    );

  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        const isBullet =
          line.trim().startsWith("- ") || line.trim().startsWith("• ");
        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? "bg-white/60" : "bg-[#393E46]"}`}
              />
              <span>{renderInline(line.replace(/^[-•]\s/, ""))}</span>
            </div>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

const MessageBubble = ({
  msg,
  userAvatar,
}: {
  msg: Message;
  userAvatar?: string | null;
}) => {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {isUser ? (
        <UserAvatar avatarUrl={userAvatar} size={7} />
      ) : (
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm bg-[#393E46]">
          <Bot size={13} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[83%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
      >
        {msg.content && (
          <div
            className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${isUser ? "bg-[#393E46] text-white rounded-br-sm" : "bg-white border border-gray-100 rounded-bl-sm"}`}
          >
            <RichText text={msg.content} isUser={isUser} />
          </div>
        )}
        {msg.products && msg.products.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-0.5">
              <Tag size={10} className="text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                {msg.products.length} Product
                {msg.products.length > 1 ? "s" : ""}
              </span>
            </div>
            {msg.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        {msg.orders && msg.orders.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-0.5">
              <Package size={10} className="text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                {msg.orders.length} Order{msg.orders.length > 1 ? "s" : ""}
              </span>
            </div>
            {msg.orders.map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        )}
        <span className="text-[9px] text-gray-300 px-1">
          {msg.timestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

const CustomerChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! 🐾 I'm your pet store assistant.\nAsk me about **products**, hot deals, or **your orders**!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { user } = useContext(AuthContext);
  const userAvatar = user?.avatar ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/customer/chat`,
        { message: userMessage.content },
        { withCredentials: true },
      );
      const { text, products, orders } = parseMessage(data.answer);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: text,
          products,
          orders,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again! 🙏",
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

  const suggestions = [
    "Hot deals 🔥",
    "Cat products 🐱",
    "My orders 📦",
    "Dog food 🐶",
  ];

  return (
    <>
      <div
        ref={chatRef}
        className={`fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[400px] max-w-[400px] transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: "min(520px, calc(100dvh - 120px))" }}
        >
          <div className="bg-[#393E46] px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-[#D6EED6] flex items-center justify-center">
                  <Bot size={18} className="text-[#393E46]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#393E46]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Pet Assistant
                </p>
                <p className="text-gray-400 text-[11px]">
                  Always here to help 🐾
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={15} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} userAvatar={userAvatar} />
            ))}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-[#393E46] flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="cursor-pointer flex-shrink-0 text-[11px] bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium hover:bg-[#393E46] hover:text-white hover:border-[#393E46] transition-all duration-200 whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-[#393E46] focus-within:bg-white transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="cursor-pointer w-8 h-8 bg-[#393E46] hover:bg-[#2a2f36] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        ref={buttonRef}
        onClick={() => setIsOpen((p) => !p)}
        className="cursor-pointer fixed bottom-22 right-4 lg:bottom-8 sm:right-6 z-50 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-[#393E46] shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
      >
        <div
          className={`absolute transition-all duration-300 ${isOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
        >
          <MessageCircle size={24} className="text-[#D6EED6]" />
        </div>
        <div
          className={`absolute transition-all duration-300 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
        >
          <X size={24} className="text-white" />
        </div>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D6EED6] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  );
};

export default CustomerChatWidget;
