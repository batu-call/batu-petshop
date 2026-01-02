"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import axios from "axios";
import CircularText from "@/components/CircularText";

interface OrderItem {
  product: string;
  price: number;
  quantity: number;
  images?: string;
}

interface ShippingAddress {
  fullName: string;
  email?: string;
  city: string;
  phoneNumber: string;
  address: string;
  postalCode?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const ProcessingOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/status/filter?status=pending`,
        { withCredentials: true }
      );

      setOrders(res.data.order);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/${id}/status`,
        { status },
        { withCredentials: true }
      );

      fetchOrders(); 
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <Navbar />
      <Sidebar />

      <div className="md:ml-24 lg:ml-40 p-4">
        <h1 className="text-2xl font-bold mb-4 text-color">Processing Orders</h1>
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-4 bg-white shadow rounded-xl border"
              >
                <h2 className="font-semibold text-lg text-color">
                  Order #{order._id}
                </h2>

                <p className="text-color">
                  Customer: <span className="text-gray-600">{order.shippingAddress.fullName}</span>
                </p>

                <p className="text-color">
                  Address: <span className="text-gray-600">{order.shippingAddress.address}</span>
                </p>

                <p className="text-color">
                  Total: <span className="text-gray-600">${order.totalAmount}</span>
                </p>

                <div className="mt-3 flex gap-3">
                  <div
                    className="px-3 py-2 bg-primary bg-opacity/20 text-white rounded-lg"
                  >
                    Paid
                  </div>

                  <button
                    onClick={() => updateStatus(order._id, "delivered")}
                    className="px-3 py-2 bg-primary text-white rounded-lg transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingOrders;
