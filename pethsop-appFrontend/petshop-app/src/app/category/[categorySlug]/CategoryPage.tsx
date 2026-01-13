"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import Footer from "@/app/Footer/page";

import { Button } from "@/components/ui/button";
import CircularText from "@/components/CircularText";

import { AuthContext } from "@/app/context/authContext";
import { useCart } from "@/app/context/cartContext";
import { useFavorite } from "@/app/context/favoriteContext";

import { Heart } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Star } from "@mui/icons-material";

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

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});

  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite, fetchFavorites } =
    useFavorite();

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

        setProducts(res.data.products || []);
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

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");

    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  //  FAVORITES
  useEffect(() => {
    fetchFavorites();
  }, []);

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

  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="ml-0 md:ml-24 lg:ml-40 min-h-screen px-4 md:px-20 lg:px-4 py-10">
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* EMPTY STATE */}
            {products.length === 0 && (
              <div className="text-center text-gray-500 mt-24">
                No products found in this category.
              </div>
            )}

            {/* PRODUCTS */}
            <div
              className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  2xl:grid-cols-5
  gap-4 sm:gap-6 lg:gap-8
"
            >
              {products.map((p) => {
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
                      <span className="absolute top-2 left-2 bg-secondary text-color text-xs font-bold px-2 py-1 rounded-full z-10">
                        %{discountPercent} OFF
                      </span>
                    )}

                    {/* favorite */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer"
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

                    {/* image */}
                    <div className="flex items-center justify-center p-2 sm:p-4">
                      {p.image && p.image.length > 0 ? (
                        <Image
                          src={p.image[0].url}
                          alt={p.product_name}
                          width={400}
                          height={400}
                          className="rounded-full w-40 h-40 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-44 xl:h-44 object-cover border-4 border-white shadow-2xl"
                        />
                      ) : (
                        <p className="text-white text-sm">No image!</p>
                      )}
                    </div>

                    <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                      <h2 className="text-white text-sm sm:text-base md:text-lg truncate font-semibold">
                        {p.product_name}
                      </h2>
                    </div>

                    {/* Review stars & count */}
                    {stats && stats.count > 0 && (
                      <div className="flex items-center justify-center gap-1 text-gray-200 text-sm mt-1">
                        <div className="flex text-yellow-500">
                          {[...Array(Math.round(stats.avgRating))].map(
                            (_, i) => (
                              <Star key={i} sx={{ fontSize: 16 }} />
                            )
                          )}
                        </div>
                        <span className="text-xs text-color3 font-semibold">
                          ( {stats.count} )
                        </span>
                      </div>
                    )}

                    <div className="px-4 py-3 sm:px-4 sm:py-2 h-20 sm:h-24 md:h-24 overflow-hidden mt-1">
                      <h2 className="text-xs sm:text-base text-color font-semibold line-clamp-3 leading-snug">
                        {p.description}
                      </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                      <div className="flex flex-col items-center">
                        {p.salePrice && p.salePrice < p.price ? (
                          <>
                            <span className="line-through text-color text-xs opacity-55 font-bold">
                              {p.price},00$
                            </span>
                            <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                              {p.salePrice},00$
                            </span>
                          </>
                        ) : (
                          <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                            {p.price},00$
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlerAddToCart(p);
                        }}
                        className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400"
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
                  <PaginationItem className="text-color cursor-pointer">
                    <PaginationPrevious
                      onClick={() =>
                        page > 1 &&
                        router.push(
                          `/category/${categorySlug}?page=${page - 1}`
                        )
                      }
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i} className="cursor-pointer">
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() =>
                          router.push(
                            `/category/${categorySlug}?page=${i + 1}`,
                            { scroll: true }
                          )
                        }
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem className="text-color cursor-pointer">
                    <PaginationNext
                      onClick={() =>
                        page < totalPages &&
                        router.push(
                          `/category/${categorySlug}?page=${page + 1}`
                        )
                      }
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
