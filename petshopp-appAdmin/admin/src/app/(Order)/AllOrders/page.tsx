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
      {loading || initialLoad ? (
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
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-16 bg-gray-50/70 dark:bg-[#0d1f18]/70 rounded-xl backdrop-blur-[1px]">
                <div className="flex items-center gap-2 bg-white dark:bg-[#162820] border border-gray-200 dark:border-[#2d5a3d] rounded-full px-4 py-2 shadow-md">
                  <div className="w-4 h-4 border-2 border-[#5a9e72] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-[#a8d4b8]">Loading orders...</span>
                </div>
              </div>
            )}
            <OrdersList
              orders={orders}
              initialLoad={initialLoad}
              loading={loading}
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
        </div>
      )}
    </div>
  );
};

export default AllOrders;