"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Footer from "@/app/Footer/page";
import Navbar from "@/app/Navbar/page";

import { Button } from "@/components/ui/button";
import CircularText from "@/components/CircularText";

import { AuthContext } from "@/app/context/authContext";
import { useCart } from "@/app/context/cartContext";
import { useFavorite } from "@/app/context/favoriteContext";

import {
  Cat,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Filter,
  Heart,
  X,
} from "lucide-react";
import { Star } from "@mui/icons-material";
import Slider from "@mui/material/Slider";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  image: ProductImage[];
  slug: string;
  category?: string;
  stock?: string;
};

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, 1000]);
  const [priceStats, setPriceStats] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const [sortBy, setSortBy] = useState("default");
  const [showOnSale, setShowOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite, fetchFavorites } =
    useFavorite();

  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "rating", label: "Highest Rated" },
  ];

  useEffect(() => {
    if (!categorySlug) return;

    const fetchPriceStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/price-stats`,
          {
            params: { category: categorySlug },
          },
        );

        const { min, max } = response.data;

        setPriceStats({ min, max });
        setPriceRange([min, max]);
        setTempPriceRange([min, max]);
      } catch (error) {
        console.error("Failed to fetch price stats:", error);
        setPriceStats({ min: 0, max: 1000 });
        setPriceRange([0, 1000]);
        setTempPriceRange([0, 1000]);
      }
    };

    fetchPriceStats();
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          category: categorySlug,
          page,
          sortBy: sortBy, // ✅ Her zaman gönder
        };

        if (
          priceRange[0] !== priceStats.min ||
          priceRange[1] !== priceStats.max
        ) {
          params.minPrice = priceRange[0];
          params.maxPrice = priceRange[1];
        }

        if (showOnSale) {
          params.onSale = true;
        }

        if (minRating > 0) {
          params.minRating = minRating;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          { params },
        );

        const fetchedProducts = res.data.products || [];
        setAllProducts(fetchedProducts);
        setTotalPages(res.data.totalPages || 1);
        setTotalProducts(res.data.totalProducts || 0);
      } catch {
        toast.error("Products could not be loaded");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    categorySlug,
    page,
    priceRange,
    priceStats.min,
    priceStats.max,
    showOnSale,
    minRating,
    sortBy,
  ]);

  const displayProducts = React.useMemo(() => {
    return [...allProducts].sort((a, b) => {
      const aStock = Number(a.stock ?? 0);
      const bStock = Number(b.stock ?? 0);

      const aLowStock = aStock > 0 && aStock < 5;
      const bLowStock = bStock > 0 && bStock < 5;

      if (aLowStock && !bLowStock) return -1;
      if (!aLowStock && bLowStock) return 1;

      const aDiscount = a.salePrice && a.salePrice < a.price;
      const bDiscount = b.salePrice && b.salePrice < b.price;

      if (aDiscount && !bDiscount) return -1;
      if (!aDiscount && bDiscount) return 1;

      return 0;
    });
  }, [allProducts]);

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");

    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const clearAllFilters = () => {
    setPriceRange([priceStats.min, priceStats.max]);
    setTempPriceRange([priceStats.min, priceStats.max]);
    setShowOnSale(false);
    setMinRating(0);
    setSortBy("default");
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
    setShowMobileFilters(false);
  };

  const handleMinPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
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
    handlePriceChangeCommitted();
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

  const goToPage = (p: number) => {
    router.push(`/category/${categorySlug}?page=${p}`, { scroll: false });
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
      <div className="min-h-screen px-4 py-4 pt-4">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 md:hidden">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="text-primary font-bold">
                  {displayProducts.length}
                </span>{" "}
                of{" "}
                <span className="text-primary font-bold">{totalProducts}</span>{" "}
                products
              </div>

              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer"
              >
                <Filter size={16} />
                <span>Filter</span>
                {hasActiveFilters() && (
                  <span className="bg-secondary text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                )}
                {showMobileFilters ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </Button>
            </div>

            {/* ✅ FIX: Mobile filter genişliği düzeltildi */}
            {showMobileFilters && (
              <div className="md:hidden bg-white rounded-2xl shadow-2xl border-2 border-primary/20 p-4 mb-4 z-40 max-w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg">
                    <Filter size={20} />
                    <span>Filters & Sort</span>
                  </div>

                  {hasActiveFilters() && (
                    <Button
                      onClick={() => {
                        clearAllFilters();
                        setShowMobileFilters(false);
                      }}
                      className="bg-primary text-white hover:bg-[#D6EED6] hover:text-[#393E46] text-xs px-3 py-1.5 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                    >
                      <X size={14} className="mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

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

                <div className="mb-4">
                  <label className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    <DollarSign size={16} />
                    Price: ${tempPriceRange[0]} - ${tempPriceRange[1]}
                  </label>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        value={tempPriceRange[0]}
                        onChange={handleMinPriceInputChange}
                        min={priceStats.min}
                        max={priceStats.max}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      />
                    </div>

                    <div className="text-gray-400 font-bold pt-5">-</div>

                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        value={tempPriceRange[1]}
                        onChange={handleMaxPriceInputChange}
                        min={priceStats.min}
                        max={priceStats.max}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      />
                    </div>

                    <Button
                      onClick={applyManualPriceInput}
                      className="bg-primary text-white hover:bg-primary/90 px-4 py-2 mt-5 transition-all hover:scale-105 cursor-pointer"
                    >
                      Apply
                    </Button>
                  </div>

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

                <div className="space-y-3">
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
                </div>
              </div>
            )}

            <div className="hidden md:block mb-4 text-sm text-gray-700">
              Showing{" "}
              <span className="text-primary font-bold">
                {displayProducts.length}
              </span>{" "}
              of <span className="text-primary font-bold">{totalProducts}</span>{" "}
              products
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center">
                  <Cat className="w-16 h-16 text-color2" />
                </div>
                <h3 className="text-2xl font-bold text-color mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters()
                    ? "Try adjusting your filters to see more results"
                    : "No products available"}
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {displayProducts.map((p) => {
                const discountPercent =
                  p.salePrice && p.salePrice < p.price
                    ? Math.round(((p.price - p.salePrice) / p.price) * 100)
                    : 0;

                const stats = reviewStats[p._id];
                return (
                  <div
                    key={p._id}
                    className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative group"
                  >
                    <div className="absolute top-3 left-1 sm:left-2 z-10 flex flex-col gap-1">
                      {discountPercent > 0 && (
                        <span className="bg-secondary text-color text-[8px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          %{discountPercent} OFF
                        </span>
                      )}

                      {Number(p.stock) > 0 && Number(p.stock) < 6 && (
                        <span className="border border-red-200 text-color text-[8px] sm:text-xs font-medium px-2 py-1 rounded-full bg-white">
                          Only {p.stock} left
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-2 right-2 z-10 cursor-pointer transition-all duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavorite(p._id);
                      }}
                    >
                      <Heart
                        className={`w-3 h-3 transition-colors duration-300 ${
                          isFavorite(p._id) ? "text-gray-600" : "text-gray-400"
                        }`}
                        fill={isFavorite(p._id) ? "currentColor" : "none"}
                      />
                    </Button>

                    <Link
                      href={`/Products/${p.slug}`}
                      className="flex-1 flex flex-col"
                    >
                      <div className="w-full px-2 mt-3 shrink-0">
                        {p.image && p.image.length > 0 ? (
                          <div className="relative w-full aspect-4/5 sm:aspect-square md:w-36 md:h-36 lg:w-44 lg:h-44 mx-auto bg-white rounded-xl md:rounded-full overflow-hidden border border-white md:border-4 shadow-lg">
                            <Image
                              src={p.image[0].url}
                              alt={p.product_name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                              priority={false}
                            />
                          </div>
                        ) : (
                          <p className="text-white text-sm text-center">
                            No image!
                          </p>
                        )}
                      </div>

                      <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                        <h2 className="text-white text-xs sm:text-base md:text-lg truncate font-semibold">
                          {p.product_name}
                        </h2>
                      </div>

                      {stats && stats.count > 0 && (
                        <div className="flex items-center justify-center gap-1 text-gray-200 mt-1">
                          <div className="flex text-yellow-500">
                            {[...Array(Math.round(stats.avgRating))].map(
                              (_, i) => (
                                <Star key={i} sx={{ fontSize: 16 }} />
                              ),
                            )}
                          </div>
                          <span className="text-[10px] text-color3 font-semibold">
                            ( {stats.count} )
                          </span>
                        </div>
                      )}

                      <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-12 md:h-18 overflow-hidden mt-1">
                        <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                          {p.description}
                        </h2>
                      </div>
                    </Link>

                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                      <div className="flex flex-col items-center">
                        {p.salePrice && p.salePrice < p.price ? (
                          <>
                            <span className="line-through text-color text-xs opacity-55 font-bold">
                              ${p.price.toFixed(2)}
                            </span>
                            <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                              ${p.salePrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
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
                        className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]"
                      >
                        Add To Cart
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-12 text-color">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>

                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {start > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm">…</span>
                    </PaginationItem>
                  )}

                  {pages.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {end < totalPages - 1 && (
                    <PaginationItem className="cursor-pointer">
                      <span className="px-2 text-sm">…</span>
                    </PaginationItem>
                  )}

                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === totalPages}
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => page < totalPages && goToPage(page + 1)}
                      className={
                        page === totalPages
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

export default CategoryPage;
