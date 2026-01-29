"use client";
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
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
import { signIn, useSession } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import { saveGoogleUser } from "@/app/utils/google";
import { saveAuthToken } from "@/app/utils/authHelper";

const Login = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
  const saveUser = async () => {
    if (!session?.user) return; 

    const res = await saveGoogleUser(session.user);
    if (res?.success) {
      const fullName = session.user.name || "";
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ");

      setUser({
        _id: res.user._id,
        firstName,
        lastName,
        email: session.user.email || "",
        phone: "",
        address: "",
        avatar: session.user.image || "",
        role: "User",
      });
      setIsAuthenticated(true);

      router.push("/"); 
    } else {
      toast.error("Google login failed!");
    }
  };

  saveUser();
}, [session, setUser, setIsAuthenticated, router]);

  const handlerLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success("Login successful!");

        if (response.data.token) {
        saveAuthToken(response.data.token);
      }

        setUser(response.data.user);
        setIsAuthenticated(true);
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
                  handlerLogin();
                }}
              >
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoComplete="new-password"
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
                      className="h-4 w-4 rounded cursor-pointer accent-green-500 border-border-light"
                    />
                    <span className="text-xs lg:text-sm font-medium text-[#121714]">
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
                  type="submit"
                  className="
    w-full 
    mt-3 
    rounded-[20px] 
    bg-primary 
    text-[#393E46] 
    hover:bg-[#D6EED6]
    cursor-pointer
    transition duration-300 ease-in-out hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md
  "
                >
                  <span className="text-md font-semibold">Login</span>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-grow border-t" />
                  <span className="text-xs text-gray-400 font-bold">OR</span>
                  <div className="flex-grow border-t" />
                </div>

                {/* GOOGLE LOGIN */}
                <Button
                 type="button"
                  onClick={() => signIn("google")}
                  className="
    w-full
    rounded-[20px]
    bg-white
    border border-gray-200
    text-gray-800
    cursor-pointer
    hover:bg-gray-50
    transition duration-300 ease-in-out hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md
  "
                  variant="outline"
                >
                  <GoogleIcon
                    fontSize="small"
                    className="text-md font-semibold"
                  />
                  Continue with Google
                </Button>

                <Link href={"/Register"}>
                  <Button
                    className="
    w-full
    rounded-[20px]
    bg-white
    border border-gray-200
    text-gray-800
    cursor-pointer
    hover:bg-gray-50
    transition duration-300 ease-in-out hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md
  "
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
