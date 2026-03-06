"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
import { ShoppingCart, Trash2 } from "lucide-react";
import { useConfirm } from "@/app/context/confirmContext";

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
  const { confirm } = useConfirm();

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
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Invalid or expired coupon");
      }
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
    const ok = await confirm({
      title: "Clear Cart",
      description: "Are you sure you want to remove all items from your cart?",
      confirmText: "Yes, Clear All",
      variant: "destructive",
    });

    if (ok) {
      try {
        clearCart();
        router.push("/");
      } catch (error) {
        toast.error("Unexpected error!");
      }
    }
  };

  return (
    <>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-[100]">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : cart.length > 0 ? (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] items-start p-2 sm:p-4 gap-4">
          {/* Product List */}
          <div className="w-full lg:w-3/4 flex flex-col gap-4">
            {/* Desktop Header */}
            <div className="hidden lg:block w-full">
              <CartHeader />
            </div>

            {/* Mobil Header */}
            <div className="lg:hidden">
              <MobileCartHeader
                cartLength={cart.length}
                onClearCart={removeAllCart}
              />
            </div>

            <div
              className={`flex flex-col gap-3 w-full pr-1
                lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto 
                lg:scrollbar-thin lg:scrollbar-thumb-gray-300
                transition-all duration-300
                ${selectedItem ? "opacity-40 pointer-events-none" : "opacity-100"}`}
            >
              {cart.map((item) => (
                <CartItem
                  key={item._id}
                  item={item as unknown as CartItemType}
                  onItemClick={setSelectedItem}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={handlerRemoveCart}
                />
              ))}

              {/* CLEAR CART  */}
              <div className="flex justify-end mt-2 mb-20 lg:mb-2">
                <button
                  onClick={removeAllCart}
                  className="hidden lg:flex items-center gap-2 px-4 py-2
                    bg-white dark:bg-[#162820]
                    text-gray-700 dark:text-[#c8e6d0]
                    border border-gray-300 dark:border-white/10
                    rounded-lg transition-all duration-300 ease-in-out
                    hover:scale-105 active:scale-95
                    shadow-sm hover:shadow-md font-medium cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Cart
                </button>
              </div>
            </div>
          </div>

          {/* CartSummary */}
          <div className="w-full lg:w-1/4">
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
              total={total}
              removeCoupon={removeCoupon}
              cartLength={cart.length}
              summaryOpen={summaryOpen}
              setSummaryOpen={setSummaryOpen}
            />
          </div>

          {selectedItem && (
            <SelectedItemModal
              selectedItem={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </div>
      ) : (
        // Your cart is empty
        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center flex-col gap-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart
                  className="w-12 h-12 text-gray-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 text-base mb-6">
              Add some products to get started!
            </p>
            <Link href="/AllProduct">
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition duration-300 hover:scale-105 active:scale-95">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
