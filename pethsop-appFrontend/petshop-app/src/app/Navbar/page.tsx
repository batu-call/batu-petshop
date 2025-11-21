"use client";
import React, { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { CartContext } from "../context/cartContext";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownLabel } from "@/app/components/dropdown/index";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { Search } from "lucide-react"
import TextField from "@mui/material/TextField";


const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/logout",
        {},
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Logged out successfully!");
      }
      localStorage.removeItem("UserToken");
      sessionStorage.removeItem("UserToken");
      setUser(null);
      setIsAuthenticated(false);
      router.push("/Login");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  return (
    <div>
      {/* Navbar container */}
      <div className="w-full h-30 bg-primary shadow-md relative">
        {/* Logo */}
        <Link href="/main" className="fixed">
          <Image
            src="/logo.png"
            alt="main-icon"
            width={500}
            height={500}
            className="flex justify-center items-center w-40 h-40"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Me */}
        <h2 className="ml-40 absolute top-0 color-white opacity-20">
          This website is a portfolio project created for demonstration purposes
          only. All products shown are fictitious and not for sale. Designed and
          developed by Batuhan Callioglu.
        </h2>

        {/* Logout button */}
        <div className="absolute top-10 right-15 flex items-center justify-center">
          <div className="relative w-full max-w-md mx-auto">
            <div className="mr-5 relative">
      <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
      <TextField 
        placeholder="Search..."
        variant="outlined"
        autoComplete="off"
        fullWidth
      sx={{
          width: "260px",        
          "& .MuiOutlinedInput-root": {
            height: "38px",
            borderRadius: "10px",
            paddingRight: "40px",
            transition: "0.2s ease",

            "&:hover fieldset": {
              borderColor: "#B1CBBB",  
            },

            "&.Mui-focused fieldset": {
              borderColor: "#B1CBBB",
            },
             "& input": {
              color: "#393E46",
            },
          },
        }}
        />
        </div>
    </div>

          <div className="flex gap-5">
            <div className="flex gap-5 items-center justify-center">
               <Dropdown>
  <DropdownButton>
    <div className="w-[50px] h-[50px] relative cursor-pointer">
      <Image
        src={user?.avatar || "/default-avatar.png"}
        alt="user avatar"
        fill
        className="object-cover rounded-full border border-gray-300"
      />
    </div>
  </DropdownButton>
  <div className={isAuthenticated ? "block" : "hidden"}>
  <DropdownMenu> 
  <DropdownLabel>My Account</DropdownLabel>

  <DropdownItem href="/my-profile" className="text-color font-bold">
    <AccountCircleIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Profile
  </DropdownItem>

  <DropdownItem href="/settings" className="text-color font-bold">
    <SettingsIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Settings
  </DropdownItem>

  <DropdownItem href="/orders" className="text-color font-bold">
    <ReceiptIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Orders
  </DropdownItem>

  <DropdownItem href="/billing" className="text-color font-bold">
    <CreditCardIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Billing
  </DropdownItem>

</DropdownMenu>
</div>
</Dropdown>
              <div className="relative transition duration-300 ease-in-out hover:scale-110">
                <Link href={"/Cart"}>
                  <ShoppingCartIcon
                    fontSize="large"
                    color="action"
                    className="p-1"
                  />

                  {cart.length > 0 && (
                    <div className="absolute -top-2 right-0 transform translate-x-1/4 -translate-y-1/4 w-5 h-5 rounded-full bg-white text-color text-sm flex items-center justify-center z-10 text-jost">
                      {cart.length}
                    </div>
                  )}
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center transition duration-300 ease-in-out hover:scale-105">
              {isAuthenticated ? (
                <Button
                  className="cursor-pointer bg-secondary text-color w-40 text-base hover:bg-secondary transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Link href={"/Login"}>
                  <Button className="cursor-pointer bg-secondary text-color w-40 text-base hover:bg-secondary transition-colors">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
