"use client";
import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Image from "next/image";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;    
};

const MyProfil = () => {
  const { user, setUser } = useContext(AuthContext);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  if (!user) return (
    <div className="w-full">
      <Navbar />
      <Sidebar/>
      <div className="ml-40 flex justify-center items-center h-full ">
      <h2 className="text-color text-2xl">No user found, please <a href="/Login" className="text-color2">Login</a></h2>
      </div>
      </div>
  )  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormDataType;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      
      (Object.keys(formData) as (keyof FormDataType)[]).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (file) data.append("avatar", file);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update`,
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Profile updated!");
        if (response.data.user) setUser(response.data.user);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data?.message || "Update failed");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Update failed");
      }
    }
  };

  return (
    <div className="bg-primary min-h-screen w-full relative">
      <Navbar />
      <Sidebar />

      <div className="flex items-center justify-center p-4 md:p-8 mt-12 ml-40">
        <div className="bg-white w-full sm:w-3/4 md:w-2/4 lg:w-1/3 xl:w-1/4 p-6 sm:p-10 shadow-2xl rounded-2xl">
          <Typography variant="h5" textAlign="center" mb={3} className="text-color tex">
            My Profile
          </Typography>

          {/* Avatar Upload */}
          <Box
            display="flex"
            alignItems="center"
            gap={3}
            mb={4}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <div className="w-24 h-24 relative rounded-full border-2 border-gray-300 overflow-hidden flex items-center justify-center">
              {file ? (
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Selected Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src={user.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <Button
              variant="contained"
              component="label"
              sx={{ mt: { xs: 2, sm: 0 }, textTransform: "none" ,backgroundColor:"#B1CBBB"}}
            >
              Change Avatar
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Box>

          {/* Form */}
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              variant="standard"
              slotProps={{
                    inputLabel: {
                      sx: {
                        color: "#B1CBBB",
                        "&.Mui-focused": {
                          color: "#393E46",
                          backgroundColor: "#B1CBBB",
                          padding: 0.4,
                          borderRadius: 1,
                        },
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
              slotProps={{
                    inputLabel: {
                      sx: {
                        color: "#B1CBBB",
                        "&.Mui-focused": {
                          color: "#393E46",
                          backgroundColor: "#B1CBBB",
                          padding: 0.4,
                          borderRadius: 1,
                        },
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
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="standard"
              slotProps={{
                    inputLabel: {
                      sx: {
                        color: "#B1CBBB",
                        "&.Mui-focused": {
                          color: "#393E46",
                          backgroundColor: "#B1CBBB",
                          padding: 0.4,
                          borderRadius: 1,
                        },
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
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="standard"
              slotProps={{
                    inputLabel: {
                      sx: {
                        color: "#B1CBBB",
                        "&.Mui-focused": {
                          color: "#393E46",
                          backgroundColor: "#B1CBBB",
                          padding: 0.4,
                          borderRadius: 1,
                        },
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
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              sx={{ mt: 2 ,backgroundColor:"#B1CBBB"}}
            >
              Save Changes
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default MyProfil;
