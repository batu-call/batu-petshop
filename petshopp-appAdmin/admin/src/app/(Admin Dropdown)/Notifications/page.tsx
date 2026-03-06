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
  ArrowRight
} from "lucide-react";
import CircularText from "@/components/CircularText";

type NotificationType = "emailNotifications" | "systemAlerts" | "newsletter";

interface NotificationOption {
  value: NotificationType;
  label: string;
  description: string;
  icon: JSX.Element;
  count: number;
  color: string;
}

const NotificationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    notificationType: "systemAlerts" as NotificationType,
  });

  const [stats, setStats] = useState({
    emailNotifications: 0,
    systemAlerts: 0,
    newsletter: 0,
  });

  useEffect(() => {
    fetchNotificationStats();
  }, []);

  const fetchNotificationStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const users = response.data.users;
        const stats = {
          emailNotifications: users.filter(
            (u: any) => u.notificationSettings?.emailNotifications
          ).length,
          systemAlerts: users.filter(
            (u: any) => u.notificationSettings?.systemAlerts
          ).length,
          newsletter: users.filter(
            (u: any) => u.notificationSettings?.newsletter
          ).length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const handleSend = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/bulk-email`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(
          `Email sent to ${response.data.sentCount} users successfully!`
        );
        setFormData({
          subject: "",
          message: "",
          notificationType: "systemAlerts",
        });
        setIsPanelOpen(false);
        fetchNotificationStats();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to send emails"
      );
    } finally {
      setLoading(false);
    }
  };

  const notificationOptions: NotificationOption[] = [
    {
      value: "emailNotifications",
      label: "Order & Shipping Notifications",
      description: "Users who opted in for order and shipping updates",
      icon: <Mail className="w-5 h-5" />,
      count: stats.emailNotifications,
      color: "bg-blue-500",
    },
    {
      value: "systemAlerts",
      label: "System & Promotional Alerts",
      description: "Users who want system updates and promotions",
      icon: <Sparkles className="w-5 h-5" />,
      count: stats.systemAlerts,
      color: "bg-purple-500",
    },
    {
      value: "newsletter",
      label: "Newsletter & Product Updates",
      description: "Users subscribed to newsletters and product announcements",
      icon: <MessageSquare className="w-5 h-5" />,
      count: stats.newsletter,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#97cba9]/5 dark:from-[#0d1f18] dark:via-[#0f2318] dark:to-[#162820] p-6">
      {/* LOADING OVERLAY */}
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
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-[#c8e6d0] mb-2 flex items-center gap-3">
            <Send className="w-10 h-10 text-[#97cba9]" />
            Notifications Center
          </h1>
          <p className="text-gray-600 dark:text-[#7aab8a] text-lg">
            Manage and send email notifications to your users
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {notificationOptions.map((option) => (
            <div
              key={option.value}
              className="bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                setFormData({ ...formData, notificationType: option.value });
                setIsPanelOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${option.color} p-3 rounded-lg text-white`}>
                  {option.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-[#c8e6d0]">
                    {option.count}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-[#7aab8a]">subscribers</div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-[#c8e6d0] mb-1 group-hover:text-[#97cba9] transition-colors">
                {option.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#7aab8a] mb-3">{option.description}</p>
              <div className="flex items-center text-[#97cba9] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Send Notification <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTION */}
        <div className="bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-[#97cba9]/10 dark:bg-[#0b8457]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-[#97cba9]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#c8e6d0] mb-2">
              Send Bulk Notification
            </h2>
            <p className="text-gray-600 dark:text-[#7aab8a] mb-6">
              Compose and send email notifications to your users based on their preferences
            </p>
            <button
              onClick={() => setIsPanelOpen(true)}
              className="px-8 py-4 rounded-lg bg-[#97cba9] dark:bg-[#0b8457] text-white font-bold text-lg hover:bg-[#7fb894] dark:hover:bg-[#0E5F44] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
            >
              <Mail className="w-5 h-5" />
              Compose Email
            </button>
          </div>
        </div>

        {/* SUBSCRIPTION OVERVIEW */}
        <div className="mt-8 bg-white dark:bg-[#162820] rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#97cba9]" />
            Subscription Overview
          </h3>
          <div className="space-y-3">
            {notificationOptions.map((option) => {
              const total = stats.emailNotifications + stats.systemAlerts + stats.newsletter;
              const percentage = total > 0 ? ((option.count / total) * 100) : 0;
              return (
                <div key={option.value} className="flex items-center gap-4">
                  <div className={`${option.color} p-2 rounded-lg text-white shrink-0`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-[#c8e6d0]">
                        {option.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-[#c8e6d0]">
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
      </div>

      {/*  SLIDING PANEL  */}
      {isPanelOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsPanelOpen(false)}
          />

          {/* PANEL */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-white dark:bg-[#162820] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* PANEL HEADER */}
            <div className="bg-gradient-to-r from-[#97cba9] to-[#7fb894] dark:from-[#0b8457] dark:to-[#0E5F44] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Compose Email
                  </h2>
                  <p className="text-white/80 text-sm">
                    Send notification to your users
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PANEL CONTENT - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* NOTIFICATION TYPE SELECTION */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-[#c8e6d0] mb-3">
                  Select Recipient Group
                </label>
                <div className="space-y-3">
                  {notificationOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
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
                            notificationType: e.target.value as NotificationType,
                          })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-center flex-1 gap-3">
                        <div className={`${option.color} p-2 rounded-lg text-white shrink-0`}>
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
                        <div className="text-right shrink-0">
                          <div className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0]">
                            {option.count}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-[#7aab8a]">users</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* DIVIDER */}
              <div className="border-t border-gray-200 dark:border-white/10" />

              {/* SUBJECT */}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent transition-all"
                />
              </div>

              {/* MESSAGE */}
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
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] focus:border-transparent transition-all resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-[#7aab8a] mt-2">
                  {formData.message.length} characters
                </p>
              </div>

              {/* PREVIEW */}
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
                      <p className="font-bold text-gray-900 dark:text-[#c8e6d0] text-lg">
                        {formData.subject}
                      </p>
                    </div>
                  )}
                  {formData.message && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-[#7aab8a] uppercase tracking-wide">
                        Message:
                      </span>
                      <p className="text-gray-700 dark:text-[#a8d4b8] whitespace-pre-wrap mt-1 leading-relaxed">
                        {formData.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PANEL FOOTER */}
            <div className="border-t border-gray-200 dark:border-white/10 p-6 bg-gray-50 dark:bg-[#0d1f18]">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFormData({
                      subject: "",
                      message: "",
                      notificationType: "systemAlerts",
                    });
                    setIsPanelOpen(false);
                  }}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-white/10 font-bold text-gray-700 dark:text-[#c8e6d0] hover:bg-gray-100 dark:hover:bg-[#1e3d2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading || !formData.subject.trim() || !formData.message.trim()}
                  className="flex-1 px-6 py-3 rounded-lg bg-[#97cba9] dark:bg-[#0b8457] text-white font-bold hover:bg-[#7fb894] dark:hover:bg-[#0E5F44] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Email"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] text-center mt-3">
                This will send an email to{" "}
                <span className="font-bold text-[#97cba9]">
                  {notificationOptions.find(o => o.value === formData.notificationType)?.count || 0}
                </span>{" "}
                subscribers
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;