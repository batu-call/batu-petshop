"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Package, Truck, RotateCcw } from "lucide-react";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface ProductInfoProps {
  productName: string;
  description: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  setQuantity: (value: React.SetStateAction<number>) => void;
  onAddToCart: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isAddingToCart?: boolean;
}

const badges = [
  { icon: Truck, text: "Free Shipping over $100" },
  { icon: Package, text: "Processed in 1–3 Business Days" },
  { icon: RotateCcw, text: "14-Day Returns" },
];

const ProductInfo: React.FC<ProductInfoProps> = ({
  productName,
  description,
  price,
  salePrice,
  quantity,
  setQuantity,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isAddingToCart = false,
}) => {
  return (
    <div className="w-full md:w-1/2 p-8 md:p-4 lg:p-8 flex flex-col justify-between gap-6 md:gap-3 lg:gap-6 relative">
      <div className="absolute right-0 top-0">
        {/* favorite */}
        <Button
          variant="ghost"
          size="icon"
          className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart
            className={`w-3 h-3 transition-colors duration-300 active:scale-[0.97] ${
              isFavorite ? "text-gray-600" : "text-gray-400"
            }`}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </Button>
      </div>

      {/* Product Name */}
      <h1 className="text-2xl md:text-xl lg:text-4xl font-bold text-color text-center wrap-break-word leading-tight">
        {productName}
      </h1>

      {/* Description */}
      <p className="text-color md:text-sm lg:text-lg text-lg wrap-break-word whitespace-normal text-center">
        {description}
      </p>

      <div className="flex flex-col gap-4 md:gap-2 lg:gap-4">
        {/* PRICE */}
        <div className="flex flex-col">
          {salePrice && salePrice < price ? (
            <>
              <span className="line-through text-red-400 dark:text-black opacity-60 dark:opacity-100 text-sm md:text-xs lg:text-sm text-shadow-xs font-semibold">
                ${(price * quantity).toFixed(2)}
              </span>
              <span className="text-2xl md:text-lg lg:text-2xl font-semibold text-color text-shadow-xs">
                ${(salePrice * quantity).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl md:text-lg lg:text-2xl font-semibold text-color text-shadow-xs">
              ${(price * quantity).toFixed(2)}
            </span>
          )}
        </div>

        {/* SHIPPING BADGES */}
       <div className="flex flex-col gap-2 md:gap-1 lg:gap-2">
          {badges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm md:text-xs lg:text-sm text-[#5a9677] dark:text-[#7aab8a]">
              <Icon className="w-4 h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* QUANTITY  */}
        <div className="flex items-center justify-center">
          <div className="flex items-center bg-slate-100 dark:bg-[#0b8457]! rounded-full px-1 py-1">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={isAddingToCart}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-[#0b8457]! active:scale-[0.97] disabled:opacity-40 transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
            >
              <RemoveCircleOutlineIcon fontSize="small" />
            </button>

            <span className="mx-4 font-bold text-sm min-w-[20px] text-center">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              disabled={isAddingToCart}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white active:scale-90 disabled:opacity-40 transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
            >
              <AddCircleOutlineIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* ADD TO CART */}
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="bg-white dark:bg-[#0b8457]! hover:bg-white text-color font-bold py-2 md:py-1 lg:py-2 rounded-lg mt-3 md:mt-1 lg:mt-3 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-color p-2 md:p-1 lg:p-2 md:text-sm lg:text-base">
            {isAddingToCart ? "Adding..." : "Add To Cart"}{" "}
            {!isAddingToCart && (
              <span className="text-xs font-bold bg-secondary dark:bg-white! text-color dark:text-[#0b8457]! px-2 py-0.5 rounded-xl ml-2">
                {quantity}
              </span>
            )}
          </p>
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;