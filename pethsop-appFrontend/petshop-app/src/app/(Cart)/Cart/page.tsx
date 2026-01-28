"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "../../context/cartContext";
import CircularText from "@/components/CircularText";
import { useRouter } from "next/navigation";
import CartSummary from "../CartSummary";
import CartItem, { CartItemType } from "../CartItem";
import CartHeader from "../CartHeader";
import MobileCartHeader from "../MobileCartHeader";
import { useShipping } from "../hooks/useShipping";
import SelectedItemModal from "../SelectedItemModal";

const Cart = () => {
  const [discountCode, setDiscountCode] = useState("");
  const [selectedItem, setSelectedItem] = useState<CartItemType | null>(null);
  const {
    cart,
    removeFromCart,
    fetchCart,
    clearCart,
    applyCoupon,
    coupon,
    subtotal,
    discountAmount,
    total,
    removeCoupon,
    updateQuantity,
  } = useCart();
  const [loading, setLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const router = useRouter();

  // Use custom shipping hook
  const { shippingFee, freeOver, calculatedShippingFee } =
    useShipping(subtotal);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [fetchCart]);

  const handleApplyCoupon = async () => {
    try {
      await applyCoupon(discountCode);
      setDiscountCode("");
    } catch (err) {
      toast.error("Invalid or expired coupon");
    }
  };

  const handlerRemoveCart = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const removeAllCart = async () => {
    try {
      clearCart();
      router.push("/main");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Unexpected error");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error!");
      }
    }
  };

  return (
    <>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-100">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : cart.length > 0 ? (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)]">
          {/* Desktop Table Header */}
          <CartHeader onClearCart={removeAllCart} />

          {/* Products Section */}
          <div
            className={`sm:mt-4 md:mt-2 lg:mt-12 flex flex-col gap-2 w-full lg:w-3/4 p-2 sm:p-5 pr-4 
              lg:max-h-[calc(100vh-7.5rem)] 
              lg:overflow-y-auto 
              lg:scrollbar-thin lg:scrollbar-thumb-gray-400 lg:scrollbar-track-gray-100 
              pb-24 sm:pb-24 lg:pb-8
              rounded-lg transition-all duration-300 flex-1
              ${selectedItem ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          >
            {/* Mobile Header */}
            <MobileCartHeader
              cartLength={cart.length}
              onClearCart={removeAllCart}
            />

            {/* Cart Items */}
            {cart.map((item) => (
              <CartItem
                key={item._id}
                item={item as unknown as CartItemType}
                onItemClick={setSelectedItem}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={handlerRemoveCart}
              />
            ))}
          </div>

          {/* Cart Summary Component */}
          <CartSummary
            subtotal={subtotal}
            shippingFee={shippingFee}
            freeOver={freeOver}
            calculatedShippingFee={calculatedShippingFee}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            handleApplyCoupon={handleApplyCoupon}
            coupon={coupon}
            discountAmount={discountAmount}
            removeCoupon={removeCoupon}
            total={total}
            cartLength={cart.length}
            summaryOpen={summaryOpen}
            setSummaryOpen={setSummaryOpen}
          />

          {/* SelectedItem Modal */}
          {selectedItem && (
            <SelectedItemModal
              selectedItem={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center flex-col gap-4 text-gray-500">
          <div className="text-6xl">🛒</div>
          <p className="text-xl font-medium">Your cart is empty</p>
          <Link href="/AllProduct">
            <Button className="bg-primary hover:bg-[#D6EED6] hover:text-[#393E46] font-semibold px-8 py-6 text-base cursor-pointer">
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default Cart;
