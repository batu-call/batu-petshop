"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirm } from "@/app/Context/confirmContext";

export type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date?: string;
  status?: "New" | "Read" | "Replied";
  avatar?: string | null;
  initials?: string;
  userId?: string | null;
};

export type ReplyPanel = {
  isOpen: boolean;
  message: Message | null;
  replyText: string;
  sending: boolean;
};

export const useMessages = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirm } = useConfirm();

  const page = Number(searchParams.get("page")) || 1;

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMessage, setOpenMessage] = useState<Message | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [replyPanel, setReplyPanel] = useState<ReplyPanel>({
    isOpen: false,
    message: null,
    replyText: "",
    sending: false,
  });

  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  });

  const [appliedFilter, setAppliedFilter] = useState(localFilter);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);
      const params = new URLSearchParams();
      params.set("page", "1");
      if (localFilter.search) params.set("search", localFilter.search);
      if (localFilter.status) params.set("status", localFilter.status);
      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [localFilter, router]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const params: any = { page };
        if (appliedFilter.search) params.search = appliedFilter.search;
        if (appliedFilter.status) params.status = appliedFilter.status;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/`,
          { params, withCredentials: true },
        );

        if (response.data.success) {
          const data = response.data.messages.map((msg: any) => ({
            id: msg.id,
            name: msg.name,
            email: msg.email,
            subject: msg.subject,
            message: msg.message,
            date: msg.date,
            status: msg.status,
            avatar: msg.avatar,
            initials: msg.initials,
            userId: msg.userId,
          }));
          setMessages(data);
          setTotalPages(response.data.totalPages || 1);
          setTotalMessages(response.data.totalMessages || 0);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [page, appliedFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split(".");
    if (parts.length !== 3) return dateStr;
    const [day, month, year] = parts;
    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const getStatusBadge = (dateStr?: string, status?: "New" | "Read" | "Replied") => {
    // If status is explicitly "New", show "New" badge
    if (status === "New") return { text: "New", isNew: true };
    if (!dateStr) return { text: "New", isNew: true };

    let parsedDate: Date;
    if (dateStr.includes(".")) {
      const [day, month, year] = dateStr.split(".");
      parsedDate = new Date(`${year}-${month}-${day}`);
    } else if (dateStr.includes("/")) {
      parsedDate = new Date(dateStr);
    } else {
      return { text: "New", isNew: true };
    }

    if (isNaN(parsedDate.getTime())) return { text: "New", isNew: true };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messageDate = new Date(parsedDate);
    messageDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    // Days ago logic - only show if NOT "New" status
    if (diffDays === 0) return { text: "Today", isNew: false };
    if (diffDays === 1) return { text: "1 day ago", isNew: false };
    if (diffDays < 7) return { text: `${diffDays} days ago`, isNew: false };
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return { text: weeks === 1 ? "1 week ago" : `${weeks} weeks ago`, isNew: false };
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return { text: months === 1 ? "1 month ago" : `${months} months ago`, isNew: false };
    }
    const years = Math.floor(diffDays / 365);
    return { text: years === 1 ? "1 year ago" : `${years} years ago`, isNew: false };
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === messages.length
        ? new Set()
        : new Set(messages.map((msg) => msg.id)),
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return alert("Select at least one message.");
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/${id}`,
            { withCredentials: true },
          ),
        ),
      );
      setMessages((prev) => prev.filter((msg) => !selectedIds.has(msg.id)));
      setSelectedIds(new Set());
      toast.success("Selected messages deleted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete selected messages");
    }
  };

  const updateMessageStatus = async (id: number, newStatus: "New" | "Read" | "Replied") => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/${id}/status`,
        { status: newStatus },
        { withCredentials: true },
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg)),
        );

        // Don't show toast for automatic status updates
        if (newStatus !== "Read") {
          toast.success(`Status updated to ${newStatus}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update status");
    }
  };

  const clearFilters = () => {
    const emptyFilters = { search: "", status: "" };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  };

  const hasActiveFilters = () => Object.values(appliedFilter).some((v) => v !== "");

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.status) params.set("status", appliedFilter.status);
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-mark as read when opening message
  const handleOpenMessage = (msg: Message) => {
    setOpenMessage(msg);
    if (msg.status === "New") {
      updateMessageStatus(msg.id, "Read");
    }
  };

  const handleSendReply = async () => {
    if (!replyPanel.replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setReplyPanel({ ...replyPanel, sending: true });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/${replyPanel.message?.id}/reply`,
        { replyMessage: replyPanel.replyText },
        { withCredentials: true },
      );

      toast.success("Email sent successfully! ✉️");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === replyPanel.message?.id ? { ...msg, status: "Replied" } : msg,
        ),
      );

      setReplyPanel({ isOpen: false, message: null, replyText: "", sending: false });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to send email");
      setReplyPanel({ ...replyPanel, sending: false });
    }
  };

  const closeReplyPanel = () =>
    setReplyPanel({ isOpen: false, message: null, replyText: "", sending: false });

  return {
    page,
    messages,
    selectedIds,
    openMessage,
    setOpenMessage,
    totalPages,
    totalMessages,
    loading,
    replyPanel,
    setReplyPanel,
    localFilter,
    setLocalFilter,
    appliedFilter,
    confirm,
    formatDate,
    getStatusBadge,
    toggleSelect,
    toggleSelectAll,
    handleDeleteSelected,
    updateMessageStatus,
    clearFilters,
    hasActiveFilters,
    goToPage,
    handleOpenMessage,
    handleSendReply,
    closeReplyPanel,
  };
};