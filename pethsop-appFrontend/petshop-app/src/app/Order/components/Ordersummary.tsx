import React from "react";

interface OrderSummaryProps {
  itemLength: number;
  safeSubtotal: number;
  calculatedShippingFee: number;
  safeDiscount: number;
  finalTotal: number;
}

const OrderSummary = ({
  itemLength,
  safeSubtotal,
  calculatedShippingFee,
  safeDiscount,
  finalTotal,
}: OrderSummaryProps) => {
  return (
    <div className="w-full border border-[#A8D1B5] dark:border-[#2d5a3d] p-4 rounded-lg shadow-md bg-white dark:bg-[#1e3d2a]">
      <h2 className="text-xl font-bold text-color dark:text-[#c8e6d0]! border-b border-gray-200 dark:border-[#2d5a3d] pb-2 mb-4">
        Order Summary
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-color dark:text-[#a8d4b8]! text-lg font-semibold">Total Items</p>
          <span className="text-color dark:text-[#c8e6d0]! text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
            {itemLength}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-color dark:text-[#a8d4b8]! text-lg font-semibold">Sub Total</p>
          <span className="text-color dark:text-[#c8e6d0]! text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
            ${safeSubtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#2d5a3d] pb-3">
          <p className="text-color dark:text-[#a8d4b8]! text-lg font-semibold">Shipping Fee</p>
          <span className="text-color dark:text-[#c8e6d0]! text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
            {calculatedShippingFee === 0 ? "Free" : `$${calculatedShippingFee.toFixed(2)}`}
          </span>
        </div>

        {safeDiscount > 0 && (
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#2d5a3d] pb-3">
            <p className="text-color dark:text-[#a8d4b8] text-lg font-semibold">Discount Amount</p>
            <span className="text-red-400  text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
              - ${safeDiscount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <p className="text-color dark:text-[#c8e6d0] text-2xl font-extrabold">Total Amount</p>
          <span className="text-white text-2xl font-extrabold bg-primary dark:bg-[#0b8457] px-6 py-2 rounded-lg shadow-lg">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;