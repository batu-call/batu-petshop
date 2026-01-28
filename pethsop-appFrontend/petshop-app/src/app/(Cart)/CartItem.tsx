"use client";
import React from "react";
import Image from "next/image";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import { useConfirm } from "../context/confirmContext";

export type CartItemType = {
  _id: string;
  product: {
    _id: string;
    product_name: string;
    description: string;
    price: number;
    salePrice?: number | null;
    image?: { url: string }[];
    slug?: string;
  };
  quantity: number;
};

interface CartItemProps {
  item: CartItemType;
  onItemClick: (item: CartItemType) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onItemClick,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const { confirm } = useConfirm();

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const ok = await confirm({
      title: "Remove Item",
      description: "Are you sure you want to remove this item from your cart?",
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (ok) {
      onRemoveItem(
        typeof item.product === "string" ? item.product : item.product._id
      );
    }
  };

  return (
    <div
      onClick={() => onItemClick(item)}
      className="
        bg-primary
        rounded-xl
        p-4
        shadow-sm
        border
        border-slate-100
        relative
        transition
        hover:shadow-md
        hover:opacity-80
        cursor-pointer

        /* DESKTOP (SM+) */
        sm:rounded-md
        sm:p-3
        sm:shadow-none
        sm:border-none
        sm:flex
        sm:items-center
        sm:justify-between
      "
    >
      <div className="flex gap-4 sm:w-1/3">
        {/* IMAGE */}
        <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
          {item.product.image && (
            <Image
              src={item.product.image[0]?.url}
              alt={item.product.product_name}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover"
            />
          )}
        </div>

        {/* NAME + UNIT PRICE */}
        <div className="flex flex-col justify-center flex-1 py-1 min-w-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-color line-clamp-2 truncate lg:pr-8">
              {item.product.product_name}
            </h3>
            <p className="text-color font-semibold text-xs md:text-sm sm:hidden">
              ${(item.product.salePrice ?? item.product.price).toFixed(2)}
              <span className="text-slate-400 font-normal"> / unit</span>
            </p>
          </div>

          {/* MOBILE CONTROLS */}
          <div className="flex flex-col gap-3 mt-3 min-[375px]:flex-row min-[375px]:items-center min-[375px]:justify-between sm:hidden">
            {/* QUANTITY */}
            <div className="flex items-center bg-slate-100 rounded-full px-1 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(item.product._id, -1);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white transition active:scale-[0.97]"
              >
                <RemoveCircleOutlineIcon fontSize="small" />
              </button>

              <span className="mx-3 font-bold text-sm min-w-[20px] text-center">
                {item.quantity}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(item.product._id, 1);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white active:scale-90"
              >
                <AddCircleOutlineIcon fontSize="small" />
              </button>
            </div>

            {/* TOTAL */}
            <div className="text-right">
              <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400">
                Total
              </p>
              <p className="text-xs md:text-md lg:text-lg font-extrabold text-color">
                $
                {(
                  (item.product.salePrice ?? item.product.price) * item.quantity
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP CONTROLS */}
      <div className="hidden sm:flex sm:w-2/3 justify-between items-center">
        {/* quantity */}
        <div className="flex items-center bg-white rounded-xl border p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(item.product._id, -1);
            }}
            className="w-8 h-8 transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
          >
            <RemoveCircleOutlineIcon />
          </button>

          <span className="w-8 text-center font-bold">{item.quantity}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(item.product._id, 1);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
          >
            <AddCircleOutlineIcon />
          </button>
        </div>

        <div className="text-color font-medium">
          ${(item.product.salePrice ?? item.product.price).toFixed(2)}
        </div>

        <div className="font-bold text-color mr-5">
          $
          {(
            (item.product.salePrice ?? item.product.price) * item.quantity
          ).toFixed(2)}
        </div>
      </div>

      {/* REMOVE */}
      <ClearIcon
        className="text-color text-md absolute top-1 right-1 cursor-pointer hover:scale-110 transform transition duration-200 hover:text-zinc-950 z-10"
        onClick={handleRemove}
      />
    </div>
  );
};

export default CartItem;