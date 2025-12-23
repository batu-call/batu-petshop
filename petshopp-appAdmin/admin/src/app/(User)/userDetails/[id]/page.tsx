"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import CircularText from "@/components/CircularText";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { X } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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

type Reviews = {
  _id: string;
  productId: {
    name: string;
    price: number;
    image: {
      publicId: string;
      url: string;
    }[];
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrdersType[]>([]);
  const [reviews, setReviews] = useState<Reviews[]>([]);

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
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/order/orders/${id}`,
          { withCredentials: true }
        );
        setOrder(response.data.orders);
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
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/reviews/user/${id}`,
          { withCredentials: true }
        );
        setReviews(response.data.reviews);
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
    fetchReviews();
  }, [id]);

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/v1/reviews/admin/${id}`,
        { withCredentials: true }
      );

      toast.success(response.data.message);

      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Unexpected error");
      } else {
        toast.error("Unexpected error!");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="md:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
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
      <div className="md:flex">
        {/* User */}
        <div className="md:ml-40 p-6 mx-auto bg-white rounded-xl shadow-lg mt-8 md:w-1/4 w-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 sm:w-30 sm:h-30 md:w-36 md:h-36 lg:w-40 lg:h-40 relative">
              <Image
                src={user?.avatar || "/default-avatar.png"}
                alt="avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-color">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.role}</p>
          </div>

          <div className="mt-6 space-y-2 text-lg">
            <div>
              <strong className="text-color">Email: </strong>
              {user.email}
            </div>
            <div>
              <strong className="text-color">Phone:</strong>{" "}
              <div>
                <PhoneInput
                  country={"us"}
                  value={user.phone}
                  buttonStyle={{
                    border: "none",
                    background: "transparent",
                  }}
                  dropdownStyle={{
                    borderRadius: "8px",
                  }}
                  specialLabel="Phone"
                  inputProps={{
                    readOnly: true,
                  }}
                  disabled={true}
                />
              </div>
            </div>
            <div className="w-full">
              <strong className="text-color block">Address:</strong>
              <div className="overflow-hidden break-words">{user.address}</div>
            </div>
          </div>
        </div>
        {/* Orders */}
        <div className="w-full md:w-3/4 max-h-[500px] overflow-y-auto mt-8 pr-2 p-2">
          {order.length === 0 ? (
            <p className="text-bold text-2xl text-color mt-8">No Orders!</p>
          ) : (
            order.map((o) => (
              <div
                key={o._id}
                className="flex items-center justify-center gap-2 border-y border-gray-300 h-16 shadow-sm text-color"
              >
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center text-left truncate">
                  {o._id}
                </div>
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center text-left truncate">
                  {o.user?.firstName}
                </div>
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center text-left truncate">
                  {o.user?.lastName}
                </div>
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center text-left truncate">
                  {o.user?.email || o.shippingAddress.email}
                </div>
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center">
                  {o.items.reduce((acc, item) => acc + item.quantity, 0)}
                </div>
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center">
                  {o.totalAmount} $
                </div>
                <div
                  className={`text-xs p-1 w-120 h-9 flex items-center justify-center ${
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
                <div className="text-xs p-1 w-120 h-9 flex items-center justify-center">
                  {formatDate(o.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="md:ml-40 mt-8">
        <div>
          {reviews.length === 0 ? (
            <p className="text-bold text-2xl text-color mt-8">No Reviews!</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                className="border p-4 rounded-md mt-4 flex items-center gap-4 relative"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm("Are you sure you want to delete this review?")
                    ) {
                      handleDelete(r._id);
                    }
                  }}
                >
                  <X className="shadow-2xl m-2 opacity-80 absolute right-0 top-2 transition duration-300 ease-in-out hover:scale-120 cursor-pointer" />
                </button>
                {/* Image */}
                <Image
                  src={r.productId?.image?.[0]?.url || "/default.png"}
                  width={60}
                  height={60}
                  alt={r.productId?.name || "product"}
                  className="rounded-md"
                />

                <div className="flex flex-col">
                  {/* Name */}
                  <span className="font-semibold">
                    {r.userId?.firstName} {r.userId?.lastName}
                  </span>

                  {/* Rating */}
                  <p>
                    {Array.from({ length: r.rating }, (_, i) => (
                      <span key={i}>
                        <StarOutlineIcon className="text-color2" />
                      </span>
                    ))}
                  </p>

                  {/* Price */}
                  <span>${r.productId?.price}</span>

                  {/* Reviews */}
                  <span className="italic">{r.comment}</span>

                  {/* Date */}
                  <span className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
