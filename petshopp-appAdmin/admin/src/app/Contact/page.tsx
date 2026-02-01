"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useConfirm } from "../Context/confirmContext";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2, Mail, Check, Reply } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CircularText from "@/components/CircularText";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date?: string;
  status?: "New" | "Read" | "Replied";
  avatar?: string | null;
  initials?: string;
  userId?: string | null;
};

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMessage, setOpenMessage] = useState<Message | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
    }
  }, [searchParams, router]);

  const page = Number(searchParams.get("page")) || 1;

  const [localFilter, setLocalFilter] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  });

  const [appliedFilter, setAppliedFilter] = useState(localFilter);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);

      const params = new URLSearchParams();
      params.set("page", "1");

      if (localFilter.search) params.set("search", localFilter.search);
      if (localFilter.status) params.set("status", localFilter.status);

      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localFilter, router]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const params: any = { page };

        if (appliedFilter.search) params.search = appliedFilter.search;
        if (appliedFilter.status) params.status = appliedFilter.status;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/`,
          { params, withCredentials: true },
        );

        if (response.data.success) {
          const data = response.data.messages.map((msg: any) => ({
            id: msg.id,
            name: msg.name,
            email: msg.email,
            subject: msg.subject,
            message: msg.message,
            date: msg.date,
            status: msg.status,
            avatar: msg.avatar,
            initials: msg.initials,
            userId: msg.userId,
          }));
          setMessages(data);
          setTotalPages(response.data.totalPages || 1);
          setTotalMessages(response.data.totalMessages || 0);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [page, appliedFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split(".");
    if (parts.length !== 3) return dateStr;
    const [day, month, year] = parts;
    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
  };

  const getStatusBadge = (dateStr?: string) => {
    if (!dateStr) return { text: "New", isNew: true };

    let parsedDate: Date;

    if (dateStr.includes(".")) {
      const [day, month, year] = dateStr.split(".");
      parsedDate = new Date(`${year}-${month}-${day}`);
    } else if (dateStr.includes("/")) {
      parsedDate = new Date(dateStr);
    } else {
      return { text: "New", isNew: true };
    }

    if (isNaN(parsedDate.getTime())) return { text: "New", isNew: true };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messageDate = new Date(parsedDate);
    messageDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "New", isNew: true };
    if (diffDays === 1) return { text: "1 day", isNew: false };
    if (diffDays < 7) return { text: `${diffDays} days`, isNew: false };
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return { text: weeks === 1 ? "1 week" : `${weeks} weeks`, isNew: false };
    }

    return {
      text: parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isNew: false,
    };
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === messages.length
        ? new Set()
        : new Set(messages.map((msg) => msg.id)),
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return alert("Select at least one message.");
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/${id}`,
            {
              withCredentials: true,
            },
          ),
        ),
      );
      setMessages((prev) => prev.filter((msg) => !selectedIds.has(msg.id)));
      setSelectedIds(new Set());
      toast.success("Selected messages deleted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || "Failed to delete selected messages",
      );
    }
  };

  const updateMessageStatus = async (
    id: number,
    newStatus: "New" | "Read" | "Replied",
  ) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/${id}/status`,
        { status: newStatus },
        { withCredentials: true },
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, status: newStatus } : msg,
          ),
        );
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update status");
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      status: "",
    };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  };

  const hasActiveFilters = () => {
    return Object.values(appliedFilter).some((value) => value !== "");
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));

    if (appliedFilter.search) params.set("search", appliedFilter.search);
    if (appliedFilter.status) params.set("status", appliedFilter.status);

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
    <div className="flex flex-col min-h-screen">
      {loading ? (
          <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
          </div>
        ) : (
        <>
          <div className="hidden md:flex justify-between items-center p-4 lg:p-6 sticky top-0 bg-white z-20 border-b border-border-light">
            <h2 className="text-lg lg:text-xl font-semibold text-color">
              Messages
            </h2>
            {selectedIds.size > 0 && (
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const ok = await confirm({
                    title: "Delete Messages",
                    description:
                      "Are you sure you want to delete the selected messages?",
                    confirmText: "Yes, Delete",
                    cancelText: "Cancel",
                    variant: "destructive",
                  });
                  if (ok) handleDeleteSelected();
                }}
                className="px-4 py-2 text-white rounded"
              >
                Delete Selected
              </Button>
            )}
          </div>

          <div className="flex-1 p-4 md:p-6 lg:p-8 bg-background-light">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, email, subject..."
                  value={localFilter.search}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, search: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                />

                <select
                  value={localFilter.status}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, status: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-40 focus:outline-none focus:ring-1 focus:ring-[#97cba9]"
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Replied">Replied</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-color2">
                    {messages.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-color">{totalMessages}</span>{" "}
                  messages
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="flex gap-2 items-center bg-white text-gray-800 rounded-sm px-4 py-2 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97] hover:shadow-md border border-gray-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-border-light">
                    <thead className="bg-primary">
                      <tr>
                        <th className="px-3 lg:px-4 py-3 w-12 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded cursor-pointer accent-green-500 border-border-light"
                            checked={
                              selectedIds.size === messages.length &&
                              messages.length > 0
                            }
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-3 lg:px-4 py-3 text-left text-text-dark text-xs font-semibold uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="hidden xl:table-cell px-3 lg:px-4 py-3 text-left text-text-dark text-xs font-semibold uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-3 lg:px-4 py-3 text-left text-text-dark text-xs font-semibold uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-3 lg:px-4 py-3 text-left text-text-dark text-xs font-semibold uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 lg:px-4 py-3 text-right text-text-dark text-xs font-semibold uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light bg-white">
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center">
                              <Mail className="w-16 h-16 text-gray-300 mb-4" />
                              <h3 className="text-xl font-bold text-gray-700 mb-2">
                                No messages found
                              </h3>
                              <p className="text-gray-500 mb-4">
                                {hasActiveFilters()
                                  ? "Try adjusting your filters"
                                  : "No messages available"}
                              </p>
                              {hasActiveFilters() && (
                                <button
                                  onClick={clearFilters}
                                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] transition"
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        messages.map((msg) => {
                          const statusBadge = getStatusBadge(msg.date);
                          return (
                            <tr
                              key={msg.id}
                              className={`hover:bg-primary/5 transition-colors cursor-pointer ${
                                msg.status === "Replied" ? "bg-primary/5" : ""
                              }`}
                              onClick={() => setOpenMessage(msg)}
                            >
                              <td
                                className="px-3 lg:px-4 py-3 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(msg.id)}
                                  onChange={() => toggleSelect(msg.id)}
                                  className="h-4 w-4 rounded cursor-pointer accent-green-500 border-border-light"
                                />
                              </td>
                              <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2 lg:gap-3">
                                  {msg.userId ? (
                                    <Link
                                      href={`/userDetails/${msg.userId}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="shrink-0"
                                    >
                                      {msg.avatar ? (
                                        <div
                                          className="bg-center bg-no-repeat bg-cover rounded-full w-8 h-8 lg:w-9 lg:h-9 hover:ring-2 hover:ring-[#97cba9] transition-all"
                                          style={{
                                            backgroundImage: `url("${msg.avatar}")`,
                                          }}
                                        ></div>
                                      ) : (
                                        <div className="flex items-center justify-center rounded-full w-8 h-8 lg:w-9 lg:h-9 font-bold text-xs lg:text-sm bg-primary/20 text-text-dark hover:ring-2 hover:ring-primary transition-all">
                                          {msg.initials}
                                        </div>
                                      )}
                                    </Link>
                                  ) : (
                                    <>
                                      {msg.avatar ? (
                                        <div
                                          className="bg-center bg-no-repeat bg-cover rounded-full w-8 h-8 lg:w-9 lg:h-9 shrink-0"
                                          style={{
                                            backgroundImage: `url("${msg.avatar}")`,
                                          }}
                                        ></div>
                                      ) : (
                                        <div className="flex items-center justify-center rounded-full w-8 h-8 lg:w-9 lg:h-9 shrink-0 font-bold text-xs lg:text-sm bg-primary/20 text-text-dark">
                                          {msg.initials}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <p className="text-text-dark text-sm font-medium truncate max-w-[120px] lg:max-w-none">
                                      {msg.name}
                                    </p>
                                    <p className="text-subtle-light text-xs truncate max-w-[120px] lg:max-w-none">
                                      {msg.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden xl:table-cell px-3 lg:px-4 py-3 text-text-dark text-sm font-medium">
                                <div className="truncate max-w-[200px]">
                                  {msg.subject}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 text-subtle-light text-sm">
                                <div className="truncate max-w-[150px] lg:max-w-[250px] xl:max-w-[300px]">
                                  {msg.message}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 text-subtle-light text-xs lg:text-sm whitespace-nowrap">
                                {formatDate(msg.date)}
                              </td>
                              <td className="px-3 lg:px-4 py-3 text-right whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 lg:px-2.5 py-0.5 text-xs font-medium ${
                                    statusBadge.isNew
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {statusBadge.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-border-light p-3 flex justify-end z-30 shadow-lg">
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const ok = await confirm({
                      title: "Delete Messages",
                      description:
                        "Are you sure you want to delete the selected messages?",
                      confirmText: "Yes, Delete",
                      cancelText: "Cancel",
                      variant: "destructive",
                    });
                    if (ok) handleDeleteSelected();
                  }}
                  className="px-4 py-2 text-white rounded"
                >
                  Delete Selected ({selectedIds.size})
                </Button>
              </div>
            )}

            <div className="flex flex-col md:hidden gap-4">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No messages found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters()
                      ? "Try adjusting your filters"
                      : "No messages available"}
                  </p>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="bg-primary text-white px-6 py-2 rounded-lg"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                messages.map((msg) => {
                  const statusBadge = getStatusBadge(msg.date);
                  return (
                    <div
                      key={msg.id}
                      className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 cursor-pointer border border-border-light hover:shadow-md transition-shadow"
                      onClick={() => setOpenMessage(msg)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {msg.userId ? (
                            <Link
                              href={`/admin/userDetails/${msg.userId}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {msg.avatar ? (
                                <div
                                  className="bg-center bg-no-repeat bg-cover rounded-full w-10 h-10 shrink-0"
                                  style={{
                                    backgroundImage: `url("${msg.avatar}")`,
                                  }}
                                ></div>
                              ) : (
                                <div className="flex items-center justify-center rounded-full w-10 h-10 shrink-0 font-bold text-sm bg-primary/20 text-text-dark">
                                  {msg.initials}
                                </div>
                              )}
                            </Link>
                          ) : (
                            <>
                              {msg.avatar ? (
                                <div
                                  className="bg-center bg-no-repeat bg-cover rounded-full w-10 h-10 shrink-0"
                                  style={{
                                    backgroundImage: `url("${msg.avatar}")`,
                                  }}
                                ></div>
                              ) : (
                                <div className="flex items-center justify-center rounded-full w-10 h-10 shrink-0 font-bold text-sm bg-primary/20 text-text-dark">
                                  {msg.initials}
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <p className="font-medium text-text-dark truncate">
                              {msg.name}
                            </p>
                            <p className="text-subtle-light text-xs truncate">
                              {msg.email}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(msg.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleSelect(msg.id)}
                          className="h-5 w-5 accent-green-500 rounded cursor-pointer shrink-0"
                        />
                      </div>
                      <div className="text-sm font-medium text-text-dark truncate">
                        {msg.subject}
                      </div>
                      <div className="text-subtle-light text-sm line-clamp-2">
                        {msg.message}
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-subtle-light">
                          {formatDate(msg.date)}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusBadge.isNew
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-12 text-color">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>

                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {start > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm">…</span>
                    </PaginationItem>
                  )}

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

                  {end < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-2 text-sm">…</span>
                    </PaginationItem>
                  )}

                  {totalPages > 1 && (
                    <PaginationItem className="cursor-pointer">
                      <PaginationLink
                        isActive={page === totalPages}
                        onClick={() => goToPage(totalPages)}
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
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>

          {/* Message modal */}
          {openMessage && (
            <div
              className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4"
              onClick={() => setOpenMessage(null)}
            >
              <div
                className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 flex flex-col overflow-y-auto max-h-[85vh] transform transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-bold text-color">
                    Message Detail
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-800 text-2xl font-bold cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setOpenMessage(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col gap-4 text-color text-sm">
                  <div>
                    <span className="font-semibold text-color">Name: </span>
                    <span className="text-color/80">{openMessage.name}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-color">Email: </span>
                    <span className="text-color/80">{openMessage.email}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-color">Subject: </span>
                    <span className="text-color/80">{openMessage.subject}</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words max-h-60">
                    <p className="font-semibold text-color mb-2">Message:</p>
                    <p className="text-color/80 leading-relaxed">
                      {openMessage.message}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-color">Date: </span>
                    <span className="text-color/80">
                      {formatDate(openMessage.date)}
                    </span>
                  </div>

                  {/* STATUS BUTTONS */}
                  <div>
                    <p className="font-semibold text-color mb-2">
                      Update Status:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() =>
                          updateMessageStatus(openMessage.id, "Read")
                        }
                        disabled={openMessage.status === "Read"}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          openMessage.status === "Read"
                            ? "bg-blue-100 text-blue-700 cursor-not-allowed opacity-70"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        Mark as Read
                      </button>
                      <button
                        onClick={() =>
                          updateMessageStatus(openMessage.id, "Replied")
                        }
                        disabled={openMessage.status === "Replied"}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          openMessage.status === "Replied"
                            ? "bg-green-100 text-green-700 cursor-not-allowed opacity-70"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        <Reply className="w-4 h-4" />
                        Mark as Replied
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex mt-6 justify-end gap-2">
                  <button
                    onClick={() => setOpenMessage(null)}
                    className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
