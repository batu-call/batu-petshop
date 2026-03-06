"use client";
import React from "react";
import { ChevronDown, Tag } from "lucide-react";
import { OrdersType } from "./types";
import OrderDetails from "./OrderDetails";

type Props = {
  o: OrdersType;
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  formatDate: (d: string) => string;
  getStatusColor: (status: string) => string;
};

const OrderCard = ({ o, expandedOrder, setExpandedOrder, formatDate, getStatusColor }: Props) => {
  const isExpanded = expandedOrder === o._id;

  return (
    <div className="bg-white dark:bg-[#162820] border border-gray-200 dark:border-[#2d5a3d] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div
        className="p-4 md:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e3d2a] transition-colors"
        onClick={() => setExpandedOrder(isExpanded ? null : o._id)}
      >
        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-4 items-center">
          <div className="text-center">
            <span className="text-xs font-mono text-gray-500 dark:text-[#7aab8a] block mb-1">ORDER ID</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-[#c8e6d0]">
              #{o._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] block mb-1">CUSTOMER</span>
            <span className="text-sm font-medium text-gray-900 dark:text-[#c8e6d0] truncate block">
              {o.user?.name || o.shippingAddress.fullName}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] block mb-1">EMAIL</span>
            <span className="text-sm text-gray-700 dark:text-[#a8d4b8] truncate block">
              {o.user?.email || o.shippingAddress.email}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] block mb-1">ITEMS</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-[#c8e6d0]">
              {o.items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] block mb-1">TOTAL</span>
            <span className="text-base font-bold text-primary dark:text-[#7aab8a]">
              ${o.totalAmount.toFixed(2)}
            </span>
            {(o.discountAmount ?? 0) > 0 && (
              <span className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">
                <Tag className="w-3 h-3" />-${o.discountAmount!.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] block mb-1">STATUS</span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block border ${getStatusColor(o.status)}`}>
              {o.status.toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600 dark:text-[#a8d4b8]">
                {formatDate(o.createdAt).split(",")[0]}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-[#7aab8a] ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] mb-1">Order ID</p>
              <span className="text-sm font-mono font-semibold text-gray-900 dark:text-[#c8e6d0]">
                #{o._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(o.status)}`}>
              {o.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-[#2d5a3d]">
            <div>
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] mb-1">Customer</p>
              <p className="text-sm font-medium text-gray-900 dark:text-[#c8e6d0] truncate">
                {o.user?.name || o.shippingAddress.fullName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] mb-1">Total</p>
              <p className="text-base font-bold text-primary dark:text-[#7aab8a]">${o.totalAmount.toFixed(2)}</p>
              {(o.discountAmount ?? 0) > 0 && (
                <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                  <Tag className="w-3 h-3" />-${o.discountAmount!.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500 dark:text-[#7aab8a]">{formatDate(o.createdAt)}</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-[#7aab8a] ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {isExpanded && <OrderDetails o={o} />}
    </div>
  );
};

export default OrderCard;