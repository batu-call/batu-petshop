"use client";

import CircularText from "@/components/CircularText";
import { Users } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useUserList } from "./hooks/useUserList";
import UserFilters from "./components/UserFilters";
import UserRow from "./components/UserRow";
import SortableHeader from "./components/SortableHeader";

const AllUsers = () => {
  const {
    page,
    sortBy,
    sortOrder,
    users,
    totalPages,
    totalUsers,
    filteredUsers,
    loading,
    localFilter,
    setLocalFilter,
    appliedFilter,
    hasActiveFilters,
    handleDelete,
    handleSort,
    clearFilters,
    goToPage,
  } = useUserList();

  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;
  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

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
            <UserFilters
              localFilter={localFilter}
              setLocalFilter={setLocalFilter}
              appliedFilter={appliedFilter}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              filteredUsers={filteredUsers}
              totalUsers={totalUsers}
            />

            {/* HEADER (DESKTOP) */}
            <div className="hidden lg:flex flex-row bg-secondary dark:bg-[#1e3d2a] py-2 text-color dark:text-[#a8d4b8] font-semibold sticky top-0 z-10 border-b dark:border-[#2d5a3d] gap-3 rounded-t-lg px-3 items-center">
              <div className="w-16 shrink-0" />

              <SortableHeader
                field="firstName"
                label="First Name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                className="flex-1 lg:w-28 lg:flex lg:justify-center"
              />
              <SortableHeader
                field="lastName"
                label="Last Name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                className="flex-1 lg:w-28 lg:flex lg:justify-center"
              />
              <SortableHeader
                field="email"
                label="Email"
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                className="flex-1 lg:w-44 lg:flex lg:justify-center"
              />
              <div className="flex-1 lg:w-36 lg:flex lg:justify-center">
                Phone
              </div>
              <div className="flex-1 lg:w-20 flex justify-center">Role</div>
              <SortableHeader
                field="createdAt"
                label="Created"
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                className="flex-1 lg:w-28 lg:flex lg:justify-center"
              />
              <SortableHeader
                field="orderCount"
                label="Orders"
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                className="flex-1 lg:w-24 justify-center"
              />
              <div className="flex-1 lg:w-32 flex justify-center">
                Last Order
              </div>
              <div className="w-8 shrink-0 ml-1" />
            </div>

            {/* USER LIST */}
            {users.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 flex justify-center">
                  <Users className="w-16 h-16 text-color2 dark:text-[#7aab8a]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-[#c8e6d0] mb-2">
                  No users found
                </h3>
                <p className="text-gray-500 dark:text-[#7aab8a] mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results"
                    : "No users available"}
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
              users.map((u) => (
                <UserRow key={u._id} u={u} handleDelete={handleDelete} />
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
    </div>
  );
};

export default AllUsers;
