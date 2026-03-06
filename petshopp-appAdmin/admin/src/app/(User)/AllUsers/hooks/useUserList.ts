"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirm } from "@/app/Context/confirmContext";

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
  orderCount?: number;
  lastOrderAt?: string | null;
};

export const useUserList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirm } = useConfirm();

  const page = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
    minOrders: searchParams.get("minOrders") || "",
    maxOrders: searchParams.get("maxOrders") || "",
  });

  const [appliedFilter, setAppliedFilter] = useState(localFilter);

  const isFirstMount = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlMin = searchParams.get("minOrders") || "";
    const urlMax = searchParams.get("maxOrders") || "";
    setLocalFilter({ search: urlSearch, minOrders: urlMin, maxOrders: urlMax });
    setAppliedFilter({ search: urlSearch, minOrders: urlMin, maxOrders: urlMax });
  }, [searchParams]);

  // Optimized debounce with memoization
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Only update if there's actual change
      const hasChanges =
        localFilter.search !== appliedFilter.search ||
        localFilter.minOrders !== appliedFilter.minOrders ||
        localFilter.maxOrders !== appliedFilter.maxOrders;

      if (!hasChanges) return;

      setAppliedFilter(localFilter);

      // Build URL params more efficiently
      const params = new URLSearchParams({ page: "1", sortBy, sortOrder });
      if (localFilter.search) params.set("search", localFilter.search);
      if (localFilter.minOrders) params.set("minOrders", localFilter.minOrders);
      if (localFilter.maxOrders) params.set("maxOrders", localFilter.maxOrders);
      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localFilter, appliedFilter, sortBy, sortOrder, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, sortBy, sortOrder };
        if (appliedFilter.search) params.search = appliedFilter.search;
        if (appliedFilter.minOrders) params.minOrders = appliedFilter.minOrders;
        if (appliedFilter.maxOrders) params.maxOrders = appliedFilter.maxOrders;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users`,
          { params, withCredentials: true },
        );

        if (res.data.success) {
          setUsers(res.data.users || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalUsers(res.data.totalUsers || 0);
          setFilteredUsers(res.data.filteredUsers || 0);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, appliedFilter.search, appliedFilter.minOrders, appliedFilter.maxOrders, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete User",
      description: "Are you sure you want to delete this user?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/admin/${id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setFilteredUsers((prev) => prev - 1);
        setTotalUsers((prev) => prev - 1);
        toast.success("User deleted");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete error");
    }
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : "desc";
    const params = new URLSearchParams({ page: "1", sortBy: field, sortOrder: newOrder });
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.minOrders) params.set("minOrders", appliedFilter.minOrders);
    if (appliedFilter.maxOrders) params.set("maxOrders", appliedFilter.maxOrders);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const empty = { search: "", minOrders: "", maxOrders: "" };
    setLocalFilter(empty);
    setAppliedFilter(empty);
    const params = new URLSearchParams({ page: "1", sortBy, sortOrder });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = useMemo(
    () => Object.values(appliedFilter).some((v) => v !== ""),
    [appliedFilter],
  );

  const goToPage = (p: number) => {
    const params = new URLSearchParams({ page: String(p), sortBy, sortOrder });
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.minOrders) params.set("minOrders", appliedFilter.minOrders);
    if (appliedFilter.maxOrders) params.set("maxOrders", appliedFilter.maxOrders);
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    page,
    sortBy,
    sortOrder,
    users,
    totalPages,
    totalUsers,
    filteredUsers,
    loading,
    localFilter,
    setLocalFilter,
    appliedFilter,
    hasActiveFilters,
    handleDelete,
    handleSort,
    clearFilters,
    goToPage,
  };
};