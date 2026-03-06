"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import CircularText from "@/components/CircularText";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useConfirm } from "@/app/Context/confirmContext";
import CloseIcon from "@mui/icons-material/Close";
import { ThumbUp } from "@mui/icons-material";
import { Package, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string;
  createdAt: string;
};

type OrderItems = {
  product: { image: { url: string }[] } | null;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  postalCode: string;
};

export type OrdersType = {
  _id: string;
  user: User | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

type Reviews = {
  _id: string;
  productId: {
    product_name: string;
    price: number;
    image: { publicId: string; url: string }[];
  };
  userId: { _id: string; firstName: string; lastName: string };
  rating: number;
  helpful: string[];
  comment: string;
  createdAt: string;
};

// ── ZoomModal 
interface ZoomModalProps {
  images: string[];
  initialIndex: number;
  label?: string;
  onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ images, initialIndex, label = "", onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const el = thumbnailRef.current?.children[currentIndex] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentIndex]);

  const handleClose = useCallback(() => setTimeout(onClose, 0), [onClose]);

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (animating || images.length <= 1) return;
      setSlideDir(dir === "next" ? "left" : "right");
      setAnimating(true);
      setImgLoaded(false);
      setNaturalSize(null);
      setTimeout(() => {
        setCurrentIndex((prev) =>
          dir === "next"
            ? prev < images.length - 1 ? prev + 1 : 0
            : prev > 0 ? prev - 1 : images.length - 1
        );
        setSlideDir(null);
        setAnimating(false);
      }, 220);
    },
    [animating, images.length]
  );

  const goToIndex = (index: number) => {
    if (index === currentIndex || animating) return;
    setSlideDir(index > currentIndex ? "left" : "right");
    setAnimating(true);
    setImgLoaded(false);
    setNaturalSize(null);
    setTimeout(() => {
      setCurrentIndex(index);
      setSlideDir(null);
      setAnimating(false);
    }, 220);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, navigate]);

  const swipe = (sx: number | null, sy: number | null, ex: number, ey: number) => {
    if (!sx || !sy) return;
    const dx = ex - sx, dy = ey - sy;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    navigate(dx < 0 ? "next" : "prev");
  };

  const calcBoxSize = useCallback((ns: { w: number; h: number } | null) => {
    if (typeof window === "undefined") return { width: 680, height: 460 };
    const maxW = Math.min(window.innerWidth * 0.82, 820);
    const maxH = Math.min(window.innerHeight * 0.72, 580);
    if (!ns) return { width: maxW, height: maxH };
    const ratio = ns.w / ns.h;
    let w = maxW, h = maxW / ratio;
    if (h > maxH) { h = maxH; w = maxH * ratio; }
    return { width: Math.round(w), height: Math.round(h) };
  }, []);

  const [boxSize, setBoxSize] = useState(() => calcBoxSize(null));
  useEffect(() => { setBoxSize(calcBoxSize(naturalSize)); }, [naturalSize, calcBoxSize]);
  useEffect(() => {
    const onResize = () => setBoxSize(calcBoxSize(naturalSize));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [naturalSize, calcBoxSize]);

  const currentUrl = images[currentIndex];

  return (
    <>
      <style>{`
        @keyframes zm-bd   { from{opacity:0} to{opacity:1} }
        @keyframes zm-card { from{opacity:0;transform:scale(0.93) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes zm-sh   { from{background-position:-200% 0} to{background-position:200% 0} }
        .zm-bd    { animation: zm-bd   0.25s ease forwards; }
        .zm-card  { animation: zm-card 0.30s cubic-bezier(0.22,1,0.36,1) forwards; }
        .zm-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: zm-sh 1.4s infinite;
        }
        .zm-thumb-bar::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="fixed inset-0 zm-bd"
        style={{ zIndex: 9999, backgroundColor: "rgba(5,7,6,0.93)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
        onClick={handleClose}
      />

      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 p-4 pointer-events-none" style={{ zIndex: 9999 }}>
        <div
          className="zm-card pointer-events-auto flex flex-col"
          style={{
            background: "linear-gradient(150deg, #191e1a 0%, #0e1210 100%)",
            borderRadius: 22,
            boxShadow: "0 48px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(151,203,169,0.14), inset 0 1px 0 rgba(255,255,255,0.055)",
            overflow: "hidden",
            width: Math.max(boxSize.width + 32, 320),
            transition: "width 0.3s ease",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase truncate max-w-[65%]" style={{ color: "rgba(151,203,169,0.55)" }}>
              {label}
            </p>
            <div className="flex items-center gap-3">
              {images.length > 1 && (
                <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.22)" }}>
                  {currentIndex + 1}<span style={{ color: "rgba(255,255,255,0.1)" }}> / </span>{images.length}
                </span>
              )}
              <button
                onClick={handleClose}
                className="flex items-center justify-center rounded-full transition-all duration-150 hover:scale-105 active:scale-90"
                style={{ width: 28, height: 28, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.55)" }} />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ height: boxSize.height + 16 }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => swipe(touchStartX.current, touchStartY.current, e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(151,203,169,0.055) 0%, transparent 70%)" }} />
            {!imgLoaded && <div className="absolute rounded-xl zm-shimmer" style={{ inset: "12px 40px" }} />}

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                padding: "8px 40px",
                transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
                transform: slideDir ? `translateX(${slideDir === "left" ? -50 : 50}px)` : "translateX(0)",
                opacity: animating ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={currentUrl}
                  alt={label}
                  fill
                  sizes="(max-width: 635px) 88vw, 820px"
                  priority
                  className="object-contain"
                  style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.22s ease", filter: "drop-shadow(0 10px 36px rgba(0,0,0,0.65))" }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                    setImgLoaded(true);
                  }}
                />
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button onClick={() => navigate("prev")} disabled={animating} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90 disabled:opacity-20" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", backdropFilter: "blur(6px)" }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
                <button onClick={() => navigate("next")} disabled={animating} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90 disabled:opacity-20" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", backdropFilter: "blur(6px)" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex-shrink-0 px-3 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
              <div ref={thumbnailRef} className="zm-thumb-bar flex gap-2 overflow-x-auto justify-center">
                {images.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className="relative flex-shrink-0 overflow-hidden transition-all duration-200 hover:opacity-80"
                    style={{
                      width: 50, height: 50, borderRadius: 9,
                      border: currentIndex === index ? "2px solid #97cba9" : "2px solid rgba(255,255,255,0.07)",
                      opacity: currentIndex === index ? 1 : 0.42,
                      background: "#161a17",
                      transform: currentIndex === index ? "scale(1.08)" : "scale(1)",
                      outline: "none", cursor: "pointer",
                      boxShadow: currentIndex === index ? "0 0 0 3px rgba(151,203,169,0.15)" : "none",
                    }}
                  >
                    <Image src={url} alt={`${index + 1}`} fill sizes="50px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && images.length <= 10 && (
          <div className="flex gap-1.5 pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToIndex(i)}
                style={{
                  width: i === currentIndex ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === currentIndex ? "#97cba9" : "rgba(255,255,255,0.18)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "width 0.25s ease, background 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrdersType[]>([]);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "reviews">("orders");
  const { confirm } = useConfirm();

  // ZoomModal state
  const [zoomImages, setZoomImages] = useState<string[]>([]);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoomLabel, setZoomLabel] = useState("");

  const openZoom = (images: string[], index = 0, label = "") => {
    setZoomImages(images);
    setZoomIndex(index);
    setZoomLabel(label);
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users/${id}`,
          { withCredentials: true },
        );
        if (response.data.success) setUser(response.data.user);
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : error instanceof Error ? error.message : "Unexpected error!",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/orders/${id}`,
          { withCredentials: true },
        );
        setOrder(response.data.orders.slice().reverse());
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : error instanceof Error ? error.message : "Unexpected error!",
        );
      }
    };
    fetchOrders();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/user/${id}`,
          { withCredentials: true },
        );
        setReviews(response.data.reviews.slice().reverse());
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : "Unexpected error!",
        );
      }
    };
    fetchReviews();
  }, [id]);

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/${reviewId}`,
        { withCredentials: true },
      );
      toast.success(response.data.message);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (error: unknown) {
      toast.error(
        axios.isAxiosError(error) && error.response
          ? error.response.data.message
          : "Unexpected error!",
      );
    }
  };

  const confirmDelete = async (reviewId: string) => {
    const ok = await confirm({
      title: "Delete Review",
      description: "Are you sure you want to delete this review?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (ok) handleDelete(reviewId);
  };

  const formattedDate = user
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    : "";

  const formattedOrderDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const getStatusStyles = (status: OrdersType["status"]) => {
    switch (status) {
      case "pending":   return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "paid":      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "shipped":   return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      default:          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-primary z-50">
        <CircularText text="LOADING" spinDuration={20} className="text-white text-3xl sm:text-4xl" />
      </div>
    );

  if (!user)
    return (
      <div className="ml-0 lg:ml-40 mt-20 text-center text-red-600 text-xl sm:text-2xl font-bold px-4">
        User not found!
      </div>
    );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4">

        {/* ── LEFT: User Info Card ── */}
        <div className="p-4 sm:p-6 bg-white dark:bg-card rounded-xl shadow-lg dark:shadow-none dark:border dark:border-border mt-4 sm:mt-8 lg:w-1/4 w-full">
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-accent cursor-pointer hover:ring-4 hover:ring-primary/30 transition-all"
              onClick={() => openZoom([user?.avatar || "/default-avatar.png"], 0, `${user.firstName} ${user.lastName}`)}
            >
              <Image
                src={user?.avatar || "/default-avatar.png"}
                alt="User avatar"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 80px"
                quality={95}
                className="object-cover"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-color dark:text-[#7aab8a]!">
              {user.firstName} {user.lastName}
            </h1>
            <span className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-primary dark:bg-primary/80 text-white dark:text-primary-foreground">
              {user.role}
            </span>
          </div>

          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="break-all">
              <strong className="text-color dark:text-[#7aab8a]!">Email:</strong>{" "}
              <span className="text-gray-600 dark:text-muted-foreground">{user.email}</span>
            </div>
            <div className="w-full">
              <strong className="text-color dark:text-[#7aab8a]! block mb-1">Phone:</strong>
              <div className="w-full overflow-x-auto">
                <PhoneInput
                  country="us"
                  value={user.phone}
                  inputProps={{ readOnly: true }}
                  disabled
                  containerStyle={{ width: "100%", minWidth: "200px" }}
                  inputStyle={{ width: "100%", fontSize: "12px", minWidth: "160px" }}
                  buttonStyle={{ border: "none", background: "transparent" }}
                  dropdownStyle={{ borderRadius: "8px" }}
                />
              </div>
            </div>
            <div>
              <strong className="text-color dark:text-[#7aab8a]!">Joined:</strong>{" "}
              <span className="text-gray-600 dark:text-muted-foreground">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tabs Panel ── */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm dark:shadow-none border border-[#dee3e1] dark:border-border w-full flex flex-col mt-2">

          {/* Tab Headers */}
          <div className="flex border-b border-[#dee3e1] dark:border-border">
            {["orders", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "orders" | "reviews")}
                className={`flex-1 py-3 sm:py-4 text-center border-b-4 font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
                  activeTab === tab
                    ? "border-[#D6EED6] dark:border-primary text-[#97cba9] dark:text-primary"
                    : "border-transparent text-[#6d7e78] dark:text-muted-foreground hover:text-[#97cba9] dark:hover:text-primary"
                }`}
              >
                <span className="flex items-center justify-center gap-1 sm:gap-2">
                  {tab === "orders" ? <ChatBubbleOutlineIcon fontSize="small" /> : <ShoppingBagIcon fontSize="small" />}
                  <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <span className="sm:hidden">{tab.charAt(0).toUpperCase()}</span>
                  <span className="ml-0.5 sm:ml-1 bg-gray-200 dark:bg-accent text-gray-700 dark:text-foreground text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                    {tab === "orders" ? order.length : reviews.length}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[400px] sm:max-h-[500px] space-y-3 sm:space-y-4">
              {order.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-muted-foreground text-sm">No orders yet.</p>
              ) : (
                order.map((o) => {
                  const orderImageUrls = o.items
                    .map((item) => item.product?.image?.[0]?.url || item.image)
                    .filter(Boolean) as string[];

                  return (
                    <div
                      key={o._id}
                      className="flex flex-col border border-[#dee3e1] dark:border-border rounded-xl p-3 sm:p-4 hover:border-[#97cba9] dark:hover:border-primary transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="min-w-0 mr-2">
                          <p className="text-color dark:text-[#7aab8a]! font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                            {o._id}
                          </p>
                          <p className="text-[#6d7e78] dark:text-muted-foreground text-[10px] sm:text-xs">
                            {formattedOrderDate(o.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase flex-shrink-0 ${getStatusStyles(o.status)}`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1">
                        {o.items.map((item, idx) => {
                          const imageUrl = item.product?.image?.[0]?.url || item.image;
                          const urlIndex = orderImageUrls.indexOf(imageUrl);
                          return imageUrl ? (
                            <div
                              key={idx}
                              className="w-10 h-10 sm:w-12 sm:h-12 bg-background-light dark:bg-accent rounded-lg overflow-hidden relative flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#97cba9] dark:hover:ring-primary transition-all"
                              onClick={() => openZoom(orderImageUrls, urlIndex >= 0 ? urlIndex : 0, item.name || "Order Image")}
                              title={item.name}
                            >
                              <Image src={imageUrl} alt={item.name || "product"} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover object-center" />
                            </div>
                          ) : (
                            <div
                              key={idx}
                              className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                              title={`${item.name} (deleted)`}
                            >
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-muted-foreground" />
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-auto pt-2 sm:pt-3 border-t border-[#dee3e1] dark:border-border flex justify-between items-center">
                        <p className="text-color dark:text-[#7aab8a]! font-bold text-sm sm:text-base">
                          ${o.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[400px] sm:max-h-[500px] space-y-3 sm:space-y-4 bg-[#fcfcfc] dark:bg-background">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="group bg-white dark:bg-card rounded-xl p-3 sm:p-4 shadow-sm dark:shadow-none border border-gray-100 dark:border-border"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div
                          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border dark:border-border flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#97cba9] dark:hover:ring-primary transition-all"
                          onClick={() =>
                            openZoom(
                              [review.productId?.image?.[0]?.url || "/default.png"],
                              0,
                              review.productId?.product_name || "Product"
                            )
                          }
                        >
                          <Image
                            src={review.productId?.image?.[0]?.url || "/default.png"}
                            alt={review.productId?.product_name || "Product image"}
                            fill
                            sizes="(max-width: 640px) 32px, 40px"
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-xs sm:text-sm text-color dark:text-[#7aab8a]! truncate">
                            {review.userId
                              ? `${review.userId.firstName} ${review.userId.lastName?.[0]}.`
                              : "Deleted User"}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarOutlineIcon
                              key={i}
                              sx={{ fontSize: { xs: 14, sm: 18 } }}
                              className={i < review.rating ? "text-yellow-500" : "text-gray-300 dark:text-muted-foreground/40"}
                            />
                          ))}
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(review._id); }}
                          className="hidden md:flex items-center justify-center text-color dark:text-foreground cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110 ml-1"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-800 dark:text-foreground font-semibold mb-1 text-xs sm:text-sm truncate">
                      {review.productId?.product_name || "Unknown Product"}
                    </p>

                    <p
                      className="text-gray-600 dark:text-muted-foreground text-xs sm:text-sm leading-relaxed overflow-hidden"
                      style={{ wordBreak: "break-all", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}
                    >
                      {review.comment}
                    </p>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                      <button className="text-gray-400 dark:text-muted-foreground text-[10px] sm:text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer duration-300 ease-in-out hover:scale-102 active:scale-[0.97]">
                        <ThumbUp sx={{ fontSize: { xs: 12, sm: 14 } }} />
                        Helpful ({review.helpful?.length ?? 0})
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(review._id); }}
                        className="md:hidden flex items-center gap-1.5 text-[#393E46] dark:text-foreground text-xs font-semibold border border-[#A8D1B5] dark:border-border px-3 py-1.5 rounded-lg bg-secondary dark:bg-accent hover:bg-[#97cba9] dark:hover:bg-primary/80 transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ZoomModal ── */}
      {zoomImages.length > 0 && (
        <ZoomModal
          images={zoomImages}
          initialIndex={zoomIndex}
          label={zoomLabel}
          onClose={() => setZoomImages([])}
        />
      )}
    </>
  );
};

export default UserDetails;