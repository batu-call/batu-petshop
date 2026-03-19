"use client";

import { useState, useRef, useEffect, useContext, ChangeEvent, KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";

import { PAGE_TITLES, ROTATING_TEXTS, Product } from "./navbarTypes";
import { AuthContext } from "@/app/context/authContext";

export const useNavbar = (
  showFilters: boolean | undefined,
  setShowFilters: ((v: boolean) => void) | undefined,
  tempPriceRange: number[] | undefined,
  setTempPriceRange: ((r: number[]) => void) | undefined,
  setPriceRange: ((r: number[]) => void) | undefined,
  handlePriceChangeCommitted: (() => void) | undefined,
) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { setUser, setIsAuthenticated, logout } = useContext(AuthContext);

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

  const getPageTitle = (): string | undefined => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
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

  const pageTitle = getPageTitle();
  const rotatingTexts = pageTitle ? ROTATING_TEXTS[pageTitle] : undefined;

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
      if (session?.user) await signOut({ redirect: false });
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
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

 const handleEnterSearch = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key !== "Enter") return;
  const q = searchQuery.trim();
  if (!q) return;
  setIsSearchFocused(false);
  setSearchResults([]);
  setSearchQuery("");
  router.push(`/AllProduct?search=${encodeURIComponent(q)}`);
};

  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setTempPriceRange || !tempPriceRange) return;
    const value = e.target.value;
    if (value === "") { setTempPriceRange([0, tempPriceRange[1]]); return; }
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setTempPriceRange([Math.max(0, numValue), tempPriceRange[1]]);
  };

  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setTempPriceRange || !tempPriceRange) return;
    const value = e.target.value;
    if (value === "") { setTempPriceRange([tempPriceRange[0], 999999]); return; }
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setTempPriceRange([tempPriceRange[0], Math.max(0, numValue)]);
  };

  const applyManualPriceInput = () => {
    if (!setPriceRange || !tempPriceRange) return;
    setPriceRange(tempPriceRange);
    if (handlePriceChangeCommitted) handlePriceChangeCommitted();
  };

  return {
    isFilterablePage,
    pageTitle,
    rotatingTexts,
    searchQuery,
    searchResults,
    loading,
    isSearchFocused,
    setIsSearchFocused,
    setSearchQuery,
    setSearchResults,
    searchRef,
    filterButtonRef,
    filterTitleRef,
    filterDropdownRef,
    handleLogout,
    handleSearch,
    handleEnterSearch, 
    handleMinPriceInputChange,
    handleMaxPriceInputChange,
    applyManualPriceInput,
  };
};