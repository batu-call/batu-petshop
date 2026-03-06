"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CircularText from "@/components/CircularText";
import Footer from "@/app/Footer/page";
import {
  Search,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  MapPin,
  ShoppingBag,
  AlertCircle,
  ExternalLink,
  FileText,
  CreditCard,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

type OrderItems = {
  product:
    | string
    | { _id: string; product_name: string; image: { url: string }[] };
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

type OrderUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type OrderTracking = {
  trackingNumber?: string;
  cargoCompany?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
};

export type OrdersType = {
  _id: string;
  user: OrderUser | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  couponCode?: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "cancellation_requested";
  createdAt: string;
  updatedAt?: string;
  tracking?: OrderTracking;
};

const Orders = () => {
  const [orders, setOrders] = useState<OrdersType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<OrdersType | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/meOrders`,
          { withCredentials: true },
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Processing", icon: Clock },
      paid: { color: "text-[#97cba9] dark:text-[#7aab8a]", bg: "bg-[#97cba9]/10 dark:bg-[#2d5a3d]/40", label: "Paid", icon: CheckCircle },
      shipped: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Shipped", icon: Truck },
      delivered: { color: "text-[#97cba9] dark:text-[#7aab8a]", bg: "bg-[#97cba9]/10 dark:bg-[#2d5a3d]/40", label: "Delivered", icon: Package },
      cancelled: { color: "text-gray-500 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-700/40", label: "Cancelled", icon: XCircle },
      cancellation_requested: { color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", label: "Cancel Requested", icon: AlertCircle },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getOrderStats = () => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  });

  const stats = getOrderStats();

  const handleCancelOrder = async () => {
    if (!selectedOrderId || !cancelReason) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/${selectedOrderId}/cancel-request`,
        { reason: cancelReason },
        { withCredentials: true },
      );
      setOrders(orders.map((order) =>
        order._id === selectedOrderId
          ? { ...order, status: "cancellation_requested" as const }
          : order,
      ));
      setCancelModalOpen(false);
      setSelectedOrderId(null);
      setCancelReason("");
      toast.success("Cancellation request sent!");
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast.error("Failed to send cancellation request");
    }
  };

  const openCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelModalOpen(true);
  };

  const openTrackingModal = (order: OrdersType) => {
    setSelectedTrackingOrder(order);
    setTrackingModalOpen(true);
  };

  const getTrackingSteps = (order: OrdersType) => [
    { label: "Order Placed", completed: true, date: formatDate(order.createdAt), icon: FileText },
    { label: "Payment Confirmed", completed: order.status !== "pending", date: "", icon: CreditCard },
    { label: "Processing", completed: ["shipped", "delivered"].includes(order.status), date: "", icon: Package },
    { label: "Shipped", completed: ["shipped", "delivered"].includes(order.status), date: order.tracking?.shippedAt ? formatDate(order.tracking.shippedAt) : "", icon: Truck },
    { label: "Delivered", completed: order.status === "delivered", date: "", icon: CheckCircle },
  ];

  const getSubtotal = (order: OrdersType) => {
    return order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const hasDiscount = (order: OrdersType) =>
    (order.discountAmount ?? 0) > 0 || (order.couponCode ?? "") !== "";

  if (loading) {
    return (
      <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-[#97cba9] dark:bg-[#0E5F44] z-50">
        <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#97cba9]/5 dark:from-[#0d1f18] dark:via-[#0d1f18] dark:to-[#162820]">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-[#c8e6d0] mb-2">My Orders</h1>
            <p className="text-gray-600 dark:text-[#7aab8a] text-lg">Track and manage your recent purchases</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-[#162820] rounded-xl p-5 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-gray-500 dark:text-[#7aab8a] uppercase tracking-wider mb-1">Total Orders</p>
              <p className="text-3xl font-black text-gray-900 dark:text-[#c8e6d0]">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-[#162820] rounded-xl p-5 border border-amber-200 dark:border-amber-800/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Processing</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </div>
            <div className="bg-white dark:bg-[#162820] rounded-xl p-5 border border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Shipped</p>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.shipped}</p>
            </div>
            <div className="bg-white dark:bg-[#162820] rounded-xl p-5 border border-[#97cba9] dark:border-[#2d5a3d] shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-[#97cba9] dark:text-[#7aab8a] uppercase tracking-wider mb-1">Delivered</p>
              <p className="text-3xl font-black text-[#97cba9] dark:text-[#7aab8a]">{stats.delivered}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-[#162820] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#7aab8a]" />
                <input
                  type="text"
                  placeholder="Search orders or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                      filterStatus === status
                        ? "bg-[#97cba9] dark:bg-[#0b8457] text-white shadow-md"
                        : "bg-gray-100 dark:bg-[#1e3d2a] text-gray-600 dark:text-[#7aab8a] hover:bg-gray-200 dark:hover:bg-[#2d5a3d]"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#162820] rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10">
              <div className="w-32 h-32 bg-gray-100 dark:bg-[#1e3d2a] rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-[#7aab8a]" />
              </div>
              <p className="text-gray-900 dark:text-[#c8e6d0] text-xl font-bold mb-2">
                {searchQuery || filterStatus !== "all" ? "No orders found" : "No orders yet"}
              </p>
              <p className="text-gray-500 dark:text-[#7aab8a] text-sm mb-8 max-w-md text-center">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start shopping to see your orders here"}
              </p>
              {searchQuery === "" && filterStatus === "all" && (
                <a
                  href="/AllProduct"
                  className="px-8 py-3 bg-[#97cba9] dark:bg-[#0b8457] text-white text-sm font-bold rounded-lg hover:bg-[#7fb894] dark:hover:bg-[#2d5a3d] transition-colors shadow-md hover:shadow-lg"
                >
                  Browse Products
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const isExpanded = expandedOrder === order._id;

                return (
                  <div
                    key={order._id}
                    className="bg-white dark:bg-[#162820] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden transition-all hover:shadow-lg hover:border-[#97cba9]/30 dark:hover:border-[#2d5a3d]"
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-[#1e3d2a] dark:to-[#162820] px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10">
                      <div className="flex gap-8 flex-wrap">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-[#7aab8a] mb-1">Order Placed</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-[#c8e6d0]">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-[#7aab8a] mb-1">Total Amount</p>
                          <p className="text-sm font-bold text-[#97cba9] dark:text-[#7aab8a]">${order.totalAmount.toFixed(2)}</p>
                        </div>
                        {hasDiscount(order) && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-[#7aab8a] mb-1">Discount</p>
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-[#97cba9] dark:text-[#7aab8a]" />
                              <p className="text-sm font-bold text-[#97cba9] dark:text-[#7aab8a]">
                                -${(order.discountAmount ?? 0).toFixed(2)}
                                {order.couponCode && (
                                  <span className="ml-1.5 text-xs bg-green-100 dark:bg-[#2d5a3d] text-[#97cba9] dark:text-[#7aab8a] px-1.5 py-0.5 rounded font-semibold">
                                    {order.couponCode}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="hidden sm:block">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-[#7aab8a] mb-1">Ship To</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-[#c8e6d0]">{order.shippingAddress.fullName}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-[#7aab8a] mb-1">Items</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-[#c8e6d0]">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-[#7aab8a]">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <button
                          onClick={() => toggleOrder(order._id)}
                          className="flex items-center gap-1.5 text-sm font-bold text-[#97cba9] dark:text-[#7aab8a] hover:text-[#7fb894] dark:hover:text-[#c8e6d0] transition-colors group"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                          <ChevronDown className={`w-4 h-4 transition-transform group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Status & Actions */}
                      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/10 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-lg ${statusConfig.bg} flex items-center gap-2`}>
                            <statusConfig.icon className={`w-5 h-5 ${statusConfig.color}`} />
                            <span className={`text-sm font-bold uppercase tracking-wide ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          {order.status === "shipped" && (
                            <button
                              onClick={() => openTrackingModal(order)}
                              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
                            >
                              <Truck className="w-4 h-4" />
                              Track Package
                            </button>
                          )}
                        </div>
                        {(order.status === "pending" || order.status === "paid") && (
                          <button
                            onClick={() => openCancelModal(order._id)}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                          </button>
                        )}
                      </div>

                      {/* Items */}
                      <div className="space-y-4">
                        {order.items.map((item, idx) => {
                          const imageUrl =
                            typeof item.product !== "string" && item.product?.image?.[0]?.url
                              ? item.product.image[0].url
                              : item.image || "/default-product.png";
                          return (
                            <div
                              key={idx}
                              className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#0d1f18] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] transition-colors border border-gray-100 dark:border-white/10"
                            >
                              <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-white dark:bg-[#162820] border border-gray-200 dark:border-white/10 shadow-sm">
                                <Image src={imageUrl} alt={item.name} fill sizes="96px" className="object-cover" unoptimized />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-[#c8e6d0] mb-1.5 line-clamp-2">{item.name}</h4>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600 dark:text-[#7aab8a]">Qty: <span className="font-bold text-gray-900 dark:text-[#c8e6d0]">{item.quantity}</span></span>
                                  <span className="text-gray-300 dark:text-white/20">•</span>
                                  <span className="font-bold text-[#97cba9] dark:text-[#7aab8a]">${item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-[#7aab8a]/70 mt-2">
                                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-100 dark:border-white/10 space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-[#1e3d2a] dark:to-[#162820] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#97cba9]/10 dark:bg-[#2d5a3d]/40 rounded-lg flex items-center justify-center">
                                  <User className="w-5 h-5 text-[#97cba9] dark:text-[#7aab8a]" />
                                </div>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-[#a8d4b8]">Customer Information</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 dark:text-[#7aab8a] min-w-[60px]">Name:</span>
                                  <span className="font-semibold text-gray-900 dark:text-[#c8e6d0]">
                                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 dark:text-[#7aab8a] min-w-[60px]">Email:</span>
                                  <span className="font-semibold text-gray-900 dark:text-[#c8e6d0] break-all">{order.user?.email || "N/A"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-[#1e3d2a] dark:to-[#162820] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#97cba9]/10 dark:bg-[#2d5a3d]/40 rounded-lg flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-[#97cba9] dark:text-[#7aab8a]" />
                                </div>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-[#a8d4b8]">Shipping Address</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p className="font-semibold text-gray-900 dark:text-[#c8e6d0]">{order.shippingAddress.fullName}</p>
                                <p className="text-gray-600 dark:text-[#7aab8a] leading-relaxed">{order.shippingAddress.address}</p>
                                <p className="text-gray-600 dark:text-[#7aab8a]">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p className="text-gray-500 dark:text-[#7aab8a]/70 text-xs">Email: {order.shippingAddress.email}</p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                                  <PhoneInput
                                    country={"us"}
                                    value={order.shippingAddress.phoneNumber}
                                    buttonStyle={{ border: "none", background: "transparent" }}
                                    inputStyle={{ border: "none", background: "transparent", fontSize: "14px", fontWeight: "600", color: "inherit" }}
                                    dropdownStyle={{ borderRadius: "8px" }}
                                    inputProps={{ readOnly: true }}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-[#1e3d2a] dark:to-[#162820] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-[#a8d4b8] mb-4">Order Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-[#7aab8a]">Subtotal</span>
                                <span className="font-semibold text-gray-900 dark:text-[#c8e6d0]">${getSubtotal(order).toFixed(2)}</span>
                              </div>
                              {hasDiscount(order) && (
                                <div className="flex justify-between text-green-600 dark:text-[#7aab8a]">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <Tag className="w-3.5 h-3.5" />
                                    Discount{order.couponCode && ` (${order.couponCode})`}
                                  </span>
                                  <span className="font-bold">-${(order.discountAmount ?? 0).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-[#7aab8a]">Shipping</span>
                                <span className="font-semibold text-gray-900 dark:text-[#c8e6d0]">
                                  {(order.shippingFee ?? 0) === 0 ? "Free" : `$${(order.shippingFee ?? 0).toFixed(2)}`}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-white/10">
                                <span className="font-bold text-gray-900 dark:text-[#c8e6d0]">Total</span>
                                <span className="font-black text-[#97cba9] dark:text-[#7aab8a] text-base">${order.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162820] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0]">Cancel Order</h3>
                <p className="text-sm text-gray-500 dark:text-[#7aab8a]">Order #{selectedOrderId?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-[#a8d4b8] mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">Reason for cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you're cancelling..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setCancelModalOpen(false); setSelectedOrderId(null); setCancelReason(""); }}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#1e3d2a] text-gray-700 dark:text-[#a8d4b8] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-[#2d5a3d] transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOpen && selectedTrackingOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setTrackingModalOpen(false); setSelectedTrackingOrder(null); }}
        >
          <div className="bg-white dark:bg-[#162820] rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0]">Track Your Package</h3>
                  <p className="text-sm text-gray-500 dark:text-[#7aab8a]">Order #{selectedTrackingOrder._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => { setTrackingModalOpen(false); setSelectedTrackingOrder(null); }}
                className="text-gray-400 dark:text-[#7aab8a] hover:text-gray-600 dark:hover:text-[#c8e6d0] transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {selectedTrackingOrder.tracking?.trackingNumber ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                      {selectedTrackingOrder.tracking.cargoCompany} Tracking Number
                    </p>
                    <p className="text-lg font-black text-blue-900 dark:text-blue-300 font-mono">{selectedTrackingOrder.tracking.trackingNumber}</p>
                    {selectedTrackingOrder.tracking.estimatedDelivery && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Estimated Delivery: <span className="font-bold">{formatDate(selectedTrackingOrder.tracking.estimatedDelivery)}</span>
                      </p>
                    )}
                  </div>
                  {selectedTrackingOrder.tracking.trackingUrl && (
                    <a
                      href={selectedTrackingOrder.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e3d2a] text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-[#2d5a3d] transition-colors border border-blue-200 dark:border-blue-800/50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track on {selectedTrackingOrder.tracking.cargoCompany}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Tracking information will be available soon.</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Your package has been picked up and is being processed.</p>
              </div>
            )}

            <div className="space-y-4">
              {getTrackingSteps(selectedTrackingOrder).map((step, idx) => {
                const StepIcon = step.icon;
                const steps = getTrackingSteps(selectedTrackingOrder);
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? "bg-[#97cba9] dark:bg-[#0b8457] text-white" : "bg-gray-200 dark:bg-[#1e3d2a] text-gray-400 dark:text-[#7aab8a]"}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.completed ? "bg-[#97cba9] dark:bg-[#0b8457]" : "bg-gray-200 dark:bg-[#1e3d2a]"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className={`font-bold ${step.completed ? "text-gray-900 dark:text-[#c8e6d0]" : "text-gray-400 dark:text-[#7aab8a]/50"}`}>{step.label}</h4>
                      {step.date && <p className="text-sm text-gray-500 dark:text-[#7aab8a]">{step.date}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTrackingOrder.tracking?.estimatedDelivery && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="bg-gray-50 dark:bg-[#1e3d2a] rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 dark:text-[#c8e6d0] mb-1">Estimated Delivery</h4>
                  <p className="text-2xl font-black text-[#97cba9] dark:text-[#7aab8a]">
                    {formatDate(selectedTrackingOrder.tracking.estimatedDelivery)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Orders;