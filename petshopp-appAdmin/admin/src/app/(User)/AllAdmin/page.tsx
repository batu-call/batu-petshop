"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import CloseIcon from "@mui/icons-material/Close";

type Admin = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string;
};

const AllAdmin = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const { confirm } = useConfirm();
  const { admin: currentAdmin } = useAdminAuth();

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/details`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setAdmins(res.data.adminDetails);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Admin",
      description: "Are you sure you want to delete this admin?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setAdmins((prev) => prev.filter((a) => a._id !== id));
        setSelectedAdmin(null);
        toast.success("Admin deleted ✅");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete error");
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.address.toLowerCase().includes(q)
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
                placeholder="Search by name, email or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-full md:w-96"
              />
            </div>

            {/* HEADER */}
            <div className="hidden lg:flex flex-row bg-secondary py-2 text-color font-semibold sticky top-0 z-10 border-b gap-3">
              <div className="w-20"></div>
              <div className="flex-1 text-center lg:text-left lg:w-32">
                First Name
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-32">
                Last Name
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-48">
                Email
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-40">
                Phone
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-72">
                Address
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-24 flex justify-center">
                Role
              </div>
            </div>

            {/* LIST */}
            {filteredAdmins.length === 0 ? (
              <p className="text-xl mt-6">No Admin!</p>
            ) : (
              filteredAdmins.map((a) => (
                <div
                  key={a._id}
                  onClick={() => setSelectedAdmin(a)}
                  className={`flex flex-col lg:flex-row group gap-3 border p-3 md:p-2 items-start md:items-center relative hover:bg-gray-50 cursor-pointer
    ${
      currentAdmin?._id === a._id
        ? "bg-[#e3f6f5] border-l-4 border-y-teal-700"
        : ""
    }
  `}
                >
                  {/* AVATAR */}
                  <div className="w-full h-50 lg:w-20 lg:h-20 relative shrink-0">
                    <Image
                      src={a.avatar || "/default-avatar.png"}
                      alt="admin"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain lg:object-cover rounded"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 flex flex-col lg:flex-row sm:flex-wrap lg:flex-nowrap gap-3 min-w-0">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="lg:hidden text-xs text-gray-500">
                          First Name
                      </p>
                      <span className="truncate text-xs xl:text-sm">
                        {a.firstName}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <span className="truncate text-xs xl:text-sm">
                         <p className="lg:hidden text-xs text-gray-500">
                          Last Name
                      </p>
                        {a.lastName}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <span className="truncate text-xs xl:text-sm">
                         <p className="lg:hidden text-xs text-gray-500">Email</p>
                        {a.email}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="lg:hidden text-xs text-gray-500">Phone</p>
                      <PhoneInput
                        country="us"
                        value={a.phone}
                        disabled
                        inputStyle={{ width: "100%" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden w-80">
                      <span className="text-xs xl:text-sm break-words lg:truncate">
                        <p className="lg:hidden text-xs text-gray-500">Address</p>
                        {a.address}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex justify-center ml-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 h-7">
                        {a.role}
                      </span>
                    </div>
                  </div>

                     {/* Delete sm-lg-xl */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const ok = await confirm({
                          title: "Delete Admin",
                          description:
                            "Are you sure you want to delete this admin?",
                          confirmText: "Yes, Delete",
                          cancelText: "Cancel",
                          variant: "destructive",
                        });

                        if (ok) handleDelete(a._id);
                      }}
                      className="md:hidden text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded"
                    >
                      Delete Admin
                    </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Admin",
                        description:
                          "Are you sure you want to delete this admin?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handleDelete(a._id);
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

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Admin",
                        description:
                          "Are you sure you want to delete this admin?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handleDelete(a._id);
                    }}
                    className="hidden md:block xl:hidden absolute top-2 right-2 text-color cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* DRAWER */}
      {selectedAdmin && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={() => setSelectedAdmin(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:w-[400px] bg-white p-6 shadow-xl overflow-y-auto"
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedAdmin(null)}
              className="absolute top-4 right-4 text-xl font-bold text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="w-40 h-40 relative">
                <Image
                  src={selectedAdmin.avatar || "/default-avatar.png"}
                  alt="admin"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-lg"
                />
              </div>

              <h2 className="text-xl font-semibold truncate">
                {selectedAdmin.firstName} {selectedAdmin.lastName}
              </h2>

              <p className="text-sm text-gray-500">{selectedAdmin.email}</p>

              <PhoneInput
                country="us"
                value={selectedAdmin.phone}
                disabled
                inputStyle={{ width: "100%" }}
              />

              <div className="w-full text-sm text-gray-700 text-center break-words max-h-28">
                {selectedAdmin.address}
              </div>

              <span className="px-3 py-1 rounded bg-green-100 text-green-700 text-sm font-semibold">
                {selectedAdmin.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAdmin;
