"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Order, Stats, CARGO_COMPANIES, ITEMS_PER_PAGE } from "./types";
import { FileText, CreditCard, Package, Truck, CheckCircle } from "lucide-react";

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0, cancellation_requested: 0,
  });
  const [filter, setFilter] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Order | null>(null);
  const [shippingForm, setShippingForm] = useState({
    trackingNumber: "",
    cargoCompany: "UPS" as (typeof CARGO_COMPANIES)[number],
    estimatedDelivery: "",
  });
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/stats`, { withCredentials: true });
      if (res.data.success) {
        setStats({
          pending: res.data.data.pendingOrders || 0,
          paid: res.data.data.paidOrders || 0,
          shipped: res.data.data.shippedOrders || 0,
          delivered: res.data.data.completedOrders || 0,
          cancelled: res.data.data.cancelledOrders || 0,
          cancellation_requested: res.data.data.cancellationRequestedOrders || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (status: string, search: string, page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search && search.trim()) params.set("search", search.trim());
      params.set("page", String(page));
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/allOrders?${params.toString()}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setOrders(res.data.orders || res.data.order || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalOrders(res.data.totalOrders || 0);
      } else {
        setOrders([]); setTotalPages(1); setTotalOrders(0);
        toast.error(res.data.message || "Failed to load orders");
      }
    } catch (error) {
      setOrders([]); setTotalPages(1); setTotalOrders(0);
      if (axios.isAxiosError(error)) toast.error(error.response?.data?.message || "Failed to load orders");
      else toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(filter, debouncedSearch, currentPage); }, [filter, debouncedSearch, currentPage, fetchOrders]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleFilterChange = (status: string) => { setFilter(status); setCurrentPage(1); };

  const updateStatus = async (id: string, newStatus: string, trackingData?: typeof shippingForm) => {
    if (!id || !newStatus || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      const payload: Record<string, string> = { status: newStatus };
      if (newStatus === "shipped" && trackingData) {
        if (trackingData.trackingNumber) payload.trackingNumber = trackingData.trackingNumber;
        if (trackingData.cargoCompany) payload.cargoCompany = trackingData.cargoCompany;
        if (trackingData.estimatedDelivery) payload.estimatedDelivery = trackingData.estimatedDelivery;
      }
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/${id}/status`,
        payload,
        { withCredentials: true, timeout: 10000 },
      );
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) => prev.filter((o) => o._id !== id));
        setSelectedOrder(null);
        setShowShippingForm(false);
        setShippingForm({ trackingNumber: "", cargoCompany: "UPS", estimatedDelivery: "" });
        fetchStats();
        if (orders.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
        else fetchOrders(filter, debouncedSearch, currentPage);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) toast.error(error.response?.data?.message || "Failed to update order status");
      else toast.error("An unexpected error occurred");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateTracking = async (orderId: string) => {
    if (!shippingForm.trackingNumber || !shippingForm.cargoCompany) {
      toast.error("Tracking number and cargo company are required"); return;
    }
    try {
      setUpdatingTracking(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/${orderId}/tracking`,
        shippingForm,
        { withCredentials: true, timeout: 10000 },
      );
      if (res.data.success) {
        toast.success("Tracking information updated!");
        setSelectedTracking((prev) => prev ? { ...prev, tracking: res.data.order.tracking } : prev);
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, tracking: res.data.order.tracking } : o));
        setShowShippingForm(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) toast.error(error.response?.data?.message || "Failed to update tracking");
      else toast.error("An unexpected error occurred");
    } finally {
      setUpdatingTracking(false);
    }
  };

  const openTrackingModal = (order: Order) => {
    setSelectedTracking(order);
    setShippingForm({
      trackingNumber: order.tracking?.trackingNumber || "",
      cargoCompany: (order.tracking?.cargoCompany as (typeof CARGO_COMPANIES)[number]) || "UPS",
      estimatedDelivery: order.tracking?.estimatedDelivery
        ? new Date(order.tracking.estimatedDelivery).toISOString().split("T")[0] : "",
    });
    setTrackingModalOpen(true);
  };

  const getPageNumbers = () => {
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const range: number[] = [];
    for (let i = left; i <= right; i++) range.push(i);
    if (left > 1) { range.unshift(-1); range.unshift(1); }
    if (right < totalPages) { range.push(-2); range.push(totalPages); }
    return range;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return "Invalid Date"; }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSubtotal = (order: Order) =>
    order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getTrackingSteps = (order: Order) => [
    { label: "Order Placed", completed: true, date: formatDate(order.createdAt), icon: FileText },
    { label: "Payment Confirmed", completed: order.status !== "pending", date: order.updatedAt ? formatDate(order.updatedAt) : "", icon: CreditCard },
    { label: "Processing", completed: ["shipped", "delivered"].includes(order.status), date: "", icon: Package },
    { label: "Shipped", completed: ["shipped", "delivered"].includes(order.status), date: order.tracking?.shippedAt ? formatDate(order.tracking.shippedAt) : "", icon: Truck },
    { label: "Delivered", completed: order.status === "delivered", date: "", icon: CheckCircle },
  ];

  return {
    orders, loading, statsLoading, stats, filter, selectedOrder, setSelectedOrder,
    updatingStatus, searchQuery, setSearchQuery, debouncedSearch, trackingModalOpen,
    setTrackingModalOpen, selectedTracking, setSelectedTracking, shippingForm, setShippingForm,
    showShippingForm, setShowShippingForm, updatingTracking, currentPage, setCurrentPage,
    totalPages, totalOrders, handleFilterChange, updateStatus, updateTracking, openTrackingModal,
    getPageNumbers, formatDate, getInitials, getSubtotal, getTrackingSteps,
  };
};