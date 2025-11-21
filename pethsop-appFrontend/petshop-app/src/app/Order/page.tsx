"use client";
import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../Sidebar/page";
import Navbar from "../Navbar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { TextField } from "@mui/material";
import StripePay from "../StripePay";
import { useRouter } from "next/navigation";

type Items = {
  _id: string;
  product:
    | string
    | { _id: string; product_name: string; image: { url: string } };
  image: string;
  name: string;
  price: number;
  quantity: number;
};

const Order = () => {
  const [items, setItems] = useState<Items[]>([]);
  const [postalCode, setPostalCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const router = useRouter();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingFee = 5;
  const totalAmount = subtotal + shippingFee;

  const itemlength = items.length;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/cart/getCart",
          { withCredentials: true }
        );
        if (response.data.success) {
          setItems(response.data.cart.items);
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


  const orderCreate = useCallback(
    async(paymentIntentId?: string | null) => {
    if(!items.length) {
      toast.error("The cart is empty, the order cannot be created!")
      return null
    }
    if(!fullName || !email ||  !city || !phoneNumber || !address){
      toast.error("Please fill in all address information");
      return null;
    }

   const orderItems = items.map((item) => ({
  product:
    typeof item.product === "string"
      ? item.product
      : item.product && "_id" in item.product
      ? item.product._id
      : item._id,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  image: item.image,
}));

    const payload = {
      items:orderItems,
      totalAmount,
      shippingFee,
      shippingAddress:{
        fullName,
        email,
        address,
        city,
        phoneNumber,
        postalCode
      },
      paymentIntentId:paymentIntentId ?? null
    };
    try {
      const response = await axios.post("http://localhost:5000/api/v1/order",
        payload,
        {withCredentials:true}
      );
      if(response.data.success){
        toast.success("Your order has been saved!")
        return response.data.order
      }else {
        toast.error(response.data.message || "Order could not be created.")
        return null
      }
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Server error.");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error.");
        }
        return null;
      }
  },
  [items, totalAmount, shippingFee, fullName, email, address, city, phoneNumber, postalCode]
);


  const handlerPaymentSuccess = async(paymentIntentId?:string | null) => {
    const order = await orderCreate(paymentIntentId);
    if(order) {
      setItems([]);
      router.push(`/Success?orderId=${order._id}`);
    }
  }

  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="ml-40 h-[calc(100vh-7.5rem)] flex">
        {/* Left */}
        <div className="w-1/2 h-full">
          {/* Items */}
          <div className="w-full h-2/3 border border-[#A8D1B5] flex flex-col gap-2 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg transition-all duration-300">
            {items.map((c) => (
              <div key={c._id} className="flex border-2">
                <div className="w-[120px] h-[120px] relative border-2">
                  <Image
                    src={c.image}
                    alt="product-image"
                    fill
                    className="object-cover rounded-2xl p-2 "
                  />
                </div>
                <div className="w-[400px] h-[120px] flex justify-center items-center">
                  <p className="flex justify-center items-center text-xl text-color text-shadow-2xs">
                    {c.name}
                  </p>
                </div>
                <div className="w-[120px] h-[120px] flex justify-center items-center">
                  <p className="flex justify-center items-center text-2xl text-color2 text-shadow-emerald-900">
                    {c.quantity}
                  </p>
                </div>
                <div className="w-[400px] h-[120px] flex justify-center items-center">
                  <p className="flex justify-center items-center text-xl text-color text-shadow-2xs">
                    {c.price * c.quantity} $
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Items Description */}
          <div className="w-full h-1/3 border border-[#A8D1B5] flex gap-12 justify-center items-center">
            <div>
              <div className="flex gap-10 items-center justify-center mt-6">
                <p className="text-color text-2xl text-shadow-gray-100 font-semibold">
                  Total Items
                </p>
                <span className="text-color text-xl font-semibold bg-primary px-8 py-1 shadow-md">
                  {itemlength}
                </span>
              </div>
              <div className="flex gap-10 items-center justify-center mt-6">
                <p className="text-color text-2xl text-shadow-gray-100 font-semibold">
                  Sub Total
                </p>
                <span className="text-color text-xl font-semibold bg-primary px-8 py-1 shadow-md">
                  {subtotal} $
                </span>
              </div>
            </div>
            <div className="">
              <div className="flex gap-10 items-center justify-center mt-6">
                <p className="text-color text-2xl text-shadow-gray-100 font-semibold">
                  Shipping Fee
                </p>
                <span className="text-color text-xl font-semibold bg-primary px-8 py-1 shadow-md">
                  {shippingFee} $
                </span>
              </div>
              <div className="flex gap-10 items-center justify-center mt-6">
                <p className="text-color text-2xl text-shadow-gray-100 font-semibold">
                  Total Amount
                </p>
                <span className="text-color text-xl font-semibold bg-primary px-8 py-1 shadow-md">
                  {totalAmount} $
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Right */}
        <div className="w-1/2 h-full">
                    {/* Address */}
          <div className="w-full h-2/5 border border-[#A8D1B5]">
            <div className="w-full flex justify-center items-center">
              <h2 className="text-color text-2xl text-shadow-gray-100 font-semibold">
                Address Information
              </h2>
            </div>
            <div className="w-full flex gap-2">
              <div className="flex flex-col gap-2 p-4 w-1/2">
                <div className="w-full">
                  <TextField
                    label="FullName"
                    name="FullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#393E46",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />
                </div>
                <div className="w-full mt-6">
                  <TextField
                    label="Email"
                    name="Email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#393E46",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />
                </div>
                <div className="w-full mt-5">
                  <TextField
                    label="City"
                    name="City"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#393E46",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 p-4 w-1/2">
                <div className="w-full">
                  <TextField
                    label="Phone Number"
                    name="Phone Number"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#393E46",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />
                </div>
                <div className="w-full">
                  <TextField
                    label="Adress"
                    name="Adress"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    multiline
                    rows={2}
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#393E46",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />
                </div> 
                <div className="w-full mt-5">
                  <TextField
                    label="Postal Code"
                    name="Postal Code"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    variant="standard"
                    fullWidth
                    autoComplete="off"
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "#B1CBBB",
                          "&.Mui-focused": {
                            color: "#393E46",
                            backgroundColor: "#B1CBBB",
                            padding: 0.4,
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#B1CBBB",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
                    {/* Pay */}
         <div className="w-full h-3/5 border border-[#A8D1B5] flex justify-center items-center">
             
                <StripePay
                  totalAmount={totalAmount}
                  items={items}
                  fullName={fullName}
                  email={email}
                  city={city}
                  phoneNumber={phoneNumber}
                  address={address}
                  postalCode={postalCode}
                  onPaymentSuccess={(paymentIntentId?: string) => handlerPaymentSuccess(paymentIntentId)}
                />
       
            </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
