"use client";
import React from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "../context/confirmContext";
import { ShoppingBasket } from "lucide-react";

interface MobileCartHeaderProps {
  cartLength: number;
  onClearCart: () => void;
}

const MobileCartHeader: React.FC<MobileCartHeaderProps> = ({
  cartLength,
  onClearCart,
}) => {
  const { confirm } = useConfirm();

  const handleClearCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const ok = await confirm({
      title: "Delete Cart",
      description: "Are you sure you want to clear the cart?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (ok) {
      onClearCart();
    }
  };

  if (cartLength === 0) return null;

  return (
    <div className="flex justify-between p-2 lg:hidden">
      <h2 className="text-sm flex items-center justify-center gap-2 bg-[#97cba9]/80 text-color font-bold sm:text-xl px-4 py-2 rounded-xl shadow-md border border-[#97cba9]/30">
        <ShoppingBasket /> Shopping Cart
      </h2>
      <button
        onClick={handleClearCart}
        className="flex gap-2 items-center  bg-white dark:bg-[#162820]
                    text-gray-700 dark:text-[#c8e6d0]
                    border border-gray-300 dark:border-white/10 rounded-md p-2 ease-in-out
                    hover:scale-101 active:scale-95
                    shadow-sm hover:shadow-md font-medium cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
        Clear Cart
      </button>
    </div>
  );
};

export default MobileCartHeader;
