"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Package, User, Mail, Phone, MapPin, Calendar, Tag } from "lucide-react";
import { Order, CARGO_COMPANIES } from "./types";
import StatusActions from "./StatusActions";

interface Props {
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
  updatingStatus: boolean;
  showShippingForm: boolean;
  setShowShippingForm: (v: boolean) => void;
  shippingForm: { trackingNumber: string; cargoCompany: (typeof CARGO_COMPANIES)[number]; estimatedDelivery: string };
  setShippingForm: (f: any) => void;
  updateStatus: (id: string, status: string, trackingData?: any) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDate: (d: string) => string;
  getSubtotal: (order: Order) => number;
}

const OrderDetailModal = ({
  selectedOrder, setSelectedOrder, updatingStatus, showShippingForm, setShowShippingForm,
  shippingForm, setShippingForm, updateStatus, getStatusBadge, formatDate, getSubtotal,
}: Props) => {
  return (
    <AnimatePresence>
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => { if (!updatingStatus) setSelectedOrder(null); }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#162820] rounded-2xl shadow-2xl w-full max-w-3xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 sm:px-8 py-6 border-b rounded-t-2xl ${
              selectedOrder.status === "cancellation_requested"
                ? "bg-gradient-to-br from-orange-400 to-orange-500 border-orange-400/20"
                : "bg-gradient-to-br from-[#97cba9] to-[#7ab89a] border-[#97cba9]/20"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => { if (!updatingStatus) setSelectedOrder(null); }}
                  disabled={updatingStatus}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-[#97cba9]/5 to-[#97cba9]/10 dark:from-[#0b8457]/10 dark:to-[#0b8457]/20 rounded-xl p-6 border border-[#97cba9]/20 dark:border-[#2d5a3d]">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#97cba9]" />
                  <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-[#c8e6d0]">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "Full Name", value: selectedOrder.shippingAddress.fullName },
                    { icon: Mail, label: "Email", value: selectedOrder.shippingAddress.email || "N/A" },
                    { icon: Phone, label: "Phone", value: selectedOrder.shippingAddress.phoneNumber },
                    { icon: MapPin, label: "City", value: selectedOrder.shippingAddress.city },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-gray-400 dark:text-[#7aab8a] mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#7aab8a] uppercase tracking-wider font-bold mb-1">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-[#c8e6d0] break-all">{value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-[#7aab8a] mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-[#7aab8a] uppercase tracking-wider font-bold mb-1">Address</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#c8e6d0] break-all">{selectedOrder.shippingAddress.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-gray-700 dark:text-[#97cba9]" />
                  <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-[#c8e6d0]">Order Items</h3>
                </div>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => {
                    const product = typeof item.product !== "string" ? item.product : null;
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3d2a] rounded-xl hover:bg-[#97cba9]/5 dark:hover:bg-[#0b8457]/20 transition-colors">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {product?.image?.[0]?.url ? (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={product.image[0].url} alt="product" fill sizes="48px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#97cba9]/30 to-[#7ab89a]/20 dark:from-[#0b8457]/30 dark:to-[#0b8457]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#5a9677] dark:text-[#97cba9]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-[#c8e6d0] truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-[#7aab8a]">{item.quantity} × ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-black text-gray-900 dark:text-[#c8e6d0] ml-4 flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-[#2d5a3d] pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-[#7aab8a] font-medium">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-[#c8e6d0]">${getSubtotal(selectedOrder).toFixed(2)}</span>
                </div>
                {(selectedOrder.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      Discount{selectedOrder.couponCode && ` (${selectedOrder.couponCode})`}
                    </span>
                    <span className="font-bold">-${selectedOrder.discountAmount!.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-[#7aab8a] font-medium">Shipping Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-[#c8e6d0]">
                    {(selectedOrder.shippingFee ?? 0) === 0 ? "Free" : `$${(selectedOrder.shippingFee ?? 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg border-t border-gray-200 dark:border-[#2d5a3d] pt-3">
                  <span className="font-black text-gray-900 dark:text-[#c8e6d0]">Total</span>
                  <span className="font-black text-[#5a9677] dark:text-[#97cba9]">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t border-gray-200 dark:border-[#2d5a3d] pt-6">
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-[#c8e6d0] mb-4">Update Status</h3>
                <StatusActions
                  order={selectedOrder}
                  updatingStatus={updatingStatus}
                  showShippingForm={showShippingForm}
                  setShowShippingForm={setShowShippingForm}
                  shippingForm={shippingForm}
                  setShippingForm={setShippingForm}
                  updateStatus={updateStatus}
                  getStatusBadge={getStatusBadge}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailModal;