"use client";
import { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TextField, Button } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/authContext";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      return toast.error("Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      const resposne = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/reset-password/${token}`,
        { password } ,
        {withCredentials:true}
      );
     if (resposne.data.success) {
        setUser(resposne.data.user);
        setIsAuthenticated(true);
        toast.success("Password has been reset successfully!");
        router.push("/"); 
      }
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
        <h2 className="text-2xl font-bold mb-2 text-color">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your new password below to reset your account password.
        </p>

        <TextField
          type="password"
          label="New Password"
          variant="standard"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            mb: 3,
          }}
        />

        <TextField
          type="password"
          label="Confirm New Password"
          variant="standard"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            mb: 3,
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
          Reset Password
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
