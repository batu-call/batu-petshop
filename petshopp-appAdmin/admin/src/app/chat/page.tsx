"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Sparkles, X, Send, Bot, User, Loader2,
  Package, Clock, CheckCircle, Truck, XCircle,
  ChevronRight, Tag, ExternalLink, Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "../Context/AdminAuthContext";

/* ─────────────── Types ─────────────── */
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

type OrderItem = {
  product: { _id: string; product_name: string; image: { url: string }[]; slug: string };
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

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  orders?: Order[];
  timestamp: Date;
};

/* ─────────────── Constants ─────────────── */
const QUICK_QUESTIONS = [
  "Orders this month? 📊",
  "Best sellers? 🏆",
  "Low stock? ⚠️",
  "Top customers? 👑",
  "Orders by city? 🗺️",
  "Cancelled today? ❌",
];

const makeInitialMessage = (): Message => ({
  id: "1",
  role: "assistant",
  content: "Hello Admin! 👋 Ask me anything about your store — **orders**, **products**, customers, or **revenue**.",
  timestamp: new Date(),
});

const statusConfig: Record<string, {
  label: string; color: string; bg: string; darkCls: string; Icon: React.ElementType;
}> = {
  pending: {
    label: "Processing", color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    darkCls: "dark:bg-amber-900/20 dark:border-amber-600/40 dark:text-amber-400", Icon: Clock,
  },
  paid: {
    label: "Paid", color: "text-[#57B394]",
    bg: "bg-[#D6EED6]/50 border-[#97cba9]/40",
    darkCls: "dark:bg-[#0E5F44]/30 dark:border-[#57B394]/40", Icon: CheckCircle,
  },
  shipped: {
    label: "Shipped", color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    darkCls: "dark:bg-blue-900/20 dark:border-blue-600/40 dark:text-blue-400", Icon: Truck,
  },
  delivered: {
    label: "Delivered", color: "text-[#57B394]",
    bg: "bg-[#D6EED6]/50 border-[#97cba9]/40",
    darkCls: "dark:bg-[#0E5F44]/30 dark:border-[#57B394]/40", Icon: Package,
  },
  cancelled: {
    label: "Cancelled", color: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
    darkCls: "dark:bg-gray-800/40 dark:border-gray-600/40 dark:text-gray-400", Icon: XCircle,
  },
};

/* ─────────────── Helpers ─────────────── */
const parseMessage = (content: string): { text: string; products: ProductCard[]; orders: Order[] } => {
  const empty = { text: content, products: [] as ProductCard[], orders: [] as Order[] };
  try {
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
      try { const r = JSON.parse(s); return Array.isArray(r) ? r : null; } catch { return null; }
    };
    const arr = tryParse(rawJson) ?? tryParse(repair(rawJson));
    if (!arr || arr.length === 0) return empty;
    const valid = arr.filter((item: any) => item && typeof item === "object" && item._id);
    if (valid.length === 0) return empty;
    const text = fenced
      ? content.replace(/```(?:json)?[\s\S]*?```/, "").trim()
      : content.replace(/\[[\s\S]*\]/, "").trim();
    if ("status" in valid[0] && "totalAmount" in valid[0])
      return { text, products: [], orders: valid as Order[] };
    return { text, products: valid as ProductCard[], orders: [] };
  } catch { return empty; }
};

/* ─────────────── Avatars ─────────────── */
const BotAvatar = () => (
  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#393E46] dark:bg-[#0E5F44] ring-2 ring-white dark:ring-[#162820] shadow-sm">
    <Sparkles size={13} className="text-[#D6EED6]" />
  </div>
);

const UserAvatarAdmin = ({ avatarUrl }: { avatarUrl?: string | null }) => {
  const [imgError, setImgError] = React.useState(false);
  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt="Admin"
        onError={() => setImgError(true)}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm ring-2 ring-[#D6EED6] dark:ring-[#57B394]/50"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#D6EED6] dark:bg-[#0E5F44] ring-2 ring-white dark:ring-[#162820] shadow-sm">
      <User size={13} className="text-[#393E46] dark:text-[#c8e6d0]" />
    </div>
  );
};

/* ─────────────── RichText (same as CustomerChatWidget) ─────────────── */
const RichText = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const lines = text.split("\n").filter((l) => l.trim());

  const renderInline = (t: string) =>
    t.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={j} className={isUser ? "font-bold" : "font-bold text-[#393E46] dark:text-[#c8e6d0]"}>
          {p.slice(2, -2)}
        </strong>
      ) : <span key={j}>{p}</span>,
    );

  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        if (line.toLowerCase().startsWith("tip:") || line.includes("💡")) {
          return (
            <div key={i} className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-700/30 rounded-xl px-2.5 py-2 mt-1">
              <span className="text-sm flex-shrink-0">💡</span>
              <span className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {line.replace(/^tip:/i, "").replace("💡", "").trim()}
              </span>
            </div>
          );
        }
        const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? "bg-white/60" : "bg-[#97cba9] dark:bg-[#57B394]"}`} />
              <span className={isUser ? "text-white/95" : "text-gray-700 dark:text-[#c8e6d0]/90"}>
                {renderInline(line.replace(/^[-•]\s/, ""))}
              </span>
            </div>
          );
        }
        const numMatch = line.trim().match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`flex-shrink-0 w-[18px] h-[18px] rounded-full text-[9px] font-black flex items-center justify-center mt-0.5 ${isUser ? "bg-white/20 text-white" : "bg-[#393E46]/10 dark:bg-[#c8e6d0]/10 text-[#393E46] dark:text-[#c8e6d0]"}`}>
                {numMatch[1]}
              </span>
              <span className={isUser ? "text-white/95" : "text-gray-700 dark:text-[#c8e6d0]/90"}>
                {renderInline(numMatch[2])}
              </span>
            </div>
          );
        }
        if (line.startsWith("## ") || line.startsWith("# ")) {
          const txt = line.replace(/^#{1,2}\s/, "");
          return (
            <p key={i} className="font-bold text-[#393E46] dark:text-[#c8e6d0] text-sm mt-2 mb-0.5">
              {txt}
            </p>
          );
        }
        return (
          <p key={i} className={isUser ? "text-white/95" : "text-gray-700 dark:text-[#c8e6d0]/90"}>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};

/* ─────────────── SlideIn ─────────────── */
const SlideIn = ({ isUser, children }: { isUser: boolean; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = isUser ? "translateX(12px)" : "translateX(-12px)";
    el.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateX(0)";
      }),
    );
    return () => cancelAnimationFrame(id);
  }, []);
  return <div ref={ref}>{children}</div>;
};

/* ─────────────── Product Card ─────────────── */
const AdminProductCard = ({ product }: { product: ProductCard }) => {
  const discount =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;
  const href = product.slug ? `/Products/${product.slug}` : `/AllProduct`;

  return (
    <Link href={href} target="_blank">
      <div className="group bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden hover:border-[#97cba9] dark:hover:border-[#57B394]/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col">
        <div className="relative w-full h-[72px] bg-gray-50 dark:bg-[#162820] overflow-hidden flex-shrink-0">
          {product.image?.[0]?.url ? (
            <Image
              src={product.image[0].url}
              alt={product.product_name}
              fill sizes="120px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={20} className="text-gray-300 dark:text-[#7aab8a]" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute -top-0 left-0 bg-[#97cba9] text-[#393E46] text-[8px] font-bold pl-1.5 pr-2 py-0.5 rounded-br-lg">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-2 flex flex-col gap-1 flex-1">
          <p className="text-[11px] font-semibold text-gray-800 dark:text-[#c8e6d0] line-clamp-2 leading-tight">
            {product.product_name}
          </p>
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex flex-col">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-[9px] line-through text-gray-400">${product.price.toFixed(2)}</span>
                  <span className="text-xs font-bold text-[#393E46] dark:text-[#c8e6d0]">${product.salePrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-xs font-bold text-[#393E46] dark:text-[#c8e6d0]">
                  {product.price ? `$${product.price.toFixed(2)}` : "—"}
                </span>
              )}
            </div>
            {product.stock !== undefined && (
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                product.stock < 5 ? "bg-red-50 text-red-400 dark:bg-red-900/20" :
                product.stock < 20 ? "bg-amber-50 text-amber-500 dark:bg-amber-900/20" :
                "bg-[#D6EED6]/60 text-[#57B394] dark:bg-[#0E5F44]/30"
              }`}>
                {product.stock} left
              </span>
            )}
          </div>
          {product.sold !== undefined && (
            <p className="text-[9px] text-gray-400 dark:text-[#7aab8a]">Sold: {product.sold}</p>
          )}
        </div>
        <div className="px-2 pb-2 flex items-center gap-1 text-[9px] text-gray-400 dark:text-[#7aab8a] group-hover:text-[#393E46] dark:group-hover:text-[#c8e6d0] transition-colors">
          <ExternalLink size={9} />
          <span>View product</span>
        </div>
      </div>
    </Link>
  );
};

/* ─────────────── Order Card ─────────────── */
const OrderCard = ({ order }: { order: Order }) => {
  const st = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = st.Icon;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  return (
    <Link href={`/orders/${order._id}`}>
      <div className="group bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#97cba9]/30 dark:hover:border-[#57B394]/40 transition-all duration-200 cursor-pointer">
        <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#162820]">
          <div className="flex items-center gap-1.5">
            <Package size={11} className="text-gray-400 dark:text-[#7aab8a]" />
            <span className="text-[10px] text-gray-400 dark:text-[#7aab8a] font-mono tracking-wider">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${st.color} ${st.bg} ${st.darkCls}`}>
            <StatusIcon size={10} />
            {st.label}
          </span>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex -space-x-2.5">
              {order.items?.slice(0, 3).map((item, i) => (
                <img key={i}
                  src={item.product?.image?.[0]?.url || "/placeholder.png"}
                  alt={item.product?.product_name || "product"}
                  className="w-10 h-10 object-cover rounded-xl border-2 border-white dark:border-[#1e3d2a] shadow-sm"
                />
              ))}
              {(order.items?.length || 0) > 3 && (
                <div className="w-10 h-10 rounded-xl border-2 border-white dark:border-[#1e3d2a] bg-gray-100 dark:bg-[#162820] flex items-center justify-center shadow-sm">
                  <span className="text-[10px] text-gray-500 dark:text-[#7aab8a] font-bold">
                    +{order.items.length - 3}
                  </span>
                </div>
              )}
            </div>
            <p className="flex-1 text-[11px] text-gray-500 dark:text-[#7aab8a] truncate">
              {order.items?.map((i) => i.product?.product_name).filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-[#7aab8a]">
              <Clock size={9} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#97cba9] dark:text-[#57B394]">
                ${order.totalAmount.toFixed(2)}
              </span>
              <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-[#162820] group-hover:bg-[#97cba9] dark:group-hover:bg-[#0E5F44] flex items-center justify-center transition-colors duration-200">
                <ChevronRight size={11} className="text-gray-400 dark:text-[#7aab8a] group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

/*  Message Bubble  */
const MessageBubble = ({ msg }: { msg: Message }) => {
  const { admin } = useAdminAuth();
  const isUser = msg.role === "user";
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    setTimeStr(
      msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  }, [msg.timestamp]);

  return (
    <SlideIn isUser={isUser}>
      <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {isUser ? <UserAvatarAdmin avatarUrl={admin?.avatar} /> : <BotAvatar />}
        <div className={`max-w-[83%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          {msg.content && (
            <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
              isUser
                ? "bg-[#393E46] dark:bg-[#0E5F44] rounded-br-sm"
                : "bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 rounded-bl-sm"
            }`}>
              <RichText text={msg.content} isUser={isUser} />
            </div>
          )}

          {msg.products && msg.products.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <Tag size={10} className="text-gray-400 dark:text-[#7aab8a]" />
                <span className="text-[10px] text-gray-400 dark:text-[#7aab8a] font-medium uppercase tracking-wide">
                  {msg.products.length} Product{msg.products.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {msg.products.slice(0, 6).map((p) => (
                  <AdminProductCard key={p._id} product={p} />
                ))}
              </div>
              {msg.products.length > 6 && (
                <Link href="/AllProduct" className="text-center text-xs text-[#393E46] dark:text-[#57B394] font-medium mt-1 hover:underline">
                  View all {msg.products.length} products →
                </Link>
              )}
            </div>
          )}

          {msg.orders && msg.orders.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <Package size={10} className="text-gray-400 dark:text-[#7aab8a]" />
                <span className="text-[10px] text-gray-400 dark:text-[#7aab8a] font-medium uppercase tracking-wide">
                  {msg.orders.length} Order{msg.orders.length > 1 ? "s" : ""}
                </span>
              </div>
              {msg.orders.map((o) => (
                <OrderCard key={o._id} order={o} />
              ))}
            </div>
          )}

          <span className="text-[9px] text-gray-300 dark:text-[#7aab8a]/50 px-1">{timeStr}</span>
        </div>
      </div>
    </SlideIn>
  );
};

/* ─────────────── Main Widget ─────────────── */
const AdminChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [makeInitialMessage()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        chatRef.current && !chatRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleClear = () => setMessages([makeInitialMessage()]);

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText ?? input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/admin/chat`,
        { message: text },
        { withCredentials: true },
        
      );
      
      const { text: t, products, orders } = parseMessage(data.answer);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t,
          products: products.length > 0 ? products : undefined,
          orders: orders.length > 0 ? orders : undefined,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again! 🙏",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasExtraMessages = messages.length > 1;

  return (
    <>
      {/* Chat panel */}
      <div
        ref={chatRef}
        className={`fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div
          className="bg-white dark:bg-[#162820] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/8 flex flex-col overflow-hidden"
          style={{ height: "min(560px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-[#393E46] dark:bg-[#0d1f18] px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-[#D6EED6] dark:bg-[#0E5F44] flex items-center justify-center">
                  <Sparkles size={18} className="text-[#393E46] dark:text-[#c8e6d0]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#393E46] dark:border-[#0d1f18]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Admin AI Assistant</p>
                <p className="text-gray-400 dark:text-[#7aab8a] text-[11px]">Powered by Groq ⚡</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasExtraMessages && (
                <button
                  onClick={handleClear}
                  title="Clear messages"
                  className="cursor-pointer w-8 h-8 rounded-xl bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors group"
                >
                  <Trash2 size={14} className="text-white/60 group-hover:text-red-300 transition-colors" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-white" />
              </button>
            </div>
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 bg-white dark:bg-[#162820] border-b border-gray-50 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="cursor-pointer flex-shrink-0 text-[11px] bg-white dark:bg-[#1e3d2a] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c8e6d0] px-3 py-1.5 rounded-full font-medium hover:bg-[#393E46] dark:hover:bg-[#0E5F44] hover:text-white hover:border-transparent dark:hover:border-[#57B394] transition-all duration-200 whitespace-nowrap disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#162820]/60">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isLoading && (
              <SlideIn isUser={false}>
                <div className="flex items-end gap-2">
                  <BotAvatar />
                  <div className="bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 bg-[#97cba9] dark:bg-[#57B394] rounded-full animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SlideIn>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#162820] flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1e3d2a] rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-white/10 focus-within:border-[#393E46] dark:focus-within:border-[#57B394] transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about your store..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-[#c8e6d0] outline-none placeholder:text-gray-400 dark:placeholder:text-[#7aab8a]/60"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="cursor-pointer w-8 h-8 bg-[#393E46] dark:bg-[#0E5F44] hover:bg-[#2a2f36] dark:hover:bg-[#57B394] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((p) => !p)}
        style={{ touchAction: "manipulation" } as React.CSSProperties}
        className="cursor-pointer select-none fixed bottom-6 right-4 sm:right-6 z-50 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-[#393E46] dark:bg-[#0E5F44] shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
      >
        <div className={`absolute transition-all duration-300 ${isOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}>
          <Sparkles size={24} className="text-[#D6EED6]" />
        </div>
        <div className={`absolute transition-all duration-300 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}>
          <X size={24} className="text-white" />
        </div>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D6EED6] dark:bg-[#57B394] rounded-full border-2 border-white dark:border-[#0d1f18] animate-pulse" />
        )}
      </button>
    </>
  );
};

export default AdminChatWidget;