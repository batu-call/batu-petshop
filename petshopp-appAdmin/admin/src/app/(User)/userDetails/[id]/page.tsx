"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import CircularText from "@/components/CircularText";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string;
};

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

export type OrdersType = {
  _id: string;
  user: User | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};



const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [order,setOrder] = useState<OrdersType[]>([])

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/user/users/${id}`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Unexpected error");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unexpected error!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchOrder = async() => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/order/orders/${id}`,{withCredentials:true})
        setOrder(response.data.orders)
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Unexpected error");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unexpected error!");
        }
      }
    }
    fetchOrder()
  },[id])


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

  if (!user) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="ml-40 mt-20 text-center text-red-600 text-2xl font-bold">
          User not found!
        </div>
      </>
    );
  }

  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="flex w-1/2">
        {/* User */}
        <div className="ml-40 p-6 max-w-xl mx-auto bg-white rounded-xl shadow-lg mt-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 sm:w-30 sm:h-30 md:w-36 md:h-36 lg:w-40 lg:h-40 relative">
              <Image
                src={user?.avatar || "/default-avatar.png"}
                alt="avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.role}</p>
          </div>

          <div className="mt-6 space-y-2 text-lg">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Telefon:</strong> {user.phone}
            </p>
            <p>
              <strong>Adres:</strong> {user.address}
            </p>
          </div>
        </div>
        {/* Orders */}
        <div>
          {order.length === 0 ? (
          <p className='text-bold text-2xl text-color mt-8'>No Orders!</p>
        ) : (
          order.map((o) => (
            <div key={o._id} className='flex items-center justify-center gap-2 border-y border-gray-300 h-16 shadow-sm text-color'>
              <div className='text-sm p-1 w-120 h-9 flex items-center justify-center text-left truncate'>{o._id}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center text-left truncate'>{o.user?.firstName}</div>
              <div className='text-xl p-1 w-120 h-9 flex items-center justify-center text-left truncate'>{o.user?.lastName}</div>
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
    </div>
  );
};

export default UserDetails;
