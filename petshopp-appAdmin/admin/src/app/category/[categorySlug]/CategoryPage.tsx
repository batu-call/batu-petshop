"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ShoppingCart, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import CircularText from "@/components/CircularText";

import { Star } from "@mui/icons-material";
import { useConfirm } from "@/app/Context/confirmContext";

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
  stock?: number;
};

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(1);

  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const { confirm } = useConfirm();

  useEffect(() => {
    if (!categorySlug) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          {
            params: {
              category: categorySlug,
              page,
            },
          },
        );

        const fetchedProducts = res.data.products || [];

        // 🔥 Sort products: low stock first, then discount (same as frontend)
        const sortedProducts = [...fetchedProducts].sort((a, b) => {
          const aStock = Number(a.stock ?? 0);
          const bStock = Number(b.stock ?? 0);

          // Priority 1: Low stock (0 < stock < 6)
          const aLowStock = aStock > 0 && aStock < 6;
          const bLowStock = bStock > 0 && bStock < 6;

          if (aLowStock && !bLowStock) return -1;
          if (!aLowStock && bLowStock) return 1;

          // Priority 2: On sale (has discount)
          const aDiscount = a.salePrice && a.salePrice < a.price;
          const bDiscount = b.salePrice && b.salePrice < b.price;

          if (aDiscount && !bDiscount) return -1;
          if (!aDiscount && bDiscount) return 1;

          return 0;
        });

        setProduct(sortedProducts);
        setTotalPages(res.data.totalPages || 1);
      } catch {
        toast.error("Products could not be loaded");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, page]);

  //  FETCH REVIEWS
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

  const handlerRemove = async (id: string) => {
    const ok = await confirm({
      title: "Delete Product",
      description: "Are you sure you want to delete this product?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${id}`,
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success(response.data.message || "Product deleted ✅");
        setProduct((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Something went wrong");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  //  PAGINATION

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
      <div className="min-h-screen px-4 py-4">
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
            {/* EMPTY STATE */}
            {product.length === 0 && (
              <div className="text-center text-gray-500 mt-24">
                No products found in this category.
              </div>
            )}

            {/* PRODUCTS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [@media(min-width:1600px)]:grid-cols-5 gap-4 sm:gap-5 [@media(min-width:1600px)]:gap-4">
              {product.map((p) => {
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

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlerRemove(p._id);
                      }}
                      className="
    absolute 
    top-1 right-1
    sm:top-2 sm:right-2
    md:top-3 md:right-3
    z-10
    rounded-full
    bg-white/80
    backdrop-blur
    p-1.5
    transition-all duration-200 ease-in-out
    hover:scale-105 hover:bg-[#97cba9] hover:text-white hover:border hover:border-white
    active:scale-95
    cursor-pointer
  "
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 dark:text-[#162820]" />
                    </button>

                    <Link
                      href={`/Products/${p.slug}`}
                      className="flex-1 flex flex-col"
                    >
                      <div className="w-full shrink-0">
                        {p.image && p.image.length > 0 ? (
                          <div className="relative w-full h-50 md:w-36 md:h-36 lg:w-44 lg:h-44 mx-auto bg-white rounded-xs md:rounded-full overflow-hidden border border-white md:border-4">
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

                      {/* Name + Star */}
                      <div className="px-2 sm:px-4 pt-2 pb-1 flex flex-col items-center justify-center gap-1 min-h-[56px]">
                        <h2 className="text-white text-lg sm:text-base md:text-lg truncate font-semibold text-center w-full">
                          {p.product_name}
                        </h2>
                        {stats && stats.count > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex text-yellow-500">
                              {[...Array(Math.round(stats.avgRating))].map(
                                (_, i) => (
                                  <Star key={i} sx={{ fontSize: 14 }} />
                                ),
                              )}
                            </div>
                            <span className="text-[10px] text-color3 font-semibold">
                              ({stats.count})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-12 md:h-18 overflow-hidden mt-1">
                        <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                          {p.description}
                        </h2>
                      </div>
                    </Link>

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

                      <Button className="hidden md:block w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]">
                        Add To Cart
                      </Button>

                      {/* mobil cart */}
                      <Button className="flex md:hidden bg-secondary text-color cursor-pointer hover:bg-[#D6EED6]/90 transition-all duration-300 active:scale-95 rounded-full aspect-square p-0 min-w-[44px] min-h-[44px] w-11 h-11 shadow-sm">
                        <ShoppingCart size={20} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Pagination className="mt-12 text-color">
                <PaginationContent>
                  {/* PREVIOUS */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>

                  {/* FIRST PAGE */}
                  <PaginationItem>
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
                    <PaginationItem key={p}>
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
                  <PaginationItem>
                    <PaginationLink
                      isActive={page === totalPages}
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>

                  {/* NEXT */}
                  <PaginationItem>
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
    </>
  );
};

export default CategoryPage;
