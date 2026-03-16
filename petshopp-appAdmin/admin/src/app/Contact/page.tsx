"use client";

import CircularText from "@/components/CircularText";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useMessages } from "./hooks/useMessages";
import MessageTable from "./components/MessageTable";
import MessageDetailModal from "./components/MessageDetailModal";
import ReplyPanel from "./components/ReplyPanel";

const Page = () => {
  const {
    page,
    messages,
    selectedIds,
    openMessage,
    setOpenMessage,
    totalPages,
    totalMessages,
    loading,
    replyPanel,
    setReplyPanel,
    localFilter,
    setLocalFilter,
    appliedFilter,
    confirm,
    formatDate,
    getStatusBadge,
    toggleSelect,
    toggleSelectAll,
    handleDeleteSelected,
    clearFilters,
    hasActiveFilters,
    goToPage,
    handleOpenMessage,
    handleSendReply,
    closeReplyPanel,
  } = useMessages();

  const visibleCount = 5;
  let start = Math.max(2, page - Math.floor(visibleCount / 2));
  let end = start + visibleCount - 1;
  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(2, end - visibleCount + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const count = selectedIds.size;
    const description =
      count === 1
        ? "Are you sure you want to delete this message?"
        : `Are you sure you want to delete these ${count} selected messages?`;

    const ok = await confirm({
      title: count === 1 ? "Delete Message" : "Delete Messages",
      description,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (ok) handleDeleteSelected();
  };

  return (
    <div className="flex flex-col min-h-screen">
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
          {/* ── HEADER ── */}
          <div className="flex justify-between items-center px-4 py-3 lg:px-6 lg:py-4 sticky top-14 md:top-14 lg:top-0 bg-white dark:bg-card z-20 border-b border-border-light dark:border-border shadow-sm">
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-color dark:text-[#0b8457]!">
                Customer Messages
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
                Manage and respond to customer inquiries
              </p>
            </div>

            {selectedIds.size > 0 && (
              <Button
                onClick={handleDelete}
                className="px-3 sm:px-4 py-2 text-white rounded flex items-center gap-1.5 text-sm bg-primary hover:bg-[#D6EED6] hover:text-[#393E46] dark:hover:bg-secondary dark:hover:text-foreground cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Delete</span>
                <span>({selectedIds.size})</span>
              </Button>
            )}
          </div>

          <div className="flex-1 p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background">
            {/* ── FILTERS ── */}
            <div className="bg-white dark:bg-card p-4 rounded-lg shadow-md dark:shadow-none dark:border dark:border-border mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, email, subject..."
                  value={localFilter.search}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, search: e.target.value })
                  }
                  className="border border-gray-300 dark:border-border bg-white dark:bg-accent text-gray-900 dark:text-foreground placeholder-gray-400 dark:placeholder-muted-foreground p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-primary"
                />
                <select
                  value={localFilter.status}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, status: e.target.value })
                  }
                  className="border border-gray-300 dark:border-border bg-white dark:bg-accent text-gray-900 dark:text-foreground p-2 rounded w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Replied">Replied</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-[#a8d4b8]">
                  Showing{" "}
                  <span className="font-bold text-color dark:text-[#a8d4b8]!">
                    {messages.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-black/60 dark:text-[#c8e6d0]">
                    {totalMessages}
                  </span>{" "}
                  messages
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="flex gap-2 items-center bg-white dark:bg-[#1e3d2a] text-gray-800 dark:text-[#c8e6d0] rounded-sm px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#162820] transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97] hover:shadow-md border border-gray-300 dark:border-[#2d5a3d]"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* ── MESSAGE TABLE ── */}
            <MessageTable
              messages={messages}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              toggleSelectAll={toggleSelectAll}
              handleOpenMessage={handleOpenMessage}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <Pagination className="mt-12 text-color dark:text-foreground">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={
                        page === 1
                          ? "opacity-50 pointer-events-none"
                          : "dark:text-foreground dark:hover:bg-accent"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
                      className="dark:text-foreground dark:hover:bg-accent dark:data-[active]:bg-primary dark:data-[active]:text-primary-foreground"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {start > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm dark:text-muted-foreground">
                        …
                      </span>
                    </PaginationItem>
                  )}
                  {pages.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goToPage(p)}
                        className="dark:text-foreground dark:hover:bg-accent dark:data-[active]:bg-primary dark:data-[active]:text-primary-foreground"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {end < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-2 text-sm dark:text-muted-foreground">
                        …
                      </span>
                    </PaginationItem>
                  )}
                  {totalPages > 1 && (
                    <PaginationItem className="cursor-pointer">
                      <PaginationLink
                        isActive={page === totalPages}
                        onClick={() => goToPage(totalPages)}
                        className="dark:text-foreground dark:hover:bg-accent dark:data-[active]:bg-primary dark:data-[active]:text-primary-foreground"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => page < totalPages && goToPage(page + 1)}
                      className={
                        page === totalPages
                          ? "opacity-50 pointer-events-none"
                          : "dark:text-foreground dark:hover:bg-accent"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>

          {/* ── MESSAGE MODAL ── */}
          {openMessage && (
            <MessageDetailModal
              openMessage={openMessage}
              onClose={() => setOpenMessage(null)}
              onReply={() => {
                setReplyPanel({
                  isOpen: true,
                  message: openMessage,
                  replyText: "",
                  sending: false,
                });
                setOpenMessage(null);
              }}
              formatDate={formatDate}
            />
          )}

          {/* ── REPLY SLIDING PANEL ── */}
          <ReplyPanel
            replyPanel={replyPanel}
            setReplyPanel={setReplyPanel}
            onClose={closeReplyPanel}
            onSend={handleSendReply}
            formatDate={formatDate}
          />
        </>
      )}
    </div>
  );
};

export default Page;
