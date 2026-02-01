"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Trash2 } from "lucide-react";
import Link from "next/link";

type OrderItems = {
  product:
    | string
    | {
        _id: string;
        product_name: string;
        image: { url: string }[];
        price: number;
        slug: string;
      };
  name: string;
  price: number;
  quantity: number;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  postalCode: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
};

export type OrdersType = {
  _id: string;
  user: User | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

const AllOrders = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orders, setOrders] = useState<OrdersType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);

  // Get filters from URL
  const page = Number(searchParams.get("page")) || 1;

  // Local filter state (for immediate UI updates)
  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
    email: searchParams.get("email") || "",
    status: searchParams.get("status") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  // Applied filters (for API calls)
  const [appliedFilter, setAppliedFilter] = useState(localFilter);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce filter updates
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);

      // Update URL
      const params = new URLSearchParams();
      params.set("page", "1");

      if (localFilter.search) params.set("search", localFilter.search);
      if (localFilter.email) params.set("email", localFilter.email);
      if (localFilter.status) params.set("status", localFilter.status);
      if (localFilter.minPrice) params.set("minPrice", localFilter.minPrice);
      if (localFilter.maxPrice) params.set("maxPrice", localFilter.maxPrice);

      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localFilter, router]);

  // Fetch orders with filters
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params: any = { page };

        // Add filters to request
        if (appliedFilter.search) params.search = appliedFilter.search;
        if (appliedFilter.email) params.email = appliedFilter.email;
        if (appliedFilter.status) params.status = appliedFilter.status;
        if (appliedFilter.minPrice) params.minPrice = appliedFilter.minPrice;
        if (appliedFilter.maxPrice) params.maxPrice = appliedFilter.maxPrice;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/allOrders`,
          { params, withCredentials: true },
        );

        if (response.data.success) {
          setOrders(response.data.orders);
          setTotalPages(response.data.totalPages || 1);
          setTotalOrders(response.data.totalOrders || 0);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Unexpected error");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unexpected error!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [
    page,
    appliedFilter.search,
    appliedFilter.email,
    appliedFilter.status,
    appliedFilter.minPrice,
    appliedFilter.maxPrice,
  ]);

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      email: "",
      status: "",
      minPrice: "",
      maxPrice: "",
    };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(appliedFilter).some((value) => value !== "");
  };

  // Pagination
  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));

    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.email) params.set("email", appliedFilter.email);
    if (appliedFilter.status) params.set("status", appliedFilter.status);
    if (appliedFilter.minPrice) params.set("minPrice", appliedFilter.minPrice);
    if (appliedFilter.maxPrice) params.set("maxPrice", appliedFilter.maxPrice);

    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;

  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50 mt-14 md:mt-0">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="flex-1 min-h-screen bg-white p-4">
          {/* FILTER SECTION */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Search by name..."
                value={localFilter.search}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, search: e.target.value })
                }
                className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
              />

              <input
                type="text"
                placeholder="Filter by email"
                value={localFilter.email}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, email: e.target.value })
                }
                className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
              />

              <select
                value={localFilter.status}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, status: e.target.value })
                }
                className="border border-gray-300 p-2 rounded min-w-[150px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={localFilter.minPrice}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, minPrice: e.target.value })
                }
                className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={localFilter.maxPrice}
                onChange={(e) =>
                  setLocalFilter({ ...localFilter, maxPrice: e.target.value })
                }
                className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
              />
            </div>

            {/* Results count and clear button */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-color2">{orders.length}</span>{" "}
                of <span className="font-bold text-color">{totalOrders}</span>{" "}
                orders
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="w-40 flex gap-2 justify-center items-center bg-white text-gray-800 rounded-sm p-2 cursor-pointer hover:bg-gray-100 hover:scale-105 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* TABLE HEADER - Desktop only */}
          <div className="hidden lg:grid grid-cols-7 bg-secondary py-2 text-color font-semibold rounded-t-lg px-4 mb-2">
            <div className="text-center">Order ID</div>
            <div className="text-center">Customer</div>
            <div className="text-center">Email</div>
            <div className="text-center">Items</div>
            <div className="text-center">Total</div>
            <div className="text-center">Status</div>
            <div className="text-center">Date</div>
          </div>

          {/* ORDERS LIST */}
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 flex justify-center">
                <Package className="w-16 h-16 text-color2" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters()
                  ? "Try adjusting your filters to see more results"
                  : "No orders available"}
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                className="border rounded-lg mb-4 shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* MAIN ORDER INFO */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-7 gap-2 p-4 bg-[#f6f7f9] text-color items-center cursor-pointer hover:bg-opacity-90 transition-colors"
                  onClick={() =>
                    setExpandedOrder(expandedOrder === o._id ? null : o._id)
                  }
                >
                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">
                      Order ID
                    </p>
                    <span className="text-xs truncate block">{o._id}</span>
                  </div>

                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">
                      Customer
                    </p>
                    <span className="truncate block">
                      {o.user?.name || o.shippingAddress.fullName}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">
                      Email
                    </p>
                    <span className="truncate block text-sm">
                      {o.user?.email || o.shippingAddress.email}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">
                      Items
                    </p>
                    <span className="font-semibold">
                      {o.items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">
                      Total
                    </p>
                    <span className="font-bold text-color">
                      ${o.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">
                      Status
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        o.status === "delivered"
                          ? "bg-green-100 text-[#97cba9]"
                          : o.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : o.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : o.status === "paid"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-red-100 text-red-700"
                      }`}
                    >
                      {o.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="lg:hidden text-xs text-gray-500 mb-1">Date</p>
                    <span className="text-sm">{formatDate(o.createdAt)}</span>
                  </div>
                </div>

                {/* ORDER DETAILS */}
                {expandedOrder === o._id && (
                  <div className="p-4 bg-white border-t flex flex-col gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-color">
                        Shipping Address
                      </h3>
                      {o.user && (
                        <Link
                          href={`/userDetails/${o.user._id}`}
                        >
                          <div className="bg-gray-50 p-3 rounded"
                          onClick={(e) => e.stopPropagation()}
                          >
                            <Image
                              src={o.user.avatar || "/default-avatar.png"}
                              alt="user-avatar"
                              width={240}
                              height={240}
                              className="rounded-md"
                            />
                            <p className="font-medium">
                              {o.shippingAddress.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {o.shippingAddress.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              {o.shippingAddress.phoneNumber}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {o.shippingAddress.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {o.shippingAddress.city},{" "}
                              {o.shippingAddress.postalCode}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-color">
                        Products
                      </h3>
                      <div className="space-y-2">
                        {o.items.map((item, idx) => {
                          const product =
                            typeof item.product !== "string"
                              ? item.product
                              : null;

                          return (
                            <div key={idx}>
                              {product ? (
                                <Link href={`/Products/${product.slug}`}>
                                  <div
                                    className="flex gap-3 items-center border rounded p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="relative w-16 h-16 shrink-0">
                                      <Image
                                        src={
                                          product.image?.length
                                            ? product.image[0].url
                                            : "/default-product.png"
                                        }
                                        alt={product.product_name}
                                        fill
                                        className="object-cover rounded"
                                        sizes="64px"
                                      />
                                    </div>

                                    <div className="flex-1">
                                      <p className="font-semibold text-color">
                                        {item.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {item.quantity} x $
                                        {item.price.toFixed(2)} ={" "}
                                        <span className="font-semibold text-[#97cba9]">
                                          $
                                          {(item.quantity * item.price).toFixed(
                                            2,
                                          )}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                // product string ise linksiz göster
                                <div className="flex gap-3 items-center border rounded p-3 bg-gray-50">
                                  <div className="flex-1">
                                    <p className="font-semibold text-color">
                                      {item.name}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <Pagination className="mt-12 text-color">
              <PaginationContent>
                {/* PREVIOUS */}
                <PaginationItem className="cursor-pointer">
                  <PaginationPrevious
                    onClick={() => page > 1 && goToPage(page - 1)}
                    className={
                      page === 1 ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </PaginationItem>

                {/* FIRST PAGE */}
                <PaginationItem className="cursor-pointer">
                  <PaginationLink
                    isActive={page === 1}
                    onClick={() => goToPage(1)}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* LEFT ELLIPSIS */}
                {start > 2 && (
                  <PaginationItem>
                    <span className="px-2 text-sm">…</span>
                  </PaginationItem>
                )}

                {/* MIDDLE PAGES */}
                {pages.map((p) => (
                  <PaginationItem key={p} className="cursor-pointer">
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* RIGHT ELLIPSIS */}
                {end < totalPages - 1 && (
                  <PaginationItem>
                    <span className="px-2 text-sm">…</span>
                  </PaginationItem>
                )}

                {/* LAST PAGE */}
                <PaginationItem className="cursor-pointer">
                  <PaginationLink
                    isActive={page === totalPages}
                    onClick={() => goToPage(totalPages)}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>

                {/* NEXT */}
                <PaginationItem className="cursor-pointer">
                  <PaginationNext
                    onClick={() => page < totalPages && goToPage(page + 1)}
                    className={
                      page === totalPages
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default AllOrders;
