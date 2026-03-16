"use client";
import React from "react";
import CircularText from "@/components/CircularText";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ShieldCheck,
  Trash2,
  Filter,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAdminList } from "./hooks/useAdminList";
import AdminRow from "./components/AdminRow";
import AdminDrawer from "./components/AdminDrawer";

const SortIcon = ({
  field,
  currentField,
  currentOrder,
}: {
  field: string;
  currentField: string;
  currentOrder: string;
}) => {
  if (currentField !== field)
    return <ArrowUpDown className="w-3 h-3 opacity-40 dark:opacity-30" />;
  return currentOrder === "asc" ? (
    <ArrowUp className="w-3 h-3 text-color dark:text-[#a8d4b8]" />
  ) : (
    <ArrowDown className="w-3 h-3 text-color dark:text-[#a8d4b8]" />
  );
};

const AllAdmin = () => {
  const {
    admins,
    totalPages,
    totalAdmins,
    filteredAdmins,
    loading,
    selectedAdmin,
    setSelectedAdmin,
    showFilters,
    setShowFilters,
    localFilter,
    setLocalFilter,
    hasActiveFilters,
    sortBy,
    sortOrder,
    page,
    pages,
    start,
    end,
    currentAdmin,
    handleDelete,
    handleSort,
    clearFilters,
    goToPage,
  } = useAdminList();

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
      className={`flex items-center gap-1 hover:text-color2 dark:hover:text-[#c8e6d0] transition-colors cursor-pointer ${className}`}
    >
      {label}
      <SortIcon field={field} currentField={sortBy} currentOrder={sortOrder} />
    </button>
  );

  const INPUT_CLASS =
    "border border-gray-300 dark:border-[#2d5a3d] p-2 rounded bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-1 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] [&>option]:bg-white dark:[&>option]:bg-[#1e3d2a] [&>option]:text-gray-900 dark:[&>option]:text-[#c8e6d0]";

  return (
    <div className="bg-gray-50 dark:bg-[#0d1f18] min-h-screen">
      <div className="min-h-screen p-4">
        {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary dark:bg-[#0E5F44] z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* FILTER SECTION */}
            <div className="bg-white dark:bg-[#162820] p-4 rounded-lg shadow-md mb-6 border border-transparent dark:border-[#2d5a3d]">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full flex items-center justify-between p-3 bg-primary/10 dark:bg-[#1e3d2a] rounded-lg mb-3"
              >
                <span className="flex items-center gap-2 font-semibold text-color dark:text-[#c8e6d0]! text-sm sm:text-base">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  Filters {hasActiveFilters && `(1)`}
                </span>
                <ChevronDown
                  className={`w-5 h-5 dark:text-[#7aab8a] transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              <div className={`${showFilters ? "block" : "hidden"} lg:hidden`}>
                <input
                  type="text"
                  placeholder="Search by name, email, phone or address..."
                  value={localFilter.search}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, search: e.target.value })
                  }
                  className={`${INPUT_CLASS} w-full text-sm sm:text-base`}
                />
              </div>

              <div className="hidden lg:block">
                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone or address..."
                    value={localFilter.search}
                    onChange={(e) =>
                      setLocalFilter({ ...localFilter, search: e.target.value })
                    }
                    className={`${INPUT_CLASS} flex-1 min-w-[200px]`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-[#2d5a3d]">
                <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
                  Showing{" "}
                  <span className="font-bold text-color dark:text-[#a8d4b8]!">
                    {filteredAdmins}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-black/60 dark:text-[#c8e6d0]">
                    {totalAdmins}
                  </span>{" "}
                  admin
                  {hasActiveFilters && (
                    <span className="text-xs text-gray-500 dark:text-[#7aab8a] ml-2">
                      (Filtered results)
                    </span>
                  )}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-40 flex gap-2 justify-center items-center bg-white dark:bg-[#1e3d2a] text-gray-800 dark:text-[#c8e6d0] border dark:border-[#2d5a3d] rounded-sm p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* HEADER */}
            <div className="hidden lg:flex flex-row bg-secondary dark:bg-[#1e3d2a] py-2 text-color dark:text-[#a8d4b8] font-semibold sticky top-0 z-10 border-b dark:border-[#2d5a3d] gap-3 rounded-t-lg px-3">
              <div className="w-16 shrink-0" />
              <SortableHeader
                field="firstName"
                label="First Name"
                className="flex-1 lg:w-28 lg:flex lg:justify-center"
              />
              <SortableHeader
                field="lastName"
                label="Last Name"
                className="flex-1 lg:w-28 lg:flex lg:justify-center"
              />
              <SortableHeader
                field="email"
                label="Email"
                className="flex-1 lg:w-44 lg:flex lg:justify-center lg:items-center"
              />
              <div className="flex-1 lg:w-36 lg:flex lg:justify-center lg:items-center">
                Phone
              </div>
              <div className="flex-1 lg:w-60 lg:flex lg:justify-center lg:items-center">
                Address
              </div>
              <div className="flex-1 lg:w-20 lg:flex lg:justify-center lg:items-center">
                Role
              </div>
              <SortableHeader
                field="createdAt"
                label="Created"
                className="flex-1 lg:w-28 lg:flex lg:items-center lg:justify-center"
              />
              {/* delete button */}
              <div className="w-8"> 
              </div>
            </div>

            {/* LIST */}
            {admins.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center">
                  <ShieldCheck className="w-16 h-16 text-color2 dark:text-[#7aab8a]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-[#c8e6d0] mb-2">
                  No admins found
                </h3>
                <p className="text-gray-500 dark:text-[#7aab8a] mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results"
                    : "No admins available"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="bg-primary dark:bg-[#0b8457] text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] hover:text-[#393E46] dark:hover:text-[#c8e6d0] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              admins.map((a) => (
                <AdminRow
                  key={a._id}
                  a={a}
                  currentAdminId={currentAdmin?._id}
                  setSelectedAdmin={setSelectedAdmin}
                  handleDelete={handleDelete}
                />
              ))
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Pagination className="mt-12 text-color dark:text-[#c8e6d0]">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d] ${page === 1 ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
                      className={
                        page === 1
                          ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]"
                          : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"
                      }
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {start > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm dark:text-[#7aab8a]">
                        …
                      </span>
                    </PaginationItem>
                  )}
                  {pages.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goToPage(p)}
                        className={
                          page === p
                            ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]"
                            : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"
                        }
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {end < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-2 text-sm dark:text-[#7aab8a]">
                        …
                      </span>
                    </PaginationItem>
                  )}
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === totalPages}
                      onClick={() => goToPage(totalPages)}
                      className={
                        page === totalPages
                          ? "dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]"
                          : "dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d]"
                      }
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => page < totalPages && goToPage(page + 1)}
                      className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:border-[#2d5a3d] ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      <AdminDrawer
        selectedAdmin={selectedAdmin}
        setSelectedAdmin={setSelectedAdmin}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default AllAdmin;
