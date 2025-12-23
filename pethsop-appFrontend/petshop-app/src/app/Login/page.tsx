"use client";
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import { AuthContext } from "../context/authContext";

import CircularText from "@/components/CircularText";
import Link from "next/link";
import { Button } from "@mui/material";

const Login = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const handlerLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Login successful!");

        setUser(response.data.user);
        setIsAuthenticated(true);
        router.push("/main");
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

  return (
    <div>
      <Navbar />
      <Sidebar />
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="md:ml-24 lg:ml-40 mt-24 p-4 flex items-center justify-center">
          <div className="w-full max-w-5xl bg-background-light dark:bg-background-dark rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
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
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#1a211d]">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2 text-color text-start">
                  Login
                </h2>
                <p className="text-color dark:text-gray-400 mt-3">
                  Enter your details to access your account.
                </p>
              </div>

              <form className="flex flex-col gap-5">
                {/* EMAIL */}
                <TextField
                  label="Email"
                  name="email"
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
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

                {/* PASSWORD */}
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoComplete="new-password"
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

                <div className="flex justify-between">
                  {/* REMEMBER */}
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-[#d7e0da] text-primary focus:ring-primary"
                    />
                    <span className="text-xs lg:text-sm font-medium text-[#121714] dark:text-gray-300">
                      Remember Me
                    </span>
                  </label>

                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs lg:text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                {/* BUTTONS */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlerLogin}
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
                >
                  <span className="text-md font-semibold">Login</span>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-grow border-t" />
                  <span className="text-xs text-gray-400 font-bold">OR</span>
                  <div className="flex-grow border-t" />
                </div>

                <Link href={"/Register"}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      cursor: "pointer",
                      backgroundColor: "#fcfefe",
                      borderRadius: "20px",
                      color: "#393E46",
                    }}
                  >
                    <span className="text-md font-semibold">
                      Create an Account
                    </span>
                  </Button>
                </Link>
              </form>

              {/* SOCIAL */}
              <div className="mt-8 flex justify-center gap-4">
                <button className="h-10 w-10 rounded-full bg-[#f0f4f2] hover:bg-[#e0e8e4]">
                  G
                </button>
                <button className="h-10 w-10 rounded-full bg-[#f0f4f2] hover:bg-[#e0e8e4] text-blue-600">
                  f
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
