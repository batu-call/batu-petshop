"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/page";
import Navbar from "../Navbar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/cartContext";
import CircularText from "@/components/CircularText";

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  image: { url: string }[];
  slug: string;
};

type CartItem = {
  _id: string;
  product: Product;
  quantity: number;
};

const Cart = () => {
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPercent, setAppliedPercent] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const { cart, setCart, removeFromCart, fetchCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [freeOver, setFreeOver] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(true);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

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

  const applyCoupon = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a code!");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/apply`,
        { code: discountCode, subtotal },
        { withCredentials: true }
      );

      setDiscountAmount(res.data.discountAmount);
      setAppliedPercent(res.data.percent);

      toast.success(`Coupon applied! -${res.data.percent}%`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Invalid coupon!");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while fetching the cart.");
      }
    }
  };

  const fetchShippingSettings = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setShippingFee(res.data.data.fee);
        setFreeOver(res.data.data.freeOver);
      }
    } catch (err) {
      toast.error("Failed to load shipping settings");
    } finally {
      setShippingLoading(false);
    }
  };
  const calculatedShippingFee =
    freeOver > 0 && subtotal >= freeOver ? 0 : shippingFee;

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  useEffect(() => {
    setTotalAmount(subtotal - discountAmount + calculatedShippingFee);
  }, [subtotal, discountAmount, calculatedShippingFee]);

  const handleQuantityChange = async (
    product: string | { _id: string },
    delta: number
  ) => {
    const productId = typeof product === "string" ? product : product._id;
    const item = cart.find(
      (c) =>
        (typeof c.product === "string" ? c.product : c.product._id) ===
        productId
    );
    if (!item) return null;

    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/updateQuantity`,
        { productId, quantity: newQuantity },
        { withCredentials: true }
      );
      if (response.data.success) {
        setCart(response.data.cart.items);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while updating quantity!");
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
    try {
      clearCart();
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

  useEffect(() => {
    const savedCode = localStorage.getItem("discountCode");
    const savedAmount = localStorage.getItem("discountAmount");
    const savedPercent = localStorage.getItem("appliedPercent");

    if (savedCode) setDiscountCode(savedCode);
    if (savedAmount) setDiscountAmount(Number(savedAmount));
    if (savedPercent) setAppliedPercent(Number(savedPercent));
  }, []);

  useEffect(() => {
    localStorage.setItem("discountCode", discountCode);
    localStorage.setItem("discountAmount", discountAmount.toString());
    localStorage.setItem("appliedPercent", appliedPercent.toString());
  }, [discountCode, discountAmount, appliedPercent]);

  return (
    <>
      <Navbar />
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] md:ml-24 lg:ml-5">
          <div className="hidden lg:flex lg:ml-40 justify-between items-center bg-white shadow-2xl border-2 fixed rounded-sm w-[610px] xl:w-[1260px] 2xl:w-[1263px] h-12 lg:h-12">
            <p className="text-center lg:ml-20 sm:ml-28 sm:text-left text-color lg:text-md 2xl:text-lg font-semibold">
              Product Name
            </p>
            <div className="flex xl:w-170 2xl:w-[270px] p-2">
              <p className="text-color lg:text-md 2xl:text-lg font-semibold text-center lg:w-1/2 xl:w-1/4 flex justify-center">
                Quantity
              </p>
              <p className="text-color lg:text-md 2xl:text-lg font-semibold text-center lg:w-1/2 xl:w-1/4 flex justify-center lg:ml-20 xl:ml-7 2xl:ml-56">
                Price
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear the cart?")) {
                  removeAllCart();
                }
              }}
              className="flex gap-2 justify-center items-center bg-white text-gray-800 rounded-sm p-2 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>

          <div
            className={`mt-2 sm:mt-4 md:mt-2 lg:mt-12 lg:ml-40 flex flex-col gap-2 w-full lg:w-3/4 p-2 sm:p-5 bg-white shadow-2xl pr-4 
  lg:max-h-[calc(100vh-7.5rem)] 
  lg:overflow-y-auto 
  lg:scrollbar-thin lg:scrollbar-thumb-gray-400 lg:scrollbar-track-gray-100
  rounded-lg transition-all duration-300 ${
    selectedItem ? "opacity-40 pointer-events-none" : "opacity-100"
  }`}
          >
            {cart.length > 0 && (
              <div className="flex justify-end p-2 lg:hidden">
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear the cart?")) {
                      removeAllCart();
                    }
                  }}
                  className="flex gap-2 items-center bg-white text-gray-800 border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
            )}

            {cart.length > 0 ? (
              cart.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setSelectedItem(c as unknown as CartItem)}
                  className="bg-primary min-h-[120px] w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md text-jost cursor-pointer hover:opacity-80 transition relative"
                >
                  <div className="flex items-center w-full sm:w-1/3 mb-2 sm:mb-0">
                    <div className="h-20 w-20 relative rounded-md flex-shrink-0">
                      {c.image && (
                        <Image
                          src={c.image}
                          alt="cart-image"
                          fill
                          className="object-cover rounded-md"
                        />
                      )}
                    </div>
                    <div className="text-base sm:text-lg text-color font-medium ml-4 truncate max-w-[calc(100%-6rem)]">
                      {c.name}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-2/3 justify-between">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-1/3 justify-start sm:justify-center">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(c.product, -1);
                        }}
                        className="cursor-pointer w-8 h-8 flex items-center justify-center rounded text-color"
                      >
                        <RemoveCircleOutlineIcon />
                      </div>

                      <span className="text-base font-sm text-color bg-white p-2 w-10 h-10 flex justify-center items-center shadow-inner rounded-md">
                        {c.quantity}
                      </span>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(c.product, 1);
                        }}
                        className="cursor-pointer w-8 h-8 flex items-center justify-center rounded text-color"
                      >
                        <AddCircleOutlineIcon />
                      </div>
                    </div>

                    <div className="flex justify-between w-full sm:w-2/3">
                      <div className="text-base text-color3 w-1/2 flex justify-start sm:justify-center">
                        <span className="font-semibold mr-1 lg:hidden">
                          Price:
                        </span>
                        {c.price}$
                      </div>
                      <div className="text-base font-bold text-color w-1/2 flex justify-start sm:justify-center">
                        <span className="font-semibold mr-1 lg:hidden">
                          Total:
                        </span>
                        {(c.price * c.quantity).toFixed(2)}$
                      </div>
                    </div>
                  </div>

                  <ClearIcon
                    className="text-color text-md absolute top-1 right-1 cursor-pointer hover:scale-110 transform transition duration-200 hover:text-zinc-950"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          "Are you sure you want to remove this item from your cart?"
                        )
                      ) {
                        handlerRemoveCart(
                          typeof c.product === "string"
                            ? c.product
                            : c.product._id
                        );
                      }
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-lg mt-10 flex items-center justify-center">
                There are no items in your cart
              </div>
            )}
          </div>
          {/* Cart Summary */}
          <div
            className="bg-white w-full lg:w-1/4 
    shadow-2xl 
    mt-4 lg:mt-3 xl:mt-16
    p-3 sm:p-4 lg:p-4 
    rounded-lg 
    flex flex-col gap-3 lg:gap-4
    sticky bottom-0 
    lg:sticky lg:top-24
    right-0 self-start"
          >
            <h2 className="text-2xl font-bold text-color mb-2 border-b pb-2">
              Cart Summary
            </h2>

            <div className="flex justify-between items-center text-lg">
              <h3 className="text-color">Sub Total:</h3>
              <div className="font-semibold text-color">
                {subtotal.toFixed(2)}$
              </div>
            </div>

            <div className="flex justify-between items-center text-lg">
              <h3 className="text-color">Shipping Fee:</h3>
              <div className="font-semibold text-color text-end">
                {calculatedShippingFee === 0 ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  `${calculatedShippingFee.toFixed(2)}$`
                )}
                {freeOver > 0 && (
  <p className="text-sm text-gray-500">
    Free shipping over {freeOver}$
  </p>
)}
              </div>
            </div>

            <div className="flex flex-col gap-1 md:gap-2">
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
                onClick={applyCoupon}
                className="bg-primary text-white py-2 rounded-md hover:opacity-70 transition"
              >
                Apply Code
              </button>
              <div>
                {appliedPercent > 0 && (
                  <div className="mt-3 p-3 bg-green-100 text-color rounded-md">
                    <div>
                      <strong>Discount Code:</strong> {discountCode}
                    </div>
                    <div>
                      <strong>Applied Percent:</strong> %{appliedPercent}
                    </div>
                    <div>
                      <strong>Discount Amount:</strong> {discountAmount}$
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-bold border-t pt-1 md:pt-4 mt-2">
              <h3 className="text-color">Total Amount:</h3>
              <div className="text-color">{totalAmount.toFixed(2)}$</div>
            </div>

            <div className="w-full flex items-center justify-center mt-2 md:mt-5">
              <Link href={cart.length > 0 ? "/Order" : "#"} className="w-full">
                <Button
                  className="w-full bg-primary h-12 cursor-pointer hover:bg-[#D6EED6] hover:text-[#393E46] text-lg font-semibold transition duration-300 ease-in-out lg:hover:scale-105"
                  disabled={cart.length === 0}
                >
                  Place Order
                </Button>
              </Link>
            </div>
          </div>

          {selectedItem && (
            <div
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 rounded-2xl w-full max-w-sm relative shadow-xl transform transition-all duration-300 scale-100 opacity-100"
              >
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:opacity-45 cursor-pointer text-2xl"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </button>

                <div className="flex flex-col items-center">
                  {selectedItem.product.image && (
                    <Image
                      src={selectedItem.product.image?.[0]?.url}
                      alt={selectedItem.product.product_name}
                      width={300}
                      height={300}
                      className="rounded-md object-cover max-h-60 w-auto"
                    />
                  )}
                  <h2 className="text-2xl font-semibold mt-4 text-gray-800 text-center">
                    {selectedItem.product.product_name}
                  </h2>
                  <p className="text-gray-600 text-center mt-2 text-sm max-h-24 overflow-y-auto">
                    {selectedItem.product.description}
                  </p>
                  <div className="text-xl font-bold mt-4 text-gray-900">
                    {selectedItem.product.price.toFixed(2)}$ ×{" "}
                    {selectedItem.quantity} ={" "}
                    {(
                      selectedItem.product.price * selectedItem.quantity
                    ).toFixed(2)}
                    $
                  </div>
                  <Link href={`/Products/${selectedItem.product.slug}`}>
                    <Button
                      className="mt-4 bg-primary hover:bg-[#D6EED6] text-gray-900 font-semibold cursor-pointer transition duration-300 ease-in-out hover:scale-105"
                      onClick={() => setSelectedItem(null)}
                    >
                      View Full Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Cart;
