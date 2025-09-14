"use client";
import React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

const Register = () => {
    const AdminColor = "#B1CBBB";

    const router = useRouter();

    const goToLogin = () => {
      router.push("/")
    }

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
        Admin Regsiter
      </Typography>

      <TextField
        label="Email"
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

      <TextField
        label="Password"
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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
        }}
        />

         <TextField
        label="FirstName"
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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
        }}
        />

         <TextField
        label="LastName"
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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
        }}
        />

         <TextField
        label="Phone"
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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
        }}
        />

         <TextField
        label="Address"
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
            "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
        }}
        />

         <div>
      <Button
        variant="contained"
        component="label"
        sx={{ backgroundColor: "#B1CBBB" }}
      >
        Upload Avatar
        <input
          hidden
          type="file"
         
        />
      </Button>

     
        <Typography sx={{ mt: 1, color: "#B1CBBB" }}>
          Selected: 
        </Typography>
      
    </div>

        <h2 className="text-color2 cursor-pointer text-jost w-15"onClick={goToLogin}>Login</h2>
      <Button
        variant="contained"
        fullWidth
        sx={{ cursor: "pointer" , backgroundColor : "#B1CBBB"}}
        >
        Register
      </Button>
    </Box>     
    </div>
    </div>
  );
};

export default Register;
