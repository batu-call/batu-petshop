"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import CircularText from "@/components/CircularText";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useConfirm } from "@/app/Context/confirmContext";
import CloseIcon from "@mui/icons-material/Close";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
  orderCount?: number;
  lastOrderAt?: string | null;
};


const SortIcon = ({
  field,
  currentField,
  currentOrder,
}: {
  field: string;
  currentField: string;
  currentOrder: string;
}) => {
  if (currentField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return currentOrder === "asc"
    ? <ArrowUp className="w-3 h-3 text-color" />
    : <ArrowDown className="w-3 h-3 text-color" />;
};

const AllUsers = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirm } = useConfirm();


  const page = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";


  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);


  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
    minOrders: searchParams.get("minOrders") || "",
    maxOrders: searchParams.get("maxOrders") || "",
  });


  const [appliedFilter, setAppliedFilter] = useState(localFilter);


  const isFirstMount = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);


  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlMin = searchParams.get("minOrders") || "";
    const urlMax = searchParams.get("maxOrders") || "";


    setLocalFilter({ search: urlSearch, minOrders: urlMin, maxOrders: urlMax });
    setAppliedFilter({ search: urlSearch, minOrders: urlMin, maxOrders: urlMax });
  }, [
    searchParams.get("search"),
    searchParams.get("minOrders"),
    searchParams.get("maxOrders"),
  ]);


  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return; 
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);

      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (localFilter.search) params.set("search", localFilter.search);
      if (localFilter.minOrders) params.set("minOrders", localFilter.minOrders);
      if (localFilter.maxOrders) params.set("maxOrders", localFilter.maxOrders);

      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          sortBy,
          sortOrder,
        };
        if (appliedFilter.search) params.search = appliedFilter.search;
        if (appliedFilter.minOrders) params.minOrders = appliedFilter.minOrders;
        if (appliedFilter.maxOrders) params.maxOrders = appliedFilter.maxOrders;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users`,
          { params, withCredentials: true }
        );

        if (res.data.success) {
          setUsers(res.data.users || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalUsers(res.data.totalUsers || 0);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, appliedFilter.search, appliedFilter.minOrders, appliedFilter.maxOrders, sortBy, sortOrder]);


  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete User",
      description: "Are you sure you want to delete this user?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/${id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success("User deleted");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete error");
    }
  };

  const handleSort = (field: string) => {
    const newOrder =
      sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : "desc";

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("sortBy", field);
    params.set("sortOrder", newOrder);
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.minOrders) params.set("minOrders", appliedFilter.minOrders);
    if (appliedFilter.maxOrders) params.set("maxOrders", appliedFilter.maxOrders);

    router.push(`?${params.toString()}`, { scroll: false });
  };


  const clearFilters = () => {
    const empty = { search: "", minOrders: "", maxOrders: "" };
    setLocalFilter(empty);
    setAppliedFilter(empty);

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = () =>
    Object.values(appliedFilter).some((v) => v !== "");

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.minOrders) params.set("minOrders", appliedFilter.minOrders);
    if (appliedFilter.maxOrders) params.set("maxOrders", appliedFilter.maxOrders);

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
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  //  Sortable Header 
  const SortableHeader = ({
    field,
    label,
    className = "",
  }: {
    field: string;
    label: string;
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 hover:text-color2 transition-colors cursor-pointer ${className}`}
    >
      {label}
      <SortIcon field={field} currentField={sortBy} currentOrder={sortOrder} />
    </button>
  );


  return (
    <div>
      <div className="min-h-screen p-4">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={localFilter.search}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, search: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                />
                <input
                  type="number"
                  placeholder="Min Orders"
                  value={localFilter.minOrders}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, minOrders: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                />
                <input
                  type="number"
                  placeholder="Max Orders"
                  value={localFilter.maxOrders}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, maxOrders: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-color2">{users.length}</span> of{" "}
                  <span className="font-bold text-color">{totalUsers}</span> users
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="w-40 flex gap-2 justify-center items-center bg-white text-gray-800 rounded-sm p-2 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

             {/* Header */}
            <div className="hidden lg:flex flex-row bg-secondary py-2 text-color font-semibold sticky top-0 z-10 border-b gap-3 rounded-t-lg px-3">
              <div className="w-20 shrink-0"></div>
              <SortableHeader field="firstName" label="First Name" className="flex-1 lg:w-28" />
              <SortableHeader field="lastName" label="Last Name" className="flex-1 lg:w-28" />
              <SortableHeader field="email" label="Email" className="flex-1 lg:w-44" />
              <div className="flex-1 lg:w-36">Phone</div>
              <div className="flex-1 lg:w-20 flex justify-center">Role</div>
              <SortableHeader field="createdAt" label="Created" className="flex-1 lg:w-28" />
              <SortableHeader field="orderCount" label="Orders" className="flex-1 lg:w-24 justify-center" />
              <div className="flex-1 lg:w-32 flex justify-center">Last Order</div>
            </div>

            {/* LIST */}
            {users.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center">
                  <Users className="w-16 h-16 text-color2" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No users found</h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters()
                    ? "Try adjusting your filters to see more results"
                    : "No users available"}
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
              users.map((u) => (
                <Link href={`userDetails/${u._id}`} key={u._id} className="block">
                  <div className="flex flex-col lg:flex-row group gap-3 border p-3 md:p-2 items-start md:items-center relative hover:bg-gray-50 cursor-pointer transition-colors">
                    {/* Avatar */}
                    <div className="w-full h-50 lg:w-16 lg:h-16 relative shrink-0">
                      <Image
                        src={u.avatar || "/default-avatar.png"}
                        alt="user"
                        fill
                        className="object-contain lg:object-cover rounded"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-3 min-w-0">
                      {/* First Name */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="lg:hidden text-xs text-gray-500">First Name</p>
                        <span className="truncate text-xs xl:text-sm">{u.firstName}</span>
                      </div>

                      {/* Last Name */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="lg:hidden text-xs text-gray-500">Last Name</p>
                        <span className="truncate text-xs xl:text-sm">{u.lastName}</span>
                      </div>

                      {/* Email */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="lg:hidden text-xs text-gray-500">Email</p>
                        <span className="truncate text-xs xl:text-sm">{u.email}</span>
                      </div>

                      {/* Phone */}
                      <div className="flex-1 min-w-0">
                        <p className="lg:hidden text-xs text-gray-500">Phone</p>
                        <PhoneInput
                          country="us"
                          value={u.phone}
                          disabled
                          inputStyle={{ width: "100%" }}
                        />
                      </div>

                      {/* Role */}
                      <div className="flex-1 flex justify-center">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 h-7">
                          {u.role}
                        </span>
                      </div>

                      {/* Created */}
                      <div className="flex-1 min-w-0">
                        <p className="lg:hidden text-xs text-gray-500">Created</p>
                        <span className="text-xs xl:text-sm text-gray-600">
                          {new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Orders */}
                      <div className="flex-1 flex flex-col items-start lg:items-center">
                        <p className="lg:hidden text-xs text-gray-500">Orders</p>
                        <span className="font-semibold text-color2">{u.orderCount ?? 0}</span>
                      </div>

                      {/* Last Order */}
                      <div className="flex-1 flex flex-col items-start lg:items-center">
                        <p className="lg:hidden text-xs text-gray-500">Last Order</p>
                        <span className="font-semibold text-xs xl:text-sm text-color2">
                          {u.lastOrderAt
                            ? new Date(u.lastOrderAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Delete */}
                    <div className="md:hidden w-full flex justify-end">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(u._id); }}
                      className="text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded bg-secondary hover:bg-[#97cba9] transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
                    >
                      Delete User
                    </button>
                    </div>

                    {/* XL Delete */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(u._id); }}
                      className="hidden xl:block absolute top-8 right-2 cursor-pointer transition hover:scale-110"
                    >
                      <Image src="/trash.png" alt="delete" width={26} height={26} />
                    </button>

                    {/* MD–LG Delete */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(u._id); }}
                      className="hidden md:block xl:hidden absolute top-2 right-2 text-color cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                </Link>
              ))
            )}

            {/* ── PAGINATION ──────────────────────────────────── */}
            {totalPages > 1 && (
              <Pagination className="mt-12 text-color">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                    />
                  </PaginationItem>

                  <PaginationItem className="cursor-pointer">
                    <PaginationLink isActive={page === 1} onClick={() => goToPage(1)}>1</PaginationLink>
                  </PaginationItem>

                  {start > 2 && (
                    <PaginationItem><span className="px-2 text-sm">…</span></PaginationItem>
                  )}

                  {pages.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink isActive={page === p} onClick={() => goToPage(p)}>{p}</PaginationLink>
                    </PaginationItem>
                  ))}

                  {end < totalPages - 1 && (
                    <PaginationItem><span className="px-2 text-sm">…</span></PaginationItem>
                  )}

                  <PaginationItem className="cursor-pointer">
                    <PaginationLink isActive={page === totalPages} onClick={() => goToPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => page < totalPages && goToPage(page + 1)}
                      className={page === totalPages ? "opacity-50 pointer-events-none" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers;