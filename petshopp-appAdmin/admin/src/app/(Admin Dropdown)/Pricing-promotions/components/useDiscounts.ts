"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirm } from "@/app/Context/confirmContext";

export type Discount = {
  _id: string;
  code: string;
  percent: number;
  minAmount: number;
  usageCount?: number;
  expiryDate?: string;
  status?: "active" | "expired" | "scheduled";
  createdAt?: string;
};

export const PAGE_SIZE = 8;

export const useDiscounts = () => {
  const { confirm } = useConfirm();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [discountType, setDiscountType] = useState("percentage");

  const [shippingFee, setShippingFee] = useState("");
  const [freeOver, setFreeOver] = useState("");
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [discountLoading, setDiscountLoading] = useState(true);
  const [shippingLoading, setShippingLoading] = useState(true);

  const loading = discountLoading || shippingLoading;

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon`, {
        withCredentials: true,
      });
      const sorted = (res.data.data || []).sort(
        (a: Discount, b: Discount) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
      setDiscounts(sorted);
    } catch {
      toast.error("Failed to load discount codes");
    } finally {
      setDiscountLoading(false);
    }
  };

  const fetchShippingSettings = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setShippingFee(String(res.data.data.fee));
        setFreeOver(String(res.data.data.freeOver));
      }
    } catch {
      toast.error("Failed to load shipping settings");
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchShippingSettings();
  }, []);

  const createDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !percent) { toast.error("Please fill required fields"); return; }
    const percentValue = Number(percent);
    const minAmountValue = minAmount ? Number(minAmount) : 0;
    if (percentValue <= 0 || percentValue > 100) { toast.error("Discount percent must be between 1 and 100"); return; }
    if (minAmountValue < 0) { toast.error("Minimum amount cannot be negative"); return; }
    const exists = discounts.find((d) => d.code.toLowerCase() === code.toLowerCase());
    if (exists) { toast.error("This discount code already exists!"); return; }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon`,
        {
          code: code.trim().toUpperCase(),
          percent: percentValue,
          minAmount: minAmountValue > 0 ? minAmountValue : undefined,
          expiryDate: expiryDate || undefined,
        },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success("Discount code created!");
        handleReset();
        fetchDiscounts();
        setCurrentPage(1);
      }
    } catch {
      toast.error("Failed to create discount");
    }
  };

  const deleteDiscount = async (id: string, couponCode: string) => {
    const ok = await confirm({
      title: "Delete Discount Code",
      description: `Are you sure you want to delete the code "${couponCode}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/${id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success("Deleted!");
        fetchDiscounts();
        setCurrentPage((prev) => {
          const newTotal = discounts.length - 1;
          const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
          return Math.min(prev, maxPage);
        });
      }
    } catch {
      toast.error("Failed to delete discount");
    }
  };

  const updateShipping = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`,
        { fee: Number(shippingFee), freeOver: Number(freeOver) },
        { withCredentials: true },
      );
      if (res.data.success) toast.success("Shipping settings updated!");
    } catch {
      toast.error("Failed to update shipping settings");
    }
  };

  const handleReset = () => {
    setCode("");
    setPercent("");
    setMinAmount("");
    setExpiryDate("");
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filteredDiscounts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedDiscounts = filteredDiscounts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = {
    activeDiscounts: discounts.filter((d) => d.status !== "expired").length,
    totalUsage: discounts.reduce((sum, d) => sum + (d.usageCount || 0), 0),
    avgDiscount:
      discounts.length > 0
        ? (discounts.reduce((sum, d) => sum + d.percent, 0) / discounts.length).toFixed(1)
        : "0.0",
    expiringSoon: discounts.filter((d) => {
      if (!d.expiryDate) return false;
      const days = Math.floor(
        (new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return days >= 0 && days <= 7;
    }).length,
  };

  return {
    loading,
    discounts,
    code, setCode,
    percent, setPercent,
    minAmount, setMinAmount,
    expiryDate, setExpiryDate,
    discountType, setDiscountType,
    shippingFee, setShippingFee,
    freeOver, setFreeOver,
    freeShippingEnabled, setFreeShippingEnabled,
    searchQuery,
    currentPage, setCurrentPage,
    filteredDiscounts, totalPages, safePage, pagedDiscounts,
    stats,
    createDiscount, deleteDiscount, updateShipping, handleReset, handleSearch,
  };
};