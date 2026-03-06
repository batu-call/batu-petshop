"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirm } from "@/app/Context/confirmContext";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export type Admin = {
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

export const useAdminList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirm } = useConfirm();
  const { admin: currentAdmin } = useAdminAuth();

  const page = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [filteredAdmins, setFilteredAdmins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [localFilter, setLocalFilter] = useState({ search: searchParams.get("search") || "" });
  const [appliedFilter, setAppliedFilter] = useState(localFilter);

  const isFirstMount = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchParams.get("page")) router.replace("?page=1", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setLocalFilter({ search: urlSearch });
    setAppliedFilter({ search: urlSearch });
  }, [searchParams]);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const hasChanges = localFilter.search !== appliedFilter.search;
      if (!hasChanges) return;
      setAppliedFilter(localFilter);
      const params = new URLSearchParams({ page: "1", sortBy, sortOrder });
      if (localFilter.search) params.set("search", localFilter.search);
      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [localFilter, appliedFilter, sortBy, sortOrder, router]);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, sortBy, sortOrder };
        if (appliedFilter.search) params.search = appliedFilter.search;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/details`,
          { params, withCredentials: true },
        );
        if (res.data.success) {
          setAdmins(res.data.adminDetails);
          setTotalPages(res.data.totalPages || 1);
          setTotalAdmins(res.data.totalAdmins || 0);
          setFilteredAdmins(res.data.filteredAdmins || 0);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [page, appliedFilter.search, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Admin",
      description: "Are you sure you want to delete this admin?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setAdmins((prev) => prev.filter((a) => a._id !== id));
        setFilteredAdmins((prev) => prev - 1);
        setTotalAdmins((prev) => prev - 1);
        setSelectedAdmin(null);
        toast.success("Admin deleted");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete error");
    }
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : "desc";
    const params = new URLSearchParams({ page: "1", sortBy: field, sortOrder: newOrder });
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setLocalFilter({ search: "" });
    setAppliedFilter({ search: "" });
    const params = new URLSearchParams({ page: "1", sortBy, sortOrder });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = useMemo(() => appliedFilter.search !== "", [appliedFilter.search]);

  const goToPage = (p: number) => {
    const params = new URLSearchParams({ page: String(p), sortBy, sortOrder });
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;
  if (end >= totalPages) { end = totalPages - 1; start = Math.max(2, end - visibleCount + 1); }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return {
    admins, totalPages, totalAdmins, filteredAdmins, loading,
    selectedAdmin, setSelectedAdmin, showFilters, setShowFilters,
    localFilter, setLocalFilter, appliedFilter, hasActiveFilters,
    sortBy, sortOrder, page, pages, start, end,
    currentAdmin, handleDelete, handleSort, clearFilters, goToPage,
  };
};