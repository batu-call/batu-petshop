"use client";
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Button } from "@/components/ui/button";
import ScrollFloat from "@/components/ScrollFloat";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import type { Swiper as SwiperType } from "swiper";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../context/cartContext";
import { useFavorite } from "../context/favoriteContext";
import { Star } from "@mui/icons-material";

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

const FeaturedProducts = () => {
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/featured-product`,
          { withCredentials: true },
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`,
        );
        setReviewStats(response.data.stats);
      } catch {
        toast.error("Failed to load reviews");
      }
    };

    fetchReviewStats();
  }, []);

  const memoizedFetchFavorites = useCallback(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  useEffect(() => {
    memoizedFetchFavorites();
  }, [memoizedFetchFavorites]);

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

  const visibleDots = 7;
  const start = Math.max(0, activeIndex - 2);
  const end = Math.min(product.length, start + visibleDots);

  return (
    <div className="flex-1 bg-white p-4">
      <div className="text-color text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center justify-center mb-2 sm:mb-8">
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
        >
          Featured Products
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
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 5 },
          1024: { slidesPerView: 3, spaceBetween: 5 },
          1280: { slidesPerView: 4, spaceBetween: 5 },
          1600: { slidesPerView: 5, spaceBetween: 5 },
        }}
        loop
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        navigation
        preventClicks={true}
        preventClicksPropagation={false}
        className="py-4 lg:mt-12 custom-swiper items-center"
      >
        {product.map((item) => {
          const discountPercent =
            item.salePrice && item.salePrice < item.price
              ? Math.round(((item.price - item.salePrice) / item.price) * 100)
              : 0;

          const stats = reviewStats[item._id];

          return (
            <SwiperSlide key={item._id} className="p-2">
                <div
                    key={item._id}
                    className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative group"
                  >
                    <div className="absolute top-3 left-1 sm:left-2 z-10 flex flex-col gap-1">
                      {discountPercent > 0 && (
                        <span className="bg-secondary text-color text-[8px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          %{discountPercent} OFF
                        </span>
                      )}

                      {Number(item.stock) > 0 && Number(item.stock) < 6 && (
                        <span className="border border-red-200 text-color text-[8px] sm:text-xs font-medium px-2 py-1 rounded-full bg-white">
                          Only {item.stock} left
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
                        handleFavorite(item._id);
                      }}
                    >
                      <Heart
                        className={`w-3 h-3 transition-colors duration-300 ${
                          isFavorite(item._id) ? "text-gray-600" : "text-gray-400"
                        }`}
                        fill={isFavorite(item._id) ? "currentColor" : "none"}
                      />
                    </Button>

                    <Link
                      href={`/Products/${item.slug}`}
                      className="flex-1 flex flex-col"
                    >
                      <div className="w-full shrink-0">
                        {item.image && item.image.length > 0 ? (
                          <div className="relative w-full h-50 md:w-36 md:h-36 lg:w-44 lg:h-44 mx-auto bg-white rounded-xs md:rounded-full overflow-hidden border border-white md:border-4">
                            <Image
                              src={item.image[0].url}
                              alt={item.product_name}
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
                          {item.product_name}
                        </h2>
                      </div>

                      <div className="h-[22px] flex items-center justify-center mt-1">
  {stats && stats.count > 0 ? (
    <>
      <div className="flex text-yellow-500">
        {[...Array(Math.round(stats.avgRating))].map((_, i) => (
          <Star key={i} sx={{ fontSize: 16 }} />
        ))}
      </div>
      <span className="text-[10px] ml-1">( {stats.count} )</span>
    </>
  ) : (
    <span className="opacity-0">no rating</span>
  )}
</div>

                      <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-12 md:h-18 overflow-hidden mt-1">
                        <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                          {item.description}
                        </h2>
                      </div>
                    </Link>

                    <div className="flex gap-2 justify-between items-center px-2 sm:px-4 py-2">
                      <div className="flex flex-col items-center">
                        {item.salePrice && item.salePrice < item.price ? (
                          <>
                            <span className="line-through text-color text-xs opacity-55 font-bold">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-color text-md sm:text-base xl:text-lg font-semibold">
                              ${item.salePrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-color text-md sm:text-base xl:text-lg font-semibold">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlerAddToCart(item);
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
                          handlerAddToCart(item);
                        }}
                        className="flex md:hidden bg-secondary text-color cursor-pointer hover:bg-[#D6EED6]/90 transition-all duration-300 active:scale-95 rounded-full aspect-square p-0 min-w-[44px] min-h-[44px] w-11 h-11 shadow-sm"
                      >
                        <ShoppingCart size={20} />
                      </Button>
                    </div>
                  </div>
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

export default FeaturedProducts;
