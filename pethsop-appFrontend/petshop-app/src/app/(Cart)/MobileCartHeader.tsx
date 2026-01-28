"use client";
import React from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "../context/confirmContext";


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
      <h2 className="flex items-center justify-center gap-2 bg-[#97cba9]/80 text-color font-bold text-lg sm:text-xl px-4 py-2 rounded-xl shadow-md border border-[#97cba9]/30">
        🛒 Shopping Cart
      </h2>
      <button
        onClick={handleClearCart}
        className="flex gap-2 items-center bg-white text-gray-800 border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
      >
        <Trash2 className="w-4 h-4" />
        Clear Cart
      </button>
    </div>
  );
};

export default MobileCartHeader;