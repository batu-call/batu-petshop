"use client";
import React, { useEffect } from "react";
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
  coupon: { code: string; percent: number } | null;
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

  useEffect(() => {
    document.body.style.overflow = summaryOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [summaryOpen]);

  return (
    <>
      {summaryOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-55 lg:hidden"
          onClick={() => setSummaryOpen(false)}
        />
      )}

      <div
        className={`
          bg-white dark:bg-[#1a3d2a]
          w-full md:w-[calc(100%-7rem)] lg:w-full
          shadow-2xl p-3 sm:p-4 lg:p-4
          rounded-t-lg lg:rounded-lg
          flex flex-col gap-3 lg:gap-4
          fixed bottom-0 left-0 md:left-28 lg:left-0 z-60 lg:z-30
          lg:static lg:sticky lg:top-24 lg:mt-16 xl:mt-16
          right-0 self-start
          border-t border-gray-100 dark:border-white/10 lg:border-none
        `}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2 cursor-pointer lg:cursor-default"
          onClick={() => setSummaryOpen((prev) => !prev)}
        >
          <h2 className="text-2xl font-bold text-color dark:!text-white">Cart Summary</h2>
          <button className="lg:hidden text-sm font-semibold text-color dark:!text-white">
            <div className="flex gap-2">
              <span className={summaryOpen ? "hidden" : "block"}>
                ${(total + calculatedShippingFee).toFixed(2)}
              </span>
              {summaryOpen ? "Hide" : "Show"}
            </div>
          </button>
        </div>

        {/* Content */}
        <div
          className={`transition-all duration-300 overflow-hidden
            ${summaryOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
            lg:max-h-full lg:opacity-100`}
        >
          {/* Subtotal */}
          <div className="flex justify-between items-center text-lg mt-3">
            <h3 className="text-color dark:!text-white/80">Sub Total:</h3>
            <div className="font-semibold text-color dark:!text-white">
              ${subtotal.toFixed(2)}
            </div>
          </div>

          {/* Shipping */}
          <div className="flex justify-between items-center text-lg">
            <h3 className="text-color dark:!text-white/80">Shipping Fee:</h3>
            <div className="font-semibold text-color dark:!text-white text-end">
              {calculatedShippingFee === 0 ? (
                <span className="text-green-600 dark:!text-[#7aab8a] font-semibold">Free</span>
              ) : (
                `$${calculatedShippingFee.toFixed(2)}`
              )}
              {freeOver > 0 && (
                <p className="text-sm text-gray-500 dark:!text-white/50">
                  Free shipping over ${freeOver}
                </p>
              )}
            </div>
          </div>

          {/* Discount Code */}
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-color dark:!text-white/80 text-lg">Discount Code:</h3>
            {!coupon && (
              <>
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
                      "& fieldset": { borderColor: "#4a7a5a" },
                      "&:hover fieldset": { borderColor: "#0b8457" },
                      "&.Mui-focused fieldset": { borderColor: "#0b8457" },
                      backgroundColor: "rgba(255,255,255,0.05)",
                    },
                    "& input": { color: "inherit", padding: "10px 12px" },
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-primary text-white py-2 rounded-md hover:opacity-70 cursor-pointer transition active:scale-[0.97] hover:shadow-md"
                >
                  Apply Code
                </button>
              </>
            )}

            {coupon && (
              <div className="mt-2 p-3 bg-green-100 dark:bg-[#0b8457]/30 rounded-md flex flex-col gap-2 text-color dark:!text-white border border-green-200 dark:border-[#0b8457]/50">
                <div><strong>Code:</strong> {coupon.code}</div>
                <div><strong>Percent:</strong> %{coupon.percent}</div>
                <div><strong>Discount:</strong> -${discountAmount}</div>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    if (window.innerWidth < 1024) {
                      removeCoupon();
                    } else {
                      const ok = await confirm({
                        title: "Remove Coupon",
                        description: "Are you sure you want to remove the applied coupon?",
                        confirmText: "Yes, Remove",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });
                      if (ok) removeCoupon();
                    }
                  }}
                  className="bg-white dark:bg-[#1a3d2a] text-color dark:!text-white py-1 rounded-md hover:opacity-80 cursor-pointer transition duration-300 ease-in-out active:scale-[0.97] border border-gray-200 dark:border-white/20"
                >
                  Remove Coupon
                </button>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 dark:border-white/10 pt-4 mt-3">
            <h3 className="text-color dark:!text-white">Total Amount:</h3>
            <div className="text-color dark:!text-white">
              ${(total + calculatedShippingFee).toFixed(2)}
            </div>
          </div>

          {/* Place Order */}
          <div className="w-full mt-3">
            <Link href={cartLength > 0 ? "/Order" : "#"} className="w-full">
              <Button
                className="w-full bg-primary h-12 hover:bg-[#D6EED6] hover:text-[#393E46] dark:hover:bg-[#0b8457] dark:hover:!text-white text-lg font-semibold transition lg:hover:scale-105 cursor-pointer"
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