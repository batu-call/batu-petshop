"use client";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";



const AdminLogin = () => {
    const AdminColor = "#B1CBBB";
    const router = useRouter();
    const { setAdmin } = useAdminAuth();

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

 

      const handlerLogin = async() => {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/login`,{
            email,password},
            {withCredentials:true}
          )
            if(response.data.success){
              setAdmin(response.data.admin);
              toast.success(response.data.message || "Login successful!");
              router.push("/main")
            }

        } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error("Login failed! Please try again.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
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
      <Typography variant="h5" textAlign="center" sx={{color : AdminColor}}>
        Admin Login
      </Typography>

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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" }, 
        }}
        />

      <TextField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
        }}
        />
      <Button
        variant="contained"
        fullWidth
        onClick={handlerLogin}
        sx={{ cursor: "pointer" , backgroundColor : "#B1CBBB"}}
        >
        Login
      </Button>
    </Box>     
    </div>
    </div>

  );
};

export default AdminLogin;
