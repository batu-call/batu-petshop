"use client";
import React, { useState } from "react";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

const Settings = () => {
  // Password form
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        { withCredentials: true }
      );

      alert("Password updated successfully!");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating the password.");
    }
  };

  // Notification toggles
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    securityAlerts: false,
    newsletter: true,
  });

  type NotificationKey = "emailNotifications" | "systemAlerts" | "securityAlerts" | "newsletter";

  const handleNotificationChange = (key: NotificationKey) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Notification labels
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

      <div className="ml-40 bg-primary h-full flex items-center justify-center">
        <div className="w-2/3 bg-white h-2/3 rounded-2xl p-10 flex gap-6">
          {/* Password Section */}
          <div className="w-1/2">
            <Typography variant="h5" className="flex items-center justify-center mb-4 text-color">Password</Typography>
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
                        color: "#393E46",
                        backgroundColor: "#B1CBBB",
                        padding: 0.4,
                        borderRadius: 1,
                      },
                    },
                  },
                }}
                sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" } }}
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
                        color: "#393E46",
                        backgroundColor: "#B1CBBB",
                        padding: 0.4,
                        borderRadius: 1,
                      },
                    },
                  },
                }}
                sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" } }}
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
                        color: "#393E46",
                        backgroundColor: "#B1CBBB",
                        padding: 0.4,
                        borderRadius: 1,
                      },
                    },
                  },
                }}
                sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" } }}
              />

              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ mt: 2, backgroundColor: "#B1CBBB" }}
              >
                Update Password
              </Button>
            </Box>
            </div>
          </div>

          <div className="w-px bg-gray-300" />

          {/* Notifications Section */}
          <div className="w-1/2">
            <Typography variant="h5" className="flex items-center justify-center mb-4 text-color">Notifications</Typography>
            <div className="mt-20">
            <Box display="flex" flexDirection="column" gap={6}>

              {Object.keys(notificationSettings).map((key) => {
                const typedKey = key as NotificationKey;
                return (
                  <Box key={key} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography className="text-color">{notificationLabels[typedKey]}</Typography>
                  
                    <Box
                      onClick={() => handleNotificationChange(typedKey)}
                      sx={{
                        width: 50,
                        height: 25,
                        borderRadius: 15,
                        backgroundColor: notificationSettings[typedKey] ? "#4ade80" : "#ccc",
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
    </div>
  );
};

export default Settings;
