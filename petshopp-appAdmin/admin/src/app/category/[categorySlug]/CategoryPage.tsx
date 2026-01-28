"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import CircularText from "@/components/CircularText";


import { Heart } from "lucide-react";
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
   const {confirm} = useConfirm();


  // 🔹 FETCH PRODUCTS
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
          }
        );

        setProduct(res.data.products || []);
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`
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
        { withCredentials: true }
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
            <div
              className="
  grid
  grid-cols-2
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  2xl:grid-cols-5
  gap-4 sm:gap-6 lg:gap-8
"
            >
              {product.map((p) => {
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
                      <span className="absolute top-2 left-1 sm:top-2 sm:left-2 bg-secondary text-color text-[8px] sm:text-xs font-bold px-2 py-1 rounded-full z-10">
                        %{discountPercent} OFF
                      </span>
                    )}

                    {/* favorite */}
                    <button
                    className="absolute top-0 right-0 md:top-2 md:right-2 transition duration-300 ease-in-out hover:scale-[1.02] cursor-pointer hover:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerRemove(p._id);
                    }}
                  >
                    <X className="shadow-2xl m-2 opacity-80" />
                  </button>

                    {/* image */}
                    <div className="flex items-center justify-center p-2 sm:p-4">
                      {p.image && p.image.length > 0 ? (
                        <Image
                          src={p.image[0].url}
                          alt={p.product_name}
                          width={400}
                          height={400}
                          sizes="
    (max-width: 640px) 50vw,
    (max-width: 1024px) 33vw,
    (max-width: 1536px) 25vw,
    20vw
  "
  loading="eager"
                          className="rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-44 xl:h-44 object-cover border-2 md:border-4 border-white shadow-2xl"
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
                      <div className="flex items-center justify-center gap-1 text-gray-200 mt-1">
                        <div className="flex text-yellow-500">
                          {[...Array(Math.round(stats.avgRating))].map(
                            (_, i) => (
                              <Star key={i} sx={{ fontSize: 16 }} />
                            )
                          )}
                        </div>
                        <span className="text-[10px] text-color3 font-semibold">
                          ( {stats.count} )
                        </span>
                      </div>
                    )}

                     <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-12 md:h-16 lg:h-20 overflow-hidden mt-1">
                      <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
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
                        }}
                        className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out
    active:scale-[0.97]"
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
