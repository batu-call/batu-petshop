"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Star } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

type ProductImage = { url: string; publicId: string; _id: string };
type Category = { _id: string; name: string; slug: string };
type Features = { name: string; description: string };
type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: ProductImage[];
  slug: string;
  category: Category;
  productFeatures: Features[];
};

type ReviewStats = {
  [productId: string]: {
    count: number;
    avgRating: number;
  };
};

interface SimilarProductsProps {
  products: Product[];
  reviewStats: ReviewStats;
  onAddToCart: (item: Product) => void;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  products,
  reviewStats,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const swiperRef = useRef<SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="p-4">
      <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
        Similar Products
      </h2>
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
        {products.map((item) => {
          const discountPercent =
            item.salePrice && item.salePrice < item.price
              ? Math.round(((item.price - item.salePrice) / item.price) * 100)
              : 0;

          const stats = reviewStats[item._id];

          return (
            <SwiperSlide key={item._id} className="p-2">
              <Link
                key={item._id}
                href={`/Products/${item.slug}`}
                className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative h-76 sm:h-82 md:h-90 lg:h-100"
              >
                {/* DISCOUNT BADGE */}
                {discountPercent > 0 && (
                  <span className="absolute top-2 left-2 bg-secondary text-color text-[8px] sm:text-xs font-bold px-2 py-1 rounded-full z-10">
                    %{discountPercent} OFF
                  </span>
                )}

                {/* favorite */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(item._id);
                  }}
                >
                  <Heart
                    className={`w-3 h-3 transition-colors duration-300 active:scale-[0.97] group-hover:scale-110 ${
                      isFavorite(item._id) ? "text-gray-600" : "text-gray-400"
                    }`}
                    fill={isFavorite(item._id) ? "currentColor" : "none"}
                  />
                </Button>

                {/* image */}
                <div className="flex items-center justify-center p-2 sm:p-4">
                  {item.image && item.image.length > 0 ? (
                    <Image
                      src={item.image[0].url}
                      alt={item.product_name}
                      width={400}
                      height={400}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                      className="rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-44 xl:h-44 object-cover border-2 sm:border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <p className="text-white text-sm">No image!</p>
                  )}
                </div>

                <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                  <h2 className="text-white text-xs sm:text-base md:text-lg truncate font-semibold">
                    {item.product_name}
                  </h2>
                </div>

                {/* Review stars & count */}
                {stats && stats.count > 0 && (
                  <div className="flex items-center justify-center gap-1 text-gray-200 mt-1">
                    <div className="flex text-yellow-500">
                      {[...Array(Math.round(stats.avgRating))].map((_, i) => (
                        <Star key={i} sx={{ fontSize: 16 }} />
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-xs text-color3 font-semibold">
                      ( {stats.count} )
                    </span>
                  </div>
                )}

                <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-24 md:h-24 overflow-hidden mt-1">
                  <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                    {item.description}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                  <div className="flex flex-col items-center">
                    {item.salePrice && item.salePrice < item.price ? (
                      <>
                        <span className="line-through text-color text-xs opacity-55 font-bold">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                          ${item.salePrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]"
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
        {products.map((_, index) => (
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

export default SimilarProducts;