"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Tag } from "lucide-react";
import { OrdersType } from "./types";

const getInitials = (name: string) => {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

type Props = { o: OrdersType };

const OrderDetails = ({ o }: Props) => {
  return (
    <div className="border-t border-gray-200 dark:border-[#2d5a3d] bg-gray-50 dark:bg-[#0d1f18]">
      <div className="p-4 md:p-6 space-y-6">

        {/* Shipping Address */}
        <div>
          <h3 className="font-semibold text-base md:text-lg mb-3 text-gray-900 dark:text-[#c8e6d0] flex items-center gap-2">
            <svg className="w-5 h-5 text-primary dark:text-[#7aab8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Shipping Address
          </h3>

          {o.user ? (
            <Link href={`/userDetails/${o.user._id}`}>
              <div className="bg-white dark:bg-[#162820] p-4 rounded-lg border border-gray-200 dark:border-[#2d5a3d] hover:border-[#97cba9] dark:hover:border-[#7aab8a] hover:shadow-sm transition-all duration-200 flex gap-4"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0">
                  {o.user.avatar ? (
                    <Image src={o.user.avatar} alt="user-avatar" width={80} height={80}
                      sizes="(max-width: 1024px) 100vw, 80px"
                      className="rounded-lg object-cover border-2 border-gray-100 dark:border-[#2d5a3d] w-20 h-20" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#97cba9] to-[#7ab89a] flex items-center justify-center border-2 border-gray-100 dark:border-[#2d5a3d]">
                      <span className="text-white font-black text-xl">{getInitials(o.shippingAddress.fullName)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-[#c8e6d0] mb-1">{o.shippingAddress.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-[#a8d4b8] mb-1 break-all">{o.shippingAddress.email}</p>
                  <p className="text-sm text-gray-600 dark:text-[#a8d4b8] mb-2">{o.shippingAddress.phoneNumber}</p>
                  <p className="text-sm text-gray-700 dark:text-[#c8e6d0] mt-2 break-words">{o.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
                    {o.shippingAddress.city}{o.shippingAddress.postalCode && `, ${o.shippingAddress.postalCode}`}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white dark:bg-[#162820] p-4 rounded-lg border border-gray-200 dark:border-[#2d5a3d] flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#1e3d2a] dark:to-[#2d5a3d] flex items-center justify-center border-2 border-gray-100 dark:border-[#2d5a3d]">
                  <span className="text-gray-600 dark:text-[#a8d4b8] font-black text-xl">{getInitials(o.shippingAddress.fullName)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-[#c8e6d0] mb-1">{o.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-600 dark:text-[#a8d4b8] mb-1">{o.shippingAddress.email}</p>
                <p className="text-sm text-gray-600 dark:text-[#a8d4b8] mb-2">{o.shippingAddress.phoneNumber}</p>
                <p className="text-sm text-gray-700 dark:text-[#c8e6d0] mt-2">{o.shippingAddress.address}</p>
                <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
                  {o.shippingAddress.city}{o.shippingAddress.postalCode && `, ${o.shippingAddress.postalCode}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        <div>
          <h3 className="font-semibold text-base md:text-lg mb-3 text-gray-900 dark:text-[#c8e6d0] flex items-center gap-2">
            <svg className="w-5 h-5 text-primary dark:text-[#7aab8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Products ({o.items.length})
          </h3>
          <div className="space-y-2">
            {o.items.map((item, idx) => {
              const product = typeof item.product !== "string" ? item.product : null;
              return (
                <div key={idx}>
                  {product ? (
                    <Link href={`/Products/${product.slug}`}>
                      <div className="flex gap-3 items-center bg-white dark:bg-[#162820] border border-gray-200 dark:border-[#2d5a3d] rounded-lg p-3 hover:border-[#97cba9] dark:hover:border-[#7aab8a] hover:shadow-sm transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}>
                        {product?.image?.[0]?.url ? (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                            <Image src={product.image[0].url} alt={product.product_name} fill
                              className="object-cover rounded-lg" sizes="(max-width: 640px) 64px, 80px" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#97cba9]/30 to-[#7ab89a]/20 dark:from-[#0b8457]/30 dark:to-[#1e3d2a]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-[#5a9677] dark:text-[#7aab8a]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-[#c8e6d0] mb-1 truncate">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
                            {item.quantity} × ${item.price.toFixed(2)} ={" "}
                            <span className="font-semibold text-primary dark:text-[#7aab8a]">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex gap-3 items-center bg-white dark:bg-[#162820] border border-gray-200 dark:border-[#2d5a3d] rounded-lg p-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1e3d2a] dark:to-[#2d5a3d] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-[#7aab8a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-[#c8e6d0] mb-1 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 dark:text-[#7aab8a] mb-1 italic">(Product no longer available)</p>
                        <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
                          {item.quantity} × ${item.price.toFixed(2)} ={" "}
                          <span className="font-semibold text-primary dark:text-[#7aab8a]">
                            ${(item.quantity * item.price).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-[#162820] rounded-lg border border-gray-200 dark:border-[#2d5a3d] p-4">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-[#a8d4b8] uppercase tracking-wider mb-3">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-[#a8d4b8]">Subtotal</span>
              <span className="font-semibold dark:text-[#c8e6d0]">
                ${o.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
              </span>
            </div>
            {(o.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  Discount{o.couponCode && ` (${o.couponCode})`}
                </span>
                <span className="font-bold">-${o.discountAmount!.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-[#a8d4b8]">Shipping</span>
              <span className="font-semibold dark:text-[#c8e6d0]">
                {(o.shippingFee ?? 0) === 0 ? "Free" : `$${(o.shippingFee ?? 0).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-[#2d5a3d]">
              <span className="font-bold text-gray-900 dark:text-[#c8e6d0]">Total</span>
              <span className="font-black text-primary dark:text-[#7aab8a] text-base">
                ${o.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;