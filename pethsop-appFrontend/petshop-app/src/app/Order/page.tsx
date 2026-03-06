"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { TextField } from "@mui/material";
import StripePay from "../StripePay";
import { useRouter } from "next/navigation";
import CircularText from "@/components/CircularText";
import { useCart } from "../context/cartContext";
import { AuthContext } from "../context/authContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Order = () => {
  const [postalCode, setPostalCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState(0);
  const [freeOver, setFreeOver] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { cart, subtotal, discountAmount, total, clearCart } = useCart();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useContext(AuthContext);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/Login");
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const safeSubtotal = subtotal ?? 0;
  const safeDiscount = discountAmount ?? 0;
  const itemlength = cart.length;

  const calculatedShippingFee =
    freeOver > 0 && safeSubtotal >= freeOver ? 0 : shippingFee;

  const finalTotal = Math.max(total + calculatedShippingFee, 0);

  const orderCreate = useCallback(
    async (paymentIntentId?: string | null) => {
      if (isProcessingOrder) {
        console.log("Order already being processed");
        return null;
      }

      if (!cart.length) {
        toast.error("The cart is empty!");
        return null;
      }

      if (
        !fullName?.trim() ||
        !email?.trim() ||
        !city?.trim() ||
        !phoneNumber?.trim() ||
        !address?.trim()
      ) {
        toast.error("Please fill in all address information");
        return null;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return null;
      }

      setIsProcessingOrder(true);

      const orderItems = cart.map((item) => ({
        product: item.product._id,
        name: item.product.product_name,
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
        image: item.product.image?.[0]?.url ?? "",
      }));

      const payload = {
        items: orderItems,
        shippingFee: calculatedShippingFee,
        shippingAddress: {
          fullName: fullName.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          phoneNumber: phoneNumber.trim(),
          postalCode: postalCode.trim() || undefined,
        },
        paymentIntentId: paymentIntentId ?? null,
      };

      try {
        console.log("Creating order with payload:", payload);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order`,
          payload,
          { withCredentials: true },
        );

        if (response.data.success) {
          toast.success("Your order has been saved!");
          return response.data.order;
        } else {
          toast.error(response.data.message || "Order could not be created.");
          return null;
        }
      } catch (error: unknown) {
        console.error("Order creation error:", error);

        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Server error.");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error.");
        }
        return null;
      } finally {
        setIsProcessingOrder(false);
      }
    },
    [
      cart,
      calculatedShippingFee,
      fullName,
      email,
      address,
      city,
      phoneNumber,
      postalCode,
      isProcessingOrder,
    ],
  );

  const handlerPaymentSuccess = async (paymentIntentId?: string | null) => {
    console.log("Payment successful, paymentIntentId:", paymentIntentId);

    const order = await orderCreate(paymentIntentId);

    if (order) {
      console.log("Order created/confirmed:", order._id);
      await clearCart();
      router.push(`/Success?orderId=${order._id}`);
    } else {
      console.log("Payment successful, webhook will create the order");
      await clearCart();
      toast.success("Payment successful! Your order is being processed.");
      router.push(`/Success?paymentIntentId=${paymentIntentId}`);
    }
  };

  const fetchShippingSettings = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setShippingFee(res.data.data.fee);
        setFreeOver(res.data.data.freeOver);
      }
    } catch {
      toast.error("Failed to load shipping settings");
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  const stripeItems = cart.map((item) => ({
    _id: item.product._id,
    name: item.product.product_name,
    price: item.product.salePrice ?? item.product.price,
    quantity: item.quantity,
  }));

  const isAddressComplete = !!(
    fullName?.trim() &&
    email?.trim() &&
    city?.trim() &&
    phoneNumber?.trim() &&
    address?.trim()
  );

  // Reusable MUI TextField dark mode sx props
  const textFieldSx = {
    "& .MuiInput-underline:after": { borderBottomColor: "#7aab8a" },
    "& .MuiInput-underline:before": { borderBottomColor: "#B1CBBB" },
    "& .MuiInputBase-input": { color: "inherit" },
  };

  const labelSx = {
    sx: {
      color: "#B1CBBB",
      "&.Mui-focused": {
        color: "#ffffff",
        backgroundColor: "#B1CBBB",
        padding: 0.4,
        borderRadius: 1,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#162820]">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="p-4 lg:p-8 flex flex-col gap-6 lg:flex-row lg:gap-8 flex-1">

          {/* LEFT COLUMN */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">

            {/* Order Items */}
            <div className="w-full h-[60vh] lg:h-[70vh] border border-[#A8D1B5] dark:border-[#2d5a3d] flex flex-col gap-2 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg shadow-md bg-white dark:bg-[#1e3d2a]">
              <h2 className="text-xl font-bold text-color dark:text-[#c8e6d0] p-2 border-b border-gray-200 dark:border-[#2d5a3d]">
                Order Items ({itemlength})
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
                    <p className="text-sm sm:text-base text-color dark:text-[#c8e6d0] font-semibold truncate">
                      {c.product.product_name}
                    </p>
                  </div>

                  <div className="w-16 flex justify-center items-center flex-shrink-0">
                    <p className="text-base sm:text-lg text-color2 dark:text-[#7aab8a] font-extrabold">
                      x{c.quantity}
                    </p>
                  </div>

                  <div className="w-24 sm:w-32 flex justify-end items-center flex-shrink-0">
                    <p className="text-sm sm:text-base text-color dark:text-[#c8e6d0] font-bold">
                      $
                      {(
                        (c.product.salePrice ?? c.product.price) * c.quantity
                      ).toFixed(2)}
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

            {/* Order Summary */}
            <div className="w-full border border-[#A8D1B5] dark:border-[#2d5a3d] p-4 rounded-lg shadow-md bg-white dark:bg-[#1e3d2a]">
              <h2 className="text-xl font-bold text-color dark:text-[#c8e6d0] border-b border-gray-200 dark:border-[#2d5a3d] pb-2 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-color dark:text-[#a8d4b8] text-lg font-semibold">
                    Total Items
                  </p>
                  <span className="text-color dark:text-[#c8e6d0] text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
                    {itemlength}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-color dark:text-[#a8d4b8] text-lg font-semibold">Sub Total</p>
                  <span className="text-color dark:text-[#c8e6d0] text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
                    ${safeSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#2d5a3d] pb-3">
                  <p className="text-color dark:text-[#a8d4b8] text-lg font-semibold">
                    Shipping Fee
                  </p>
                  <span className="text-color dark:text-[#c8e6d0] text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
                    {calculatedShippingFee === 0
                      ? "Free"
                      : `$${calculatedShippingFee.toFixed(2)}`}
                  </span>
                </div>

                {safeDiscount > 0 && (
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#2d5a3d] pb-3">
                    <p className="text-color dark:text-[#a8d4b8] text-lg font-semibold">
                      Discount Amount
                    </p>
                    <span className="text-color dark:text-[#c8e6d0] text-lg font-bold bg-gray-100 dark:bg-[#162820] px-4 py-1 rounded">
                      - ${safeDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <p className="text-color dark:text-[#c8e6d0] text-2xl font-extrabold">
                    Total Amount
                  </p>
                  <span className="text-white text-2xl font-extrabold bg-primary dark:bg-[#0b8457] px-6 py-2 rounded-lg shadow-lg">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">

            {/* Address Information */}
            <div className="w-full border border-[#A8D1B5] dark:border-[#2d5a3d] p-4 sm:p-6 rounded-lg shadow-md bg-white dark:bg-[#1e3d2a]">
              <h2 className="text-color dark:text-[#c8e6d0] text-2xl font-bold mb-4 border-b border-gray-200 dark:border-[#2d5a3d] pb-2">
                Address Information
                {!isAddressComplete && (
                  <span className="text-sm text-red-500 ml-2">* Required</span>
                )}
              </h2>

              <div className="flex flex-wrap -mx-2">
                <div className="flex flex-col gap-4 p-2 w-full sm:w-1/2">
                  <TextField
                    label="Full Name"
                    name="FullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    error={!fullName.trim() && fullName !== ""}
                    slotProps={{ inputLabel: labelSx }}
                    sx={textFieldSx}
                  />
                  <div className="md:h-2" />
                  <TextField
                    label="Email"
                    name="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    error={!email.trim() && email !== ""}
                    slotProps={{ inputLabel: labelSx }}
                    sx={textFieldSx}
                  />
                  <TextField
                    label="City"
                    name="City"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    error={!city.trim() && city !== ""}
                    slotProps={{ inputLabel: labelSx }}
                    sx={textFieldSx}
                  />
                </div>

                <div className="flex flex-col gap-4 p-2 w-full sm:w-1/2">
                  <div className="sm:col-span-2">
                    <PhoneInput
                      country={"us"}
                      value={phoneNumber}
                      onChange={(phone) => setPhoneNumber(phone)}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #B1CBBB",
                      }}
                      specialLabel="Phone"
                    />
                  </div>

                  <TextField
                    label="Address"
                    name="Address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    multiline
                    rows={2}
                    error={!address.trim() && address !== ""}
                    slotProps={{ inputLabel: labelSx }}
                    sx={textFieldSx}
                  />
                  <TextField
                    label="Postal Code"
                    name="Postal Code"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    slotProps={{ inputLabel: labelSx }}
                    sx={textFieldSx}
                  />
                </div>
              </div>
            </div>

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
                    handlerPaymentSuccess(paymentIntentId)
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