"use client";

import Image from "next/image";
import Link from "next/link";
import TextField from "@mui/material/TextField";
import { Search } from "lucide-react";
import { ChangeEvent } from "react";
import { Product } from "./navbarTypes";

type Props = {
  searchQuery: string;
  searchResults: Product[];
  loading: boolean;
  isSearchFocused: boolean;
  setIsSearchFocused: (v: boolean) => void;
  setSearchQuery: (v: string) => void;
  setSearchResults: (v: Product[]) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
};

const NavbarSearch = ({
  searchQuery,
  searchResults,
  loading,
  isSearchFocused,
  setIsSearchFocused,
  setSearchQuery,
  setSearchResults,
  handleSearch,
  searchRef,
}: Props) => {
  return (
    <div ref={searchRef} className="relative w-44 md:w-56 lg:w-64 xl:w-72">
      <TextField
        placeholder="Search..."
        variant="outlined"
        fullWidth
        autoComplete="off"
        value={searchQuery}
        onChange={handleSearch}
        onFocus={() => setIsSearchFocused(true)}
        InputProps={{
          startAdornment: <Search className="mr-2 opacity-70" size={18} />,
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

      <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
      `}</style>

      {isSearchFocused && (searchQuery || loading) && (
        <div
          className="absolute top-full right-0 w-64 sm:w-72 md:w-full mt-2 z-50"
          style={{ animation: "searchFadeIn 0.2s ease forwards" }}
        >
          <div className="bg-white dark:bg-[#162820] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-8">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block w-2 h-2 rounded-full bg-[#57B394]"
                      style={{ animation: `dotBounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 dark:text-[#7aab8a] font-semibold tracking-widest uppercase">
                  Searching…
                </span>
              </div>
            )}

            {/* No results */}
            {!loading && searchQuery && searchResults.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-7">
                <div className="w-11 h-11 rounded-full bg-[#eaf7f2] dark:bg-[#1e3d2a] flex items-center justify-center">
                  <Search size={18} className="text-[#57B394] dark:text-[#7aab8a]" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-[#c8e6d0]">No results found</p>
                <p className="text-xs text-gray-400 dark:text-[#7aab8a] text-center leading-relaxed">
                  Try a different keyword or check your spelling
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && searchResults.length > 0 && (
              <div className="max-h-64 md:max-h-72 overflow-y-auto">
                <div className="px-4 pt-3 pb-2 bg-[#f9fafb] dark:bg-[#1e3d2a] border-b border-gray-100 dark:border-white/10">
                  <span className="text-xs font-bold text-gray-400 dark:text-[#7aab8a] tracking-widest uppercase">
                    {searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {searchResults.map((product) => (
                  <Link
                    key={product._id}
                    href={`/Products/${product.slug}`}
                    onClick={() => {
                      setIsSearchFocused(false);
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-[#eaf7f2] dark:hover:bg-[#1e3d2a] transition-colors duration-150 border-b border-gray-50 dark:border-white/5 last:border-b-0"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0d1f18]">
                      {product.image?.length ? (
                        <Image
                          src={product.image[0].url}
                          alt={product.product_name}
                          fill
                          sizes="44px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search size={14} className="text-gray-300 dark:text-[#7aab8a]" />
                        </div>
                      )}
                    </div>

                    {/* Name + desc */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-700 dark:text-[#c8e6d0] truncate group-hover:text-[#57B394] dark:group-hover:text-[#7aab8a] transition-colors duration-150">
                        {product.product_name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-[#7aab8a]/70 truncate">
                        {product.description?.slice(0, 42)}
                        {(product.description?.length ?? 0) > 42 ? "…" : ""}
                      </span>
                    </div>

                    {/* Price badge */}
                    <div className="shrink-0 bg-[#eaf7f2] dark:bg-[#2d5a3d] group-hover:bg-[#57B394] dark:group-hover:bg-[#0b8457] rounded-lg px-2.5 py-1 transition-colors duration-200">
                      <span className="text-xs font-bold text-[#57B394] dark:text-[#7aab8a] group-hover:text-white transition-colors duration-200">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;