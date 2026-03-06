"use client";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/authContext";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token || typeof token !== "string" || token.length < 10) {
      toast.error("Invalid or expired reset link");
      router.push("/Login");
    }
  }, [token, router]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) return toast.error("Please fill in all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters long");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success("Password has been reset successfully!");
        router.replace("/");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to reset password");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
    "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
    "& .MuiInputBase-input": { color: "inherit" },
    mb: 3,
  };

  const labelSx = {
    sx: {
      color: "#B1CBBB",
      "&.Mui-focused": { color: "#B1CBBB" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1f18] p-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white dark:bg-[#162820] border border-transparent dark:border-white/10">
        <h2 className="text-2xl font-bold mb-2 text-color">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-[#7aab8a] mb-6">
          Enter your new password below to reset your account password.
        </p>

        <TextField
          type={showPassword ? "text" : "password"}
          label="New Password"
          variant="standard"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { color: "inherit" },
            },
            inputLabel: labelSx,
          }}
          sx={textFieldSx}
        />

        <TextField
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm New Password"
          variant="standard"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword((p) => !p)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { color: "inherit" },
            },
            inputLabel: labelSx,
          }}
          sx={textFieldSx}
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
          {loading ? "Resetting..." : "Reset Password"}
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