"use client";
import React, { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Navbar/page";
import Link from "next/link";
import Sidebar from "../Sidebar/page";
import { AuthContext } from "../context/authContext";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox } from "@mui/material";



const Login = () => {
    const LoginColor = "#B1CBBB";
    const router = useRouter();
    const {setUser,setIsAuthenticated} = useContext(AuthContext)

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [rememberMe,setRememberMe] = useState(false)

 

      const handlerLogin = async() => {
        try {
          const response = await axios.post("http://localhost:5000/api/v1/user/login",{
            email,password,rememberMe},
            {withCredentials:true}
          )
            if(response.data.success){
              toast.success("Login successful!");

              setUser(response.data.user); 
              setIsAuthenticated(true);
              router.push("/main")
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

    

  return (
    <div className="bg-primary w-full h-screen relative">
      <Navbar/>
      <Sidebar/>
    <div className="bg-white w-1/4 p-12 shadow-2xl rounded-2xl absolute left-190 top-50">
    <Box 
      display="flex"
      flexDirection="column"
      gap={3}
      width="320px"
      margin="100px auto"
      fontFamily={"jost"}
      >
      <Typography variant="h5" textAlign="center" sx={{color : LoginColor}}>
       Login
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
        <Link href={"/Register"}>
        <h2 className="text-color text-sm font-bold opacity-80">Register</h2>
        </Link>
        <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{ color: "#B1CBBB" }}
              />
            }
            label="Remember Me"
            className="text-color2"
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

export default Login;
