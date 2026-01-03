"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "@/components/ui/button";
import ScrollFloat from "@/components/ScrollFloat";
import Link from "next/link";
import { AuthContext } from "../context/authContext";
import { useRouter } from "next/navigation";
import type { Swiper as SwiperType } from "swiper";
import { Heart } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useCart } from "../context/cartContext";
import { Star } from "@mui/icons-material";
import { useFavorite } from "../context/favoriteContext";

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

const Deals = () => {
  const router = useRouter();
  const [product, setProduct] = useState<Product[]>([]);
  const { isAuthenticated } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType>(null);
  const { favorites, addFavorite, removeFavorite, fetchFavorites } =
    useFavorite();
  const { addToCart } = useCart();
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/hot-deals`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setProduct(response.data.products);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error!");
        }
      }
    };
    fetchProduct();
  }, []);

  const handlerAddToCart = async (product: Product) => {
    if (!isAuthenticated) return router.push("/Login");

    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

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

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

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
    <div className="md:ml-24 lg:ml-40 flex-1 h-auto bg-white p-6">
      <div className="text-color font-bold text-jost flex items-center justify-center">
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
        >
          Hot Deals for Your Pet
        </ScrollFloat>
      </div>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        style={
          {
            "--swiper-theme-color": "#393E46",
            "--swiper-navigation-size": "25px",
          } as React.CSSProperties
        }
        slidesPerView={5}
        loop={true}
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        navigation
        preventClicks={true}
        preventClicksPropagation={false}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
          1280: { slidesPerView: 4, spaceBetween: 10 },
          1600: { slidesPerView: 5, spaceBetween: 10 },
        }}
        className="py-8 mt-2 lg:mt-14 custom-swiper"
      >
        {product.map((p) => {
          const discountPercent =
            p.salePrice && p.salePrice < p.price
              ? Math.round(((p.price - p.salePrice) / p.price) * 100)
              : 0;

          const stats = reviewStats[p._id];
          return (
            <SwiperSlide key={p._id}>
              <Link
                key={p._id}
                href={`/Products/${p.slug}`}
                className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative h-110"
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
                  {isFavorite(p._id) ? (
                    <FavoriteIcon className="text-gray-400 w-3 h-3" />
                  ) : (
                    <Heart className="text-gray-400 w-5 h-5" />
                  )}
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
                      {[...Array(Math.round(stats.avgRating))].map((_, i) => (
                        <Star key={i} sx={{ fontSize: 16 }} />
                      ))}
                    </div>
                    <span className="text-xs text-color3 font-semibold">
                      ( {stats.count} )
                    </span>
                  </div>
                )}

                <div className="px-4 py-3 sm:px-4 sm:py-2 h-20 sm:h-24 md:h-24 overflow-hidden mt-1">
                  <h2 className="text-xs sm:text-sm text-color font-semibold line-clamp-3 leading-snug">
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
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Pagination */}
      <div className="flex justify-center mt-8 gap-2">
        {product.map((_, index) => (
          <div
            key={index}
            onClick={() => swiperRef.current?.slideToLoop(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === activeIndex
                ? "bg-[#393E46] scale-125"
                : "bg-gray-300 scale-100 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Deals;
