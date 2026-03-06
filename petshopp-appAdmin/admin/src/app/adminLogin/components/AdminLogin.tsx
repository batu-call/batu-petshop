"use client";
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const AdminLogin = () => {
  const router = useRouter();
  const { setAdmin } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  
  const handlerLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/login`,
        { email, password },
        { withCredentials: true },
      );

      if (response.data.success) {
        setAdmin(response.data.admin);
        toast.success(response.data.message || "Login successful!");
        setTimeout(() => router.push("/main"), 100);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Login failed! Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
    "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
    "& .MuiInputBase-input": { color: "inherit" },
    "& .MuiInputLabel-root": {
      transformOrigin: "top left",
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(0, -8px) scale(0.75)",
    },
  };
  const labelSx = {
    sx: {
      color: "#B1CBBB",
      "&.Mui-focused": {
        color: isDark ? "#393E46" : "#ffffff",
        backgroundColor: "#B1CBBB",
        padding: 0.4,
        borderRadius: 1,
      },
    },
  };

  return (
    <div className="bg-primary dark:bg-[#0E5F44] flex items-center justify-center min-h-screen px-4 py-8">
      <div className="bg-white dark:bg-[#162820] p-8 lg:p-12 shadow-2xl rounded-2xl">
        <div className="flex gap-8">
          {/* LEFT IMAGE */}
          <div className="hidden lg:block relative w-[480px] min-h-[480px]">
            <Image
              src="/admin_login.jpg"
              alt="Admin login illustration"
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
              quality={95}
              className="rounded-2xl object-cover"
            />
          </div>

          {/* LOGIN FORM */}
          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlerLogin();
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                gap={5}
                fontFamily="jost"
              >
                {/* HEADER */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-semibold text-color dark:text-[#0b8457]!">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 dark:text-[#7aab8a] leading-normal">
                    Please enter your credentials to access the dashboard.
                  </p>
                </div>

                {/* EMAIL */}
                <TextField
                  label="Email"
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  autoComplete="new-email"
                  slotProps={{
                    input: { sx: { color: "inherit" } },
                    inputLabel: labelSx,
                  }}
                  sx={textFieldSx}
                />

                {/* PASSWORD */}
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="standard"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      sx: { color: "inherit" },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: labelSx,
                  }}
                  sx={textFieldSx}
                />

                {/* SUBMIT */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 bg-primary dark:bg-[#0b8457] text-[#393E46] dark:text-white transition-all hover:bg-[#D6EED6] dark:hover:bg-[#0E5F44] hover:scale-105 cursor-pointer"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                {/* INFO */}
                <p className="text-xs text-gray-400 dark:text-[#7aab8a] text-center">
                  Forgot your password? Contact the system administrator.
                </p>
              </Box>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
