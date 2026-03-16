import React from "react";
import Image from "next/image";

interface CartItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    product_name: string;
    price: number;
    salePrice?: number | null
    image?: { url: string }[];
  };
}

interface OrderItemsProps {
  cart: CartItem[];
}

const OrderItems = ({ cart }: OrderItemsProps) => {
  return (
    <div className="w-full h-[60vh] lg:max-h-[85vh] border border-[#A8D1B5] dark:border-[#2d5a3d] flex flex-col gap-2 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg shadow-md bg-white dark:bg-[#1e3d2a]">
      <h2 className="text-xl font-bold text-color dark:text-[#c8e6d0]! p-2 border-b border-gray-200 dark:border-[#2d5a3d]">
        Order Items ({cart.length})
      </h2>

      {cart.map((c) => (
        <div
          key={c._id}
          className="flex items-center border border-gray-100 dark:border-[#2d5a3d] rounded-lg p-2 transition duration-200 hover:bg-gray-50 dark:hover:bg-[#162820]"
        >
          <div className="w-[80px] h-[80px] relative flex-shrink-0">
            <Image
              src={c.product.image?.[0]?.url || "/placeholder.png"}
              alt={c.product.product_name}
              fill
              sizes="80px"
              className="object-cover rounded-md p-1"
            />
          </div>
          <div className="flex-1 min-w-0 px-2 sm:px-4">
            <p className="text-sm sm:text-base text-color dark:text-[#c8e6d0]! font-semibold truncate">
              {c.product.product_name}
            </p>
          </div>
          <div className="w-16 flex justify-center items-center flex-shrink-0">
            <p className="text-base sm:text-lg text-color2 dark:text-[#7aab8a]! font-extrabold">
              x{c.quantity}
            </p>
          </div>
          <div className="w-24 sm:w-32 flex justify-end items-center flex-shrink-0">
            <p className="text-sm sm:text-base text-color dark:text-[#c8e6d0]! font-bold">
              ${((c.product.salePrice ?? c.product.price) * c.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      ))}

      {cart.length === 0 && (
        <div className="text-center text-gray-500 dark:text-[#7aab8a] py-10">
          Your cart is empty.
        </div>
      )}
    </div>
  );
};

export default OrderItems;