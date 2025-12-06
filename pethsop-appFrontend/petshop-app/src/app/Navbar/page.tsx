"use client";
import React, { useContext, useState, useRef, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import { CartContext } from "../context/cartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownLabel } from "@/app/components/dropdown/index";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { Search } from "lucide-react";
import TextField from "@mui/material/TextField";
import MobileMenu from "@/app/components/mobile";

type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  image: ProductImage[];
  slug: string;
};

const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) toast.success("Logged out successfully!");
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

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/search?query=${value}`);
        const data: Product[] = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="w-full relative z-50">
      <div className="w-full h-15 xs:h-50 sm:h-15 md:h-20 lg:h-30 xl:h-30 bg-primary shadow-md relative flex items-center justify-between">
        {/* Mobile menu */}
        <div className="absolute top-3 md:hidden">
          <MobileMenu anchor="left" />
        </div>

        {/* Logo */}
        <Link href="/main" className="md:fixed">
          <Image
            src="/logo.png"
            alt="main-icon"
            width={500}
            height={500}
            className="hidden md:flex justify-center items-center w-15 h-15 sm:h-25 sm:w-25 md:w-24 md:h-24 lg:w-40 lg:h-40"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>


       

        {/* Search & User & Cart & Logout */}
        <div className="flex items-center gap-5 absolute right-2">
           {/* Search */}
        <div className="relative w-30 sm:w-30 md:w-60 lg:w-80 xl:w-full max-w-md mx-auto ">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 lg:w-5 lg:h-5 w-4 h-4 opacity-60" />
          <TextField
            placeholder="Search..."
            variant="outlined"
            autoComplete="off"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: { xs: "30px", md: "48px", lg: "50px" },
                borderRadius: "10px",
                paddingRight: "40px",
                "&:hover fieldset": { borderColor: "#B1CBBB" },
                "&.Mui-focused fieldset": { borderColor: "#B1CBBB" },
                "& input": { color: "#393E46" },
              },
            }}
          />

          {/* Dropdown results */}
          <div ref={dropdownRef}>
            {loading && (
              <div className="absolute bg-white w-full shadow rounded mt-1 p-2 z-[9999]">
                Searching...
              </div>
            )}
            {!loading && searchQuery && searchResults.length === 0 && (
              <div className="absolute bg-white w-full shadow rounded mt-1 p-2 z-[9999]">
                No results found
              </div>
            )}
            {!loading && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-white w-full shadow-lg rounded z-[9999] max-h-96 overflow-y-auto">
                {searchResults.map((product) => (
                  <Link
                    key={product._id}
                    href={`/Products/${product.slug}`}
                    className="flex flex-col sm:flex-row items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full transition"
                    onClick={() => setSearchResults([])}
                  >
                    <div className="flex-shrink-0">
                      {product.image && product.image.length > 0 ? (
                        <Image
                          src={product.image[0].url}
                          alt={product.product_name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-1 justify-between w-full">
                      <h2 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">
                        {product.product_name}
                      </h2>
                      <p className="text-sm sm:text-base font-medium text-green-600">
                        {product.price},00$
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* avatar */}
          <Dropdown>
            <DropdownButton>
              <div className="lg:w-[50px] lg:h-[50px] w-7 h-7 relative cursor-pointer">
                <Image
                  src={user?.avatar || "/default-avatar.png"}
                  alt="user avatar"
                  fill
                  className="object-cover rounded-full border border-gray-300"
                />
              </div>
            </DropdownButton>
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownLabel>My Account</DropdownLabel>
                <DropdownItem href="/my-profile">
                  <AccountCircleIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Profile
                </DropdownItem>
                <DropdownItem href="/settings">
                  <SettingsIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Settings
                </DropdownItem>
                <DropdownItem href="/orders">
                  <ReceiptIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Orders
                </DropdownItem>
                <DropdownItem href="/billing">
                  <CreditCardIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Billing
                </DropdownItem>
              </DropdownMenu>
            )}
          </Dropdown>


            {/* Cart */}
         <div className="relative">
  {isAuthenticated ? (
    <Link href={"/Cart"}>
      <ShoppingCartIcon fontSize="medium" color="action" />
      {cart.length > 0 && (
        <div className="absolute -top-2 right-0 w-5 h-5 rounded-full bg-white text-color text-sm flex items-center justify-center">
          {cart.length}
        </div>
      )}
    </Link>
  ) : (
    <div className="cursor-not-allowed opacity-50">
      <ShoppingCartIcon fontSize="medium" color="action" />
      {cart.length > 0 && (
        <div className="absolute -top-2 right-0 w-5 h-5 rounded-full bg-white text-color text-sm flex items-center justify-center">
          {cart.length}
        </div>
      )}
    </div>
  )}
</div>
{/* Button */}
              <div className="hidden lg:flex items-center justify-center transition duration-300 ease-in-out hover:scale-105">
          {isAuthenticated ? (
            <Button
              className="cursor-pointer bg-secondary text-color w-15 lg:w-40 text-base hover:bg-secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Link href={"/Login"}>
              <Button className="cursor-pointer bg-secondary text-color w-40 text-base hover:bg-secondary">
                Login
              </Button>
            </Link>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
