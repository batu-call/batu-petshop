"use client";
import React, { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/Context/AuthContext";

const Login = () => {

  const AdminColor = "#B1CBBB";
    const {setUser, setIsAuthenticated } = useContext(AuthContext);
  const [email,setEmail] = useState<string>("");
  const [password,setPassword] = useState<string>("");
  const router = useRouter(); 

  const goToRegister = () => {
    router.push("/register")
  }

  const handlerLogin  = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/v1/user/login",
        {email,password,role:"User"},
        {withCredentials:true,
          headers:{"Content-Type" : "application/json"}
        }
      )

      if(response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success(response.data.message)
        router.push("/")
      }
    } catch (error:unknown) {
      if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
    }
  }


  return (
       <div className="bg-primary ml-[150px] h-[760px] relative">
    <div className="bg-white w-1/4 p-12 shadow-2xl rounded-2xl absolute left-150 top-15">
    <form onSubmit={handlerLogin}>

    <Box 
      display="flex"
      flexDirection="column"
      gap={3}
      width="320px"
      margin="100px auto"
      fontFamily={"jost"}
      >
      <Typography variant="h5" textAlign="center" sx={{color : AdminColor}}>
       Login
      </Typography>

      <TextField
        label="Email"
        variant="standard"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

        <h2 
        className="w-15" 
        onClick={goToRegister}>
          Register
        </h2>


      <Button
      type="submit"
        variant="contained"
        fullWidth
        sx={{ cursor: "pointer" , backgroundColor : "#B1CBBB" , marginTop: "14px"}}
        >
        Login
      </Button>
    </Box>     
          </form>
    </div>
    </div>
  )
}

export default Login

