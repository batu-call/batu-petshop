"use client";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const Register = () => {
  const AdminColor = "#B1CBBB";

  const router = useRouter();

  type formDataType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  };

  const [formData, setFormData] = useState<formDataType>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
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
        data.append("avatar", file);
      }
      const response = await axios.post(
        "http://localhost:5000/api/v1/admin/add",
        data,{withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
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

  const goToLogin = () => {
    router.push("/admin");
  };

  return (
    <div className="bg-primary w-full h-screen relative">
      <div className="bg-white w-1/4 p-12 shadow-2xl rounded-2xl absolute left-190 top-45">
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
          width="320px"
          margin="100px auto"
          fontFamily={"jost"}
        >
          <Typography
            variant="h5"
            textAlign="center"
            sx={{ color: AdminColor }}
          >
            Admin Regsiter
          </Typography>

          <div className="flex gap-12 w-full">
            <div className="w-240">
              <TextField
                label="FirstName"
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
                label="LastName"
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
            <div className="w-240">
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

          <div>
            <Button
              variant="contained"
              component="label"
              sx={{ backgroundColor: "#B1CBBB" }}
            >
              Upload Avatar
              <input type="file" onChange={handleFileChange} />
            </Button>

            <Typography sx={{ mt: 1, color: "#B1CBBB" }}>
              Selected: {file?.name}
            </Typography>
          </div>

          <h2
            className="text-color2 cursor-pointer text-jost w-15"
            onClick={goToLogin}
          >
            Login
          </h2>
          <Button
            variant="contained"
            fullWidth
            sx={{ cursor: "pointer", backgroundColor: "#B1CBBB" }}
            onClick={handlerSubmit}
          >
            Register
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Register;
