"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TextField, Button } from "@mui/material";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/forgot-password`,
        { email }
      );
      toast.success(
        "If an account exists, a password reset link has been sent to your email."
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-2 text-color">Forgot Password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email address and we’ll send you a link to reset your
          password.
        </p>

        <TextField
          label="Email address"
          variant="standard"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          slotProps={{
            inputLabel: {
              sx: {
                color: "#B1CBBB",
                "&.Mui-focused": { color: "#B1CBBB" },
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
          fullWidth
          variant="contained"
          sx={{
            cursor: "pointer",
            backgroundColor: "#D6EED6",
            borderRadius: "20px",
            color: "#393E46",
            transition: "all 0.3s",
            marginTop: "12px",
            "&:hover": {
              backgroundColor: "#97cba9",
              borderColor: "primary.main",
            },
          }}
          onClick={handleSubmit}
        >
          Send Reset Link
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
