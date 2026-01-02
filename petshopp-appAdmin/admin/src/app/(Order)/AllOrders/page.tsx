"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import CircularText from "@/components/CircularText";
import Image from "next/image";

type OrderItems = {
  product:
    | string
    | {
        _id: string;
        product_name: string;
        image: { url: string }[];
        price: number;
      };
  name: string;
  price: number;
  quantity: number;
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    email: "",
    status: "",
    totalPriceMin: "",
    totalPriceMax: "",
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/allOrders`,
          { withCredentials: true }
        );
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
      } finally {
        setLoading(false);
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

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.shippingAddress.fullName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesEmail = filter.email
      ? o.user?.email?.toLowerCase().includes(filter.email.toLowerCase()) ||
        o.shippingAddress?.email
          ?.toLowerCase()
          .includes(filter.email.toLowerCase())
      : true;
    const matchStatus = filter.status ? o.status === filter.status : true;
    const matchesTotalPrice =
      (!filter.totalPriceMin ||
        o.totalAmount >= Number(filter.totalPriceMin)) &&
      (!filter.totalPriceMax || o.totalAmount <= Number(filter.totalPriceMax));
    return matchesSearch && matchesEmail && matchStatus && matchesTotalPrice;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
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

      <div className="md:ml-24 lg:ml-40 flex-1 h-screen bg-white p-4 overflow-x-auto">
        {/* FILTERS */}
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
            onChange={(e) =>
              setFilter({ ...filter, totalPriceMin: e.target.value })
            }
            className="border p-2 rounded w-32"
          />
          <input
            type="number"
            placeholder="Max Total Price"
            value={filter.totalPriceMax}
            onChange={(e) =>
              setFilter({ ...filter, totalPriceMax: e.target.value })
            }
            className="border p-2 rounded w-32"
          />
        </div>

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <p className="text-bold text-2xl text-color mt-8">No Orders!</p>
        ) : (
          filteredOrders.map((o) => (
            <div
              key={o._id}
              className="border rounded-lg mb-4 shadow hover:shadow-lg transition cursor-pointer"
            >
              {/* MAIN ORDER INFO */}
              <div
                className="flex flex-col md:flex-row gap-2 p-2 bg-secondary text-color items-center justify-between"
                onClick={() =>
                  setExpandedOrder(expandedOrder === o._id ? null : o._id)
                }
              >
                <div className="flex-1 text-center truncate">{o._id}</div>
                <div className="flex-1 text-center truncate">
                  {o.user?.name || o.shippingAddress.fullName}
                </div>
                <div className="flex-1 text-center truncate">
                  {o.user?.email || o.shippingAddress.email}
                </div>
                <div className="flex-1 text-center truncate">
                  {o.items.reduce((acc, item) => acc + item.quantity, 0)}
                </div>
                <div className="flex-1 text-center truncate">
                  {o.totalAmount} $
                </div>
                <div
                  className={`flex-1 text-center truncate ${
                    o.status === "delivered"
                      ? "text-green-500"
                      : o.status === "pending"
                      ? "text-yellow-500"
                      : o.status === "shipped"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {o.status}
                </div>
                <div className="flex-1 text-center truncate">
                  {formatDate(o.createdAt)}
                </div>
              </div>

              {/* ORDER DETAILS */}
              {expandedOrder === o._id && (
                <div className="p-4 bg-white border-t flex flex-col gap-2">
                  <h3 className="font-semibold text-lg mb-2 text-color">
                    Shipping Address
                  </h3>
                  <p>
                    {o.shippingAddress.fullName} | {o.shippingAddress.email}
                  </p>
                  <p>
                    {o.shippingAddress.phoneNumber} | {o.shippingAddress.city}
                  </p>
                  <p>
                    {o.shippingAddress.address}, {o.shippingAddress.postalCode}
                  </p>

                  <h3 className="font-semibold text-lg mt-2 text-color">
                    Products
                  </h3>
                  {o.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center border-b py-2"
                    >
                      <div className="relative w-16 h-16">
                        <Image
                          src={
                            item.product &&
                            typeof item.product !== "string" &&
                            item.product.image?.length
                              ? item.product.image[0].url
                              : "/default-product.png"
                          }
                          alt={
                            item.product && typeof item.product !== "string"
                              ? item.product.product_name
                              : item.name || "Product image"
                          }
                          fill
                          className="object-cover rounded"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p>
                          {item.quantity} x ${item.price} = $
                          {item.quantity * item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllOrders;
