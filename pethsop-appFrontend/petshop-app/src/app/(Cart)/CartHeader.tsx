"use client";
import React from "react";

const CartHeader: React.FC = () => {
  return (
    <div className="hidden lg:flex items-center bg-white dark:bg-[#1a3d2a] shadow-xl border-2 border-transparent dark:border-white/10 sticky top-0 rounded-sm w-full h-12 z-10">
      <p className="sm:w-1/3 pl-2 xl:pl-24 text-color dark:!text-white text-lg font-semibold">
        Product Name
      </p>
      <div className="flex p-2 sm:w-2/3 justify-between">
        <p className="text-color dark:!text-white text-lg font-semibold text-center flex justify-center">
          Quantity
        </p>
        <p className="text-color dark:!text-white text-lg font-semibold text-center flex justify-center ml-6">
          Price
        </p>
        <p className="text-color dark:!text-white text-lg font-semibold text-center flex justify-center mr-6">
          Total Price
        </p>
      </div>
    </div>
  );
};

export default CartHeader;