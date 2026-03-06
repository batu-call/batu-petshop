"use client";
import React from "react";
import CircularText from "@/components/CircularText";
import { useAllOrders } from "./components/useAllOrders";
import AllOrdersFilters from "./components/AllOrdersFilters";
import OrdersList from "./components/OrdersList";

const AllOrders = () => {
  const {
    orders, totalPages, totalOrders, totalAllOrders, loading,
    expandedOrder, setExpandedOrder, showFilters, setShowFilters,
    initialLoad, page, localFilter, setLocalFilter, appliedFilter,
    clearFilters, hasActiveFilters, goToPage, getPaginationPages,
    formatDate, getStatusColor,
  } = useAllOrders();

  return (
    <div className="bg-gray-50 dark:bg-[#0d1f18] min-h-screen">
      {loading && initialLoad ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary dark:bg-[#0E5F44] z-50 mt-14 md:mt-0">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="flex-1 min-h-screen bg-gray-50 dark:bg-[#0d1f18] p-3 sm:p-4 md:p-6">
          <AllOrdersFilters
            localFilter={localFilter}
            setLocalFilter={setLocalFilter}
            appliedFilter={appliedFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            totalOrders={totalOrders}
            totalAllOrders={totalAllOrders}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />
          <OrdersList
            orders={orders}
            initialLoad={initialLoad}
            totalPages={totalPages}
            page={page}
            expandedOrder={expandedOrder}
            setExpandedOrder={setExpandedOrder}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            goToPage={goToPage}
            getPaginationPages={getPaginationPages}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        </div>
      )}
    </div>
  );
};

export default AllOrders;