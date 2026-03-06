"use client";

import Image from "next/image";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Trash2 } from "lucide-react";
import { User } from "../hooks/useUserList";

type Props = {
  u: User;
  handleDelete: (id: string) => void;
};

const UserRow = ({ u, handleDelete }: Props) => {
  const stopAndDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete(u._id);
  };

  return (
    <Link href={`userDetails/${u._id}`} className="block">
      <div className="flex flex-col lg:flex-row group gap-3 border dark:border-[#2d5a3d] p-3 md:p-2 items-start lg:items-center relative hover:bg-[#eeeeee] dark:hover:bg-[#1e3d2a] cursor-pointer transition-colors">

        {/* AVATAR */}
        <div className="w-full h-50 lg:w-16 lg:h-16 relative shrink-0">
          <Image
            src={u.avatar || "/default-avatar.png"}
            alt="user"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 80px"
            className="object-contain lg:object-cover rounded"
          />
        </div>

        {/* FIELDS */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-w-0">
          <div className="flex-1 min-w-0 overflow-hidden lg:flex lg:justify-center lg:items-center">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">First Name</p>
            <span className="truncate text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]">{u.firstName}</span>
          </div>

          <div className="flex-1 min-w-0 overflow-hidden lg:flex lg:justify-center lg:items-center">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Last Name</p>
            <span className="truncate text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]">{u.lastName}</span>
          </div>

          <div className="flex-1 min-w-0 overflow-hidden lg:flex lg:justify-center lg:items-center">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Email</p>
            <span className="truncate text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]">{u.email}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Phone</p>
            <PhoneInput country="us" value={u.phone} disabled inputStyle={{ width: "100%" }} />
          </div>

          <div className="flex-1 flex lg:justify-center">
            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-7">
              {u.role}
            </span>
          </div>

          <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Created</p>
            <span className="text-sm md:text-md lg:text-sm text-gray-600 dark:text-[#a8d4b8]">
              {new Date(u.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "2-digit", year: "numeric",
              })}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-start lg:items-center lg:justify-center">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Orders</p>
            <span className="font-semibold text-color2 dark:text-[#7aab8a]!">{u.orderCount ?? 0}</span>
          </div>

          <div className="flex-1 flex flex-col items-start lg:items-center lg:justify-center">
            <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Last Order</p>
            <span className="font-semibold text-xs xl:text-sm text-color2 dark:text-[#7aab8a]!">
              {u.lastOrderAt
                ? new Date(u.lastOrderAt).toLocaleDateString("en-US", {
                    month: "short", day: "2-digit", year: "numeric",
                  })
                : "-"}
            </span>
          </div>
        </div>

        {/* MOBILE — Delete */}
        <div className="md:hidden w-full flex justify-end mt-1">
          <button
            onClick={stopAndDelete}
            className="flex items-center gap-1.5 text-[#393E46] dark:text-[#c8e6d0] text-xs font-semibold border border-[#A8D1B5] dark:border-[#2d5a3d] px-3 py-1.5 rounded-lg bg-secondary dark:bg-[#1e3d2a] hover:bg-[#97cba9] dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97] cursor-pointer"
          >
            <Trash2 size={13} />
            Delete User
          </button>
        </div>

        {/* DESKTOP — Delete */}
        <button
          onClick={stopAndDelete}
          className="hidden md:flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-gray-400 dark:text-[#7aab8a] hover:text-white hover:bg-[#97cba9] dark:hover:bg-[#0b8457] transition-all duration-200 cursor-pointer ml-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Link>
  );
};

export default UserRow;