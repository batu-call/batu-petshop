"use client";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
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
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../context/cartContext";
import { Star } from "@mui/icons-material";
import { useFavorite } from "../context/favoriteContext";

type ReviewStats = {
  [productId: string]: { count: number; avgRating: number };
};
type ProductImage = { url: string; publicId: string; _id: string };
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

type Props = { reviewStats: ReviewStats };

const Deals = ({ reviewStats }: Props) => {
  const router = useRouter();
  const [product, setProduct] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType>(null);
  const { favorites, addFavorite, removeFavorite, fetchFavorites } =
    useFavorite();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/hot-deals`,
          { withCredentials: true },
        );
        if (response.data.success) setProduct(response.data.products);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response)
          toast.error(error.response.data.message);
        else if (error instanceof Error) toast.error(error.message);
        else toast.error("Unknown error!");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const handlerAddToCart = async (product: Product) => {
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

  const memoizedFetchFavorites = useCallback(() => {
    if (isAuthenticated) fetchFavorites();
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
    if (isFav) await removeFavorite(productId);
    else await addFavorite(productId);
  };

  const isFavorite = (productId: string) =>
    favorites.some((f) => f._id === productId);

  const getMobileFavFill = (productId: string) =>
    isFavorite(productId) ? (isDark ? "black" : "#393E46") : "none";

  const getMobileFavColor = (productId: string) =>
    isFavorite(productId)
      ? isDark ? "black" : "#393E46"
      : isDark ? "black" : "#9ca3af";

  return (
    <div className="flex-1 p-4">
      <div className="text-color dark:text-[#0b8457]! font-bold text-2xl sm:text-3xl lg:text-4xl flex items-center justify-center mb-6 sm:mb-8">
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

      {productsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 py-4 lg:mt-12 min-h-[320px] md:min-h-[420px]">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-primary/40 rounded-2xl animate-pulse min-h-[320px] md:min-h-[420px]"
            />
          ))}
        </div>
      ) : (
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
          loop={product.length > 4}
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          navigation
          preventClicks={true}
          preventClicksPropagation={false}
          className="py-4 lg:mt-12 custom-swiper items-center min-h-[320px] md:min-h-[420px]"
        >
          {product.map((item) => {
            const discountPercent =
              item.salePrice && item.salePrice < item.price
                ? Math.round(((item.price - item.salePrice) / item.price) * 100)
                : 0;
            const stats = reviewStats[item._id];
            const hasStats = stats && stats.count > 0;

            return (
              <SwiperSlide key={item._id} className="p-2">
                <div className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative group">
                  {/* Badges */}
                  <div className="absolute top-3 left-0 z-10 flex flex-col gap-1.5">
                    {discountPercent > 0 && (
                      <span className="bg-secondary text-color text-[9px] sm:text-[11px] font-bold pl-2.5 pr-3 py-1 rounded-r-full shadow-md tracking-wide">
                        %{discountPercent} OFF
                      </span>
                    )}
                    {Number(item.stock) > 0 && Number(item.stock) < 6 && (
                      <span className="bg-white/90 backdrop-blur-sm border-r border-t border-b border-red-200 text-red-400 text-[9px] sm:text-[11px] font-semibold pl-2.5 pr-3 py-1 rounded-r-full shadow-sm tracking-wide">
                        Only {item.stock} left
                      </span>
                    )}
                  </div>

                  {/* Favorite — desktop */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex p-2 rounded-full hover:bg-[#D6EED6] dark:hover:bg-white/20 absolute top-2 right-2 z-10 cursor-pointer transition-all duration-300 justify-center items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavorite(item._id);
                    }}
                  >
                    <Heart
                      className={`w-3 h-3 transition-colors duration-300 ${
                        isFavorite(item._id)
                          ? "text-gray-600 dark:!text-black"
                          : "text-gray-400 dark:!text-black"
                      }`}
                      fill={isFavorite(item._id) ? "currentColor" : "none"}
                    />
                  </Button>

                  {/* Favorite — mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden w-8 h-8 absolute top-2 right-2 z-10 cursor-pointer transition-all duration-300 bg-white/40 backdrop-blur-[2px] hover:bg-white/60 border border-white/30 shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavorite(item._id);
                    }}
                  >
                    <Heart
                      style={{
                        color: getMobileFavColor(item._id),
                        fill: getMobileFavFill(item._id),
                      }}
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        isFavorite(item._id) ? "scale-110" : ""
                      }`}
                      strokeWidth={isFavorite(item._id) ? 2.5 : 2}
                    />
                  </Button>

                  <Link
                    href={`/Products/${item.slug}`}
                    className="flex-1 flex flex-col"
                  >
                    {/* Image */}
                    <div className="w-full shrink-0">
                      {item.image && item.image.length > 0 ? (
                        <div className="relative w-full aspect-square md:w-36 md:h-36 lg:w-44 lg:h-44 mx-auto bg-white rounded-xs md:rounded-full overflow-hidden border border-white md:border-4">
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

                    {/* Name + Star */}
                    <div className="px-2 sm:px-4 pt-2 pb-1 flex flex-col items-center gap-1 min-h-[56px] justify-center">
                      <h2 className="text-white text-lg sm:text-base md:text-lg truncate font-semibold text-center w-full">
                        {item.product_name}
                      </h2>
                      {hasStats && (
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

                    {/* Description */}
                    <div className="px-4 py-2 h-12 sm:h-12 md:h-18 overflow-hidden">
                      <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                        {item.description}
                      </h2>
                    </div>
                  </Link>

                  {/* Price + Cart */}
                  <div className="flex gap-2 justify-between items-center px-2 sm:px-4 py-2">
                    <div className="flex flex-col items-center">
                      {item.salePrice && item.salePrice < item.price ? (
                        <>
                          <span className="text-xs line-through text-red-400 dark:text-black opacity-60 dark:opacity-100 font-semibold">
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
                      disabled={addingToCart === item._id}
                      className="hidden md:block w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white dark:hover:bg-[#c8e6d0]! text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === item._id ? "Adding..." : "Add To Cart"}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlerAddToCart(item);
                      }}
                      disabled={addingToCart === item._id}
                      className="flex md:hidden bg-secondary text-color cursor-pointer hover:bg-[#D6EED6]/90 dark:hover:!bg-[#0b8457] dark:hover:!text-white transition-all duration-300 active:scale-95 rounded-full aspect-square p-0 min-w-[44px] min-h-[44px] w-11 h-11 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === item._id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <ShoppingCart size={20} />
                      )}
                    </Button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}

      {/* Pagination */}
      {product.length >= 6 && (
        <div className="flex justify-center mt-8 gap-2 min-h-[20px]">
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
      )}
    </div>
  );
};

export default Deals;