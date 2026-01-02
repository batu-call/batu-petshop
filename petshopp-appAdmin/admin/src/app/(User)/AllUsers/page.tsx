"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import CircularText from "@/components/CircularText";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useConfirm } from "@/app/Context/confirmContext";
import CloseIcon from "@mui/icons-material/Close";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
  orderCount?: number;
  lastOrderAt?: string | null;
};

const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { confirm } = useConfirm();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setUsers(res.data.users || []);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete User",
      description: "Are you sure you want to delete this user?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success("User deleted");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Navbar />
      <Sidebar />

      <div className="md:ml-24 lg:ml-40 min-h-screen p-4">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* SEARCH */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-full md:w-96"
              />
            </div>

            {/* HEADER */}
            <div className="hidden lg:flex flex-row bg-secondary py-2 text-color font-semibold sticky top-0 z-10 border-b gap-3">
              <div className="w-24"></div>
              <div className="flex-1 lg:w-32">First Name</div>
              <div className="flex-1 lg:w-32">Last Name</div>
              <div className="flex-1 lg:w-48">Email</div>
              <div className="flex-1 lg:w-40">Phone</div>
              <div className="flex-1 lg:w-24 flex justify-center">Role</div>
              <div className="flex-1 lg:w-32">Created</div>
              <div className="flex-1 lg:w-24 flex justify-center">Orders</div>
              <div className="flex-1 lg:w-40 flex justify-center">Last Order</div>
            </div>

            {/* LIST */}
            {filteredUsers.length === 0 ? (
              <p className="text-xl mt-6">No Users</p>
            ) : (
              filteredUsers.map((u) => (
                <Link href={`userDetails/${u._id}`} key={u._id} className="block">
                  <div className="flex flex-col lg:flex-row group gap-3 border p-3 md:p-2 items-start md:items-center relative hover:bg-gray-50 cursor-pointer">
                    {/* AVATAR */}
                    <div className="w-full h-50 lg:w-20 lg:h-20 relative shrink-0">
                      <Image
                        src={u.avatar || "/default-avatar.png"}
                        alt="user"
                        fill
                        className="object-contain lg:object-cover rounded"
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-3 min-w-0">
                      <div className="flex-1">
                        <p className="lg:hidden text-xs text-gray-500">
                          First Name
                        </p>
                        <span className="text-xs xl:text-sm">{u.firstName}</span>
                      </div>

                      <div className="flex-1">
                        <p className="lg:hidden text-xs text-gray-500">
                          Last Name
                        </p>
                        <span className="text-xs xl:text-sm">{u.lastName}</span>
                      </div>

                      <div className="flex-1">
                        <p className="lg:hidden text-xs text-gray-500">Email</p>
                        <span className="text-xs xl:text-sm">{u.email}</span>
                      </div>

                      <div className="flex-1">
                        <p className="lg:hidden text-xs text-gray-500">Phone</p>
                        <PhoneInput
                          country="us"
                          value={u.phone}
                          disabled
                          inputStyle={{ width: "100%" }}
                        />
                      </div>

                      <div className="flex-1 flex justify-center">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 h-7">
                          {u.role}
                        </span>
                      </div>

                      <div className="flex-1">
                        <p className="lg:hidden text-xs text-gray-500">
                          Created
                        </p>
                        <span className="text-sm text-gray-600">
                          {new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col items-start md:items-center">
                        <p className="lg:hidden text-xs text-gray-500">
                          Orders
                        </p>
                        <span className="font-semibold text-color2">
                          {u.orderCount ?? 0}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col items-start md:items-center">
                        <p className="lg:hidden text-xs text-gray-500">
                          Last Order
                        </p>
                        <span className="font-semibold text-sm text-color2">
                          {u.lastOrderAt
                            ? new Date(u.lastOrderAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* MOBILE DELETE */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(u._id);
                      }}
                      className="md:hidden text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded"
                    >
                      Delete User
                    </button>

                    {/* XL DELETE */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(u._id);
                      }}
                      className="hidden xl:block absolute top-8 right-2 cursor-pointer transition hover:scale-110"
                    >
                      <Image
                        src="/trash.png"
                        alt="delete"
                        width={26}
                        height={26}
                      />
                    </button>

                    {/* MD–LG DELETE */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(u._id);
                      }}
                      className="hidden md:block xl:hidden absolute top-2 right-2 text-color cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
