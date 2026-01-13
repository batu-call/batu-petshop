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
import { usePathname, useRouter } from "next/navigation";
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
import RotatingText from "@/components/RotatingText";

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
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useContext(AuthContext);
  const { cart, setCart } = useContext(CartContext);
  const { favorites } = useContext(FavoriteContext);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = () => {
    const staticTitles: Record<string, string> = {
      "/my-profile": "My Profile",
      "/favorite": "Favorite",
      "/orders": "My Orders",
      "/Cart": "Shopping Cart",
      "/Order": "All Users",
      "/Contact": "Contact Us",
      "/settings": "Setting",
    };

    if (staticTitles[pathname]) return staticTitles[pathname];

    if (pathname === "/") return "Home";
    if (pathname.startsWith("/category/Cat")) return "Cat Products";
    if (pathname.startsWith("/category/Dog")) return "Dog Products";
    if (pathname.startsWith("/category/Bird")) return "Bird Products";
    if (pathname.startsWith("/category/Fish")) return "Fish Products";
    if (pathname.startsWith("/category/Reptile")) return "Reptile Products";
    if (pathname.startsWith("/category/Rabbit")) return "Rabbit Products";
    if (pathname.startsWith("/category/Horse")) return "Horse Products";
    if (pathname.startsWith("/favorite")) return "Favorite";
  };

  const rotatingTexts: Record<string, string[]> = {
    "Cat Products": ["Cats", "Are", "Awesome!", "Meow!"],
    "Dog Products": ["Dogs", "Are", "Loyal!", "Woof!"],
    "Bird Products": ["Birds", "Can", "Sing!", "Tweet!"],
    "Fish Products": ["Fishes", "Swim", "Gracefully!", "Splash!"],
    "Reptile Products": ["Reptiles", "Are", "Cold-Blooded!", "Hiss!"],
    "Rabbit Products": ["Rabbits", "Are", "Cute!", "Hop!"],
    "Horse Products": ["Horses", "Are", "Majestic!", "Neigh!"],
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        setSearchResults([]);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
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

  return (
    <div className="md:ml-24 lg:ml-40 relative z-50">
      <div className="w-full h-14 sm:h-16 lg:h-18 bg-primary relative flex items-center justify-between">
        {/* Mobile menu */}
        <div className="absolute top-2 md:hidden flex items-center justify-center">
          <MobileMenu anchor="left" />
        </div>

        {/* Page Title & Rotating Text */}
        <div className="hidden md:flex ml-7">
          {pageTitle() && (
            <div className="relative flex items-center gap-3" ref={filterRef}>
              <h1 className="text-xl sm:text-xl font-bold mb-4 text-white flex items-center mt-4">
                {pageTitle()}
              </h1>

              {[
                "Cat Products",
                "Dog Products",
                "Bird Products",
                "Fish Products",
                "Reptile Products",
                "Rabbit Products",
                "Horse Products",
              ].includes(pageTitle()!) && (
                <RotatingText
                  texts={rotatingTexts[pageTitle()!] || ["Welcome"]}
                  mainClassName="hidden lg:block px-4 sm:px-6 md:px-8 py-1 sm:py-2 md:py-3 rounded-lg text-white font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-[#97cba9] via-[#79bfa1] to-[#57b394] overflow-hidden flex justify-center items-center"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.05}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  rotationInterval={3000}
                />
              )}
            </div>
          )}
        </div>

        {/* Search & User & Cart & Logout */}
        <div className="flex items-center gap-5 absolute right-2 md:right-2">
          {/* SEARCH */}
          <div
            ref={searchRef}
            className="relative w-32 sm:w-44 md:w-56 lg:w-64 xl:w-72"
          >
            <TextField
              placeholder="Search..."
              variant="outlined"
              fullWidth
              autoComplete="off"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
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
                  border: "1px solid rgba(255,255,255,0.4)",
                  "& fieldset": { border: "none" },
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.35)" },
                  "&.Mui-focused": {
                    backgroundColor: "rgba(255,255,255,0.35)",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.5)",
                  },
                  "& input": { color: "#1f2937", paddingLeft: "4px" },
                },
              }}
            />
            {/* Search dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 w-56 md:w-full mt-1 z-50">
                {loading && (
                  <div className="bg-white rounded shadow p-2 text-sm">
                    Searching...
                  </div>
                )}
                {!loading && searchQuery && searchResults.length === 0 && (
                  <div className="bg-white rounded shadow p-2 text-sm">
                    No results found
                  </div>
                )}
                {!loading && searchResults.length > 0 && (
                  <div className="bg-white shadow-lg rounded max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        href={`/Products/${product.slug}`}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchResults([]);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 transition border-b last:border-b-0"
                      >
                        <div className="relative w-10 h-10 shrink-0">
                          {product.image?.length ? (
                            <Image
                              src={product.image[0].url}
                              alt={product.product_name}
                              fill
                              sizes="40px"
                              className="rounded-md object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold truncate">
                            {product.product_name}
                          </span>
                          <span className="text-sm font-bold text-color">
                            {product.price},00$
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar Dropdown */}
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
                  Favorite (
                  <span className="text-md text-color2 font-semibold">
                    {" "}
                    {favorites.length}{" "}
                  </span>
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
                <div className="relative w-7 h-7 lg:w-12 lg:h-12 flex items-center justify-center transition duration-300 ease-in-out hover:scale-105">
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

          {/* Login/Logout Button */}
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
