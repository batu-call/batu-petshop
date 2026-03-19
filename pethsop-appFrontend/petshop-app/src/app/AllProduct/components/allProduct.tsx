"use client";

import { useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import { useRouter } from "next/navigation";
import { Cat } from "lucide-react";
import { useAllProductFilters } from "./useAllProductFilters";
import { useAllProducts } from "./useAllProducts";
import AllProductMobileFilterBar from "./AllProductMobileFilterBar";
import AllProductCard from "./AllProductCard";
import AllProductPagination from "./AllProductPagination";
import { AuthContext } from "@/app/context/authContext";
import { useCart } from "@/app/context/cartContext";
import { useFavorite } from "@/app/context/favoriteContext";
import Navbar from "@/app/Navbar/page";
import Footer from "@/app/Footer/page";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating", label: "Highest Rated" },
];

const AllProduct = () => {
  const router = useRouter();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorite();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const filters = useAllProductFilters();
  const search = filters.search;

  const { displayProducts, totalPages, totalProducts, loading, reviewStats } =
    useAllProducts(
      filters.currentPage,
      filters.priceRange[0],
      filters.priceRange[1],
      filters.priceStats,
      filters.showOnSale,
      filters.minRating,
      filters.sortBy,
      search,
      filters.priceStatsLoaded,
    );

  useEffect(() => {
    if (!loading && filters.isClearing) {
      filters.setIsClearing(false);
    }
  }, [loading]);

  const handlerAddToCart = async (
    product: Parameters<typeof AllProductCard>[0]["p"],
  ) => {
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

  const handleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      router.push("/Login");
      return;
    }
    const isFav = favorites.some((f) => f._id === productId);
    if (isFav) await removeFavorite(productId);
    else await addFavorite(productId);
  };

  const isFavorite = (productId: string) =>
    favorites.some((f) => f._id === productId);

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set("page", String(newPage));
      if (search) params.set("search", search);
      router.push(`?${params.toString()}`, { scroll: false });
    }, 100);
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
      <div className="min-h-screen px-4 py-4 pt-4">
        {loading || filters.isClearing ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            <AllProductMobileFilterBar
              showMobileFilters={filters.showMobileFilters}
              setShowMobileFilters={filters.setShowMobileFilters}
              displayCount={displayProducts.length}
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
              setPriceRange={filters.setPriceRange}
              setTempPriceRange={filters.setTempPriceRange}
            />

            <div className="hidden md:block mb-4 text-sm text-gray-700 dark:text-[#a8d4b8]">
              Showing{" "}
              <span className="text-primary dark:text-[#a8d4b8]! font-bold">
                {displayProducts.length}
              </span>{" "}
              of{" "}
              <span className="text-primary dark:text-[#c8e6d0] font-bold">
                {totalProducts}
              </span>{" "}
              products
            </div>

            {displayProducts.length === 0 &&
              !filters.isClearing &&
              !loading && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 flex justify-center">
                    <Cat className="w-16 h-16 text-color2" />
                  </div>
                  <h3 className="text-2xl font-bold text-color dark:text-[#a8d4b8]! mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {search
                      ? `No results found for "${search}"`
                      : filters.hasActiveFilters()
                        ? "Try adjusting your filters to see more results"
                        : "No products available"}
                  </p>
                  {(search || filters.hasActiveFilters()) && (
                    <button
                      onClick={filters.clearAllFilters}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [@media(min-width:1600px)]:grid-cols-5 gap-4 sm:gap-5 [@media(min-width:1600px)]:gap-4">
              {displayProducts.map((p) => (
                <AllProductCard
                  key={p._id}
                  p={p}
                  reviewStats={reviewStats}
                  isFavorite={isFavorite}
                  handleFavorite={handleFavorite}
                  handlerAddToCart={handlerAddToCart}
                  addingToCart={addingToCart}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <AllProductPagination
                currentPage={filters.currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllProduct;
