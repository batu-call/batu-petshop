"use client";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import Image from "next/image";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Register = () => {
  const UserColor = "#B1CBBB";
   const PrimaryText = "#393E46";
  const router = useRouter();

  type formDataType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    role: string;
  };

  const [formData, setFormData] = useState<formDataType>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "User",
  });

  const [file, setFile] = useState<File | null>(null);

  type FormInputNames = keyof formDataType;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as FormInputNames;
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlerSubmit = async () => {
    try {
      const data = new FormData();
      for (const key in formData) {
        const k = key as keyof formDataType;
        data.append(k, formData[k]);
      }
      if (file) {
        data.append("uploads", file);
      }

      const response = await axios.post(
        "http://localhost:5000/api/v1/user/register",
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        router.push("/Login");
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

  return (
    <div className="bg-primary min-h-screen w-full relative">
      <Navbar />
      <Sidebar />

      <div className="flex items-center justify-center p-4 md:p-8 mt-12 ml-40">
        <div className="bg-white w-full sm:w-3/4 md:w-2/4 lg:w-1/3 xl:w-1/4 p-6 sm:p-10 shadow-2xl rounded-2xl">
          <Box
            display="flex"
            flexDirection="column"
            gap={3}
            width="100%"
            fontFamily={"jost"}
          >
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ color: UserColor}}
            >
              Admin Register
            </Typography>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-5">
              <div className="flex flex-col gap-7">
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  type="text"
                  variant="standard"
                  fullWidth
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
                  type="text"
                  variant="standard"
                  fullWidth
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
            <div className="mt-6">
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
              </div>
              </div>

              <div className="flex flex-col gap-7">
                <TextField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  variant="standard"
                  fullWidth
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
                  type="tel"
                  variant="standard"
                  fullWidth
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
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="text"
                  variant="standard"
                  fullWidth
                  rows={2}
                  multiline
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
              </div>
            </div>

            {/* IMAGE UPLOAD */}
           <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent="space-between" 
              gap={2}
              mt={3}
              p={2}
              border="1px solid #eee"
              borderRadius={1}
            >
       
              <div className="rounded-full w-24 h-24 border-2 border-gray-300 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                {file ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Seçilen Avatar"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <AccountCircleIcon 
                    sx={{
                      fontSize: 80,
                      color: UserColor,
                    }}
                  />
                )}
              </div>

          
              <Button
                variant="contained"
                component="label"
                sx={{
                  backgroundColor: UserColor,
                  color: PrimaryText, 
                  "&:hover": {
                    backgroundColor: "#9BB7A6", 
                  },
                  width: { xs: "100%", sm: "180px" },
                  height: "50px",
                  textTransform: "none",
                }}
              >
                Upload Image
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>

            {file && (
              <p className="text-gray-600 text-center">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{
                cursor: "pointer",
                backgroundColor: "#B1CBBB",
                height: "50px",
                mt: 2,
              }}
              onClick={handlerSubmit}
            >
              Register
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Register;
