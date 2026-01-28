"use client";
import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "../context/authContext";
import CircularText from "@/components/CircularText";
import { Heart } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useFavorite } from "../context/favoriteContext";
import { Star } from "@mui/icons-material";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import Footer from "../Footer/page";
import Navbar from "../Navbar/page";

type ReviewStats = {
  [productId: string]: {
    count: number;
    avgRating: number;
  };
};

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
  salePrice?: number | null;
  stock: string;
  image: ProductImage[];
  slug: string;
};

const AllProduct = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const { favorites, addFavorite, removeFavorite, fetchFavorites } =
    useFavorite();
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState("default");
  const [showOnSale, setShowOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const [hasUserSetPrice, setHasUserSetPrice] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;

  // Calculate price range from products - MEMOIZED
  const priceStats = useMemo(() => {
    if (allProducts.length === 0) {
      return { min: 0, max: 1000 };
    }
    const prices = allProducts.map((p: Product) =>
      p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
    );
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  // Fetch products
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const params: any = { page: currentPage };

        const isDefaultPriceRange =
          priceRange[0] === priceStats.min && priceRange[1] === priceStats.max;

        if (!isDefaultPriceRange && hasUserSetPrice) {
          params.minPrice = priceRange[0];
          params.maxPrice = priceRange[1];
        }

        if (showOnSale) {
          params.onSale = true;
        }

        if (minRating > 0) {
          params.minRating = minRating;
        }

        if (sortBy !== "default") {
          params.sortBy = sortBy;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          { params, withCredentials: true },
        );

        if (response.data.success) {
          setAllProducts(response.data.products);
          setTotalPages(response.data.totalPages);
          setTotalProducts(response.data.totalProducts || 0);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [currentPage, priceRange, showOnSale, minRating, sortBy, hasUserSetPrice]);

  useEffect(() => {
    if (!hasUserSetPrice && priceStats.min !== 0 && priceStats.max !== 1000) {
      setPriceRange([priceStats.min, priceStats.max]);
      setTempPriceRange([priceStats.min, priceStats.max]);
    }
  }, [priceStats.min, priceStats.max, hasUserSetPrice]);

  // Display products with client-side rating filter
  const displayProducts = useMemo(() => {
    if (minRating > 0) {
      return allProducts.filter((product) => {
        const stats = reviewStats[product._id];
        return stats && stats.avgRating >= minRating;
      });
    }
    return allProducts;
  }, [allProducts, minRating, reviewStats]);

  // Fetch review stats
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`,
        );
        setReviewStats(response.data.stats);
      } catch {
        toast.error("Failed to load reviews");
      }
    };

    fetchReviewStats();
  }, []);

  // Fetch favorites
  useEffect(() => {
    if (isAuthenticated) fetchFavorites();
  }, [isAuthenticated, fetchFavorites]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");

    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      router.push("/Login");
      return;
    }

    const isFav = favorites.some((f) => f._id === productId);

    if (isFav) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  const isFavorite = (productId: string) =>
    favorites.some((f) => f._id === productId);

  const clearAllFilters = () => {
    setHasUserSetPrice(false);
    setPriceRange([priceStats.min, priceStats.max]);
    setTempPriceRange([priceStats.min, priceStats.max]);
    setShowOnSale(false);
    setMinRating(0);
    setSortBy("default");
    router.push("?page=1");
  };

  const hasActiveFilters = () => {
    return (
      priceRange[0] !== priceStats.min ||
      priceRange[1] !== priceStats.max ||
      showOnSale ||
      minRating > 0 ||
      sortBy !== "default"
    );
  };

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    setTempPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = () => {
    setPriceRange(tempPriceRange);
    setHasUserSetPrice(true);
    router.push("?page=1");
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`, { scroll: false });
  };

  // PAGINATION LOGIC
  const visibleCount = 5;
  let start = Math.max(2, currentPage - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;

  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <>
      <Navbar
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        tempPriceRange={tempPriceRange}
        setTempPriceRange={setTempPriceRange}
        priceStats={priceStats}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showOnSale={showOnSale}
        setShowOnSale={setShowOnSale}
        minRating={minRating}
        setMinRating={setMinRating}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        handlePriceChange={handlePriceChange}
        handlePriceChangeCommitted={handlePriceChangeCommitted}
      />
      <div className="flex-1 min-h-screen bg-white p-4">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-700">
              Showing{" "}
              <span className="text-primary font-bold">
                {displayProducts.length}
              </span>{" "}
              of <span className="text-primary font-bold">{totalProducts}</span>{" "}
              products
            </div>

            {/* EMPTY STATE */}
            {displayProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">😿</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters to see more results
                </p>
                {hasActiveFilters() && (
                  <Button
                    onClick={clearAllFilters}
                    className="bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-6 lg:gap-8 sm:p-0">
              {displayProducts.map((p) => {
                const discountPercent =
                  p.salePrice && p.salePrice < p.price
                    ? Math.round(((p.price - p.salePrice) / p.price) * 100)
                    : 0;

                const stats = reviewStats[p._id];
                return (
                  <Link
                    key={p._id}
                    href={`/Products/${p.slug}`}
                    className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative"
                  >
                    {/* DISCOUNT BADGE */}
                    {discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-secondary text-color text-[8px] sm:text-xs font-bold px-2 py-1 rounded-full z-10">
                        %{discountPercent} OFF
                      </span>
                    )}

                    {/* favorite */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavorite(p._id);
                      }}
                    >
                      <Heart
                        className={`w-3 h-3 transition-colors duration-300 active:scale-[0.97] group-hover:scale-110 ${
                          isFavorite(p._id) ? "text-gray-600" : "text-gray-400"
                        }`}
                        fill={isFavorite(p._id) ? "currentColor" : "none"}
                      />
                    </Button>

                    {/* image */}
                    <div className="flex items-center justify-center p-2 sm:p-4">
                      {p.image && p.image.length > 0 ? (
                        <Image
                          src={p.image[0].url}
                          alt={p.product_name}
                          width={400}
                          height={400}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                          className="rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-44 xl:h-44 object-cover border-2 sm:border-4 border-white shadow-2xl"
                        />
                      ) : (
                        <p className="text-white text-sm">No image!</p>
                      )}
                    </div>

                    <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                      <h2 className="text-white text-xs sm:text-base md:text-lg truncate font-semibold">
                        {p.product_name}
                      </h2>
                    </div>

                    {/* Review stars & count */}
                    {stats && stats.count > 0 && (
                      <div className="flex items-center justify-center gap-1 text-gray-200 text-[10px] sm:text-sm mt-1">
                        <div className="flex text-yellow-500">
                          {[...Array(Math.round(stats.avgRating))].map(
                            (_, i) => (
                              <Star key={i} sx={{ fontSize: 16 }} />
                            ),
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-color3 font-semibold">
                          ( {stats.count} )
                        </span>
                      </div>
                    )}

                    <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-24 md:h-24 overflow-hidden mt-1">
                      <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 sm:line-clamp-3 leading-snug">
                        {p.description}
                      </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                      <div className="flex flex-col items-center">
                        {p.salePrice && p.salePrice < p.price ? (
                          <>
                            <span className="line-through text-color text-xs opacity-55 font-bold">
                              ${(p.price).toFixed(2)}
                            </span>
                            <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                              ${(p.salePrice).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                            ${(p.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlerAddToCart(p);
                        }}
                        className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]"
                      >
                        Add To Cart
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Pagination className="mt-12 text-color">
                <PaginationContent>
                  {/* PREVIOUS */}
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={
                        currentPage === 1
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {/* FIRST PAGE */}
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {/* LEFT ELLIPSIS */}
                  {start > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm">…</span>
                    </PaginationItem>
                  )}

                  {/* MIDDLE PAGES */}
                  {pages.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink
                        isActive={currentPage === p}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {/* RIGHT ELLIPSIS */}
                  {end < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-2 text-sm">…</span>
                    </PaginationItem>
                  )}

                  {/* LAST PAGE */}
                  {totalPages > 1 && (
                    <PaginationItem className="cursor-pointer">
                      <PaginationLink
                        isActive={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* NEXT */}
                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage === totalPages
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
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

export default AllProduct;
