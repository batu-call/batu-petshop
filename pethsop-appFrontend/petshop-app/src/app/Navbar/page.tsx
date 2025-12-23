"use client";
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import { CartContext } from "../context/cartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
import { Search } from "lucide-react";
import TextField from "@mui/material/TextField";
import MobileMenu from "@/app/components/mobile";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { FavoriteContext } from "../context/favoriteContext";

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
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useContext(AuthContext);
  const { cart, setCart } = useContext(CartContext);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { favorites } = useContext(FavoriteContext);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
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
      setCart([]);
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/search?query=${value}`
        );
        const data: Product[] = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleFocusSearch = async () => {
    setIsSearchFocused(true);

    if (searchQuery.trim() && searchResults.length === 0) {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/search?query=${searchQuery}`
        );
        const data: Product[] = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="md:ml-24 lg:ml-40 relative z-50">
      <div className="w-full h-14 sm:h-16 lg:h-18 bg-primary relative flex items-center justify-between">
        {/* Mobile menu */}
        <div className="absolute top-3 md:hidden flex items-center justify-center">
          <MobileMenu anchor="left" />
        </div>

        {/* Search & User & Cart & Logout */}
        <div className="flex items-center gap-5 absolute right-5 md:right-2">
          {/* Search */}
          <div
            ref={dropdownRef}
            className="w-32 sm:w-40 md:w-56 lg:w-64 xl:w-72"
          >
            <div className="relative w-full max-w-md mx-auto">
              <TextField
                placeholder="Search..."
                variant="outlined"
                fullWidth
                autoComplete="off"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={handleFocusSearch}
                onBlur={() => {
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    setSearchResults([]);
                  }, 150);
                }}
                InputProps={{
                  startAdornment: (
                    <Search className="mr-2 opacity-70" size={18} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: { xs: "36px", md: "40px", lg: "44px" },
                    borderRadius: "12px",

                    backgroundColor: "rgba(255,255,255,0.3)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",

                    border: "1px solid rgba(255,255,255,0.4)",

                    "& fieldset": {
                      border: "none",
                    },

                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.35)",
                    },

                    "&.Mui-focused": {
                      backgroundColor: "rgba(255,255,255,0.35)",
                      boxShadow: "0 0 0 2px rgba(255,255,255,0.5)",
                    },

                    "& input": {
                      color: "#1f2937",
                      paddingLeft: "4px",
                    },

                    "& input::placeholder": {
                      color: "#4b5563",
                      opacity: 1,
                    },
                  },
                }}
              />

              {/* Dropdown results */}
              {loading && isSearchFocused && (
                <div className="absolute bg-white w-full shadow rounded mt-1 p-2 z-[9999]">
                  Searching...
                </div>
              )}
              {!loading &&
                searchQuery &&
                isSearchFocused &&
                searchResults.length === 0 && (
                  <div className="absolute bg-white w-full shadow rounded mt-1 p-2 z-[9999]">
                    No results found
                  </div>
                )}
              {!loading && isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white w-50 md:w-full shadow-lg rounded z-[9999] max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      href={`/Products/${product.slug}`}
                      className="flex flex-row items-center gap-2 px-3 py-2 hover:bg-gray-100 w-50 md:w-full transition border border-[#D6EED6] shadow-md"
                      onClick={() => {
                        setSearchResults([]);
                        setIsSearchFocused(false);
                      }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 xl:w-24 xl:h-24 relative">
                        {product.image && product.image.length > 0 ? (
                          <Image
                            src={product.image[0].url}
                            alt={product.product_name}
                            fill
                            sizes="96px"
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
                        <p className="text-sm sm:text-base font-semibold text-color md:text-md lg:text-sm xl:text-sm text-shadow-sm">
                          {product.price},00$
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Avatar */}
          <Dropdown>
            <DropdownButton>
              <div className="relative w-7 h-7 lg:w-10 lg:h-10 cursor-pointer">
                <Image
                  src={user?.avatar || "/default-avatar.png"}
                  alt="user avatar"
                  fill
                  sizes="(max-width: 1024px) 40px, 50px"
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
                <DropdownItem href="/favorite">
                  <FavoriteBorderIcon sx={{ color: "#A8D1B5", mr: 1 }} />{" "}
                  Favorite ({" "}
                  <span className="text-md text-color2 font-semibold">
                    {favorites.length}
                  </span>{" "}
                  )
                </DropdownItem>
                <DropdownItem href="/orders">
                  <ReceiptIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Orders
                </DropdownItem>
                <DropdownItem href="/settings">
                  <SettingsIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Settings
                </DropdownItem>
              </DropdownMenu>
            )}
          </Dropdown>

          {/* Cart */}
          <div className="relative">
            {isAuthenticated ? (
              <Link href="/Cart">
                <div className="relative w-7 h-7 lg:w-12 lg:h-12 items-center justify-center flex transition duration-300 ease-in-out hover:scale-105">
                  <ShoppingCartIcon
                    className="text-color"
                    sx={{ fontSize: { xs: 24, md: 32 } }}
                  />
                  {cart.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-white text-color text-xs flex items-center justify-center">
                      {cart.length}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="cursor-not-allowed opacity-50">
                <ShoppingCartIcon />
              </div>
            )}
          </div>
          {/* Button */}
          <div className="hidden md:flex items-center justify-center transition duration-300 ease-in-out hover:scale-105">
            {isAuthenticated ? (
              <Button
                className="cursor-pointer bg-secondary text-color w-24 lg:w-32 text-base hover:bg-secondary"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Link href={"/Login"}>
                <Button className="cursor-pointer bg-secondary text-color w-24 lg:w-32 text-base hover:bg-secondary">
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
