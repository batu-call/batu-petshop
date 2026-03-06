"use client";
import React from "react";
import CircularText from "@/components/CircularText";
import { useDiscounts } from "./components/useDiscounts";
import DiscountStats from "./components/DiscountStats";
import CreateDiscountForm from "./components/CreateDiscountForm";
import ShippingSettings from "./components/ShippingSettings";
import DiscountTable from "./components/DiscountTable";
import DiscountPagination from "./components/DiscountPagination";

const DiscountAdminPage = () => {
  const {
    loading,
    code, setCode,
    percent, setPercent,
    minAmount, setMinAmount,
    expiryDate, setExpiryDate,
    discountType, setDiscountType,
    shippingFee, setShippingFee,
    freeOver, setFreeOver,
    freeShippingEnabled, setFreeShippingEnabled,
    searchQuery,
    currentPage, setCurrentPage,
    filteredDiscounts, totalPages, safePage, pagedDiscounts,
    stats,
    createDiscount, deleteDiscount, updateShipping, handleReset, handleSearch,
  } = useDiscounts();

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#0d1f18]">
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-primary dark:bg-[#0E5F44] z-50 backdrop-blur-sm">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      )}

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <DiscountStats
          activeDiscounts={stats.activeDiscounts}
          totalUsage={stats.totalUsage}
          avgDiscount={stats.avgDiscount}
          expiringSoon={stats.expiringSoon}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <CreateDiscountForm
              code={code} setCode={setCode}
              percent={percent} setPercent={setPercent}
              minAmount={minAmount} setMinAmount={setMinAmount}
              expiryDate={expiryDate} setExpiryDate={setExpiryDate}
              discountType={discountType} setDiscountType={setDiscountType}
              createDiscount={createDiscount}
              handleReset={handleReset}
            />
          </div>
          <div className="lg:col-span-5 space-y-8">
            <ShippingSettings
              shippingFee={shippingFee} setShippingFee={setShippingFee}
              freeOver={freeOver} setFreeOver={setFreeOver}
              freeShippingEnabled={freeShippingEnabled} setFreeShippingEnabled={setFreeShippingEnabled}
              updateShipping={updateShipping}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#162820] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <DiscountTable
            pagedDiscounts={pagedDiscounts}
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            deleteDiscount={deleteDiscount}
          />
          <DiscountPagination
            filteredDiscounts={filteredDiscounts}
            safePage={safePage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountAdminPage;