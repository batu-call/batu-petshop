"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import CircularText from '@/components/CircularText';

type OrderItems = {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  postalCode: string;
};

type User = { 
  _id: string;
  name: string;
  email: string;
};

export type OrdersType = {
  _id: string;
  user: User | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

const AllOrders = () => {
  const [orders, setOrders] = useState<OrdersType[]>([]);
   const [loading,setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await axios.get("http://localhost:5000/api/v1/order/allOrders", { withCredentials: true });
        if (response.data.success) {
          setOrders(response.data.orders);
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
      finally {
    setLoading(false)
  }
    };
    fetchOrders();
  }, []);

 const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${(date.getMonth()+1).toString().padStart(2,'0')}/${
    date.getDate().toString().padStart(2,'0')}/${
    date.getFullYear()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
};

  
if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      </>
    );
  }


  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className='ml-40 flex-1 h-screen bg-white p-4 overflow-x-auto'>
        <div className='w-full bg-secondary flex gap-2 mt-12 text-color justify-between'>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Order ID</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>User Name</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>User Email</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Items</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Total Amount</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Status</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Created At</div>
        </div>

        {orders.length === 0 ? (
          <p className='text-bold text-2xl text-color mt-8'>No Orders!</p>
        ) : (
          orders.map((o) => (
            <div key={o._id} className='flex items-center justify-center gap-2 border-y border-gray-300 h-16 shadow-sm text-color'>
              <div className='text-sm p-1 w-120 h-9 flex items-center justify-center text-left truncate'>{o._id}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center text-left truncate'>{o.user?.name || o.shippingAddress.fullName}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center text-left truncate'>{o.user?.email || o.shippingAddress.email}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>{o.items.reduce((acc, item) => acc + item.quantity, 0)}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>{o.totalAmount} $</div>
              <div
                className={`text-xl p-1 w-120 h-9 flex items-center justify-center ${
                  o.status === "delivered" ? "text-green-500" :
                  o.status === "pending" ? "text-yellow-500" :
                  o.status === "shipped" ? "text-blue-500" :
                  "text-red-500"
                }`}
              >
                {o.status}
              </div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>{formatDate(o.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllOrders;
