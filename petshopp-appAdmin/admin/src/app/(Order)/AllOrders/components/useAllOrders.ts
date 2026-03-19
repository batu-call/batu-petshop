"use client";
import axios from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { OrdersType } from "./types";

export const useAllOrders = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orders, setOrders] = useState<OrdersType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAllOrders, setTotalAllOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstMount = useRef(true);

  const page = Number(searchParams.get("page")) || 1;

  const getInitialFilters = () => ({
    search: searchParams.get("search") || "",
    email: searchParams.get("email") || "",
    status: searchParams.get("status") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  const [localFilter, setLocalFilter] = useState(getInitialFilters);
  const [appliedFilter, setAppliedFilter] = useState(getInitialFilters);

  useEffect(() => {
    if (!searchParams.get("page")) {
      setPageReady(false);
      router.replace("?page=1", { scroll: false });
      return;
    }
    setPageReady(true);
    const newFilters = getInitialFilters();
    setLocalFilter(newFilters);
    setAppliedFilter(newFilters);
  }, [
    searchParams.get("page"),
    searchParams.get("search"),
    searchParams.get("email"),
    searchParams.get("status"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("startDate"),
    searchParams.get("endDate"),
  ]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);
      const params = new URLSearchParams();
      params.set("page", "1");
      if (localFilter.search.trim()) params.set("search", localFilter.search.trim());
      if (localFilter.email.trim()) params.set("email", localFilter.email.trim());
      if (localFilter.status) params.set("status", localFilter.status);
      if (localFilter.minPrice) params.set("minPrice", localFilter.minPrice);
      if (localFilter.maxPrice) params.set("maxPrice", localFilter.maxPrice);
      if (localFilter.startDate) params.set("startDate", localFilter.startDate);
      if (localFilter.endDate) params.set("endDate", localFilter.endDate);
      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [
    localFilter.search,
    localFilter.email,
    localFilter.status,
    localFilter.minPrice,
    localFilter.maxPrice,
    localFilter.startDate,
    localFilter.endDate,
    router,
  ]);

  const fetchOrders = useCallback(async () => {
    if (!pageReady) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const params: any = { page };
      if (appliedFilter.search.trim()) params.search = appliedFilter.search.trim();
      if (appliedFilter.email.trim()) params.email = appliedFilter.email.trim();
      if (appliedFilter.status) params.status = appliedFilter.status;
      if (appliedFilter.minPrice) params.minPrice = appliedFilter.minPrice;
      if (appliedFilter.maxPrice) params.maxPrice = appliedFilter.maxPrice;
      if (appliedFilter.startDate) params.startDate = appliedFilter.startDate;
      if (appliedFilter.endDate) params.endDate = appliedFilter.endDate;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/allOrders`,
        {
          params,
          withCredentials: true,
          signal: abortControllerRef.current.signal,
          timeout: 15000,
        },
      );
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalOrders(response.data.totalOrders || 0);
        setTotalAllOrders(response.data.totalAllOrders || 0);
      } else {
        setOrders([]);
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") return;
      setOrders([]);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to load orders");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred!");
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [
    pageReady,
    page,
    appliedFilter.search,
    appliedFilter.email,
    appliedFilter.status,
    appliedFilter.minPrice,
    appliedFilter.maxPrice,
    appliedFilter.startDate,
    appliedFilter.endDate,
  ]);

  useEffect(() => {
    fetchOrders();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchOrders]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      search: "",
      email: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
    };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  }, [router]);

  const hasActiveFilters = useCallback(
    () => Object.values(appliedFilter).some((v) => v !== ""),
    [appliedFilter],
  );

  const goToPage = useCallback(
    (p: number) => {
      if (p < 1 || p > totalPages) return;
      const params = new URLSearchParams();
      params.set("page", String(p));
      if (appliedFilter.search.trim()) params.set("search", appliedFilter.search.trim());
      if (appliedFilter.email.trim()) params.set("email", appliedFilter.email.trim());
      if (appliedFilter.status) params.set("status", appliedFilter.status);
      if (appliedFilter.minPrice) params.set("minPrice", appliedFilter.minPrice);
      if (appliedFilter.maxPrice) params.set("maxPrice", appliedFilter.maxPrice);
      if (appliedFilter.startDate) params.set("startDate", appliedFilter.startDate);
      if (appliedFilter.endDate) params.set("endDate", appliedFilter.endDate);
      router.push(`?${params.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, totalPages, appliedFilter],
  );

  const getPaginationPages = useCallback(() => {
    const visibleCount = 5;
    let start = Math.max(2, page - Math.floor(visibleCount / 2));
    let end = start + visibleCount - 1;
    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(2, end - visibleCount + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colors = {
      delivered: "bg-green-100 text-green-700 border-green-300",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      shipped: "bg-blue-100 text-blue-700 border-blue-300",
      paid: "bg-purple-100 text-purple-700 border-purple-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-300"
    );
  }, []);

  return {
    orders,
    totalPages,
    totalOrders,
    totalAllOrders,
    loading,
    expandedOrder,
    setExpandedOrder,
    showFilters,
    setShowFilters,
    initialLoad,
    page,
    localFilter,
    setLocalFilter,
    appliedFilter,
    clearFilters,
    hasActiveFilters,
    goToPage,
    getPaginationPages,
    formatDate,
    getStatusColor,
  };
};