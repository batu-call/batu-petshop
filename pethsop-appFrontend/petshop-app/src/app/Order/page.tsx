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
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/getCart`,
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
          toast.error("An unknown error occurred while fetching the cart.");
        }
      }
    };
    fetchCart();
  }, []);

  const orderCreate = useCallback(
    async (paymentIntentId?: string | null) => {
      if (!items.length) {
        toast.error("The cart is empty, the order cannot be created!");
        return null;
      }
      if (!fullName || !email || !city || !phoneNumber || !address) {
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
        items: orderItems,
        totalAmount,
        shippingFee,
        shippingAddress: {
          fullName,
          email,
          address,
          city,
          phoneNumber,
          postalCode,
        },
        paymentIntentId: paymentIntentId ?? null,
      };
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order`,
          payload,
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success("Your order has been saved!");
          return response.data.order;
        } else {
          toast.error(response.data.message || "Order could not be created.");
          return null;
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
    [
      items,
      totalAmount,
      shippingFee,
      fullName,
      email,
      address,
      city,
      phoneNumber,
      postalCode,
    ]
  );

  const handlerPaymentSuccess = async (paymentIntentId?: string | null) => {
    const order = await orderCreate(paymentIntentId);
    if (order) {
      setItems([]);
      router.push(`/Success?orderId=${order._id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Sidebar />
      {/* Ana İçerik Konteyneri: Responsive Marjin, Padding ve Flex Düzeni */}
      <div className="ml-0 md:ml-[16rem] lg:ml-[20rem] p-4 lg:p-8 flex flex-col gap-6 lg:flex-row lg:gap-8 flex-1">
        
        {/* Sol Alan (Ürünler ve Özet): Mobil cihazlarda tam genişlik (w-full), büyük ekranlarda yarım (lg:w-1/2) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Ürün Listesi */}
          <div className="w-full h-[60vh] lg:h-[70vh] border border-[#A8D1B5] flex flex-col gap-2 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-bold text-color p-2 border-b">Order Items ({itemlength})</h2>
            {items.map((c) => (
              <div
                key={c._id}
                className="flex items-center border border-gray-100 rounded-lg p-2 transition duration-200 hover:bg-gray-50"
              >
                {/* Ürün Resmi */}
                <div className="w-[80px] h-[80px] relative flex-shrink-0">
                  <Image
                    src={c.image}
                    alt="product-image"
                    fill
                    className="object-cover rounded-md p-1"
                  />
                </div>
                
                {/* Ürün Adı */}
                <div className="flex-1 min-w-0 px-2 sm:px-4">
                  <p className="text-sm sm:text-base text-color font-semibold truncate">
                    {c.name}
                  </p>
                </div>
                
                {/* Miktar (Quantity) */}
                <div className="w-16 flex justify-center items-center flex-shrink-0">
                  <p className="text-base sm:text-lg text-color2 font-extrabold">
                    x{c.quantity}
                  </p>
                </div>
                
                {/* Toplam Fiyat */}
                <div className="w-24 sm:w-32 flex justify-end items-center flex-shrink-0">
                  <p className="text-sm sm:text-base text-color font-bold">
                    ${(c.price * c.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
                <div className="text-center text-gray-500 py-10">Your cart is empty.</div>
            )}
          </div>
          
          {/* Fiyat Özeti */}
          <div className="w-full border border-[#A8D1B5] p-4 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-bold text-color border-b pb-2 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-color text-lg font-semibold">Total Items</p>
                <span className="text-color text-lg font-bold bg-gray-100 px-4 py-1 rounded">
                  {itemlength}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-color text-lg font-semibold">Sub Total</p>
                <span className="text-color text-lg font-bold bg-gray-100 px-4 py-1 rounded">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <p className="text-color text-lg font-semibold">Shipping Fee</p>
                <span className="text-color text-lg font-bold bg-gray-100 px-4 py-1 rounded">
                  ${shippingFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <p className="text-color text-2xl font-extrabold">Total Amount</p>
                <span className="text-white text-2xl font-extrabold bg-primary px-6 py-2 rounded-lg shadow-lg">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sağ Alan (Adres ve Ödeme): Mobil cihazlarda tam genişlik (w-full), büyük ekranlarda yarım (lg:w-1/2) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          {/* Adres Formu */}
          <div className="w-full border border-[#A8D1B5] p-4 sm:p-6 rounded-lg shadow-md bg-white">
            <h2 className="text-color text-2xl font-bold mb-4 border-b pb-2">
              Address Information
            </h2>
            
            {/* Form Alanları */}
            <div className="flex flex-wrap -mx-2">
              {/* Sol Sütun (Mobil: Tam, Tablet/Desktop: Yarım) */}
              <div className="flex flex-col gap-4 p-2 w-full sm:w-1/2">
                <TextField
                  label="FullName"
                  name="FullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoComplete="off"
                  // MUI Stilleri
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.4, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
                />
                <TextField
                  label="Email"
                  name="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoComplete="off"
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.4, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
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
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.4, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
                />
              </div>
              
              {/* Sağ Sütun (Mobil: Tam, Tablet/Desktop: Yarım) */}
              <div className="flex flex-col gap-4 p-2 w-full sm:w-1/2">
                <TextField
                  label="Phone Number"
                  name="Phone Number"
                  type="tel" // type="tel" olarak düzeltildi
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  variant="standard"
                  fullWidth
                  autoComplete="off"
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.4, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
                />
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
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.4, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
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
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.4, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
                />
              </div>
            </div>
          </div>
          
          {/* Ödeme Alanı */}
          <div className="w-full border border-[#A8D1B5] p-4 sm:p-6 rounded-lg shadow-md bg-white flex justify-center items-center">
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