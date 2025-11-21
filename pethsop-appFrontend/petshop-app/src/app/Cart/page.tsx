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

type CartItem = {
  _id: string;
  product:
    | string
    | { _id: string; product_name: string; image: { url: string } };
  image: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  slug: string;
};

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/cart/getCart",
          { withCredentials: true }
        );
        if (response.data.success) {
          setCart(response.data.cart.items);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("xfghdxfgjdxfg!");
        }
      }
    };
    fetchCart();
  }, []);

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
        "http://localhost:5000/api/v1/cart/updateQuantity",
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
        toast.error("Something went wrong!");
      }
    }
  };

  const removeCart = async (productId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/v1/cart/removeCart/${productId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setCart(response.data.cart.items);
        toast.success("Item removed from cart");
      }
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

  const removeAllCart = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/v1/cart/removeAllCart",
        { withCredentials: true }
      );
      if (response.data.success) {
        setCart(response.data.cart.items);
        toast.success("All carts cleared!");
      }
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

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingFee = 5;
  const totalAmount = subtotal - discountAmount + shippingFee;

  return (
    <>
      <Navbar />
      <Sidebar /> 
      <div className="flex h-[calc(100vh-7.5rem)] ml-5">
        <div className="ml-40 flex justify-between items-center bg-white  shadow-2xl border-2 fixed h-12 rounded-sm w-[1263px]">
          <p className="text-center ml-40 sm:ml-28 sm:text-left text-color text-lg font-semibold">
            Product Name
          </p>
          <div className="flex ml-80 gap-12">
            <p className="text-center  sm:text-left text-color text-lg font-semibold ml-12">
              Quantity
            </p>
            <p className="text-center sm:text-left text-color text-lg font-semibold ml-12">
              Price
            </p>
            <p className="text-center sm:text-left text-color text-lg font-semibold ml-5">
              Total Price
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear the cart?")) {
                removeAllCart();
              }
            }}
            className="flex gap-2 justify-center items-center bg-white text-gray-800  rounded-sm p-4 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out hover:scale-105 px-4 py-2 "
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </div>
        {/* blur */}
        <div
          className={`ml-40 mt-10 flex flex-col gap-2 w-3/4 p-5 sm:w-1/2 md:w-2/3 lg:3/4 bg-white shadow-2xl pr-4 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg transition-all duration-300 ${
            selectedItem ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          {cart.length > 0 ? (
            cart.map((c) => (
              <div
                key={c._id}
                onClick={() => setSelectedItem(c)}
                className="bg-primary max-w-[1206px] h-[120px] mt-2 flex items-center justify-between rounded-sm text-jost relative cursor-pointer hover:opacity-80 transition"
              >
                <div className="h-[120px] w-24 relative rounded-xl">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt="cart-image"
                      fill
                      className="object-cover rounded-sm"
                    />
                  )}
                </div>
                <div className="text-2xl text-color w-120 overflow-hidden whitespace-nowrap text-ellipsis">
                  {c.name}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(c.product, -1);
                    }}
                    className="cursor-pointer w-10 h-10 flex items-center justify-center rounded text-color"
                  >
                    <RemoveCircleOutlineIcon />
                  </div>

                  <span className="text-xl font-sm text-color bg-white p-3 w-12 h-12 flex justify-center items-center shadow-2xl rounded-xl">
                    {c.quantity}
                  </span>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(c.product, 1);
                    }}
                    className="cursor-pointer w-10 h-10 flex items-center justify-center rounded text-color"
                  >
                    <AddCircleOutlineIcon />
                  </div>
                </div>
                <div className="w-102 flex">
                  <div className="text-lg mr-20 text-color3 ml-2 w-20 flex justify-center">
                    {c.price} <span className="ml-1 text-color3">$</span>
                  </div>
                  <div className="w-10 flex items-center justify-center">
                    <div className="text-lg mr-20 text-color ml-20 flex w-20 justify-center">
                      {c.price * c.quantity}{" "}
                      <span className="ml-1 text-color">$</span>
                    </div>
                  </div>
                </div>
                <ClearIcon
                  className="text-color text-sm absolute top-1 right-2 cursor-pointer hover:scale-110 transform transition duration-200 hover:text-zinc-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        "Are you sure you want to remove this item from your cart?"
                      )
                    ) {
                      removeCart(typeof c._id === "string" ? c._id : c._id);
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


        <div className="bg-white w-118 shadow-2xl mt-20 h-100 fixed right-0 bottom-0 flex flex-col justify-center">
          <div>
            <div className="flex gap-2 text-2xl justify-center items-center">
              <h2 className="text-color text-shadow-2xl w-120 flex justify-center items-center">
                Sub Total
              </h2>
              <div className="p-2 flex items-center text-color rounded-sm bg-[#f9f9f9] shadow-2xl border-b-2  border-black w-full justify-center">
                {subtotal} <span className="ml-1 text-color">$</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-2 text-2xl justify-center items-center">
              <h2 className="text-color text-shadow-2xl w-120 flex justify-center items-center">
                Shipping fee
              </h2>
              <div className="p-2 flex items-center text-color rounded-sm bg-[#f9f9f9] shadow-2xl border-b-2  border-black w-full justify-center">
                {shippingFee} <span className="ml-1 text-color">$</span>
              </div>
            </div>
            <div className="flex gap-2 text-2xl justify-center items-center w-full">
              <h2 className="text-color text-shadow-2xl w-100 flex justify-center items-center">
                Discount Code
              </h2>
              <div className="p-2 flex items-center rounded-sm bg-[#f9f9f9] shadow-2xl border-b-2 border-black w-100 justify-center">
                <TextField
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  variant="standard"
                  fullWidth
                  placeholder="Enter code"
                  autoComplete="off"
                  InputProps={{
                    disableUnderline: false,
                    style: {
                      color: "#000",
                      padding: 0,
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      color: "#B1CBBB",
                    },
                  }}
                  sx={{
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "#000",
                    },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 text-2xl justify-center items-center">
            <h2 className="text-color text-shadow-2xl w-120 flex justify-center items-center font-semibold">
              Total Amount
            </h2>
            <div className="p-2 flex items-center text-color rounded-sm bg-[#f9f9f9] shadow-2xl border-b-2  border-black w-full justify-center">
              {totalAmount} <span className="ml-1 text-color">$</span>
            </div>
          </div>
          <div className="w-full flex items-center justify-center mt-5">
            <Link href={cart.length > 0 ? "/Order" : "#"}>
              <Button className="w-100 bg-primary h-10 cursor-pointer hover:bg-[#D6EED6] hover:text-[#393E46] text-base transition duration-300 ease-in-out hover:scale-105">
                Place Order
              </Button>
            </Link>
          </div>
        </div>

        {selectedItem && (
          <div
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-2xl w-[400px] relative shadow-xl"
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:opacity-45 cursor-pointer"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>

              <div className="flex flex-col items-center">
                {selectedItem.image && (
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    width={300}
                    height={300}
                    className="rounded-md"
                  />
                )}
                <h2 className="text-xl font-semibold mt-4 text-gray-800">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-600 text-center mt-2">
                  {selectedItem.description}
                </p>
                <div className="text-lg font-bold mt-4 text-gray-900">
                  {selectedItem.price}$ × {selectedItem.quantity} ={" "}
                  {selectedItem.price * selectedItem.quantity}$
                </div>
                <Link href={`/Products/${selectedItem.slug}`}>
                  <Button
                    className="mt-4 bg-primary hover:bg-[#D6EED6] text-gray-900 transition"
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
    </>
  );
};

export default Cart;
