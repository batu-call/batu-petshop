"use client";
import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, AlertCircle, Truck, Package } from "lucide-react";
import { Order, CARGO_COMPANIES } from "./types";

interface Props {
  order: Order;
  updatingStatus: boolean;
  showShippingForm: boolean;
  setShowShippingForm: (v: boolean) => void;
  shippingForm: { trackingNumber: string; cargoCompany: (typeof CARGO_COMPANIES)[number]; estimatedDelivery: string };
  setShippingForm: (f: any) => void;
  updateStatus: (id: string, status: string, trackingData?: any) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const inputClass = "w-full border border-gray-300 dark:border-[#2d5a3d] bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#97cba9] focus:border-transparent";
const labelClass = "text-xs font-bold text-gray-600 dark:text-[#7aab8a] uppercase tracking-wider mb-1 block";

const StatusActions = ({
  order, updatingStatus, showShippingForm, setShowShippingForm,
  shippingForm, setShippingForm, updateStatus, getStatusBadge,
}: Props) => {
  if (order.status === "cancelled") {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="font-bold text-red-800 dark:text-red-300">Order Cancelled</p>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">This order has been cancelled and cannot be changed.</p>
      </div>
    );
  }

  if (order.status === "cancellation_requested") {
    return (
      <div className="space-y-3">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <p className="font-bold text-orange-800 dark:text-orange-300">Cancellation Requested</p>
          </div>
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Customer has requested to cancel this order.</p>
          {order.cancelReason && (
            <div className="mt-2 bg-white dark:bg-[#162820] border border-orange-200 dark:border-orange-800/40 rounded-lg px-3 py-2">
              <p className="text-xs font-bold text-gray-500 dark:text-[#7aab8a] uppercase tracking-wider mb-1">Reason</p>
              <p className="text-sm text-gray-700 dark:text-[#c8e6d0]">{order.cancelReason}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: !updatingStatus ? 1.02 : 1 }}
            whileTap={{ scale: !updatingStatus ? 0.98 : 1 }}
            onClick={() => updateStatus(order._id, "cancelled")}
            disabled={updatingStatus}
            className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              updatingStatus
                ? "bg-gray-300 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
                : "bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30"
            }`}
          >
            <XCircle className="w-4 h-4" />
            {updatingStatus ? "Updating..." : "Approve Cancellation"}
          </motion.button>
          <motion.button
            whileHover={{ scale: !updatingStatus ? 1.02 : 1 }}
            whileTap={{ scale: !updatingStatus ? 0.98 : 1 }}
            onClick={() => updateStatus(order._id, "paid")}
            disabled={updatingStatus}
            className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              updatingStatus
                ? "bg-gray-300 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
                : "bg-gradient-to-br from-[#97cba9] to-[#7ab89a] text-white hover:shadow-lg hover:shadow-[#97cba9]/30"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {updatingStatus ? "Updating..." : "Reject & Keep Order"}
          </motion.button>
        </div>
      </div>
    );
  }

  if (order.status === "delivered") {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="font-bold text-green-800 dark:text-green-300">Order Delivered</p>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">This order has been successfully delivered.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateStatus(order._id, "cancelled")}
          disabled={updatingStatus}
          className={`cursor-pointer w-full px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            updatingStatus
              ? "bg-gray-300 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
              : "bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30"
          }`}
        >
          <XCircle className="w-4 h-4" />
          {updatingStatus ? "Updating..." : "Cancel Order"}
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-[#7aab8a]">Current:</span>
        {getStatusBadge(order.status)}
      </div>
      {showShippingForm ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Shipping Information
          </h4>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Cargo Company *</label>
              <select
                value={shippingForm.cargoCompany}
                onChange={(e) => setShippingForm({ ...shippingForm, cargoCompany: e.target.value as (typeof CARGO_COMPANIES)[number] })}
                className={inputClass}
              >
                {CARGO_COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tracking Number *</label>
              <input
                type="text"
                placeholder="e.g. 1Z999AA10123456784"
                value={shippingForm.trackingNumber}
                onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
                className={inputClass}
                maxLength={100}
              />
            </div>
            <div>
              <label className={labelClass}>Estimated Delivery (optional)</label>
              <input
                type="date"
                value={shippingForm.estimatedDelivery}
                onChange={(e) => setShippingForm({ ...shippingForm, estimatedDelivery: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateStatus(order._id, "shipped", shippingForm)}
                disabled={updatingStatus || !shippingForm.trackingNumber}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  updatingStatus || !shippingForm.trackingNumber
                    ? "bg-gray-300 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
                    : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                }`}
              >
                <Truck className="w-4 h-4" />
                {updatingStatus ? "Updating..." : "Mark as Shipped"}
              </motion.button>
              <button
                onClick={() => setShowShippingForm(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-200 dark:bg-[#1e3d2a] text-gray-600 dark:text-[#7aab8a] hover:bg-gray-300 dark:hover:bg-[#2d5a3d] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {(["paid", "shipped", "delivered", "cancelled"] as const).map((status) => {
            const icons = { paid: CheckCircle, shipped: Truck, delivered: Package, cancelled: XCircle };
            const StatusIcon = icons[status];
            const isCurrent = order.status === status;
            return (
              <motion.button
                key={status}
                whileHover={{ scale: !isCurrent && !updatingStatus ? 1.02 : 1 }}
                whileTap={{ scale: !isCurrent && !updatingStatus ? 0.98 : 1 }}
                onClick={() => {
                  if (isCurrent || updatingStatus) return;
                  if (status === "shipped") { setShowShippingForm(true); return; }
                  updateStatus(order._id, status);
                }}
                disabled={isCurrent || updatingStatus}
                className={`cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? "bg-gray-200 dark:bg-[#1e3d2a] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
                    : updatingStatus
                    ? "bg-gray-300 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a] cursor-not-allowed"
                    : status === "cancelled"
                    ? "bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30"
                    : "bg-gradient-to-br from-[#97cba9] to-[#7ab89a] text-white hover:shadow-lg hover:shadow-[#97cba9]/30"
                }`}
              >
                <StatusIcon className="w-4 h-4" />
                {updatingStatus ? "..." : status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default StatusActions;