"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TextField, Button } from "@mui/material";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return toast.error("Please enter your email address");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Please enter a valid email address");
    if (loading) return;
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/forgot-password`,
        { email: email.trim() }
      );
      toast.success("If an account exists, a password reset link has been sent to your email.");
      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1f18] p-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white dark:bg-[#162820] border border-transparent dark:border-white/10">
        <h2 className="text-2xl font-bold mb-2 text-color">Forgot Password</h2>
        <p className="text-sm text-gray-500 dark:text-[#7aab8a] mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <TextField
          label="Email address"
          variant="standard"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          slotProps={{
            inputLabel: {
              sx: {
                color: "#B1CBBB",
                "&.Mui-focused": { color: "#B1CBBB" },
              },
            },
            input: {
              sx: {
                color: "inherit",
              },
            },
          }}
          sx={{
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
            "& .MuiInputBase-input": {
              color: "inherit",
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#D6EED6",
            borderRadius: "20px",
            color: "#393E46",
            transition: "all 0.3s",
            marginTop: "12px",
            "&:hover": { backgroundColor: "#97cba9" },
            "&:disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" },
          }}
          onClick={handleSubmit}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        <div className="mt-6 text-center">
          <Link href="/Login" className="text-sm text-primary hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}