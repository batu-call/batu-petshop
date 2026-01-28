"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";
import CloseIcon from "@mui/icons-material/Close";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Trash2 } from "lucide-react";

type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: string;
  stock: string;
  isActive: boolean;
  image: ProductImage[];
  category: string;
  slug: string;
};

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);

  // Get filters from URL
  const page = Number(searchParams.get("page")) || 1;

  // Local filter state (for immediate UI updates)
  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minStock: searchParams.get("minStock") || "",
    maxStock: searchParams.get("maxStock") || "",
  });

  // Applied filters (for API calls)
  const [appliedFilter, setAppliedFilter] = useState(localFilter);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { confirm } = useConfirm();

  const handlerRemove = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${id}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("Product deleted ✅");
        setProduct((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unexpected error");
    }
  };

  // Debounce filter updates
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);

      // Update URL
      const params = new URLSearchParams();
      params.set("page", "1");

      if (localFilter.search) params.set("search", localFilter.search);
      if (localFilter.category) params.set("category", localFilter.category);
      if (localFilter.minPrice) params.set("minPrice", localFilter.minPrice);
      if (localFilter.maxPrice) params.set("maxPrice", localFilter.maxPrice);
      if (localFilter.minStock) params.set("minStock", localFilter.minStock);
      if (localFilter.maxStock) params.set("maxStock", localFilter.maxStock);

      router.push(`?${params.toString()}`, { scroll: false });
    }, 600); // 600ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localFilter, router]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = { page };

        // Add filters to request
        if (appliedFilter.search) params.search = appliedFilter.search;
        if (appliedFilter.category) params.category = appliedFilter.category;
        if (appliedFilter.minPrice) params.minPrice = appliedFilter.minPrice;
        if (appliedFilter.maxPrice) params.maxPrice = appliedFilter.maxPrice;
        if (appliedFilter.minStock) params.minStock = appliedFilter.minStock;
        if (appliedFilter.maxStock) params.maxStock = appliedFilter.maxStock;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products`,
          { params, withCredentials: true },
        );

        if (response.data.success) {
          setProduct(response.data.products);
          setTotalPages(response.data.totalPages || 1);
          setTotalProducts(response.data.totalProducts || 0);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [
    page,
    appliedFilter.search,
    appliedFilter.category,
    appliedFilter.minPrice,
    appliedFilter.maxPrice,
    appliedFilter.minStock,
    appliedFilter.maxStock,
  ]);

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      maxStock: "",
    };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(appliedFilter).some((value) => value !== "");
  };

  // Pagination
  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));

    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.category) params.set("category", appliedFilter.category);
    if (appliedFilter.minPrice) params.set("minPrice", appliedFilter.minPrice);
    if (appliedFilter.maxPrice) params.set("maxPrice", appliedFilter.maxPrice);
    if (appliedFilter.minStock) params.set("minStock", appliedFilter.minStock);
    if (appliedFilter.maxStock) params.set("maxStock", appliedFilter.maxStock);

    router.push(`?${params.toString()}`, { scroll: false });
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
    <div>
      <div className="flex-1 min-h-screen p-4">
        {loading ? (
          <div className="fixed inset-0 flex justify-center items-center bg-primary z-30">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* FILTER */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={localFilter.search}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, search: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                />

                <select
                  value={localFilter.category}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, category: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded min-w-[150px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                >
                  <option value="">All Categories</option>
                  <option value="Cat">Cat</option>
                  <option value="Dog">Dog</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Reptile">Reptile</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Horse">Horse</option>
                </select>

                <input
                  type="number"
                  placeholder="Min Price"
                  className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                  value={localFilter.minPrice}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, minPrice: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                  value={localFilter.maxPrice}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, maxPrice: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Min Stock"
                  className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                  value={localFilter.minStock}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, minStock: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Max Stock"
                  className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                  value={localFilter.maxStock}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, maxStock: e.target.value })
                  }
                />
              </div>

              {/* Results count and clear button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-color2">
                    {product.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-color">
                    {totalProducts}
                  </span>{" "}
                  products
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="w-40 flex gap-2 justify-center items-center bg-white text-gray-800 rounded-sm p-2 cursor-pointer hover:bg-gray-100 hover:scale-105 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* TABLE HEADER */}
            <div className="sticky top-0 z-10 hidden md:flex bg-secondary py-2 text-color font-semibold rounded-t-lg">
              <div className="w-20"></div>
              <div className="w-48 ml-12">Product</div>
              <div className="w-64 ml-12">Description</div>
              <div className="w-32 ml-6">Price</div>
              <div className="w-32 ml-6">Stock</div>
              <div className="w-32 ml-6">Category</div>
              <div className="w-32 ml-14">Active</div>
            </div>

            {/* PRODUCTS LIST */}
            {product.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center"><Package className="w-16 h-16 text-color2" /></div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters()
                    ? "Try adjusting your filters to see more results"
                    : "Start by adding your first product"}
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              product.map((p) => (
                <Link
                  key={p._id}
                  href={`Products/${p.slug}`}
                  className="flex flex-col md:flex-row group gap-3 border p-3 md:p-2 items-start md:items-center relative hover:bg-gray-50 transition-colors"
                >
                  {/* IMAGE */}
                  <div className="w-full aspect-square md:w-20 md:h-20 relative shrink-0 bg-gray-50">
                    <Image
                      src={p.image[0]?.url || "/placeholder.png"}
                      alt="product"
                      fill
                      className="object-contain md:object-cover rounded"
                    />
                  </div>

                  <div className="w-full md:w-48 md:ml-6 overflow-hidden">
                    <p className="md:hidden text-xs text-gray-500 line-clamp-1">
                      Product
                    </p>
                    {p.product_name}
                  </div>

                  <div className="w-full md:w-64 md:ml-6 line-clamp-3 overflow-hidden">
                    <p className="md:hidden text-xs text-gray-500">
                      Description
                    </p>
                    {p.description}
                  </div>

                  <div className="w-full md:w-32 md:ml-6 overflow-hidden">
                    <p className="md:hidden text-xs text-gray-500">Price</p>$
                    {p.price}
                  </div>

                  <div className="w-full md:w-32 md:ml-6">
                    <p className="md:hidden text-xs text-gray-500">Stock</p>
                    {p.stock}
                  </div>

                  <div className="w-full md:w-32 md:ml-6">
                    <p className="md:hidden text-xs text-gray-500">Category</p>
                    {p.category}
                  </div>

                  <div className="w-full md:w-32 md:ml-6 flex items-center justify-between gap-2">
                    <div>
                      <p className="md:hidden text-xs text-gray-500">Status</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          p.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Delete sm-lg-xl */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const ok = await confirm({
                          title: "Delete Product",
                          description:
                            "Are you sure you want to delete this product?",
                          confirmText: "Yes, Delete",
                          cancelText: "Cancel",
                          variant: "destructive",
                        });

                        if (ok) handlerRemove(p._id);
                      }}
                      className="md:hidden text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete Product
                    </button>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Product",
                        description:
                          "Are you sure you want to delete this product?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handlerRemove(p._id);
                    }}
                    className="hidden xl:block absolute top-8 right-2 cursor-pointer transition hover:scale-110"
                  >
                    <Image
                      src="/trash.png"
                      alt="delete"
                      width={26}
                      height={26}
                    />
                  </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Product",
                        description:
                          "Are you sure you want to delete this product?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handlerRemove(p._id);
                    }}
                    className="hidden md:block xl:hidden absolute top-2 right-2 text-color cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </Link>
              ))
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Pagination className="mt-12 text-color">
                <PaginationContent>
                  {/* PREVIOUS */}
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>

                  {/* FIRST PAGE */}
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
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
                        isActive={page === p}
                        onClick={() => goToPage(p)}
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
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === totalPages}
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>

                  {/* NEXT */}
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
    </div>
  );
};

export default Page;
