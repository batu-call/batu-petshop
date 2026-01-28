"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import CloseIcon from "@mui/icons-material/Close";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Trash2 } from "lucide-react";

type Admin = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string;
};

const AllAdmin = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const { confirm } = useConfirm();
  const { admin: currentAdmin } = useAdminAuth();

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);


  const page = Number(searchParams.get("page")) || 1;


  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
  });


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

      router.push(`?${params.toString()}`, { scroll: false });
    }, 600); // 600ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localFilter, router]);

  // Fetch admins with filters
  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const params: any = { page };

        // Add filters to request
        if (appliedFilter.search) params.search = appliedFilter.search;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/details`,
          { params, withCredentials: true },
        );

        if (res.data.success) {
          setAdmins(res.data.adminDetails);
          setTotalPages(res.data.totalPages || 1);
          setTotalAdmins(res.data.totalAdmins || 0);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [page, appliedFilter.search]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Admin",
      description: "Are you sure you want to delete this admin?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setAdmins((prev) => prev.filter((a) => a._id !== id));
        setSelectedAdmin(null);
        toast.success("Admin deleted ✅");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete error");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      search: "",
    };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return appliedFilter.search !== "";
  };

  // Pagination
  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));

    if (appliedFilter.search) params.set("search", appliedFilter.search);

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
            {/* FILTER SECTION */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, email, phone or address..."
                  value={localFilter.search}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, search: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                />
              </div>

              {/* Results count and clear button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-color2">{admins.length}</span>{" "}
                  of <span className="font-bold text-color">{totalAdmins}</span>{" "}
                  admins
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

            {/* HEADER */}
            <div className="hidden lg:flex flex-row bg-secondary py-2 text-color font-semibold sticky top-0 z-10 border-b gap-3 rounded-t-lg">
              <div className="w-20"></div>
              <div className="flex-1 text-center lg:text-left lg:w-32">
                First Name
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-32">
                Last Name
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-48">
                Email
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-40">
                Phone
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-72">
                Address
              </div>
              <div className="flex-1 text-center lg:text-left lg:w-24 flex justify-center">
                Role
              </div>
            </div>

            {/* LIST */}
            {admins.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center">
                  <ShieldCheck className="w-16 h-16 text-color2" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No admins found
                </h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters()
                    ? "Try adjusting your filters to see more results"
                    : "No admins available"}
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
              admins.map((a) => (
                <div
                  key={a._id}
                  onClick={() => setSelectedAdmin(a)}
                  className={`flex flex-col lg:flex-row group gap-3 border p-3 md:p-2 items-start md:items-center relative hover:bg-gray-50 cursor-pointer transition-colors
    ${
      currentAdmin?._id === a._id
        ? "bg-[#e3f6f5] border-l-4 border-y-teal-700"
        : ""
    }
  `}
                >
                  {/* AVATAR */}
                  <div className="w-full h-50 lg:w-20 lg:h-20 relative shrink-0">
                    <Image
                      src={a.avatar || "/default-avatar.png"}
                      alt="admin"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain lg:object-cover rounded"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 flex flex-col lg:flex-row sm:flex-wrap lg:flex-nowrap gap-3 min-w-0">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="lg:hidden text-xs text-gray-500">
                        First Name
                      </p>
                      <span className="truncate text-xs xl:text-sm">
                        {a.firstName}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <span className="truncate text-xs xl:text-sm">
                        <p className="lg:hidden text-xs text-gray-500">
                          Last Name
                        </p>
                        {a.lastName}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <span className="truncate text-xs xl:text-sm">
                        <p className="lg:hidden text-xs text-gray-500">Email</p>
                        {a.email}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="lg:hidden text-xs text-gray-500">Phone</p>
                      <PhoneInput
                        country="us"
                        value={a.phone}
                        disabled
                        inputStyle={{ width: "100%" }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden w-80">
                      <span className="text-xs xl:text-sm break-words lg:truncate">
                        <p className="lg:hidden text-xs text-gray-500">
                          Address
                        </p>
                        {a.address}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex justify-center ml-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 h-7">
                        {a.role}
                      </span>
                    </div>
                  </div>

                  {/* Delete sm-lg-xl */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Admin",
                        description:
                          "Are you sure you want to delete this admin?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handleDelete(a._id);
                    }}
                    className="md:hidden text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded hover:bg-red-50 transition-colors active:scale-[0.97]"
                  >
                    Delete Admin
                  </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Admin",
                        description:
                          "Are you sure you want to delete this admin?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handleDelete(a._id);
                    }}
                    className="hidden xl:block absolute top-8 right-2 cursor-pointer transition hover:scale-110 active:scale-[0.97]"
                  >
                    <Image
                      src="/trash.png"
                      alt="delete"
                      width={26}
                      height={26}
                    />
                  </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Admin",
                        description:
                          "Are you sure you want to delete this admin?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handleDelete(a._id);
                    }}
                    className="hidden md:block xl:hidden absolute top-2 right-2 text-color cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-[0.97]"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
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
          </>
        )}
      </div>

      {/* DRAWER */}
      <Drawer
        direction="right"
        open={!!selectedAdmin}
        onOpenChange={(open) => {
          if (!open) setSelectedAdmin(null);
        }}
      >
        <DrawerContent className="h-[100dvh] sm:max-w-[400px] sm:ml-auto">
          {/* HEADER */}
          <DrawerHeader>
            <DrawerTitle className="text-color2">Admin Details</DrawerTitle>
          </DrawerHeader>

          {/* SCROLLABLE CONTENT */}
          {selectedAdmin && (
            <div className="no-scrollbar overflow-y-auto px-4 pb-6 flex flex-col items-center gap-4">
              {/* AVATAR */}
              <div className="w-36 h-36 relative">
                <Image
                  src={selectedAdmin.avatar || "/default-avatar.png"}
                  alt="admin"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              {/* NAME */}
              <h2 className="text-xl font-semibold text-center break-words">
                {selectedAdmin.firstName} {selectedAdmin.lastName}
              </h2>

              {/* EMAIL */}
              <p className="text-sm text-gray-500 break-all text-center">
                {selectedAdmin.email}
              </p>

              {/* PHONE */}
              <div className="w-full">
                <PhoneInput
                  country="us"
                  value={selectedAdmin.phone}
                  disabled
                  inputStyle={{ width: "100%" }}
                />
              </div>

              {/* ADDRESS */}
              <div className="w-full">
                <p className="text-xs text-gray-500 mb-1 text-center">
                  Address
                </p>

                <div className="w-full max-h-32 overflow-y-auto rounded-md border bg-gray-50 p-3 text-sm text-gray-700 text-left break-words whitespace-pre-wrap">
                  {selectedAdmin.address || "No address provided"}
                </div>
              </div>

              {/* ROLE */}
              <span className="px-3 py-1 rounded bg-green-100 text-green-700 text-sm font-semibold">
                {selectedAdmin.role}
              </span>
            </div>
          )}

          {/* FOOTER */}
          <DrawerFooter>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedAdmin!._id)}
              className="bg-primary hover:bg-[#D6EED6] hover:text-[#393E46] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
            >
              Delete Admin
            </Button>

            <DrawerClose asChild>
              <Button
                variant="outline"
                className="transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer"
              >
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AllAdmin;
