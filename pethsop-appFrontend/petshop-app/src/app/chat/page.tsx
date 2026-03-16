"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageCircle, X, Send, Bot, User, Loader2, Package,
  Clock, CheckCircle, Truck, XCircle, ChevronRight, Tag,
  Trash2, ShoppingCart, Ticket, Star, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "@/app/context/authContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  orderSummary?: OrderSummary | null;
  cart?: CartData | null;
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
  avgRating?: number;
};

type OrderSummary = {
  total: number;
  pending: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

type CartItem = {
  quantity: number;
  product: {
    _id: string;
    product_name: string;
    price: number;
    salePrice?: number | null;
    image: { url: string }[];
    slug: string;
    stock: number;
  };
};

type CartData = {
  itemCount: number;
  items: CartItem[];
  total: number;
  appliedCoupon?: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeInitialMessage = (): Message => ({
  id: "1",
  role: "assistant",
  content: "Hi! 🐾 I'm your pet store assistant.\nAsk me about **products**, hot deals, or **your orders**!",
  timestamp: new Date(),
});

const parseMessage = (content: string): {
  text: string;
  products: Product[];
  orderSummary: OrderSummary | null;
  cart: CartData | null;
} => {
  const empty = { text: content, products: [] as Product[], orderSummary: null, cart: null };

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  let rawJson = fenced ? fenced[1].trim() : null;
  if (!rawJson) {
    const bracket = content.match(/(\[[\s\S]*)/);
    rawJson = bracket ? bracket[1].trim() : null;
  }
  if (!rawJson) {
    const obj = content.match(/(\{[\s\S]*)/);
    rawJson = obj ? obj[1].trim() : null;
  }
  if (!rawJson) return empty;

  const tryParse = (s: string): any => { try { return JSON.parse(s); } catch { return null; } };
  const repair = (s: string): string => {
    let fixed = s.replace(/,?\s*"[^"]*$/, "").replace(/,?\s*"[^"]*"\s*:\s*[^,}\]]*$/, "").replace(/,\s*$/, "");
    let opens = 0;
    for (const ch of fixed) { if (ch === "{") opens++; else if (ch === "}") opens--; }
    for (let i = 0; i < opens; i++) fixed += "}";
    return fixed;
  };

  const parsed = tryParse(rawJson) ?? tryParse(repair(rawJson));
  if (!parsed) return empty;

  const text = fenced
    ? content.replace(/```(?:json)?[\s\S]*?```/, "").trim()
    : content.replace(/(\[|\{)[\s\S]*/, "").trim();

  // Order summary: { total, pending, shipped, delivered, cancelled }
  if (!Array.isArray(parsed) && typeof parsed.total === "number" && "pending" in parsed) {
    return { text, products: [], orderSummary: parsed as OrderSummary, cart: null };
  }
  // Cart: { itemCount, items, total }
  if (!Array.isArray(parsed) && typeof parsed.itemCount === "number" && Array.isArray(parsed.items)) {
    return { text, products: [], orderSummary: null, cart: parsed as CartData };
  }
  if (!Array.isArray(parsed)) return empty;

  const valid = parsed.filter((item: any) => item && typeof item === "object" && item._id);
  if (!valid.length) return empty;

  return { text, products: valid as Product[], orderSummary: null, cart: null };
};

// ─── Avatars ──────────────────────────────────────────────────────────────────

const UserAvatar = ({ avatarUrl }: { avatarUrl?: string | null }) => {
  const [imgError, setImgError] = useState(false);
  if (avatarUrl && !imgError)
    return <img src={avatarUrl} alt="You" onError={() => setImgError(true)}
      className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm ring-2 ring-[#D6EED6] dark:ring-[#57B394]/50" />;
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#D6EED6] dark:bg-[#0E5F44] ring-2 ring-white dark:ring-[#162820] shadow-sm">
      <User size={13} className="text-[#393E46] dark:text-[#c8e6d0]" />
    </div>
  );
};

const BotAvatar = () => (
  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#393E46] dark:bg-[#0E5F44] ring-2 ring-white dark:ring-[#162820] shadow-sm">
    <Bot size={13} className="text-[#D6EED6]" />
  </div>
);

// ─── RichText ─────────────────────────────────────────────────────────────────

const RichText = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const lines = text.split("\n").filter((l) => l.trim());
  const renderInline = (t: string) =>
    t.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} className={isUser ? "font-bold" : "font-bold text-[#393E46] dark:text-[#c8e6d0]"}>{p.slice(2, -2)}</strong>
        : <span key={j}>{p}</span>
    );

  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        if (line.toLowerCase().startsWith("tip:") || line.includes("💡"))
          return (
            <div key={i} className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-700/30 rounded-xl px-2.5 py-2 mt-1">
              <span className="text-sm flex-shrink-0">💡</span>
              <span className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{line.replace(/^tip:/i, "").replace("💡", "").trim()}</span>
            </div>
          );
        const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
        if (isBullet)
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? "bg-white/60" : "bg-[#97cba9] dark:bg-[#57B394]"}`} />
              <span className={isUser ? "text-white/95" : "text-gray-700 dark:text-[#c8e6d0]/90"}>{renderInline(line.replace(/^[-•]\s/, ""))}</span>
            </div>
          );
        const numMatch = line.trim().match(/^(\d+)\.\s(.+)/);
        if (numMatch)
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`flex-shrink-0 w-[18px] h-[18px] rounded-full text-[9px] font-black flex items-center justify-center mt-0.5 ${isUser ? "bg-white/20 text-white" : "bg-[#393E46]/10 dark:bg-[#c8e6d0]/10 text-[#393E46] dark:text-[#c8e6d0]"}`}>{numMatch[1]}</span>
              <span className={isUser ? "text-white/95" : "text-gray-700 dark:text-[#c8e6d0]/90"}>{renderInline(numMatch[2])}</span>
            </div>
          );
        return <p key={i} className={isUser ? "text-white/95" : "text-gray-700 dark:text-[#c8e6d0]/90"}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({ product, onNavigate }: { product: Product; onNavigate: () => void }) => {
  const discount = product.salePrice && product.salePrice < product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  return (
    <Link href={`/Products/${product.slug}`} onClick={onNavigate}>
      <div className="group flex items-center gap-3 bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 rounded-2xl p-2.5 hover:border-[#97cba9] dark:hover:border-[#57B394]/50 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="relative flex-shrink-0">
          <img src={product.image?.[0]?.url || "/placeholder.png"} alt={product.product_name} className="w-14 h-14 object-cover rounded-xl" />
          {discount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#97cba9] text-[#393E46] text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight">-{discount}%</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 dark:text-[#c8e6d0] truncate">{product.product_name}</p>
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            <span className="text-[10px] text-gray-400 dark:text-[#7aab8a] bg-gray-100 dark:bg-[#162820] px-1.5 py-0.5 rounded-full">{product.category}</span>
            {product.avgRating && <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><Star size={8} fill="currentColor" />{product.avgRating}</span>}
            {isLowStock && <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">Only {product.stock} left</span>}
            {isOutOfStock && <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full">Out of stock</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {product.salePrice && product.salePrice < product.price ? (
              <><span className="text-xs line-through text-gray-400 dark:text-gray-500">${product.price.toFixed(2)}</span><span className="text-sm font-bold text-[#393E46] dark:text-[#c8e6d0]">${product.salePrice.toFixed(2)}</span></>
            ) : <span className="text-sm font-bold text-[#393E46] dark:text-[#c8e6d0]">${product.price.toFixed(2)}</span>}
          </div>
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-gray-50 dark:bg-[#162820] group-hover:bg-[#393E46] dark:group-hover:bg-[#57B394]/20 flex items-center justify-center transition-colors duration-200">
          <ChevronRight size={13} className="text-gray-400 dark:text-[#7aab8a] group-hover:text-white transition-colors duration-200" />
        </div>
      </div>
    </Link>
  );
};

// ─── Order Summary Card ───────────────────────────────────────────────────────

const statusRows = [
  { key: "pending",   label: "Processing", dot: "bg-amber-400",  text: "text-amber-600 dark:text-amber-400" },
  { key: "shipped",   label: "Shipped",    dot: "bg-blue-400",   text: "text-blue-600 dark:text-blue-400" },
  { key: "delivered", label: "Delivered",  dot: "bg-[#57B394]",  text: "text-[#57B394]" },
  { key: "cancelled", label: "Cancelled",  dot: "bg-gray-400",   text: "text-gray-400 dark:text-gray-500" },
];

const OrderSummaryCard = ({ summary }: { summary: OrderSummary }) => {
  const active = statusRows.filter((s) => (summary[s.key as keyof OrderSummary] as number) > 0);
  return (
    <div className="bg-white dark:bg-[#1e3d2a] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 dark:from-[#162820] to-white dark:to-[#1e3d2a] px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <Package size={11} className="text-gray-400 dark:text-[#7aab8a]" />
          <span className="text-[10px] text-gray-500 dark:text-[#7aab8a] font-medium">Order History</span>
        </div>
        <span className="text-[11px] font-bold text-[#393E46] dark:text-[#c8e6d0] bg-gray-100 dark:bg-[#162820] px-2.5 py-0.5 rounded-full">
          {summary.total} order{summary.total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* Status grid */}
        {active.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {active.map((s) => (
              <div key={s.key} className="flex items-center gap-2 bg-gray-50 dark:bg-[#162820] rounded-xl px-2.5 py-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <div>
                  <p className={`text-xs font-bold leading-none ${s.text}`}>{summary[s.key as keyof OrderSummary]}</p>
                  <p className="text-[9px] text-gray-400 dark:text-[#7aab8a] mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link href="/my-orders">
          <button className="w-full flex items-center justify-center gap-2 bg-[#393E46] dark:bg-[#0E5F44] hover:bg-[#2a2f36] dark:hover:bg-[#57B394]/80 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 group">
            <Package size={12} />
            View My Orders
            <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity ml-auto" />
          </button>
        </Link>
      </div>
    </div>
  );
};

// ─── Cart Card ────────────────────────────────────────────────────────────────

const CartCard = ({ cart, onNavigate }: { cart: CartData; onNavigate: () => void }) => (
  <Link href="/cart" onClick={onNavigate}>
    <div className="group bg-white dark:bg-[#1e3d2a] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#97cba9]/40 dark:hover:border-[#57B394]/40 transition-all duration-200 cursor-pointer">
      <div className="bg-gradient-to-r from-gray-50 dark:from-[#162820] to-white dark:to-[#1e3d2a] px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <ShoppingCart size={11} className="text-gray-400 dark:text-[#7aab8a]" />
          <span className="text-[10px] text-gray-500 dark:text-[#7aab8a] font-medium">Your Cart · {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}</span>
        </div>
        {cart.appliedCoupon && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40">
            <Ticket size={9} /> Coupon applied
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="space-y-2 mb-3">
          {cart.items.slice(0, 3).map((item, i) => {
            const price = item.product?.salePrice ?? item.product?.price ?? 0;
            const hasDiscount = item.product?.salePrice && item.product.salePrice < item.product.price;
            return (
              <div key={i} className="flex items-center gap-2.5">
                <img src={item.product?.image?.[0]?.url || "/placeholder.png"} alt={item.product?.product_name} className="w-9 h-9 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-700 dark:text-[#c8e6d0] truncate">{item.product?.product_name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#7aab8a]">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {hasDiscount && <p className="text-[9px] line-through text-gray-400">${item.product!.price.toFixed(2)}</p>}
                  <p className="text-[11px] font-bold text-[#393E46] dark:text-[#c8e6d0]">${(price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
          {cart.items.length > 3 && <p className="text-[10px] text-gray-400 dark:text-[#7aab8a] pl-11">+{cart.items.length - 3} more item{cart.items.length - 3 !== 1 ? "s" : ""}</p>}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
          <span className="text-[10px] text-gray-400 dark:text-[#7aab8a]">Subtotal</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#97cba9] dark:text-[#57B394]">${cart.total.toFixed(2)}</span>
            <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-[#162820] group-hover:bg-[#97cba9] dark:group-hover:bg-[#0E5F44] flex items-center justify-center transition-colors duration-200">
              <ChevronRight size={11} className="text-gray-400 dark:text-[#7aab8a] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// ─── SlideIn ──────────────────────────────────────────────────────────────────

const SlideIn = ({ isUser, children }: { isUser: boolean; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = isUser ? "translateX(12px)" : "translateX(-12px)";
    el.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    const id = requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(0)"; }));
    return () => cancelAnimationFrame(id);
  }, []);
  return <div ref={ref}>{children}</div>;
};

// ─── MessageBubble ────────────────────────────────────────────────────────────

const MessageBubble = ({ msg, onNavigate }: { msg: Message; onNavigate: () => void }) => {
  const { user } = useContext(AuthContext);
  const isUser = msg.role === "user";
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => { setTimeStr(msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })); }, [msg.timestamp]);

  return (
    <SlideIn isUser={isUser}>
      <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {isUser ? <UserAvatar avatarUrl={user?.avatar ?? null} /> : <BotAvatar />}
        <div className={`max-w-[83%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          {msg.content && (
            <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${isUser ? "bg-[#393E46] dark:bg-[#0E5F44] rounded-br-sm" : "bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 rounded-bl-sm"}`}>
              <RichText text={msg.content} isUser={isUser} />
            </div>
          )}
          {msg.products && msg.products.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <Tag size={10} className="text-gray-400 dark:text-[#7aab8a]" />
                <span className="text-[10px] text-gray-400 dark:text-[#7aab8a] font-medium uppercase tracking-wide">{msg.products.length} Product{msg.products.length > 1 ? "s" : ""}</span>
              </div>
              {msg.products.map((p) => <ProductCard key={p._id} product={p} onNavigate={onNavigate} />)}
            </div>
          )}
          {msg.orderSummary && <div className="w-full"><OrderSummaryCard summary={msg.orderSummary} /></div>}
          {msg.cart && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <ShoppingCart size={10} className="text-gray-400 dark:text-[#7aab8a]" />
                <span className="text-[10px] text-gray-400 dark:text-[#7aab8a] font-medium uppercase tracking-wide">Shopping Cart</span>
              </div>
              <CartCard cart={msg.cart} onNavigate={onNavigate} />
            </div>
          )}
          <span className="text-[9px] text-gray-300 dark:text-[#7aab8a]/50 px-1">{timeStr}</span>
        </div>
      </div>
    </SlideIn>
  );
};

// ─── Main Widget ──────────────────────────────────────────────────────────────

const CustomerChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [makeInitialMessage()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) return;
    const prev = meta.content;
    if (!prev.includes("maximum-scale")) meta.content = prev + ", maximum-scale=1, user-scalable=no";
    return () => { meta.content = prev; };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleClearMessages = () => setMessages([makeInitialMessage()]);
  const handleNavigate = () => setIsOpen(false);

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText ?? input.trim();
    if (!text || isLoading) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() }]);
    setInput("");
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/customer/chat`, { message: text }, { withCredentials: true });
      const { text: t, products, orderSummary, cart } = parseMessage(data.answer);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: t, products, orderSummary, cart, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please try again! 🙏", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = ["Hot deals 🔥", "Cat products 🐱", "My orders 📦", "My cart 🛒"];

  return (
    <>
      <div ref={chatRef} className={`fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[400px] max-w-[400px] transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}>
        <div className="bg-white dark:bg-[#162820] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/8 flex flex-col overflow-hidden" style={{ height: "min(560px, calc(100dvh - 120px))" }}>

          {/* Header */}
          <div className="bg-[#393E46] dark:bg-[#0d1f18] px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-[#D6EED6] dark:bg-[#0E5F44] flex items-center justify-center">
                  <Bot size={18} className="text-[#393E46] dark:text-[#c8e6d0]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#393E46] dark:border-[#0d1f18]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Pet Assistant</p>
                <p className="text-gray-400 dark:text-[#7aab8a] text-[11px]">Always here to help 🐾</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button onClick={handleClearMessages} title="Clear messages" className="cursor-pointer w-8 h-8 rounded-xl bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors group">
                  <Trash2 size={14} className="text-white/60 group-hover:text-red-300 transition-colors" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="cursor-pointer w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={15} className="text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#162820]/60">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} onNavigate={handleNavigate} />)}
            {isLoading && (
              <SlideIn isUser={false}>
                <div className="flex items-end gap-2">
                  <BotAvatar />
                  <div className="bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/8 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-[#97cba9] dark:bg-[#57B394] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                </div>
              </SlideIn>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 pt-1.5 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 bg-white dark:bg-[#162820] border-t border-gray-50 dark:border-white/5">
              {suggestions.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="cursor-pointer flex-shrink-0 text-[11px] bg-white dark:bg-[#1e3d2a] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#c8e6d0] px-3 py-1.5 rounded-full font-medium hover:bg-[#393E46] dark:hover:bg-[#0E5F44] hover:text-white hover:border-transparent dark:hover:border-[#57B394] transition-all duration-200 whitespace-nowrap">{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#162820] flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1e3d2a] rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-white/10 focus-within:border-[#393E46] transition-all duration-200">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-[#c8e6d0] outline-none placeholder:text-gray-400 dark:placeholder:text-[#7aab8a]/60"
                disabled={isLoading} />
              <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
                className="cursor-pointer w-8 h-8 bg-[#393E46] dark:bg-[#0E5F44] hover:bg-[#2a2f36] dark:hover:bg-[#57B394] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button ref={buttonRef} onClick={() => setIsOpen((p) => !p)} style={{ touchAction: "manipulation" } as React.CSSProperties}
        className="cursor-pointer select-none fixed bottom-6 right-4 sm:right-6 z-50 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-[#393E46] shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95">
        <div className={`absolute transition-all duration-300 ${isOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}><MessageCircle size={24} className="text-[#D6EED6]" /></div>
        <div className={`absolute transition-all duration-300 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}><X size={24} className="text-white" /></div>
        {!isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D6EED6] dark:bg-[#57B394] rounded-full border-2 border-white dark:border-[#0d1f18] animate-pulse" />}
      </button>
    </>
  );
};

export default CustomerChatWidget;