"use client";
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import Link from "next/link";
import { AuthContext } from "@/app/context/authContext";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated, isAuthenticated } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

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

  
  const { data: session, status } = useSession();
  const redirectPath = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) router.replace(redirectPath);
  }, [isAuthenticated, router, redirectPath]);

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (status === "loading") return;
      if (!session?.idToken) return;
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/google-login`,
          { idToken: session.idToken },
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success("Google login successful!");
          setUser(response.data.user);
          setIsAuthenticated(true);
          router.push(redirectPath);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Google login failed");
        } else {
          toast.error("Google login failed!");
        }
      }
    };
    handleGoogleLogin();
  }, [session, status, setUser, setIsAuthenticated, router, redirectPath]);

  const handlerLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`,
        { email, password, rememberMe },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Login successful!");
        setUser(response.data.user);
        setIsAuthenticated(true);
        router.push(redirectPath);
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
    <div>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="p-4 flex items-center justify-center h-full">
          <div className="w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

            {/* LEFT IMAGE */}
            <div className="hidden md:block w-1/2 relative bg-gray-100">
              <Image
                src="/login-image.jpg"
                alt="Login Background"
                fill
                priority
                sizes="(max-width: 768px) 0vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white p-4">
                <h3 className="text-3xl font-bold mb-2">Welcome Back!</h3>
                <p className="text-lg text-white/90">Your furry friends are waiting for their treats.</p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#162820]">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2 text-color dark:text-[#0b8457]! text-start">Login</h2>
                <p className="text-color dark:text-[#7aab8a]! mt-3">Enter your details to access your account.</p>
              </div>

              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => { e.preventDefault(); handlerLogin(); }}
              >
                <TextField
                  label="Email"
                  name="email"
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: { autoComplete: "username", sx: { color: "inherit" } },
                    inputLabel: labelSx,
                  }}
                  sx={textFieldSx}
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      sx: { color: "inherit" },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: labelSx,
                  }}
                  sx={textFieldSx}
                />

                <div className="flex justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded cursor-pointer accent-green-500"
                    />
                    <span className="text-xs lg:text-sm font-medium text-[#121714] dark:text-[#c8e6d0]">
                      Remember Me
                    </span>
                  </label>
                  <Link href="/forgot-password" className="text-xs lg:text-sm text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-3 rounded-[20px] bg-primary text-[#393E46] hover:bg-[#D6EED6] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                >
                  <span className="text-md font-semibold">Login</span>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-grow border-t dark:border-white/10" />
                  <span className="text-xs text-gray-400 font-bold">OR</span>
                  <div className="flex-grow border-t dark:border-white/10" />
                </div>

                <Button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: redirectPath })}
                  className="w-full rounded-[20px] bg-white dark:bg-[#1e3d2a] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-[#c8e6d0] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                  variant="outline"
                >
                  <GoogleIcon fontSize="small" />
                  Continue with Google
                </Button>

                <Link href="/Register">
                  <Button className="w-full rounded-[20px] bg-white dark:bg-[#1e3d2a] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-[#c8e6d0] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md">
                    <span className="text-md font-semibold">Create an Account</span>
                  </Button>
                </Link>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;