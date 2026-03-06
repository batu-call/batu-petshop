"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import Footer from "@/app/Footer/page";
import { Lock, Bell, Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    newsletter: true,
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/notification-settings`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setNotificationSettings(response.data.settings);
        }
      } catch (error) {
        console.error("Failed to fetch notification settings");
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update-password`,
        { oldPassword: formData.oldPassword, newPassword: formData.newPassword },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Unexpected error");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error!");
      }
    }
  };

  type NotificationKey = "emailNotifications" | "systemAlerts" | "newsletter";

  const handleNotificationChange = async (key: NotificationKey) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/notification-settings`,
        newSettings,
        { withCredentials: true }
      );
      toast.success("Notification settings updated!");
    } catch (error) {
      setNotificationSettings(notificationSettings);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to update settings");
      } else {
        toast.error("Failed to update notification settings!");
      }
    }
  };

  const notificationItems = [
    {
      key: "emailNotifications" as NotificationKey,
      title: "Order & Shipping Notifications",
      desc: "Receive order confirmations, shipping updates, and delivery notifications via email.",
    },
    {
      key: "systemAlerts" as NotificationKey,
      title: "System & Promotional Alerts",
      desc: "Get system maintenance notices, promotions, discounts, and important announcements.",
    },
    {
      key: "newsletter" as NotificationKey,
      title: "Newsletter & Product Updates",
      desc: "Receive monthly newsletters, new product announcements, and stock alerts.",
    },
  ];

  const passwordFields = [
    { name: "oldPassword", label: "Current Password", autoComplete: "current-password" },
    { name: "newPassword", label: "New Password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm New Password", autoComplete: "new-password" },
  ] as const;

  return (
    <div>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary dark:bg-[#0E5F44] z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 via-white to-[#97cba9]/5 dark:from-[#0d1f18] dark:via-[#0d1f18] dark:to-[#162820] min-h-[calc(100vh-4.5rem)] p-6 flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Security Card */}
              <div className="bg-white dark:bg-[#162820] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm h-fit">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#1e3d2a] dark:to-[#162820]">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0] flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#97cba9] dark:text-[#7aab8a]" />
                    Security & Password
                  </h2>
                </div>
                <div className="p-8">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                      {passwordFields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-[#a8d4b8]">
                            <Lock className="w-4 h-4 text-[#97cba9] dark:text-[#7aab8a]" />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords[field.name] ? "text" : "password"}
                              name={field.name}
                              placeholder="••••••••"
                              value={formData[field.name]}
                              onChange={handleChange}
                              required
                              autoComplete={field.autoComplete}
                              minLength={field.name !== "oldPassword" ? 8 : undefined}
                              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] focus:border-transparent transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(field.name)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#7aab8a] hover:text-gray-700 dark:hover:text-[#c8e6d0]"
                            >
                              {showPasswords[field.name] ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-400">
                        Password must be at least 8 characters long and include a mix of uppercase letters, numbers, and symbols.
                      </p>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                          setShowPasswords({ oldPassword: false, newPassword: false, confirmPassword: false });
                        }}
                        className="px-6 py-3 rounded-lg border border-gray-200 dark:border-white/10 font-bold text-sm text-gray-700 dark:text-[#a8d4b8] hover:bg-gray-50 dark:hover:bg-[#1e3d2a] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 rounded-lg bg-[#97cba9] dark:bg-[#0b8457] text-white font-bold text-sm hover:bg-[#7fb894] dark:hover:bg-[#2d5a3d] transition-all shadow-lg hover:shadow-xl cursor-pointer"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="bg-white dark:bg-[#162820] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm h-fit">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#1e3d2a] dark:to-[#162820]">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0] flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#97cba9] dark:text-[#7aab8a]" />
                    Notification Preferences
                  </h2>
                </div>
                <div className="p-8 space-y-6">
                  {notificationItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0d1f18] rounded-xl border border-gray-100 dark:border-white/10"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-900 dark:text-[#c8e6d0]">{item.title}</p>
                        <p className="text-sm text-gray-600 dark:text-[#7aab8a] mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key]}
                          onChange={() => handleNotificationChange(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-[#1e3d2a] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#97cba9] dark:peer-checked:bg-[#0b8457]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Settings;