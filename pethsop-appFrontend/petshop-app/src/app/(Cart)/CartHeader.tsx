"use client";
import React from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "../context/confirmContext";


interface CartHeaderProps {
  onClearCart: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({ onClearCart }) => {
  const { confirm } = useConfirm();

  const handleClearCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const ok = await confirm({
      title: "Delete Cart",
      description: "Are you sure you want to delete this cart?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    
    if (ok) {
      onClearCart();
    }
  };

  return (
    <div className="hidden lg:flex items-center bg-white shadow-xl border-2 fixed rounded-sm w-3/4 h-12 z-10">
      <p className="sm:w-1/3 text-center sm:text-center text-color text-lg font-semibold">
        Product Name
      </p>
      <div className="flex p-2 sm:w-2/3 justify-between">
        <p className="text-color text-lg font-semibold text-center flex justify-center">
          Quantity
        </p>
        <p className="text-color text-lg font-semibold text-center flex justify-center ml-8">
          Price
        </p>
        <p className="text-color text-lg font-semibold text-center flex justify-center mr-12">
          Total Price
        </p>
      </div>
      <button
        onClick={handleClearCart}
        className="w-40 flex gap-2 justify-center items-center bg-white text-gray-800 rounded-sm p-2 cursor-pointer hover:bg-gray-100 hover:scale-105 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
      >
        <Trash2 className="w-4 h-4" />
        Clear Cart
      </button>
    </div>
  );
};

export default CartHeader;