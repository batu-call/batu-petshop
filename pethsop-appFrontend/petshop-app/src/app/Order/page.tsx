"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CircularText from "@/components/CircularText";
import StripePay from "../StripePay";
import { useCart } from "../context/cartContext";
import { AuthContext } from "../context/authContext";


import ShippingAddressForm from "./components/ShippingAddressForm";
import { useShipping } from "./components/Useshipping";
import { useOrder } from "./components/Useorder";
import OrderItems from "./components/Orderitems";
import OrderSummary from "./components/Ordersummary";

const Order = () => {
  const [postalCode,   setPostalCode]   = useState("");
  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [city,         setCity]         = useState("");
  const [phoneNumber,  setPhoneNumber]  = useState("");
  const [address,      setAddress]      = useState("");
  const [loading,      setLoading]      = useState(true);
  const [isDark,       setIsDark]       = useState(false);

  const router = useRouter();
  const { cart, subtotal, discountAmount, total } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  // ── Dark mode detector ──────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains("dark"))
    );
    observer.observe(root, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // ── Auth guard 
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push("/Login");
      else setLoading(false);
    }
  }, [isAuthenticated, authLoading, router]);

  // ── Derived values 
  const safeSubtotal = subtotal ?? 0;
  const safeDiscount = discountAmount ?? 0;

  const { calculatedShippingFee, shippingLoading } = useShipping(safeSubtotal);

  const finalTotal = Math.max(total + calculatedShippingFee, 0);

  const { handlePaymentSuccess, isProcessingOrder } = useOrder({
    calculatedShippingFee,
    shippingAddress: { fullName, email, address, city, phoneNumber, postalCode },
  });

  const stripeItems = cart.map((item) => ({
    _id: item.product._id,
    name: item.product.product_name,
    price: item.product.salePrice ?? item.product.price,
    quantity: item.quantity,
  }));

  // ── Render 
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#162820]">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="p-4 lg:p-8 flex flex-col gap-6 lg:flex-row lg:gap-8 flex-1">

          {/* ── LEFT COLUMN  */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <OrderItems cart={cart} />
            <OrderSummary
              itemLength={cart.length}
              safeSubtotal={safeSubtotal}
              calculatedShippingFee={calculatedShippingFee}
              safeDiscount={safeDiscount}
              finalTotal={finalTotal}
            />
          </div>

          {/* ── RIGHT COLUMN  */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <ShippingAddressForm
              fullName={fullName}     setFullName={setFullName}
              email={email}           setEmail={setEmail}
              city={city}             setCity={setCity}
              phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
              address={address}       setAddress={setAddress}
              postalCode={postalCode} setPostalCode={setPostalCode}
              isDark={isDark}
            />

            {/* Stripe Payment */}
            <div className="w-full border border-[#A8D1B5] dark:border-[#2d5a3d] p-4 sm:p-6 rounded-lg shadow-md bg-white dark:bg-[#1e3d2a] flex justify-center items-center">
              {finalTotal > 0 && !shippingLoading && user?._id && (
                <StripePay
                  totalAmount={Number(finalTotal.toFixed(2))}
                  items={stripeItems}
                  fullName={fullName}
                  email={email}
                  city={city}
                  phoneNumber={phoneNumber}
                  address={address}
                  postalCode={postalCode}
                  userId={user._id}
                  shippingFee={calculatedShippingFee}
                  onPaymentSuccess={(paymentIntentId?: string) =>
                    handlePaymentSuccess(paymentIntentId)
                  }
                  isProcessingOrder={isProcessingOrder}
                />
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Order;