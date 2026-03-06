"use client";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CircularText from "@/components/CircularText";
import { Heart, ShoppingCart, Trash2, HeartOff } from "lucide-react";
import { Star } from "@mui/icons-material";
import { AuthContext } from "@/app/context/authContext";
import { useFavorite } from "@/app/context/favoriteContext";
import { useCart } from "@/app/context/cartContext";
import Footer from "@/app/Footer/page";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useConfirm } from "@/app/context/confirmContext";

type ReviewStats = {
  [productId: string]: { count: number; avgRating: number };
};
type ProductImage = { url: string; publicId?: string; _id?: string };
type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: ProductImage[];
  slug: string;
  stock?: string;
};

const FavoritePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { isAuthenticated } = useContext(AuthContext);
  const {
    favorites,
    totalPages,
    currentPage,
    totalFavorites,
    removeFavorite,
    addFavorite,
    fetchFavorites,
    loading,
    loadingFav,
    clearFavorites,
  } = useFavorite();
  const { addToCart } = useCart();
  const { confirm } = useConfirm();

  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchFavorites(page);
  }, [page, isAuthenticated]);

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`,
        );
        const data = await res.json();
        setReviewStats(data.stats);
      } catch {
        toast.error("Failed to load reviews");
      }
    };
    if (favorites.length > 0) fetchReviewStats();
  }, [favorites]);

  const handleFavorite = async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      router.push("/Login");
      return;
    }
    if (loadingFav[productId]) return;
    const isFav = favorites.some((f) => f._id === productId);
    if (isFav) {
      const confirmed = await confirm({
        title: "Remove from Favorites",
        description: `Are you sure you want to remove "${productName}" from your favorites?`,
        confirmText: "Yes, Remove",
        cancelText: "Cancel",
        variant: "destructive",
      });
      if (confirmed) await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  const handleClearFavorites = async () => {
    const confirmed = await confirm({
      title: "Clear All Favorites",
      description: `This will remove all ${totalFavorites} items from your favorites. Are you sure?`,
      confirmText: "Yes, Clear All",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) await clearFavorites();
  };

  const isFavorite = (productId: string) =>
    favorites.some((f) => f._id === productId);

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");
    if (addingToCart === product._id) return;
    try {
      setAddingToCart(product._id);
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setAddingToCart(null);
    }
  };

  const goToPage = (p: number) => {
    router.push(`/favorite?page=${p}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;
  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <>
      <div className="min-h-160 flex-1 p-4 md:mt-0">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : favorites.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center w-full">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#1e3d2a] flex items-center justify-center">
                  <HeartOff className="w-12 h-12 text-gray-400 dark:text-[#7aab8a]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-[#c8e6d0] mb-2">
                No Favorites Yet
              </h2>
              <p className="text-gray-500 dark:text-[#7aab8a] text-base mb-6">
                Start adding products to your favorites to see them here!
              </p>
              <Link href="/AllProduct">
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer">
                  Browse Products
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center gap-3 mb-6">
              <div className="text-sm text-gray-700 dark:text-[#a8d4b8]">
                Showing{" "}
                <span className="text-primary font-bold">
                  {favorites.length}
                </span>{" "}
                of{" "}
                <span className="text-primary font-bold">{totalFavorites}</span>{" "}
                favorites
              </div>

              {/* Desktop clear button  */}
              <button
                onClick={handleClearFavorites}
                className="hidden sm:flex items-center gap-2 px-4 py-2
                  bg-white dark:bg-[#162820]
                  text-gray-700 dark:text-[#c8e6d0]
                  border border-gray-300 dark:border-white/10
                  rounded-lg transition-all duration-300 ease-in-out
                  hover:scale-105 active:scale-95
                  shadow-sm hover:shadow-md font-medium cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear All Favorites
              </button>

              {/* Mobile clear button  */}
              <button
                onClick={handleClearFavorites}
                className="sm:hidden flex items-center gap-2 px-3 py-2
                  bg-white dark:bg-[#162820]
                  text-gray-700 dark:text-[#c8e6d0]
                  border border-gray-300 dark:border-white/10
                  rounded-lg cursor-pointer transition-all duration-200
                  active:scale-95 shadow-sm text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [@media(min-width:1600px)]:grid-cols-5 gap-4 sm:gap-5 [@media(min-width:1600px)]:gap-4">
              {favorites.map((p, index) => {
                const discountPercent =
                  p.salePrice && p.salePrice < p.price
                    ? Math.round(((p.price - p.salePrice) / p.price) * 100)
                    : 0;
                const stats = reviewStats[p._id];
                const hasStats = stats && stats.count > 0;
                const isFirstPage = page === 1;
                const shouldPrioritize = isFirstPage && index < 8;

                const mobileFavFill = isFavorite(p._id)
                  ? isDark ? "black" : "#393E46"
                  : "none";

                const mobileFavColor = isFavorite(p._id)
                  ? isDark ? "black" : "#393E46"
                  : isDark ? "black" : "#9ca3af";

                return (
                  <div
                    key={p._id}
                    className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative group"
                  >
                    {/* Badges */}
                    <div className="absolute top-3 left-0 z-10 flex flex-col gap-1.5">
                      {discountPercent > 0 && (
                        <span className="bg-secondary text-color text-[9px] sm:text-[11px] font-bold pl-2.5 pr-3 py-1 rounded-r-full shadow-md tracking-wide">
                          {discountPercent}% OFF
                        </span>
                      )}
                      {Number(p.stock) > 0 && Number(p.stock) < 6 && (
                        <span className="bg-white/90 backdrop-blur-sm border-r border-t border-b border-red-200 text-red-400 text-[9px] sm:text-[11px] font-semibold pl-2.5 pr-3 py-1 rounded-r-full shadow-sm tracking-wide">
                          Only {p.stock} left
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loadingFav[p._id]}
                      className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-2 right-2 z-10 cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/fav"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavorite(p._id, p.product_name);
                      }}
                    >
                      <Heart
                        style={{ color: mobileFavColor, fill: mobileFavFill }}
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isFavorite(p._id) ? "scale-110" : ""}`}
                        strokeWidth={2.5}
                      />
                    </Button>

                    <Link href={`/Products/${p.slug}`} className="flex-1 flex flex-col">
                      {/* Image */}
                      <div className="w-full shrink-0">
                        {p.image && p.image.length > 0 ? (
                          <div className="relative w-full h-50 md:w-36 md:h-36 lg:w-44 lg:h-44 mx-auto bg-white rounded-xs md:rounded-full overflow-hidden border border-white md:border-4">
                            <Image
                              src={p.image[0].url}
                              alt={p.product_name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              priority={shouldPrioritize}
                              loading={shouldPrioritize ? "eager" : "lazy"}
                              fetchPriority={shouldPrioritize ? "high" : "auto"}
                              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <p className="text-white text-sm text-center">No image!</p>
                        )}
                      </div>

                      {/* Name + Stars */}
                      <div className="px-2 sm:px-4 pt-2 pb-1 flex flex-col items-center gap-1 min-h-[56px] justify-center">
                        <h2 className="text-white text-lg sm:text-base md:text-lg truncate font-semibold text-center w-full">
                          {p.product_name}
                        </h2>
                        {hasStats && (
                          <div className="flex items-center gap-1">
                            <div className="flex text-yellow-500">
                              {[...Array(Math.round(stats.avgRating))].map((_, i) => (
                                <Star key={i} sx={{ fontSize: 14 }} />
                              ))}
                            </div>
                            <span className="text-[10px] text-color3 font-semibold">
                              ({stats.count})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="px-4 py-2 h-12 sm:h-12 md:h-18 overflow-hidden">
                        <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                          {p.description}
                        </h2>
                      </div>
                    </Link>

                    {/* Price + Cart */}
                    <div className="flex gap-2 justify-between items-center px-2 sm:px-4 py-2">
                      <div className="flex flex-col items-center">
                        {p.salePrice && p.salePrice < p.price ? (
                          <>
                            <span className="text-xs line-through text-red-400 dark:text-black opacity-60 dark:opacity-100 font-semibold">
                              ${p.price.toFixed(2)}
                            </span>
                            <span className="text-color text-md sm:text-base xl:text-lg font-semibold">
                              ${p.salePrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-color text-md sm:text-base xl:text-lg font-semibold">
                            ${p.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlerAddToCart(p);
                        }}
                        disabled={addingToCart === p._id}
                        className="hidden md:block w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white dark:hover:!bg-[#0b8457] dark:hover:!text-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart === p._id ? "Adding..." : "Add To Cart"}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlerAddToCart(p);
                        }}
                        disabled={addingToCart === p._id}
                        className="flex md:hidden bg-secondary text-color cursor-pointer hover:bg-[#D6EED6]/90 dark:hover:!bg-[#0b8457] dark:hover:!text-white transition-all duration-300 active:scale-95 rounded-full aspect-square p-0 min-w-[44px] min-h-[44px] w-11 h-11 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart === p._id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <ShoppingCart size={20} />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-12 text-color dark:text-[#a8d4b8]">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:border-white/10 ${page === 1 ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
                      className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {start > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm text-gray-400 dark:text-[#7aab8a]">…</span>
                    </PaginationItem>
                  )}
                  {pages.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goToPage(p)}
                        className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {end < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-2 text-sm text-gray-400 dark:text-[#7aab8a]">…</span>
                    </PaginationItem>
                  )}
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === totalPages}
                      onClick={() => goToPage(totalPages)}
                      className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => page < totalPages && goToPage(page + 1)}
                      className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:border-white/10 ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default FavoritePage;