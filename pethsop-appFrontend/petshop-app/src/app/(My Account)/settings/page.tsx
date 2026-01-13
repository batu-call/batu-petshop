"use client";
import React, { useEffect, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import Footer from "@/app/Footer/page";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast("New passwords do not match!");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update-password`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
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

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    securityAlerts: false,
    newsletter: true,
  });

  type NotificationKey =
    | "emailNotifications"
    | "systemAlerts"
    | "securityAlerts"
    | "newsletter";

  const handleNotificationChange = (key: NotificationKey) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationLabels: Record<NotificationKey, string> = {
    emailNotifications: "Email Notifications",
    systemAlerts: "System Alerts",
    securityAlerts: "Security Alerts",
    newsletter: "Newsletter / Updates",
  };

  return (
    <div>
      <Navbar />
      <Sidebar />
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50 ">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="md:ml-24 lg:ml-40 bg-[#f6f7f9] h-auto md:min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-2">
          <div className="w-full md:w-2/3 bg-white md:h-2/3 rounded-2xl p-10 flex flex-col md:flex md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <Typography
                variant="h5"
                className="flex items-center justify-center mb-4 text-color"
              >
                Password
              </Typography>
              <div className="mt-12">
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField
                    label="Current Password"
                    name="oldPassword"
                    type="password"
                    variant="standard"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#ffffff",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />

                  <TextField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    variant="standard"
                    value={formData.newPassword}
                    onChange={handleChange}
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#ffffff",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />

                  <TextField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    variant="standard"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#ffffff",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />


                  <Button
                className="mt-2 w-full bg-primary hover:bg-[#A8D1B5] text-color font-semibold px-6 transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
                onClick={handleSubmit}
              >
                Update Password
              </Button>
                </Box>
              </div>
            </div>

            <div className="w-px bg-gray-300" />

            <div className="w-full md:w-1/2">
              <Typography
                variant="h5"
                className="flex items-center justify-center mb-4 text-color"
              >
                Notifications
              </Typography>
              <div className="mt-20">
                <Box display="flex" flexDirection="column" gap={6}>
                  {Object.keys(notificationSettings).map((key) => {
                    const typedKey = key as NotificationKey;
                    return (
                      <Box
                        key={key}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography className="text-color">
                          {notificationLabels[typedKey]}
                        </Typography>

                        <Box
                          onClick={() => handleNotificationChange(typedKey)}
                          sx={{
                            width: 50,
                            height: 25,
                            borderRadius: 15,
                            backgroundColor: notificationSettings[typedKey]
                              ? "#4ade80"
                              : "#ccc",
                            position: "relative",
                            cursor: "pointer",
                            transition: "background-color 0.3s",
                          }}
                        >
                          <Box
                            sx={{
                              width: 23,
                              height: 23,
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              position: "absolute",
                              top: 1,
                              left: notificationSettings[typedKey] ? 26 : 1,
                              transition: "all 0.3s",
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default Settings;
