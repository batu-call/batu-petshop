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
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
  DropdownLabel,
} from "@/app/components/dropdown/index";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { Search } from "lucide-react";
import TextField from "@mui/material/TextField";

const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`,
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
    <div className="sticky top-0 z-50">
      <div className="w-full bg-primary shadow-md flex items-center justify-between px-4 lg:px-8 h-16 lg:h-20 relative">
        <div className="flex items-center space-x-4">
          <Link href="/main" className="flex-shrink-0">
            <div className="relative w-10 h-10 lg:w-16 lg:h-16">
              <Image
                src="/logo.png"
                alt="main-icon"
                fill
                sizes="(max-width: 768px) 40px, 64px"
                className="object-contain"
              />
            </div>
          </Link>

          <h2 className="hidden lg:block text-white opacity-40 text-xs max-w-xs xl:max-w-md">
            This website is a portfolio project created for demonstration
            purposes only. All products shown are fictitious and not for sale.
            Designed and developed by Batuhan Callioglu.
          </h2>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 lg:w-5 lg:h-5 opacity-60 pointer-events-none" />
            <TextField
              placeholder="Search..."
              variant="outlined"
              autoComplete="off"
              sx={{
                width: { xs: "90px", sm: "120px", md: "140px", lg: "260px" },
                "& .MuiOutlinedInput-root": {
                  height: { xs: "35px", lg: "38px" },
                  borderRadius: "10px",
                  paddingRight: "30px",
                  fontSize: { xs: "12px", lg: "16px" },
                  transition: "0.2s ease",
                  "&:hover fieldset": {
                    borderColor: "#B1CBBB",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#B1CBBB",
                  },
                  "& input": {
                    color: "#393E46",
                    padding: { xs: "8px 10px", lg: "10px 14px" },
                  },
                },
              }}
            />
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Dropdown>
              <DropdownButton>
                <div className="w-8 h-8 lg:w-10 lg:h-10 relative cursor-pointer flex-shrink-0">
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
                  <DropdownItem
                    href="/my-profile"
                    className="text-color font-bold"
                  >
                    <AccountCircleIcon
                      sx={{ color: "#A8D1B5", mr: 1, fontSize: 20 }}
                    />{" "}
                    Profile
                  </DropdownItem>
                  <DropdownItem
                    href="/settings"
                    className="text-color font-bold"
                  >
                    <SettingsIcon
                      sx={{ color: "#A8D1B5", mr: 1, fontSize: 20 }}
                    />{" "}
                    Settings
                  </DropdownItem>
                  <DropdownItem href="/orders" className="text-color font-bold">
                    <ReceiptIcon
                      sx={{ color: "#A8D1B5", mr: 1, fontSize: 20 }}
                    />{" "}
                    Orders
                  </DropdownItem>
                  <DropdownItem
                    href="/billing"
                    className="text-color font-bold"
                  >
                    <CreditCardIcon
                      sx={{ color: "#A8D1B5", mr: 1, fontSize: 20 }}
                    />{" "}
                    Billing
                  </DropdownItem>
                </DropdownMenu>
              </div>
            </Dropdown>

            <div className="relative transition duration-300 ease-in-out hover:scale-110 flex-shrink-0">
              <Link href={"/Cart"}>
                <ShoppingCartIcon
                  fontSize="medium"
                  className="text-gray-600 lg:text-gray-800 p-1 lg:p-0 w-8 h-8 lg:w-10 lg:h-10"
                />

                {cart.length > 0 && (
                  <div className="absolute -top-1 right-0 transform translate-x-1/4 -translate-y-1/4 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-white text-color text-xs flex items-center justify-center z-10 text-jost font-bold">
                    {cart.length}
                  </div>
                )}
              </Link>
            </div>

            <div className="flex-shrink-0 transition duration-300 ease-in-out hover:scale-105">
              {isAuthenticated ? (
                <Button
                  className="cursor-pointer bg-secondary text-color w-auto px-2 py-1 text-sm lg:w-24 lg:text-base hover:bg-secondary transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Link href={"/Login"}>
                  <Button className="cursor-pointer bg-secondary text-color w-auto px-2 py-1 text-sm lg:w-24 lg:text-base hover:bg-secondary transition-colors">
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
