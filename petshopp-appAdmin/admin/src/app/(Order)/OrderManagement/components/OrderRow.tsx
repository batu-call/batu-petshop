"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, Truck, Tag } from "lucide-react";
import { Order } from "./types";

interface Props {
  order: Order;
  index: number;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (d: string) => string;
  getInitials: (name: string) => string;
  openTrackingModal: (order: Order) => void;
  setSelectedOrder: (order: Order) => void;
}

const OrderRow = ({ order, index, getStatusBadge, formatDate, getInitials, openTrackingModal, setSelectedOrder }: Props) => {
  return (
    <motion.tr
      key={order._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      className={`hover:bg-gray-50/50 dark:hover:bg-[#1e3d2a]/50 transition-colors cursor-pointer ${
        order.status === "cancellation_requested"
          ? "bg-orange-50/30 dark:bg-orange-900/10 border-l-4 border-l-orange-400"
          : ""
      }`}
      onClick={() => setSelectedOrder(order)}
    >
      <td className="px-4 sm:px-6 py-4">
        <span className="font-black text-xs sm:text-sm text-gray-900 dark:text-[#c8e6d0]">
          #{order._id.slice(-6).toUpperCase()}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {order.user?.avatar ? (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-lg flex-shrink-0 relative">
              <Image src={order.user.avatar} alt={order.shippingAddress.fullName} fill quality={95} sizes="100px" className="object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#97cba9] to-[#7ab89a] flex items-center justify-center text-white font-black text-xs shadow-lg flex-shrink-0">
              {getInitials(order.shippingAddress.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-[#c8e6d0] truncate">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-[#7aab8a] truncate hidden sm:block">
              {order.shippingAddress.email || order.shippingAddress.phoneNumber}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-[#7aab8a] font-medium hidden sm:table-cell">
        {formatDate(order.createdAt)}
      </td>
      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
        <span className="px-2.5 py-1 bg-gray-100 dark:bg-[#1e3d2a] text-gray-700 dark:text-[#97cba9] rounded-lg text-xs font-bold">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <span className="font-black text-xs sm:text-sm text-gray-900 dark:text-[#c8e6d0]">
          ${order.totalAmount.toFixed(2)}
        </span>
        {(order.discountAmount ?? 0) > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">
            <Tag className="w-3 h-3" />-${order.discountAmount!.toFixed(2)}
          </span>
        )}
      </td>
      <td className="px-4 sm:px-6 py-4">{getStatusBadge(order.status)}</td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex justify-end gap-2">
          {order.status === "shipped" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); openTrackingModal(order); }}
              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
            className={`p-2 transition-colors rounded-lg ${
              order.status === "cancellation_requested"
                ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                : "text-gray-400 dark:text-[#7aab8a] hover:text-[#97cba9] hover:bg-[#97cba9]/10 dark:hover:bg-[#0b8457]/20"
            }`}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

export default OrderRow;