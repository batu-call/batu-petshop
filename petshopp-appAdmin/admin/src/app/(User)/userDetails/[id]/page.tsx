"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import CircularText from "@/components/CircularText";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useConfirm } from "@/app/Context/confirmContext";
import CloseIcon from "@mui/icons-material/Close";
import { ThumbUp } from "@mui/icons-material";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string;
  createdAt: string;
};

type OrderItems = {
  product: { image: { url: string }[] } | null;
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
    product_name: string;
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
  helpful: string[];
  comment: string;
  createdAt: string;
};

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrdersType[]>([]);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "reviews">("orders");
  const { confirm } = useConfirm();

  // FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users/${id}`,
          { withCredentials: true },
        );
        if (response.data.success) setUser(response.data.user);
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : error instanceof Error
              ? error.message
              : "Unexpected error!",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // FETCH ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/orders/${id}`,
          { withCredentials: true },
        );
        setOrder(response.data.orders.slice().reverse());
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : error instanceof Error
              ? error.message
              : "Unexpected error!",
        );
      }
    };
    fetchOrders();
  }, [id]);

  // FETCH REVIEWS
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/user/${id}`,
          { withCredentials: true },
        );
        setReviews(response.data.reviews.slice().reverse());
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error) && error.response
            ? error.response.data.message
            : error instanceof Error
              ? error.message
              : "Unexpected error!",
        );
      }
    };
    fetchReviews();
  }, [id]);

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/${id}`,
        { withCredentials: true },
      );
      toast.success(response.data.message);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error: unknown) {
      toast.error(
        axios.isAxiosError(error) && error.response
          ? error.response.data.message
          : "Unexpected error!",
      );
    }
  };

  const formattedDate = user
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  const formattedOrderDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });

  const getStatusStyles = (status: OrdersType["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-primary z-50">
        <CircularText
          text="LOADING"
          spinDuration={20}
          className="text-white text-4xl"
        />
      </div>
    );

  if (!user)
    return (
      <div className="ml-40 mt-20 text-center text-red-600 text-2xl font-bold">
        User not found!
      </div>
    );

  return (
    <div className="lg:flex flex-row gap-4 p-4">
      {/* USER CARD */}
      <div className="p-6 bg-white rounded-xl shadow-lg mt-8 lg:w-1/4 w-full">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100">
            <Image
              src={user?.avatar || "/default-avatar.png"}
              alt="User avatar"
              fill
              sizes="(max-width: 768px) 48px, 96px"
              className="object-cover"
            />
          </div>
          <h1 className="text-xl font-bold text-color">
            {user.firstName} {user.lastName}
          </h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-white">
            {user.role}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-sm sm:text-base">
          <div className="break-all">
            <strong className="text-color">Email:</strong>{" "}
            <span className="text-gray-600">{user.email}</span>
          </div>

          <div className="w-full max-w-[200px]">
            <strong className="text-color block mb-1">Phone:</strong>
            <PhoneInput
              country="us"
              value={user.phone}
              inputProps={{ readOnly: true }}
              disabled
              containerStyle={{ width: "100%" }}
              inputStyle={{ width: "100%" }}
              buttonStyle={{ border: "none", background: "transparent" }}
              dropdownStyle={{ borderRadius: "8px" }}
            />
          </div>

          <div>
            <strong className="text-color">Joined:</strong>{" "}
            <span className="text-gray-600">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* ORDERS + REVIEWS */}
      <div className="bg-white rounded-xl shadow-sm border border-[#dee3e1] w-full flex flex-col mt-2">
        {/* TABS */}
        <div className="flex border-b border-[#dee3e1]">
          {["orders", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "orders" | "reviews")}
              className={`flex-1 py-4 text-center border-b-4 font-bold text-sm tracking-wide transition-all cursor-pointer ${
                activeTab === tab
                  ? "border-[#D6EED6] text-[#97cba9]"
                  : "border-transparent text-[#6d7e78] hover:text-[#97cba9]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab === "orders" ? (
                  <ChatBubbleOutlineIcon />
                ) : (
                  <ShoppingBagIcon />
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-1 bg-gray-200 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {tab === "orders" ? order.length : reviews.length}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="p-6 overflow-y-auto max-h-[500px] space-y-4">
            {order.length === 0 ? (
              <p className="text-center text-gray-500">No orders yet.</p>
            ) : (
              order.map((o) => (
                <div
                  key={o._id}
                  className="flex flex-col border border-[#dee3e1] rounded-xl p-4 hover:border-primary transition-colors group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-color font-bold">{o._id}</p>
                      <p className="text-[#6d7e78] text-xs">
                        {formattedOrderDate(o.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyles(
                        o.status,
                      )}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {o.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 bg-background-light rounded-lg overflow-hidden relative"
                      >
                        <Image
                          src={
                            item.product?.image?.[0]?.url ||
                            item.image ||
                            "/default.png"
                          }
                          alt={item.name || "product"}
                          fill
                          sizes="48px"
                          className="object-cover object-center"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-3 border-t border-[#dee3e1] flex justify-between items-center">
                    <p className="text-color font-bold">
                      $
                      {o.items
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="p-6 overflow-y-auto max-h-[500px] space-y-4 bg-[#fcfcfc]">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative"
                >
                  {/* DELETE BUTTON */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const ok = await confirm({
                        title: "Delete Review",
                        description:
                          "Are you sure you want to delete this review?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });
                      if (!ok) return;
                      handleDelete(review._id);
                    }}
                    className="hidden md:block absolute top-2 right-2 text-color cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    <CloseIcon fontSize="small" />
                  </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Review",
                        description:
                          "Are you sure you want to delete this review?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handleDelete(review._id);
                    }}
                    className="absolute bottom-2 right-2 md:hidden text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded"
                  >
                    Delete Review
                  </button>

                  {/* HEADER */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                        <Image
                          src={
                            review.productId?.image?.[0]?.url || "/default.png"
                          }
                          alt={
                            review.productId?.product_name || "Product image"
                          }
                          width={48}
                          height={48}
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-color">
                          {review.userId
                            ? `${review.userId.firstName} ${review.userId.lastName?.[0]}.`
                            : "Deleted User"}
                        </h3>
                        <p className="text-[11px] text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* RATING */}
                    <div className="flex md:mr-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarOutlineIcon
                          key={i}
                          fontSize="small"
                          className={
                            i < review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-800 font-semibold mb-1">
                    {review.productId?.product_name || "Unknown Product"}
                  </p>

                  <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  <div className="mt-4">
                    <button
                      className={`text-gray-400 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer duration-300 ease-in-out hover:scale-102 active:scale-[0.97]`}
                    >
                      <ThumbUp sx={{ fontSize: 14 }} />
                      Helpful ({review.helpful?.length ?? 0})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
