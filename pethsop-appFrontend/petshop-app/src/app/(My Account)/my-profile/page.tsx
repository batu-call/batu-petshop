"use client";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import Image from "next/image";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CircularText from "@/components/CircularText";

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const MyProfil = () => {
  const { user, setUser } = useContext(AuthContext);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Loading ve formData initial
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setLoading(false);
    }
  }, [user]);


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
      {loading ? (
        <div className="md:ml-25 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="md:ml-25 lg:ml-40 flex items-center justify-center p-4 md:p-8 mt-12">
          <div className="bg-white w-full xl:w-2/4 p-6 sm:p-10 shadow-2xl rounded-2xl">
            <Typography
              variant="h5"
              textAlign="center"
              mb={3}
              className="text-color"
            >
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
                    unoptimized
                  />
                ) : (
                  <Image
                    src={user?.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <Button
                variant="contained"
                component="label"
                sx={{
                  mt: { xs: 2, sm: 0 },
                  textTransform: "none",
                  backgroundColor: "#B1CBBB",
                }}
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
                sx={{
                  "& .MuiInput-underline:after": {
                    borderBottomColor: "#B1CBBB",
                  },
                }}
              />
              <Box>
                <Typography sx={{ color: "#B1CBBB", mb: 0.5 }}>Phone</Typography>
                <PhoneInput
                  country={"us"}
                  value={formData.phone}
                  onChange={(phone: string) =>
                    setFormData({ ...formData, phone })
                  }
                  inputStyle={{
                    width: "100%",
                    height: "56px",
                    borderRadius: "4px",
                    border: "1px solid #B1CBBB",
                    paddingLeft: "60px",
                    fontSize: "16px",
                    color: "#393E46",
                  }}
                  buttonStyle={{
                    border: "none",
                    background: "transparent",
                  }}
                  dropdownStyle={{
                    borderRadius: "8px",
                  }}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                sx={{ mt: 2, backgroundColor: "#B1CBBB" }}
              >
                Save Changes
              </Button>
            </Box>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfil;
