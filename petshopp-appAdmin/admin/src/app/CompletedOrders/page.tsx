"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import axios from "axios";

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

const CompletedOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/order/status/filter?status=delivered",
        { withCredentials: true }
      );

      setOrders(res.data.order);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <Navbar />
      <Sidebar />

      <div className="ml-40 p-4">
        <h1 className="text-2xl font-bold mb-4 text-color">Completed Orders</h1>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 mt-4 text-color">No completed orders found.</p>
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

                <p className="text-color mt-2 font-medium">
                  Status: <span className="text-color2">{order.status}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedOrders;
