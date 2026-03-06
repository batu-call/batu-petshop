"use client";

import { useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import Navbar from "@/app/Navbar/page";
import Footer from "@/app/Footer/page";
import { Cat } from "lucide-react";

import { AuthContext } from "@/app/context/authContext";
import { useCart } from "@/app/context/cartContext";
import { useFavorite } from "@/app/context/favoriteContext";

import { useCategoryFilters } from "./useCategoryFilters";
import { useCategoryProducts } from "./useCategoryProducts";
import MobileFilterBar from "./MobileFilterBar";
import ProductCard from "./ProductCard";
import CategoryPagination from "./CategoryPagination";
import { Product } from "./types";

const SORT_OPTIONS = [
  { value: "default",    label: "Default" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc",   label: "Name: A to Z" },
  { value: "name-desc",  label: "Name: Z to A" },
  { value: "rating",     label: "Highest Rated" },
];

const CategoryPage = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const page         = Number(searchParams.get("page")) || 1;

  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart }       = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorite();

  const filters = useCategoryFilters(page);

  const {
    displayProducts,
    totalPages,
    totalProducts,
    filteredProducts,
    loading,
    reviewStats,
  } = useCategoryProducts(
    filters.categorySlug,
    page,
    filters.priceRange,
    filters.priceStats,
    filters.showOnSale,
    filters.minRating,
    filters.sortBy,
    filters.subCategory, 
  );

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");
    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleFavorite = async (productId: string) => {
    if (!isAuthenticated) { router.push("/Login"); return; }
    const isFav = favorites.some((f) => f._id === productId);
    if (isFav) await removeFavorite(productId);
    else       await addFavorite(productId);
  };

  const isFavorite = (productId: string) =>
    favorites.some((f) => f._id === productId);

  const goToPage = (p: number) => {
    const sub = filters.subCategory ? `&sub=${filters.subCategory}` : "";
    router.push(`/category/${filters.categorySlug}?page=${p}${sub}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar
        showFilters={filters.showFilters}
        setShowFilters={filters.setShowFilters}
        priceRange={filters.priceRange}
        setPriceRange={filters.setPriceRange}
        tempPriceRange={filters.tempPriceRange}
        setTempPriceRange={filters.setTempPriceRange}
        priceStats={filters.priceStats}
        sortBy={filters.sortBy}
        setSortBy={filters.setSortBy}
        showOnSale={filters.showOnSale}
        setShowOnSale={filters.setShowOnSale}
        minRating={filters.minRating}
        setMinRating={filters.setMinRating}
        hasActiveFilters={filters.hasActiveFilters}
        clearAllFilters={filters.clearAllFilters}
        handlePriceChange={filters.handlePriceChange}
        handlePriceChangeCommitted={filters.handlePriceChangeCommitted}
      />
      <div className="min-h-160 px-4 py-4 pt-4 flex-1">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
          </div>
        ) : (
          <>
            <MobileFilterBar
              showMobileFilters={filters.showMobileFilters}
              setShowMobileFilters={filters.setShowMobileFilters}
              filteredProducts={filteredProducts}
              totalProducts={totalProducts}
              hasActiveFilters={filters.hasActiveFilters}
              clearAllFilters={filters.clearAllFilters}
              sortBy={filters.sortBy}
              setSortBy={filters.setSortBy}
              sortOptions={SORT_OPTIONS}
              tempPriceRange={filters.tempPriceRange}
              priceStats={filters.priceStats}
              handleMinPriceInputChange={filters.handleMinPriceInputChange}
              handleMaxPriceInputChange={filters.handleMaxPriceInputChange}
              applyManualPriceInput={filters.applyManualPriceInput}
              handlePriceChange={filters.handlePriceChange}
              handlePriceChangeCommitted={filters.handlePriceChangeCommitted}
              showOnSale={filters.showOnSale}
              setShowOnSale={filters.setShowOnSale}
              minRating={filters.minRating}
              setMinRating={filters.setMinRating}
            />

            <div className="hidden md:block mb-4 text-sm text-gray-700 dark:text-[#a8d4b8]">
              Showing{" "}
              <span className="text-color dark:text-[#a8d4b8]! font-bold">{filteredProducts}</span>
              {" "}of{" "}
              <span className="text-black/60 dark:text-[#c8e6d0] font-bold">{totalProducts}</span>
              {" "}products
              {filters.subCategory && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary text-white px-2 py-[2px] rounded-full">
                  {filters.subCategory}
                  <button
                    onClick={() => filters.clearAllFilters()}
                    className="hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.hasActiveFilters() && (
                <span className="text-xs text-gray-500 dark:text-[#7aab8a] ml-2">
                  (Filtered results)
                </span>
              )}
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center">
                  <Cat className="w-16 h-16 text-color2" />
                </div>
                <h3 className="text-2xl font-bold text-color dark:text-[#0b8457]! mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {filters.hasActiveFilters()
                    ? "Try adjusting your filters to see more results"
                    : "No products available"}
                </p>
                {filters.hasActiveFilters() && (
                  <button
                    onClick={filters.clearAllFilters}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [@media(min-width:1600px)]:grid-cols-5 gap-4 sm:gap-5 [@media(min-width:1600px)]:gap-4">
              {displayProducts.map((p, index) => (
                <ProductCard
                  key={p._id}
                  p={p}
                  index={index}
                  page={page}
                  reviewStats={reviewStats}
                  isFavorite={isFavorite}
                  handleFavorite={handleFavorite}
                  handlerAddToCart={handlerAddToCart}
                  addingToCart={null}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <CategoryPagination page={page} totalPages={totalPages} goToPage={goToPage} />
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;