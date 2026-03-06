"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Truck, Package, XCircle, AlertCircle } from "lucide-react";
import { useOrderManagement } from "./components/useOrderManagement";
import OrdersHeader from "./components/OrdersHeader";
import OrdersStats from "./components/OrdersStats";
import OrdersFilterTabs from "./components/OrdersFilterTabs";
import OrdersTable from "./components/OrdersTable";
import OrderDetailModal from "./components/OrderDetailModal";
import TrackingModal from "./components/TrackingModal";

const getStatusBadge = (status: string) => {
  const badges: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Clock },
    paid: { bg: "bg-[#97cba9]/20 dark:bg-[#0b8457]/30", text: "text-[#5a9677] dark:text-[#97cba9]", icon: CheckCircle },
    shipped: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Truck },
    delivered: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: Package },
    cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle },
    cancellation_requested: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: AlertCircle },
  };
  const style = badges[status] || badges.pending;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3" />
      {status === "cancellation_requested" ? "Cancel Request" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderManagement: React.FC = () => {
  const {
    orders, loading, statsLoading, stats, filter, selectedOrder, setSelectedOrder,
    updatingStatus, searchQuery, setSearchQuery, trackingModalOpen, setTrackingModalOpen,
    selectedTracking, setSelectedTracking, shippingForm, setShippingForm, showShippingForm,
    setShowShippingForm, updatingTracking, currentPage, setCurrentPage, totalPages, totalOrders,
    handleFilterChange, updateStatus, updateTracking, openTrackingModal, getPageNumbers,
    formatDate, getInitials, getSubtotal, getTrackingSteps,
  } = useOrderManagement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0d1f18] dark:via-[#0d1f18] dark:to-[#162820]">
      <OrdersHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <OrdersStats stats={stats} statsLoading={statsLoading} />
        <OrdersFilterTabs filter={filter} loading={loading} handleFilterChange={handleFilterChange} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#162820] rounded-2xl border border-gray-200 dark:border-[#2d5a3d] shadow-xl"
        >
          <OrdersTable
            orders={orders}
            loading={loading}
            filter={filter}
            currentPage={currentPage}
            totalPages={totalPages}
            totalOrders={totalOrders}
            setCurrentPage={setCurrentPage}
            getPageNumbers={getPageNumbers}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
            getInitials={getInitials}
            openTrackingModal={openTrackingModal}
            setSelectedOrder={setSelectedOrder}
          />
        </motion.div>
      </div>

      <OrderDetailModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        updatingStatus={updatingStatus}
        showShippingForm={showShippingForm}
        setShowShippingForm={setShowShippingForm}
        shippingForm={shippingForm}
        setShippingForm={setShippingForm}
        updateStatus={updateStatus}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
        getSubtotal={getSubtotal}
      />

      <TrackingModal
        trackingModalOpen={trackingModalOpen}
        setTrackingModalOpen={setTrackingModalOpen}
        selectedTracking={selectedTracking}
        setSelectedTracking={setSelectedTracking}
        showShippingForm={showShippingForm}
        setShowShippingForm={setShowShippingForm}
        shippingForm={shippingForm}
        setShippingForm={setShippingForm}
        updatingTracking={updatingTracking}
        updateTracking={updateTracking}
        getTrackingSteps={getTrackingSteps}
        formatDate={formatDate}
      />
    </div>
  );
};

export default OrderManagement;