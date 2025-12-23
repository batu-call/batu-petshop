"use client";
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AuthContext } from "../context/authContext";
import CircularText from "@/components/CircularText";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

const Register = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

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

  type FormInputNames = keyof formDataType;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as FormInputNames;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlerSubmit = async () => {
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
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full relative">
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
        <div className="md:ml-24 lg:ml-40 p-4 flex justify-center">
          <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">

            {/* LEFT IMAGE */}
            <div className="hidden md:block w-1/2 relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1525253086316-d0c936c814f8')",
                }}
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
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-white">
              <Box display="flex" flexDirection="column" gap={3} width="100%">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 text-color">Create Account</h2>
                  <p className="text-[#6d7e73] text-sm">
                    Enter your details below to get started.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="standard"
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
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="standard"
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
                  <div className="sm:col-span-2">
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="standard"
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
                        height: "56px",
                        borderRadius: "8px",
                        border: "1px solid #B1CBBB",
                      }}
                      specialLabel="Phone"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <TextField
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
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
                  </div>
                </div>

                {/* PHOTO */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  mt={4}
                  p={2}
                  border="1px solid #eee"
                  borderRadius={2}
                >
                  <div className="relative cursor-pointer">
                    <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden">
                      {file ? (
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="Profile"
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <AddAPhotoIcon />
                      )}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Profile Photo</p>
                    <p className="text-xs text-gray-500">
                      JPG or PNG supported
                    </p>
                  </div>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
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
                  onClick={handlerSubmit}
                >
                  Register
                </Button>
              </Box>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
