"use client";
import React, { useState } from "react";
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
  const ADMIN_COLOR = "#B1CBBB";
  const router = useRouter();
  const { setAdmin } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        router.push("/main");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Login failed! Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary flex items-center justify-center h-screen">
      <div className="bg-white p-8 lg:p-12 shadow-2xl rounded-2xl">
        <div className="flex gap-8">
          {/* LEFT IMAGE */}
          <div className="hidden lg:block relative w-[480px] min-h-[480px]">
            <Image
              src="/admin_login.jpg"
              alt="Admin login illustration"
              fill
              priority
              className="rounded-2xl object-cover"
            />
          </div>

          {/* LOGIN FORM */}
          <div className="border rounded-xl p-6">
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
                  <h2 className="text-3xl font-semibold text-color">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 leading-normal">
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
                  slotProps={{
                    inputLabel: {
                      sx: {
                        color: ADMIN_COLOR,
                        "&.Mui-focused": { color: ADMIN_COLOR },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiInput-underline:after": {
                      borderBottomColor: ADMIN_COLOR,
                    },
                  }}
                />

                {/* PASSWORD */}
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="standard"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
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
                    inputLabel: {
                      sx: {
                        color: ADMIN_COLOR,
                        "&.Mui-focused": { color: ADMIN_COLOR },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiInput-underline:after": {
                      borderBottomColor: ADMIN_COLOR,
                    },
                  }}
                />

                {/* SUBMIT */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 transition-all hover:bg-[#D6EED6] hover:text-[#393E46] hover:scale-105"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                {/* INFO */}
                <p className="text-xs text-gray-400 text-center">
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
