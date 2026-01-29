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
import {
  Search,
  Filter,
  X,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import TextField from "@mui/material/TextField";
import MobileMenu from "@/app/components/mobile";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { FavoriteContext } from "../context/favoriteContext";
import RotatingText from "@/components/RotatingText";
import { signOut, useSession } from "next-auth/react";
import Slider from "@mui/material/Slider";

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

interface NavbarProps {
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
  priceRange?: number[];
  setPriceRange?: (range: number[]) => void;
  tempPriceRange?: number[];
  setTempPriceRange?: (range: number[]) => void;
  priceStats?: { min: number; max: number };
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  showOnSale?: boolean;
  setShowOnSale?: (show: boolean) => void;
  minRating?: number;
  setMinRating?: (rating: number) => void;
  hasActiveFilters?: () => boolean;
  clearAllFilters?: () => void;
  handlePriceChange?: (event: Event, newValue: number | number[]) => void;
  handlePriceChangeCommitted?: () => void;
}

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating", label: "Highest Rated" },
];

const Navbar: React.FC<NavbarProps> = ({
  showFilters,
  setShowFilters,
  priceRange,
  tempPriceRange,
  setTempPriceRange,
  priceStats,
  sortBy,
  setSortBy,
  showOnSale,
  setShowOnSale,
  minRating,
  setMinRating,
  hasActiveFilters,
  clearAllFilters,
  handlePriceChange,
  handlePriceChangeCommitted,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, setUser, setIsAuthenticated } =
    useContext(AuthContext);
  const { cart, setCart } = useContext(CartContext);
  const { favorites } = useContext(FavoriteContext);
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLDivElement | null>(null);
  const filterTitleRef = useRef<HTMLDivElement | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);

  const isFilterablePage =
    pathname.startsWith("/category/") || pathname === "/AllProduct";

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
      const target = event.target as Node;

      if (showFilters && setShowFilters) {
        if (
          filterDropdownRef.current &&
          !filterDropdownRef.current.contains(target) &&
          filterButtonRef.current &&
          !filterButtonRef.current.contains(target)
        ) {
          setShowFilters(false);
        }
      }

      if (isSearchFocused) {
        if (searchRef.current && !searchRef.current.contains(target)) {
          setIsSearchFocused(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters, isSearchFocused, setShowFilters]);

const handleLogout = async () => {
  try {
    if (session?.user) {
      await signOut({ redirect: false });
    } else {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`,
        {},
        { withCredentials: true }
      );
    }
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);

    toast.success("Logged out successfully!");

    router.replace("/Login");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Logout failed");
  }
};

  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.name || "";
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ");

      setUser({
        _id: "",
        firstName,
        lastName,
        email: session.user.email || "",
        phone: "",
        address: "",
        avatar: session.user.image || "",
        role: "User",
      });
      setIsAuthenticated(true);
    }
  }, [session, setUser, setIsAuthenticated]);

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
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/search?query=${value}`,
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

  const handleMinPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    if (!priceStats || !setTempPriceRange || !tempPriceRange) return;

    if (value === "") {
      setTempPriceRange([priceStats.min, tempPriceRange[1]]);
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    const clampedMin = Math.max(
      priceStats.min,
      Math.min(numValue, tempPriceRange[1]),
    );

    setTempPriceRange([clampedMin, tempPriceRange[1]]);
  };

  const handleMaxPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    if (!priceStats || !setTempPriceRange || !tempPriceRange) return;

    if (value === "") {
      setTempPriceRange([tempPriceRange[0], priceStats.max]);
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    const clampedMax = Math.min(
      priceStats.max,
      Math.max(numValue, tempPriceRange[0]),
    );

    setTempPriceRange([tempPriceRange[0], clampedMax]);
  };

  const applyManualPriceInput = () => {
    if (!handlePriceChangeCommitted) return;
    handlePriceChangeCommitted();
  };

  return (
    <div
      className={`
        lg:relative w-full z-50 opacity-95 lg:opacity-100
        ${
          isFilterablePage
            ? ""
            : "fixed top-0 md:ml-24 lg:ml-40 md:w-[calc(100%-6rem)] lg:w-[calc(100%-10rem)]"
        }
      `}
    >
      <div className="w-full h-14 sm:h-16 lg:h-18 bg-primary relative flex items-center justify-between">
        {/* Mobile menu */}
        <div className="absolute top-2 md:hidden flex items-center justify-center">
          <MobileMenu anchor="left" />
        </div>

        {/* Page Title & Rotating Text */}
        <div className="hidden md:flex ml-7">
          {pageTitle() && (
            <div
              className="relative flex items-center gap-3"
              ref={filterTitleRef}
            >
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
          {isFilterablePage && setShowFilters && hasActiveFilters && (
            <div className="relative hidden md:block" ref={filterButtonRef}>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer
                  ${
                    showFilters
                      ? "bg-white text-white hover:bg-[#D6EED6]"
                      : "bg-[#D6EED6] hover:bg-white text-color "
                  }
                `}
              >
                <p className="text-color">Filter</p>
                <Filter size={16} className="text-color" />

                {hasActiveFilters() && (
                  <span className="bg-secondary text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                )}

                {showFilters ? (
                  <ChevronUp size={14} className="text-color transition-all" />
                ) : (
                  <ChevronDown
                    size={14}
                    className="text-color transition-all"
                  />
                )}
              </Button>

              {/* ✅ FIX: Filter dropdown genişliği düzeltildi */}
              {showFilters && (
                <div
                  ref={filterDropdownRef}
                  className="fixed top-12 right-2 w-[calc(100vw-1rem)] sm:w-96 md:w-[28rem] lg:w-[32rem] bg-white rounded-2xl shadow-2xl border-2 border-primary/20 p-4 sm:p-6 z-50"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-lg">
                      <Filter size={20} />
                      <span>Filters & Sort</span>
                    </div>

                    {hasActiveFilters() && clearAllFilters && (
                      <Button
                        onClick={clearAllFilters}
                        className="bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] text-xs px-3 py-1.5 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                      >
                        <X size={14} className="mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* SORT */}
                  {setSortBy && sortBy && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/30 bg-white text-primary font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* PRICE RANGE */}
                  {priceStats &&
                    tempPriceRange &&
                    setTempPriceRange &&
                    handlePriceChange &&
                    handlePriceChangeCommitted && (
                      <div className="mb-4">
                        <label className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                          <DollarSign size={16} />
                          Price: ${tempPriceRange[0]} - ${tempPriceRange[1]}
                        </label>

                        {/* Manual Input Fields */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">
                              Min Price
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={tempPriceRange[0]}
                                onChange={handleMinPriceInputChange}
                                min={priceStats.min}
                                max={priceStats.max}
                                className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              />
                            </div>
                          </div>

                          <div className="text-gray-400 font-bold pt-5">-</div>

                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">
                              Max Price
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={tempPriceRange[1]}
                                onChange={handleMaxPriceInputChange}
                                min={priceStats.min}
                                max={priceStats.max}
                                className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={applyManualPriceInput}
                            className="bg-primary text-white hover:bg-primary/90 px-4 py-2 mt-5 transition-all hover:scale-105 cursor-pointer"
                          >
                            Apply
                          </Button>
                        </div>

                        {/* Slider */}
                        <Slider
                          value={tempPriceRange}
                          onChange={handlePriceChange}
                          onChangeCommitted={handlePriceChangeCommitted}
                          valueLabelDisplay="auto"
                          min={priceStats.min}
                          max={priceStats.max}
                          sx={{
                            color: "#57B394",
                            height: 8,
                            "& .MuiSlider-thumb": {
                              width: 20,
                              height: 20,
                              backgroundColor: "#fff",
                              border: "3px solid #57B394",
                              "&:hover, &.Mui-focusVisible": {
                                boxShadow: "0 0 0 8px rgba(87, 179, 148, 0.16)",
                              },
                            },
                            "& .MuiSlider-track": {
                              backgroundColor: "#57B394",
                              borderColor: "#57B394",
                            },
                            "& .MuiSlider-rail": {
                              backgroundColor: "#d1d5db",
                              opacity: 0.5,
                            },
                          }}
                        />

                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>${priceStats.min}</span>
                          <span>${priceStats.max}</span>
                        </div>
                      </div>
                    )}

                  {/* EXTRA FILTERS */}
                  <div className="space-y-3">
                    {setShowOnSale !== undefined &&
                      showOnSale !== undefined && (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showOnSale}
                            onChange={(e) => setShowOnSale(e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-primary/30 text-primary"
                          />
                          <span className="text-sm font-medium text-primary">
                            Show Only On Sale
                          </span>
                        </label>
                      )}

                    {setMinRating !== undefined && minRating !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                          Minimum Rating
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setMinRating(rating)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                minRating === rating
                                  ? "bg-primary text-white shadow-md scale-105"
                                  : "bg-white text-primary border border-primary/30 hover:scale-105"
                              }`}
                            >
                              {rating === 0 ? "All" : `${rating}★`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEARCH - RESPONSIVE */}
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
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Dropdown>
            <DropdownButton>
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] z-[100]">
                <Image
                  src={user?.avatar || "/default-avatar.png"}
                  alt="user avatar"
                  fill
                  sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, (max-width: 1024px) 36px, 40px"
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
                <DropdownItem
                  href="/favorite"
                  className="flex items-center gap-2"
                >
                  <FavoriteBorderIcon sx={{ color: "#A8D1B5" }} />
                  <span>Favorite</span>
                  <span className="text-xs font-bold bg-secondary text-color px-2 py-0.5 rounded-xl">
                    {favorites.length}
                  </span>
                </DropdownItem>
                <DropdownItem href="/my-orders">
                  <ReceiptIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Orders
                </DropdownItem>
                <DropdownItem href="/settings">
                  <SettingsIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Settings
                </DropdownItem>
              </DropdownMenu>
            )}
          </Dropdown>

          {/* Cart - RESPONSIVE */}
          <div className="relative pr-2 md:pr-0">
            {isAuthenticated ? (
              <Link href="/Cart">
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 flex items-center justify-center transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]">
                  <ShoppingCartIcon
                    className="text-color"
                    sx={{ fontSize: { xs: 20, sm: 26, md: 28, lg: 32 } }}
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
          <div className="hidden md:flex items-center justify-center">
            {isAuthenticated ? (
              <Button
                className="cursor-pointer bg-secondary text-color w-24 lg:w-32 text-base hover:bg-secondary transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Link href={"/Login"}>
                <Button className="cursor-pointer bg-secondary text-color w-24 lg:w-32 text-base hover:bg-secondary transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md">
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