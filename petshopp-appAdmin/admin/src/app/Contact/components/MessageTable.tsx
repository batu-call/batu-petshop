"use client";

import Link from "next/link";
import { Mail, Clock, Eye, CheckCircle } from "lucide-react";
import { Message } from "../hooks/useMessages";

type Props = {
  messages: Message[];
  selectedIds: Set<number>;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  handleOpenMessage: (msg: Message) => void;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
  formatDate: (dateStr?: string) => string;
  getStatusBadge: (
    dateStr?: string,
    status?: "New" | "Read" | "Replied",
  ) => { text: string; isNew: boolean };
};

const getStatusIcon = (status?: "New" | "Read" | "Replied") => {
  switch (status) {
    case "New":     return <Mail className="w-4 h-4" />;
    case "Read":    return <Eye className="w-4 h-4" />;
    case "Replied": return <CheckCircle className="w-4 h-4" />;
    default:        return <Mail className="w-4 h-4" />;
  }
};

const AvatarCell = ({ msg }: { msg: Message }) => {
  if (msg.userId) {
    return (
      <Link
        href={`/userDetails/${msg.userId}`}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      >
        {msg.avatar ? (
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full w-8 h-8 lg:w-9 lg:h-9 hover:ring-2 hover:ring-[#97cba9] transition-all"
            style={{ backgroundImage: `url("${msg.avatar}")` }}
          />
        ) : (
          <div className="flex items-center justify-center rounded-full w-8 h-8 lg:w-9 lg:h-9 font-bold text-xs lg:text-sm bg-primary/20 dark:bg-primary/30 text-text-dark dark:text-foreground hover:ring-2 hover:ring-primary transition-all">
            {msg.initials}
          </div>
        )}
      </Link>
    );
  }

  return msg.avatar ? (
    <div
      className="bg-center bg-no-repeat bg-cover rounded-full w-8 h-8 shrink-0"
      style={{ backgroundImage: `url("${msg.avatar}")` }}
    />
  ) : (
    <div className="flex items-center justify-center rounded-full w-8 h-8 shrink-0 font-bold text-xs bg-primary/20 dark:bg-primary/30 text-text-dark dark:text-foreground">
      {msg.initials}
    </div>
  );
};

const StatusBadge = ({ status }: { status?: "New" | "Read" | "Replied" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      status === "New"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
        : status === "Read"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
    }`}
  >
    {getStatusIcon(status)}
    {status || "New"}
  </span>
);

const EmptyState = ({
  hasActiveFilters,
  clearFilters,
}: {
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) => (
  <div className="flex flex-col items-center py-16">
    <Mail className="w-16 h-16 text-gray-300 dark:text-muted-foreground/30 mb-4" />
    <h3 className="text-xl font-bold text-gray-700 dark:text-foreground mb-2">No messages found</h3>
    <p className="text-gray-500 dark:text-muted-foreground mb-4">
      {hasActiveFilters ? "Try adjusting your filters" : "No messages available"}
    </p>
    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] hover:text-[#393E46] dark:hover:bg-secondary dark:hover:text-foreground transition"
      >
        Clear Filters
      </button>
    )}
  </div>
);

const MessageTable = ({
  messages,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  handleOpenMessage,
  hasActiveFilters,
  clearFilters,
  formatDate,
  getStatusBadge,
}: Props) => {
  const activeFilters = hasActiveFilters();

  return (
    <>
      {/* ── MOBILE CARD LIST ── */}
      <div className="md:hidden flex flex-col gap-3 px-3 sm:px-4">
        {/* Select-all header */}
        {messages.length > 0 && (
          <label className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white dark:bg-card border border-border-light dark:border-border shadow-sm cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-green-500 cursor-pointer"
              checked={selectedIds.size === messages.length && messages.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="text-xs text-gray-500 dark:text-muted-foreground font-medium select-none">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
            </span>
          </label>
        )}

        {messages.length === 0 ? (
          <div className="rounded-xl border border-border-light dark:border-border bg-white dark:bg-card shadow-sm">
            <EmptyState hasActiveFilters={activeFilters} clearFilters={clearFilters} />
          </div>
        ) : (
          messages.map((msg) => {
            const statusBadge = getStatusBadge(msg.date, msg.status);
            const isSelected = selectedIds.has(msg.id);

            return (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`
                  relative flex items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer
                  transition-all duration-150 active:scale-[0.99] shadow-sm hover:shadow-md
                  ${isSelected
                    ? "border-green-400 bg-green-50/40 dark:border-green-700 dark:bg-green-900/20"
                    : "border-border-light dark:border-border bg-white dark:bg-card"}
                  ${msg.status === "New" && !isSelected ? "bg-blue-50/30 dark:bg-blue-950/20" : ""}
                  ${msg.status === "Replied" && !isSelected ? "bg-green-50/30 dark:bg-green-950/20" : ""}
                `}
              >
                <label
                  className="mt-1 shrink-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(msg.id)}
                    className="h-4 w-4 rounded accent-green-500 border-gray-300 cursor-pointer"
                  />
                </label>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <AvatarCell msg={msg} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${msg.status === "New" ? "font-bold text-gray-900 dark:text-foreground" : "font-medium text-text-dark dark:text-foreground/80"}`}>
                      {msg.name}
                    </p>
                    <StatusBadge status={msg.status} />
                  </div>

                  <p className="text-xs text-subtle-light dark:text-muted-foreground truncate mb-1">
                    {msg.email}
                  </p>

                  {msg.subject && (
                    <p className={`text-xs truncate mb-1 ${msg.status === "New" ? "font-semibold text-gray-800 dark:text-foreground" : "text-text-dark dark:text-foreground/80 font-medium"}`}>
                      {msg.subject}
                    </p>
                  )}

                  <p className="text-xs text-subtle-light dark:text-muted-foreground line-clamp-2 mb-2">
                    {msg.message}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-muted-foreground">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatDate(msg.date)}</span>
                    {!statusBadge.isNew && (
                      <span className="italic ml-1">{statusBadge.text}</span>
                    )}
                  </div>
                </div>

                {msg.status === "New" && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-xl border border-border-light dark:border-border bg-white dark:bg-card shadow-sm">
            <table className="min-w-full divide-y divide-border-light dark:divide-border">
              <thead className="bg-primary dark:bg-primary/80">
                <tr>
                  <th className="px-3 lg:px-4 py-3 w-12 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded cursor-pointer accent-green-500 border-border-light"
                      checked={selectedIds.size === messages.length && messages.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {["Sender", "Subject", "Message", "Date", "Status"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-3 lg:px-4 py-3 text-left text-text-dark dark:text-primary-foreground text-xs font-semibold uppercase tracking-wider ${
                        h === "Subject" ? "hidden xl:table-cell" : ""
                      } ${h === "Status" ? "text-center" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border bg-white dark:bg-card">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <EmptyState hasActiveFilters={activeFilters} clearFilters={clearFilters} />
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => {
                    const statusBadge = getStatusBadge(msg.date, msg.status);
                    return (
                      <tr
                        key={msg.id}
                        className={`hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer
                          ${msg.status === "New" ? "bg-blue-50/30 dark:bg-blue-950/20" : ""}
                          ${msg.status === "Replied" ? "bg-green-50/30 dark:bg-green-950/20" : ""}
                        `}
                        onClick={() => handleOpenMessage(msg)}
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

                        {/* Sender */}
                        <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div onClick={(e) => e.stopPropagation()}>
                              <AvatarCell msg={msg} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <p className={`text-sm font-medium truncate max-w-[120px] lg:max-w-none ${msg.status === "New" ? "font-bold text-gray-900 dark:text-foreground" : "text-text-dark dark:text-foreground/80"}`}>
                                {msg.name}
                              </p>
                              <p className="text-subtle-light dark:text-muted-foreground text-xs truncate max-w-[120px] lg:max-w-none">
                                {msg.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="hidden xl:table-cell px-3 lg:px-4 py-3">
                          <div className={`truncate max-w-[200px] text-sm ${msg.status === "New" ? "font-bold text-gray-900 dark:text-foreground" : "text-text-dark dark:text-foreground/80 font-medium"}`}>
                            {msg.subject}
                          </div>
                        </td>

                        {/* Message */}
                        <td className="px-3 lg:px-4 py-3 text-subtle-light dark:text-muted-foreground text-sm">
                          <div className="truncate max-w-[150px] lg:max-w-[250px] xl:max-w-[300px]">
                            {msg.message}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-3 lg:px-4 py-3 text-subtle-light dark:text-muted-foreground text-xs lg:text-sm whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(msg.date)}
                            </div>
                            {!statusBadge.isNew && (
                              <span className="text-[10px] text-gray-400 dark:text-muted-foreground/70 italic">
                                {statusBadge.text}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 lg:px-4 py-3 text-center whitespace-nowrap">
                          <StatusBadge status={msg.status} />
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
    </>
  );
};

export default MessageTable;