"use client";
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import Link from "next/link";
import { AuthContext } from "@/app/context/authContext";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import { login as loginApi, saveGoogleUser } from "@/lib/api-client"; 

const Login = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated, refreshUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  
  const { data: session } = useSession();

  // Google login
  useEffect(() => {
    const processGoogleLogin = async () => {
      if (!session?.user || isProcessingGoogle) return;

      setIsProcessingGoogle(true);
      
      try {
        console.log("🔐 [Google Login] Processing...");
        
        const res = await saveGoogleUser(session.user);
        
        if (res?.success && res?.user) {
          console.log("✅ [Google Login] Success");
          
          // CRITICAL: Token'ı localStorage'a kaydet (MOBILE İÇİN!)
          if (res.token) {
            localStorage.setItem("userToken", res.token);
            console.log("✅ [Google Login] Token saved to localStorage");
          }
          
          setUser(res.user);
          setIsAuthenticated(true);
          
          toast.success("Google login successful!");
          
          // User bilgilerini refresh et
          setTimeout(() => {
            refreshUser();
            router.push("/");
          }, 300);
        } else {
          console.error("❌ [Google Login] Failed:", res?.error);
          toast.error(res?.error || "Google login failed!");
          setIsProcessingGoogle(false);
        }
      } catch (error) {
        console.error("❌ [Google Login] Error:", error);
        toast.error("Google login failed!");
        setIsProcessingGoogle(false);
      }
    };

    processGoogleLogin();
  }, [session]);

  // Normal login
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      console.log("🔐 [Login] Attempting login...");
      
      const response = await loginApi(email, password);
      
      if (response.success) {
        console.log("✅ [Login] Success");
        
        // CRITICAL: Token'ı localStorage'a kaydet (MOBILE İÇİN!)
        if (response.token) {
          localStorage.setItem("userToken", response.token);
          console.log("✅ [Login] Token saved to localStorage");
        }
        
        toast.success("Login successful!");
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // User bilgilerini refresh et
        setTimeout(() => {
          refreshUser();
          router.push("/");
        }, 300);
      }
    } catch (error: any) {
      console.error("❌ [Login] Failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed!";
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="p-4 flex items-center justify-center h-full">
          <div className="w-full max-w-5xl bg-background-light rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <div className="hidden md:block w-1/2 relative bg-gray-100">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDTChF-Bg06rdVXhX6PChkntXrVDpULVYb3wF7Z8GxSnj7goI8Mih2Qjlp0h0wPr1EYCv-OjpmYt2xFpoWfITGY6-Dmz7IQLmIoduVksnD3AaKJbyoRTW1VrpBu8LFB67cwpgizyHUmi3AZUazWH7MloRhJ6tEXcBQrgiXzEmJS1q6sKzopv4izqu902-d2PqoZ7mnJ3A4qf_dkDhiOoAGmt6qRfje2PLPhMCaZFDxAYiCEGPLjc4PiZ4olP_5fhADp2Rodpc2Ai8')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white p-4">
                <h3 className="text-3xl font-bold mb-2">Welcome Back!</h3>
                <p className="text-lg text-white/90">
                  Your furry friends are waiting for their treats.
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2 text-color text-start">
                  Login
                </h2>
                <p className="text-color mt-3">
                  Enter your details to access your account.
                </p>
              </div>

              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                <TextField
                  label="Email"
                  name="email"
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  disabled={isLoggingIn || isProcessingGoogle}
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

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="standard"
                  fullWidth
                  disabled={isLoggingIn || isProcessingGoogle}
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            disabled={isLoggingIn || isProcessingGoogle}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
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

                <div className="flex justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded cursor-pointer accent-green-500 border-border-light"
                      disabled={isLoggingIn || isProcessingGoogle}
                    />
                    <span className="text-xs lg:text-sm font-medium text-[#121714]">
                      Remember Me
                    </span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs lg:text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn || isProcessingGoogle}
                  className="w-full mt-3 rounded-[20px] bg-primary text-[#393E46] hover:bg-[#D6EED6] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-md font-semibold">
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </span>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-grow border-t" />
                  <span className="text-xs text-gray-400 font-bold">OR</span>
                  <div className="flex-grow border-t" />
                </div>

                <Button
                  type="button"
                  onClick={() => signIn("google")}
                  disabled={isProcessingGoogle || isLoggingIn}
                  className="w-full rounded-[20px] bg-white border border-gray-200 text-gray-800 cursor-pointer hover:bg-gray-50 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  variant="outline"
                >
                  <GoogleIcon fontSize="small" className="text-md font-semibold" />
                  {isProcessingGoogle ? "Processing..." : "Continue with Google"}
                </Button>

                <Link href={"/Register"}>
                  <Button
                    disabled={isLoggingIn || isProcessingGoogle}
                    className="w-full rounded-[20px] bg-white border border-gray-200 text-gray-800 cursor-pointer hover:bg-gray-50 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-md font-semibold">
                      Create an Account
                    </span>
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