"use client";
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@/components/ui/button";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CircularText from "@/components/CircularText";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { AuthContext } from "@/app/context/authContext";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTheme } from "next-themes";

const Register = () => {
  const router = useRouter();
  const { setUser, isAuthenticated, setIsAuthenticated } =
    useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  type formDataType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: string;
  };

  const [formData, setFormData] = useState<formDataType>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "User",
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  type FormInputNames = keyof formDataType;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as FormInputNames;
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        const k = key as keyof formDataType;
        data.append(k, formData[k]);
      }
      if (file) data.append("uploads", file);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register`,
        data,
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success(response.data.message);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
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
    <div className="h-full w-full relative">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="p-4 flex items-center justify-center min-h-full">
          <div className="w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* LEFT IMAGE */}
            <div className="hidden md:block w-1/2 relative">
              <Image
                src="/register-image.jpg"
                alt="Register Background"
                fill
                priority
                sizes="(min-width: 768px) 50vw"
                quality={95}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-bold mb-2">Join Us Today</h3>
                <p className="text-lg text-white/90">
                  Create your account and get started.
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-10 lg:p-12 bg-white dark:bg-[#162820] flex flex-col justify-center">
              <form onSubmit={handlerSubmit}>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2.5}
                  width="100%"
                >
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold mb-1 text-color dark:text-[#0b8457]!">
                      Create Account
                    </h2>
                    <p className="text-[#6d7e73] dark:text-[#7aab8a] text-sm">
                      Enter your details below to get started.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      variant="standard"
                      fullWidth
                      autoComplete="given-name"
                      slotProps={{
                        inputLabel: labelSx,
                        input: { sx: { color: "inherit" } },
                      }}
                      sx={textFieldSx}
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      variant="standard"
                      fullWidth
                      autoComplete="family-name"
                      slotProps={{
                        inputLabel: labelSx,
                        input: { sx: { color: "inherit" } },
                      }}
                      sx={textFieldSx}
                    />
                    <div className="sm:col-span-2">
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        autoComplete="email"
                        slotProps={{
                          inputLabel: labelSx,
                          input: { sx: { color: "inherit" } },
                        }}
                        sx={textFieldSx}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <PhoneInput
                        country={"us"}
                        value={formData.phone}
                        onChange={(phone) =>
                          setFormData({ ...formData, phone })
                        }
                        inputStyle={{
                          width: "100%",
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #B1CBBB",
                          backgroundColor: isDark ? "#0d1f18" : "#ffffff",
                          color: isDark ? "#c8e6d0" : "#393E46",
                        }}
                        buttonStyle={{
                          backgroundColor: isDark ? "#162820" : "#ffffff",
                          border: "1px solid #B1CBBB",
                          borderRight: "none",
                        }}
                        dropdownStyle={{
                          backgroundColor: isDark ? "#162820" : "#ffffff",
                          color: isDark ? "#c8e6d0" : "#393E46",
                        }}
                        specialLabel="Phone"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <TextField
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        autoComplete="new-password"
                        slotProps={{
                          input: {
                            sx: { color: "inherit" },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword((p) => !p)}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                          inputLabel: labelSx,
                        }}
                        sx={textFieldSx}
                      />
                    </div>
                  </div>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mt={2}
                    p={1.5}
                    className="border border-gray-200 dark:border-white/10 rounded-xl"
                  >
                    <div className="relative cursor-pointer">
                      <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center overflow-hidden">
                        {file ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Profile"
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <AddAPhotoIcon
                            fontSize="small"
                            className="text-gray-400 dark:text-[#7aab8a]"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-color">
                        Profile Photo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#7aab8a]">
                        JPG or PNG supported
                      </p>
                    </div>
                  </Box>

                  <Button
                    type="submit"
                    className="w-full mt-2 rounded-[20px] bg-primary text-[#393E46] hover:bg-[#D6EED6] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                  >
                    <span className="text-md font-semibold">Register</span>
                  </Button>
                </Box>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;