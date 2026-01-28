"use client";
import React from "react";
import { TextField } from "@mui/material";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useConfirm } from "../context/confirmContext";

interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  freeOver: number;
  calculatedShippingFee: number;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  handleApplyCoupon: () => Promise<void>;
  coupon: {
    code: string;
    percent: number;
  } | null;
  discountAmount: number;
  removeCoupon: () => void;
  total: number;
  cartLength: number;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  calculatedShippingFee,
  freeOver,
  discountCode,
  setDiscountCode,
  handleApplyCoupon,
  coupon,
  discountAmount,
  removeCoupon,
  total,
  cartLength,
  summaryOpen,
  setSummaryOpen,
}) => {
  const { confirm } = useConfirm();

  return (
    <>
      {/* Cart Summary Mobile Overlay */}
      {summaryOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-55 lg:hidden"
          onClick={() => setSummaryOpen(false)}
        />
      )}

      {/* Cart Summary */}
      <div
        className={`bg-white w-full 
          md:w-[calc(100%-6rem)] 
          lg:w-1/4 
          shadow-2xl 
          mt-4 lg:mt-16 xl:mt-16
          p-3 sm:p-4 lg:p-4 
          rounded-t-lg lg:rounded-lg 
          flex flex-col gap-3 lg:gap-4
          fixed bottom-0 left-0 md:left-24 lg:left-0 z-60 lg:z-30
          lg:static lg:sticky lg:top-24
          right-0 self-start`}
      >
        {/* Summary Header */}
        <div
          className="flex items-center justify-between border-b pb-2 cursor-pointer lg:cursor-default"
          onClick={() => setSummaryOpen((prev) => !prev)}
        >
          <h2 className="text-2xl font-bold text-color">Cart Summary</h2>

          <button className="lg:hidden text-sm font-semibold text-color">
            <div className="flex gap-2">
              <span className={summaryOpen ? "hidden" : "block"}>
                ${(total + calculatedShippingFee).toFixed(2)}
              </span>
              {summaryOpen ? "Hide" : "Show"}
            </div>
          </button>
        </div>

        {/* Summary Content */}
        <div
          className={`transition-all duration-300 overflow-hidden
            ${summaryOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
            lg:max-h-full lg:opacity-100`}
        >
          {/* Subtotal */}
          <div className="flex justify-between items-center text-lg mt-3">
            <h3 className="text-color">Sub Total:</h3>
            <div className="font-semibold text-color">
              ${subtotal.toFixed(2)}
            </div>
          </div>

          {/* Shipping Fee */}
          <div className="flex justify-between items-center text-lg">
            <h3 className="text-color">Shipping Fee:</h3>
            <div className="font-semibold text-color text-end">
              {calculatedShippingFee === 0 ? (
                <span className="text-green-600 font-semibold">Free</span>
              ) : (
                `$${calculatedShippingFee.toFixed(2)}`
              )}
              {freeOver > 0 && (
                <p className="text-sm text-gray-500">
                  Free shipping over ${freeOver}
                </p>
              )}
            </div>
          </div>

          {/* Discount Code Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-color text-lg">Discount Code:</h3>
            <TextField
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Enter code"
              autoComplete="off"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#000" },
                  "&.Mui-focused fieldset": { borderColor: "#000" },
                },
                "& input": { color: "#000", padding: "10px 12px" },
              }}
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-primary text-white py-2 rounded-md hover:opacity-70 cursor-pointer transition active:scale-[0.97] hover:shadow-md"
            >
              Apply Code
            </button>

            {/* Applied Coupon Display */}
            {coupon && (
              <div className="mt-2 p-3 bg-green-100 rounded-md flex flex-col gap-2 text-color">
                <div>
                  <strong>Code:</strong> {coupon.code}
                </div>
                <div>
                  <strong>Percent:</strong> %{coupon.percent}
                </div>
                <div>
                  <strong>Discount:</strong> -${discountAmount}
                </div>

                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const ok = await confirm({
                      title: "Remove Coupon",
                      description:
                        "Are you sure you want to remove the applied coupon?",
                      confirmText: "Yes, Remove",
                      cancelText: "Cancel",
                      variant: "destructive",
                    });
                    if (ok) removeCoupon();
                  }}
                  className="bg-white text-color py-1 rounded-md hover:opacity-80 cursor-pointer transition duration-300 ease-in-out active:scale-[0.97]"
                >
                  Remove Coupon
                </button>
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center text-xl font-bold border-t pt-4 mt-3">
            <h3 className="text-color">Total Amount:</h3>
            <div className="text-color">
              ${(total + calculatedShippingFee).toFixed(2)}
            </div>
          </div>

          {/* Place Order Button */}
          <div className="w-full mt-3">
            <Link href={cartLength > 0 ? "/Order" : "#"} className="w-full">
              <Button
                className="w-full bg-primary h-12 hover:bg-[#D6EED6] hover:text-[#393E46] text-lg font-semibold transition lg:hover:scale-105 cursor-pointer"
                disabled={cartLength === 0}
              >
                Place Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSummary;
