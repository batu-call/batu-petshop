"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { Star } from "@mui/icons-material";
import { useEffect, useState } from "react";

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
  stock: string;
  image: ProductImage[];
  slug: string;
};

type Props = {
  p: Product;
  reviewStats: ReviewStats;
  isFavorite: (id: string) => boolean;
  handleFavorite: (id: string) => void;
  handlerAddToCart: (product: Product) => void;
  addingToCart: string | null;
};

const AllProductCard = ({
  p,
  reviewStats,
  isFavorite,
  handleFavorite,
  handlerAddToCart,
  addingToCart,
}: Props) => {
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

  const discountPercent =
    p.salePrice && p.salePrice < p.price
      ? Math.round(((p.price - p.salePrice) / p.price) * 100)
      : 0;

  const stats = reviewStats[p._id];
  const hasStats = stats && stats.count > 0;

  const mobileFavFill = isFavorite(p._id)
    ? isDark
      ? "black"
      : "#393E46"
    : "none";

  const mobileFavColor = isFavorite(p._id)
    ? isDark
      ? "black"
      : "#393E46"
    : isDark
      ? "black"
      : "#9ca3af";

  return (
    <div className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative group">
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

      {/* Desktop Favorite */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex p-2 rounded-full hover:bg-[#D6EED6] dark:hover:bg-white/20 absolute top-2 right-2 z-10 cursor-pointer transition-all duration-300 justify-center items-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFavorite(p._id);
        }}
      >
        <Heart
          className={`w-3 h-3 transition-colors duration-300 ${
            isFavorite(p._id)
              ? "text-gray-600 dark:!text-black"
              : "text-gray-400 dark:!text-black"
          }`}
          fill={isFavorite(p._id) ? "currentColor" : "none"}
        />
      </Button>

      {/* Mobile Favorite */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden w-8 h-8 absolute top-2 right-2 z-10 cursor-pointer transition-all duration-300 bg-white/40 backdrop-blur-[2px] hover:bg-white/60 border border-white/30 shadow-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFavorite(p._id);
        }}
      >
        <Heart
          style={{ color: mobileFavColor, fill: mobileFavFill }}
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isFavorite(p._id) ? "scale-110" : ""
          }`}
          strokeWidth={isFavorite(p._id) ? 2.5 : 2}
        />
      </Button>

      <Link href={`/Products/${p.slug}`} className="flex-1 flex flex-col">
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
            <p className="text-white text-sm text-center">No image!</p>
          )}
        </div>

        {/* Name + Star */}
        <div className="px-2 sm:px-4 pt-2 pb-1 flex flex-col items-center justify-center gap-1 min-h-[56px]">
          <h2 className="text-white text-lg sm:text-base md:text-lg truncate font-semibold text-center w-full">
            {p.product_name}
          </h2>
          {hasStats && (
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-500">
                {[...Array(Math.round(stats.avgRating))].map((_, i) => (
                  <Star key={i} sx={{ fontSize: 14 }} />
                ))}
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

        {/* Desktop Add to Cart */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlerAddToCart(p);
          }}
          disabled={addingToCart === p._id}
          className="hidden md:block w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer
            hover:bg-white
            dark:hover:bg-[#c8e6d0]!
            text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]"
        >
          {addingToCart === p._id ? "Adding..." : "Add To Cart"}
        </Button>

        {/* Mobile Add to Cart */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlerAddToCart(p);
          }}
          disabled={addingToCart === p._id}
          className="flex md:hidden bg-secondary text-color cursor-pointer
            hover:bg-[#D6EED6]/90
            dark:hover:!bg-[#0b8457] dark:hover:!text-white
            transition-all duration-300 active:scale-95
            rounded-full aspect-square p-0 min-w-11 min-h-11 w-11 h-11 shadow-sm"
        >
          {addingToCart === p._id ? (
            <span className="text-xs">...</span>
          ) : (
            <ShoppingCart size={18} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AllProductCard;