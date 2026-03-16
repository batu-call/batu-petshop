"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  Send,
  Mail,
  Sparkles,
  MessageSquare,
  Users,
  X,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  UserCheck,
  Globe,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";

type NotificationType =
  | "emailNotifications"
  | "systemAlerts"
  | "newsletter"
  | "all";
type SendMode = "bulk" | "targeted";

interface NotificationOption {
  value: NotificationType;
  label: string;
  description: string;
  icon: JSX.Element;
  count: number;
  color: string;
}

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  notificationSettings?: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    newsletter: boolean;
  };
}

interface MailHistoryItem {
  _id: string;
  subject: string;
  message: string;
  notificationType?: string;
  sentCount: number;
  failedCount: number;
  mode: "bulk" | "targeted";
  sentBy?: { firstName: string; lastName: string };
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const NotificationsPage = () => {
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sendMode, setSendMode] = useState<SendMode>("bulk");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    notificationType: "systemAlerts" as NotificationType,
  });

  const [stats, setStats] = useState({
    emailNotifications: 0,
    systemAlerts: 0,
    newsletter: 0,
    all: 0,
  });

  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [mailHistory, setMailHistory] = useState<MailHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPanelOpen]);

  useEffect(() => {
    fetchNotificationStats();
    fetchAllUsers();
    fetchMailHistory(1);
  }, []);

  const fetchNotificationStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/stats`,
        { withCredentials: true },
      );
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch {
      console.error("Failed to fetch stats");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users`,
        { withCredentials: true },
      );
      if (response.data.success) {
        setAllUsers(response.data.users);
      }
    } catch {
      console.error("Failed to fetch users");
    }
  };

  const fetchMailHistory = async (page: number) => {
    setHistoryLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/history?page=${page}&limit=10`,
        { withCredentials: true },
      );
      if (response.data.success) {
        setMailHistory(response.data.history);
        setPagination(response.data.pagination);
      }
    } catch {
      console.error("Failed to fetch mail history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const ok = await confirm({
      title: "Delete this record?",
      description:
        "This email history entry will be permanently deleted. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/history/${id}`,
        { withCredentials: true },
      );
      toast.success("Deleted successfully");
      fetchMailHistory(pagination.page);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSend = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (sendMode === "targeted" && selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (sendMode === "bulk") {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/bulk-email`,
          formData,
          { withCredentials: true },
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/send-to-users`,
          {
            userIds: selectedUserIds,
            subject: formData.subject,
            message: formData.message,
          },
          { withCredentials: true },
        );
      }

      if (response.data.success) {
        toast.success(
          `Email sent to ${response.data.sentCount} users successfully!`,
        );
        setFormData({
          subject: "",
          message: "",
          notificationType: "systemAlerts",
        });
        setSelectedUserIds([]);
        setIsPanelOpen(false);
        fetchNotificationStats();
        fetchAllUsers();
        fetchMailHistory(1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send emails");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const notificationOptions: NotificationOption[] = [
    {
      value: "all",
      label: "All Users",
      description: "Send to every registered user",
      icon: <Users className="w-5 h-5" />,
      count: stats.all,
      color: "bg-gray-700",
    },
    {
      value: "emailNotifications",
      label: "Order & Shipping",
      description: "Users who opted in for order and shipping updates",
      icon: <Mail className="w-5 h-5" />,
      count: stats.emailNotifications,
      color: "bg-blue-500",
    },
    {
      value: "systemAlerts",
      label: "System & Promotions",
      description: "Users who want system updates and promotions",
      icon: <Sparkles className="w-5 h-5" />,
      count: stats.systemAlerts,
      color: "bg-purple-500",
    },
    {
      value: "newsletter",
      label: "Newsletter",
      description: "Users subscribed to newsletters",
      icon: <MessageSquare className="w-5 h-5" />,
      count: stats.newsletter,
      color: "bg-green-500",
    },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const notifTypeLabel: Record<string, string> = {
    all: "All Users",
    emailNotifications: "Order & Shipping",
    systemAlerts: "System Alerts",
    newsletter: "Newsletter",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#97cba9]/5 dark:from-[#0d1f18] dark:via-[#0f2318] dark:to-[#162820] p-4 md:p-6">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100] backdrop-blur-sm">
          <CircularText
            text="SENDING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-[#c8e6d0] mb-1 flex items-center gap-3">
            <Send className="w-7 h-7 md:w-10 md:h-10 text-[#97cba9] shrink-0" />
            Notifications Center
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-[#7aab8a]">
            Manage and send email notifications to your users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          {notificationOptions.map((option) => (
            <div
              key={option.value}
              className="bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                setFormData({ ...formData, notificationType: option.value });
                setSendMode("bulk");
                setIsPanelOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${option.color} p-2.5 rounded-lg text-white`}>
                  {option.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#c8e6d0]">
                    {option.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[#7aab8a]">
                    users
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-[#c8e6d0] mb-1 group-hover:text-[#97cba9] transition-colors">
                {option.label}
              </h3>
              <div className="flex items-center text-[#97cba9] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                Send <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Compose Buttons */}
        <div className="bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm text-center mb-6">
          <div className="max-w-md mx-auto">
            <div className="bg-[#97cba9]/10 dark:bg-[#0b8457]/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 md:w-10 md:h-10 text-[#97cba9]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#c8e6d0] mb-2">
              Send Notification
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-[#7aab8a] mb-6">
              Send to everyone, a specific group, or select specific users
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => {
                  setSendMode("bulk");
                  setIsPanelOpen(true);
                }}
                className="px-5 py-3 rounded-lg bg-[#97cba9] dark:bg-[#0b8457] text-white font-bold text-sm hover:bg-[#7fb894] dark:hover:bg-[#0E5F44] transition-all shadow-lg flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Bulk Email
              </button>
              <button
                onClick={() => {
                  setSendMode("targeted");
                  setIsPanelOpen(true);
                }}
                className="px-5 py-3 rounded-lg border-2 border-[#97cba9] dark:border-[#0b8457] text-[#97cba9] dark:text-[#7aab8a] font-bold text-sm hover:bg-[#97cba9]/10 transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Select Users
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-5 md:p-6 shadow-sm mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#c8e6d0] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#97cba9]" />
            Subscription Overview
          </h3>
          <div className="space-y-3">
            {notificationOptions
              .filter((o) => o.value !== "all")
              .map((option) => {
                const total =
                  stats.emailNotifications +
                  stats.systemAlerts +
                  stats.newsletter;
                const percentage = total > 0 ? (option.count / total) * 100 : 0;
                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-3 md:gap-4"
                  >
                    <div
                      className={`${option.color} p-2 rounded-lg text-white shrink-0`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-[#c8e6d0] truncate mr-2">
                          {option.label}
                        </span>
                        <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-[#c8e6d0] shrink-0">
                          {option.count} users
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#1e3d2a] rounded-full h-2">
                        <div
                          className={`${option.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Mail History */}
        <div className="bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-5 md:p-6 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#c8e6d0] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#97cba9]" />
            Email History
            {pagination.total > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-[#7aab8a]">
                ({pagination.total} total)
              </span>
            )}
          </h3>

          {historyLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-[#7aab8a] text-sm">
              Loading history...
            </div>
          ) : mailHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-[#7aab8a] text-sm">
              No emails sent yet.
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {mailHistory.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1e3d2a] hover:bg-gray-100 dark:hover:bg-[#162820] transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 self-start ${
                        item.mode === "bulk"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {item.mode === "bulk" ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900 dark:text-[#c8e6d0] truncate">
                          {item.subject}
                        </span>
                        {item.notificationType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#97cba9]/20 dark:bg-[#0b8457]/30 text-[#0b8457] dark:text-[#97cba9] font-medium shrink-0">
                            {notifTypeLabel[item.notificationType] ||
                              item.notificationType}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            item.mode === "bulk"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {item.mode === "bulk" ? "Bulk" : "Targeted"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[#7aab8a] truncate mb-2">
                        {item.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-[#7aab8a]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                        {item.sentBy && (
                          <span>
                            by {item.sentBy.firstName} {item.sentBy.lastName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {item.sentCount}
                        </span>
                      </div>
                      {item.failedCount > 0 && (
                        <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-bold">
                            {item.failedCount}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteHistory(item._id)}
                        disabled={deletingId === item._id}
                        className="hidden md:flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-gray-400 dark:text-[#7aab8a] hover:text-white hover:bg-[#97cba9] dark:hover:bg-[#0b8457] transition-all duration-200 cursor-pointer ml-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
                  <p className="text-xs text-gray-500 dark:text-[#7aab8a]">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchMailHistory(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    )
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 1,
                      )
                      .reduce<(number | string)[]>((acc, p, idx, arr) => {
                        if (
                          idx > 0 &&
                          (p as number) - (arr[idx - 1] as number) > 1
                        )
                          acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`dots-${idx}`}
                            className="px-1 text-gray-400 dark:text-[#7aab8a] text-sm"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => fetchMailHistory(p as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                              pagination.page === p
                                ? "bg-[#97cba9] dark:bg-[#0b8457] text-white"
                                : "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a]"
                            }`}
                          >
                            {p}
                          </button>
                        ),
                      )}

                    <button
                      onClick={() => fetchMailHistory(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#7aab8a] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {isPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 h-screen w-full md:w-[560px] lg:w-[640px] bg-white dark:bg-[#162820] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-[#97cba9] to-[#7fb894] dark:from-[#0b8457] dark:to-[#0E5F44] p-4 md:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white">
                    Compose Email
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm">
                    {sendMode === "bulk"
                      ? "Send to a group of users"
                      : "Select specific users"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {/* Send Mode Toggle */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-3">
                  Send Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["bulk", "targeted"] as SendMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSendMode(mode)}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                        sendMode === mode
                          ? "border-[#97cba9] bg-[#97cba9]/10 dark:bg-[#0b8457]/20 text-[#0b8457] dark:text-[#97cba9]"
                          : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#7aab8a] hover:border-gray-300"
                      }`}
                    >
                      {mode === "bulk" ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      {mode === "bulk" ? "Bulk Email" : "Select Users"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-white/10" />

              {/* Bulk: Select group */}
              {sendMode === "bulk" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-3">
                    Select Recipient Group
                  </label>
                  <div className="space-y-2">
                    {notificationOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.notificationType === option.value
                            ? "border-[#97cba9] bg-[#97cba9]/5 dark:bg-[#0b8457]/10 shadow-md"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="notificationType"
                          value={option.value}
                          checked={formData.notificationType === option.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notificationType: e.target
                                .value as NotificationType,
                            })
                          }
                          className="sr-only"
                        />
                        <div className="flex items-center flex-1 gap-3">
                          <div
                            className={`${option.color} p-2 rounded-lg text-white shrink-0`}
                          >
                            {option.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-[#c8e6d0] text-sm">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-[#7aab8a] truncate">
                              {option.description}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#c8e6d0]">
                              {option.count}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-[#7aab8a]">
                              users
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Targeted: Select specific users */}
              {sendMode === "targeted" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-3">
                    Select Users{" "}
                    {selectedUserIds.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-[#97cba9] dark:bg-[#0b8457] text-white text-xs">
                        {selectedUserIds.length} selected
                      </span>
                    )}
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#7aab8a]" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] text-sm focus:ring-2 focus:ring-[#97cba9] focus:border-transparent"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-gray-200 dark:border-white/10 p-2">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 dark:text-[#7aab8a] py-4">
                        No users found
                      </p>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = selectedUserIds.includes(user._id);
                        return (
                          <div
                            key={user._id}
                            onClick={() => toggleUserSelect(user._id)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#97cba9]/15 dark:bg-[#0b8457]/20 border border-[#97cba9]/50"
                                : "hover:bg-gray-100 dark:hover:bg-[#162820] border border-transparent"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? "bg-[#97cba9] border-[#97cba9]"
                                  : "border-gray-300 dark:border-white/30"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-[#c8e6d0] truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-[#7aab8a] truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {selectedUserIds.length > 0 && (
                    <button
                      onClick={() => setSelectedUserIds([])}
                      className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-white/10" />

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  placeholder="Enter email subject..."
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-2">
                  Email Message
                </label>
                <textarea
                  placeholder="Enter your message here..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={7}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent transition-all resize-none text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-[#7aab8a] mt-1">
                  {formData.message.length} characters
                </p>
              </div>

              {/* Preview */}
              {(formData.subject || formData.message) && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1e3d2a] dark:to-[#162820] rounded-lg border border-gray-200 dark:border-white/10">
                  <p className="text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#97cba9]" />
                    Email Preview
                  </p>
                  {formData.subject && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 dark:text-[#7aab8a] uppercase tracking-wide">
                        Subject:
                      </span>
                      <p className="font-bold text-gray-900 dark:text-[#c8e6d0] text-base">
                        {formData.subject}
                      </p>
                    </div>
                  )}
                  {formData.message && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-[#7aab8a] uppercase tracking-wide">
                        Message:
                      </span>
                      <p className="text-sm text-gray-700 dark:text-[#a8d4b8] whitespace-pre-wrap mt-1 leading-relaxed">
                        {formData.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-t border-gray-200 dark:border-white/10 p-4 md:p-6 bg-gray-50 dark:bg-[#0d1f18] shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFormData({
                      subject: "",
                      message: "",
                      notificationType: "systemAlerts",
                    });
                    setSelectedUserIds([]);
                    setIsPanelOpen(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-white/10 font-bold text-sm text-gray-700 dark:text-[#c8e6d0] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={
                    loading ||
                    !formData.subject.trim() ||
                    !formData.message.trim() ||
                    (sendMode === "targeted" && selectedUserIds.length === 0)
                  }
                  className="flex-1 px-4 py-3 rounded-lg bg-[#97cba9] dark:bg-[#0b8457] text-white font-bold text-sm hover:bg-[#7fb894] dark:hover:bg-[#0E5F44] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Email"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] text-center mt-3">
                {sendMode === "bulk" ? (
                  <>
                    This will send an email to{" "}
                    <span className="font-bold text-[#97cba9]">
                      {notificationOptions.find(
                        (o) => o.value === formData.notificationType,
                      )?.count || 0}
                    </span>{" "}
                    users
                  </>
                ) : (
                  <>
                    This will send an email to{" "}
                    <span className="font-bold text-[#97cba9]">
                      {selectedUserIds.length}
                    </span>{" "}
                    selected user{selectedUserIds.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
