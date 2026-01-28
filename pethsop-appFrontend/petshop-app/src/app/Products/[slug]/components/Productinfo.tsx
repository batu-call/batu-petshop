"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

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
}

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
}) => {
  return (
    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6 relative">
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

      <h1 className="text-2xl md:text-4xl font-bold text-color text-center break-words leading-tight">
        {productName}
      </h1>

      <p className="text-color text-lg break-words whitespace-normal">
        {description}
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          {salePrice && salePrice < price ? (
            <>
              <span className="line-through text-color opacity-50 text-sm">
                ${(price * quantity).toFixed(2)}
              </span>
              <span className="text-2xl font-semibold text-color">
                ${(salePrice * quantity).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-semibold text-color">
              ${(price * quantity).toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 justify-center">
          <Button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="bg-white hover:bg-[#e7eaf6] text-gray-800 w-7 h-7 flex items-center justify-center rounded cursor-pointer active:scale-[0.97]"
          >
            -
          </Button>
          <span className="text-xl font-medium">{quantity}</span>
          <Button
            onClick={() => setQuantity((prev) => prev + 1)}
            className="bg-white hover:bg-[#e7eaf6] text-gray-800 w-7 h-7 flex items-center justify-center rounded cursor-pointer active:scale-[0.97]"
          >
            +
          </Button>
        </div>

        <Button
          onClick={onAddToCart}
          className="bg-white hover:bg-white text-color font-medium py-2 rounded-lg mt-3 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97]"
        >
          <p className="text-color text-jost">Add To Cart ({quantity})</p>
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;