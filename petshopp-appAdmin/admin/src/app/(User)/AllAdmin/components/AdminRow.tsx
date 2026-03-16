"use client";
import React from "react";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Trash2 } from "lucide-react";
import { Admin } from "../hooks/useAdminList";

interface Props {
  a: Admin;
  currentAdminId?: string;
  setSelectedAdmin: (a: Admin) => void;
  handleDelete: (id: string) => void;
}

const AdminRow = ({ a, currentAdminId, setSelectedAdmin, handleDelete }: Props) => {
  return (
    <div
      onClick={() => setSelectedAdmin(a)}
      className={`flex flex-col lg:flex-row group gap-3 border dark:border-[#2d5a3d] p-3 md:p-2 items-start lg:items-center relative hover:bg-[#eeeeee] dark:hover:bg-[#1e3d2a] cursor-pointer transition-colors ${
        currentAdminId === a._id ? "bg-[#E0F7FA] dark:bg-[#393E46]!" : ""
      }`}
    >
      <div className="w-full h-50 lg:w-16 lg:h-16 relative shrink-0">
        <Image
          src={a.avatar || "/default-avatar.png"}
          alt="admin"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 80px"
          className="object-contain lg:object-cover rounded"
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row sm:flex-wrap lg:flex-nowrap gap-3 min-w-0">
        <div className="flex-1 min-w-0 overflow-hidden lg:flex lg:justify-center lg:items-center">
          <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">First Name</p>
          <span className="block truncate max-w-[120px] text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]" title={a.firstName}>
            {a.firstName}
          </span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden lg:flex lg:justify-center lg:items-center">
          <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Last Name</p>
          <span className="block truncate max-w-[120px] text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]" title={a.lastName}>
            {a.lastName}
          </span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden lg:flex lg:justify-center lg:items-center">
          <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Email</p>
          <span className="block truncate max-w-[160px] text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]" title={a.email}>
            {a.email}
          </span>
        </div>
        <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
          <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Phone</p>
          <PhoneInput country="us" value={a.phone} disabled inputStyle={{ width: "100%" }} />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden w-56 lg:flex lg:justify-center lg:items-center">
          <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Address</p>
          <span className="block truncate max-w-45 text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]" title={a.address}>
            {a.address}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex justify-center lg:flex lg:justify-center lg:items-center">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 h-7">
            {a.role}
          </span>
        </div>
        <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
          <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Created</p>
          <span className="text-sm md:text-md lg:text-sm text-gray-600 dark:text-[#a8d4b8]">
            {new Date(a.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* MOBILE — Delete */}
      <div className="md:hidden w-full flex justify-end mt-1">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(a._id); }}
          className="flex items-center gap-1.5 text-[#393E46] dark:text-[#c8e6d0] text-xs font-semibold border border-[#A8D1B5] dark:border-[#2d5a3d] px-3 py-1.5 rounded-lg bg-secondary dark:bg-[#1e3d2a] hover:bg-[#97cba9] dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97] cursor-pointer"
        >
          <Trash2 size={13} />
          Delete Admin
        </button>
      </div>

      {/* DESKTOP — Delete */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(a._id); }}
        className="hidden md:flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-gray-400 dark:text-[#7aab8a] hover:text-white hover:bg-[#97cba9] dark:hover:bg-[#0b8457] transition-all duration-200 cursor-pointer ml-1"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default AdminRow;