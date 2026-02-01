"use client";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CircularText from "@/components/CircularText";
import { Heart, ShoppingCart } from "lucide-react";
import { Star } from "@mui/icons-material";
import { AuthContext } from "@/app/context/authContext";
import { useFavorite } from "@/app/context/favoriteContext";
import { useCart } from "@/app/context/cartContext";
import Footer from "@/app/Footer/page";

type ReviewStats = {
  [productId: string]: {
    count: number;
    avgRating: number;
  };
};

type ProductImage = {
  url: string;
  publicId?: string;
  _id?: string;
};
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
  const { isAuthenticated } = useContext(AuthContext);
  const { favorites, removeFavorite, addFavorite, fetchFavorites, loading } =
    useFavorite();
  const { addToCart } = useCart();

  const [reviewStats, setReviewStats] = useState<ReviewStats>({});

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // review stats fetch
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

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");

    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <div className="flex-1 min-h-screen p-4 md:mt-0">
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
            <p className="text-gray-500 text-lg font-semibold mb-4">
              No favorite products found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [@media(min-width:1600px)]:grid-cols-5 gap-4 sm:gap-5 [@media(min-width:1600px)]:gap-4">
            {favorites.map((p) => {
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

                    <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                      <h2 className="text-white text-lg sm:text-base md:text-lg truncate font-semibold">
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

                  <div className="flex gap-2 justify-between items-center px-2 sm:px-4 py-2">
                    <div className="flex flex-col items-center">
                      {p.salePrice && p.salePrice < p.price ? (
                        <>
                          <span className="line-through text-color text-xs opacity-55 font-bold">
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
                      className="hidden md:block w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]"
                    >
                      Add To Cart
                    </Button>

                    {/* mobil cart */}
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlerAddToCart(p);
                      }}
                      className="flex md:hidden bg-secondary text-color cursor-pointer hover:bg-[#D6EED6]/90 transition-all duration-300 active:scale-95 rounded-full aspect-square p-0 min-w-[44px] min-h-[44px] w-11 h-11 shadow-sm"
                    >
                      <ShoppingCart size={20} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default FavoritePage;
