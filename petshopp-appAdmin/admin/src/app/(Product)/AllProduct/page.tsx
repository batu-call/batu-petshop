"use client";

import CircularText from "@/components/CircularText";
import { useAdminProducts } from "./components/useAdminProducts";
import ProductFilters from "./components/ProductFilters";
import ProductTableHeader from "./components/ProductTableHeader";
import ProductList from "./components/ProductList";
import ProductPagination from "./components/ProductPagination";

const AdminProductsPage = () => {
  const {
    page,
    products,
    totalPages,
    totalProducts,
    filteredProducts,
    loading,
    localFilter,
    setLocalFilter,
    appliedFilter,
    hasActiveFilters,
    clearFilters,
    toggleFeatured,
    goToPage,
    removeProduct,
  } = useAdminProducts();

  return (
    <div className="bg-gray-50 dark:bg-[#0d1f18] min-h-screen">
      <div className="min-h-screen p-4">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary dark:bg-[#0E5F44] z-50">
            <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
          </div>
        ) : (
          <>
            <ProductFilters
              localFilter={localFilter}
              setLocalFilter={setLocalFilter}
              appliedFilter={appliedFilter}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              toggleFeatured={toggleFeatured}
              filteredProducts={filteredProducts}
              totalProducts={totalProducts}
            />

            <ProductTableHeader />

            <ProductList
              products={products}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              removeProduct={removeProduct}
            />

            {totalPages > 1 && (
              <ProductPagination
                page={page}
                totalPages={totalPages}
                goToPage={goToPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;