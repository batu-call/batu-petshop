"use client";

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const ToastProvider = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <Toaster
      position={isMobile ? "bottom-center" : "top-right"}
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        zIndex: 9999,
        marginTop: isMobile ? 0 : "4rem", // navbar safe
        marginBottom: isMobile ? "1rem" : 0,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#1f2937",
          padding: "14px 16px",
          borderRadius: "12px",
          fontSize: "0.95rem",
          maxWidth: "90vw",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)",
        },

        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#ecfdf5",
          },
          style: {
            border: "1px solid #bbf7d0",
          },
        },

        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fef2f2",
          },
          style: {
            border: "1px solid #fecaca",
          },
        },

        loading: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#eff6ff",
          },
        },
      }}
    />
  );
};

export default ToastProvider;
