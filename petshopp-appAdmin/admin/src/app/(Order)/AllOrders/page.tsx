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
   const [search,setSearch] = useState("")
   const [filter,setFilter] = useState({
    email:"",
    status:"",
     totalPriceMin: "", 
    totalPriceMax: "",
   })

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

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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


  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
    o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase()) ;

    const matchesEmail = filter.email
  ? (
      o.user?.email?.toLowerCase().includes(filter.email.toLowerCase()) ||
      o.shippingAddress?.email?.toLowerCase().includes(filter.email.toLowerCase())
    )
  : true;

    const matchStatus = filter.status ? o.status === filter.status : true;

    const matchesTotalPrice =
    (!filter.totalPriceMin || o.totalAmount >= Number(filter.totalPriceMin)) &&
    (!filter.totalPriceMax || o.totalAmount <= Number(filter.totalPriceMax));


    return (
    matchesSearch &&
    matchesEmail &&
    matchStatus &&
    matchesTotalPrice
    )
  })


  return (
    <div>
      <Navbar />
      <Sidebar />
      
      <div className='ml-40 flex-1 h-screen bg-white p-4 overflow-x-auto'>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
  <input
    type="text"
    placeholder="Search by name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border p-2 rounded flex-1"
  />
  <input
    type="text"
    placeholder="Filter by email"
    value={filter.email}
    onChange={(e) => setFilter({ ...filter, email: e.target.value })}
    className="border p-2 rounded flex-1"
  />
  <select
    value={filter.status}
    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
    className="border p-2 rounded flex-1"
  >
    <option value="">All Status</option>
    <option value="pending">pending</option>
    <option value="paid">paid</option>
    <option value="shipped">shipped</option>
    <option value="delivered">delivered</option>
    <option value="cancelled">cancelled</option>
  </select>
  <input
    type="number"
    placeholder="Min Total Price"
    value={filter.totalPriceMin}
    onChange={(e) => setFilter({ ...filter, totalPriceMin: e.target.value })}
    className="border p-2 rounded w-32"
  />
  <input
    type="number"
    placeholder="Max Total Price"
    value={filter.totalPriceMax}
    onChange={(e) => setFilter({ ...filter, totalPriceMax: e.target.value })}
    className="border p-2 rounded w-32"
  />
</div>
        <div className='w-full bg-secondary flex gap-2 mt-12 text-color justify-between'>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Order ID</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>User Name</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>User Email</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Items</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Total Amount</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Status</div>
          <div className='text-xl p-1 w-120 h-9 flex items-center justify-center'>Created At</div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className='text-bold text-2xl text-color mt-8'>No Orders!</p>
        ) : (
          filteredOrders.map((o) => (
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
