"use client";
import React, { useState } from "react";
import { Trash2, ChevronDown, Filter, CalendarDays, X, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { DateRange } from "react-day-picker";

type FilterState = {
  search: string;
  email: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
};

type Props = {
  localFilter: FilterState;
  setLocalFilter: (f: FilterState) => void;
  appliedFilter: FilterState;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  totalOrders: number;
  totalAllOrders: number;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
};

const INPUT_CLASS =
  "border border-gray-300 dark:border-[#2d5a3d] p-2 rounded bg-white dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-1 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] [&>option]:bg-white dark:[&>option]:bg-[#1e3d2a] [&>option]:text-gray-900 dark:[&>option]:text-[#c8e6d0]";

const QUICK_RANGES = [
  { label: "Today", from: () => new Date(), to: () => new Date() },
  { label: "Last 7 days", from: () => subDays(new Date(), 6), to: () => new Date() },
  { label: "Last 30 days", from: () => subDays(new Date(), 29), to: () => new Date() },
  { label: "This month", from: () => startOfMonth(new Date()), to: () => endOfMonth(new Date()) },
  { label: "Last month", from: () => startOfMonth(subMonths(new Date(), 1)), to: () => endOfMonth(subMonths(new Date(), 1)) },
];

const DateRangePicker = ({
  localFilter,
  setLocalFilter,
  className = "",
}: {
  localFilter: FilterState;
  setLocalFilter: (f: FilterState) => void;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>({ from: undefined, to: undefined });
  const [hovered, setHovered] = useState<Date | undefined>(undefined);

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setDraft({
        from: localFilter.startDate ? new Date(localFilter.startDate) : undefined,
        to: localFilter.endDate ? new Date(localFilter.endDate) : undefined,
      });
      setHovered(undefined);
    }
    setOpen(val);
  };

  const handleSelect = (val: DateRange | undefined) => {
    if (!val) {
      setDraft({ from: undefined, to: undefined });
      return;
    }

    if (draft.from && draft.to) {
      setDraft({ from: val.from, to: undefined });
      setHovered(undefined);
      return;
    }

    if (draft.from && !draft.to) {
      const incoming = val.to ?? val.from;
      if (incoming && draft.from && incoming < draft.from) {
        setDraft({ from: incoming, to: draft.from });
      } else {
        setDraft({ from: draft.from, to: incoming });
      }
      setHovered(undefined);
      return;
    }

    setDraft({ from: val.from, to: val.to });
  };

  const handleApply = () => {
    setLocalFilter({
      ...localFilter,
      startDate: draft.from && isValid(draft.from) ? format(draft.from, "yyyy-MM-dd") : "",
      endDate: draft.to && isValid(draft.to) ? format(draft.to, "yyyy-MM-dd") : "",
    });
    setOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDraft({ from: undefined, to: undefined });
    setHovered(undefined);
    setLocalFilter({ ...localFilter, startDate: "", endDate: "" });
    setOpen(false);
  };

  const handleQuickRange = (from: Date, to: Date) => {
    setDraft({ from, to });
    setHovered(undefined);
  };

  // Hover preview range — show while waiting for end date
  const previewRange: DateRange =
    draft.from && !draft.to && hovered
      ? hovered < draft.from
        ? { from: hovered, to: draft.from }
        : { from: draft.from, to: hovered }
      : draft;

  const appliedRange: DateRange = {
    from: localFilter.startDate ? new Date(localFilter.startDate) : undefined,
    to: localFilter.endDate ? new Date(localFilter.endDate) : undefined,
  };

  const hasApplied = appliedRange.from || appliedRange.to;
  const hasDraft = draft.from || draft.to;
  const isComplete = draft.from && draft.to;
  const step = !draft.from ? 1 : !draft.to ? 2 : 3;

  const triggerLabel = () => {
    if (appliedRange.from && appliedRange.to)
      return `${format(appliedRange.from, "MMM d, yyyy")} → ${format(appliedRange.to, "MMM d, yyyy")}`;
    if (appliedRange.from)
      return `From ${format(appliedRange.from, "MMM d, yyyy")}`;
    return "Pick date range";
  };

  const stepLabel = () => {
    if (step === 1) return <span className="text-gray-400 dark:text-[#7aab8a]">Step 1 — Pick a start date</span>;
    if (step === 2) return <span className="text-[#97cba9]">Step 2 — Now pick an end date</span>;
    return (
      <span className="text-gray-700 dark:text-[#c8e6d0]">
        {format(draft.from!, "MMM d")} → {format(draft.to!, "MMM d, yyyy")}
      </span>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`
            flex items-center gap-2 border rounded px-3 py-2 text-sm
            bg-white dark:bg-[#1e3d2a]
            border-gray-300 dark:border-[#2d5a3d]
            text-gray-900 dark:text-[#c8e6d0]
            hover:border-[#97cba9] dark:hover:border-[#97cba9]
            focus:outline-none focus:ring-1 focus:ring-[#97cba9]
            transition-colors duration-150
            ${hasApplied ? "border-[#97cba9] dark:border-[#97cba9]" : ""}
            ${className}
          `}
        >
          <CalendarDays className="w-4 h-4 shrink-0 text-gray-400 dark:text-[#7aab8a]" />
          <span className={hasApplied ? "text-gray-900 dark:text-[#c8e6d0]" : "text-gray-400 dark:text-[#7aab8a]"}>
            {triggerLabel()}
          </span>
          {hasApplied && (
            <X
              className="w-3.5 h-3.5 ml-auto shrink-0 text-gray-400 hover:text-red-400 dark:text-[#7aab8a] dark:hover:text-red-400 transition-colors"
              onClick={handleClear}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 border border-gray-200 dark:border-[#2d5a3d] shadow-xl rounded-xl overflow-hidden"
        align="start"
      >
        {/* Step indicator header */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#162820] border-b border-gray-100 dark:border-[#2d5a3d]">
          <div className="flex items-center gap-2 mb-1.5">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`
                  flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-colors
                  ${step >= s
                    ? "bg-[#5a9e72] dark:bg-[#3d7a56] text-white"
                    : "bg-gray-200 dark:bg-[#2d5a3d] text-gray-400 dark:text-[#7aab8a]"}
                `}>
                  {s}
                </div>
                {s < 2 && (
                  <ChevronRight className="w-3 h-3 text-gray-300 dark:text-[#3d5a45]" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm min-h-[20px]">{stepLabel()}</p>
        </div>

        <div className="flex">
          {/* Quick range shortcuts */}
          <div className="border-r border-gray-100 dark:border-[#2d5a3d] bg-gray-50 dark:bg-[#162820] flex flex-col py-2 min-w-[130px]">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-[#7aab8a] uppercase tracking-wider px-3 pb-2">
              Quick Select
            </p>
            {QUICK_RANGES.map((r) => {
              const from = r.from();
              const to = r.to();
              const isActive =
                draft.from && draft.to &&
                format(draft.from, "yyyy-MM-dd") === format(from, "yyyy-MM-dd") &&
                format(draft.to, "yyyy-MM-dd") === format(to, "yyyy-MM-dd");
              return (
                <button
                  key={r.label}
                  onClick={() => handleQuickRange(from, to)}
                  className={`
                    text-left text-xs px-3 py-1.5 transition-colors
                    ${isActive
                      ? "bg-[#e8f5ee] dark:bg-[#1e3d2a] text-[#5a9e72] dark:text-[#97cba9] font-semibold"
                      : "text-gray-600 dark:text-[#a8d4b8] hover:bg-[#e8f5ee] dark:hover:bg-[#1e3d2a] hover:text-[#5a9e72] dark:hover:text-[#97cba9]"}
                  `}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Calendar */}
          <div className="bg-white dark:bg-[#1a3025]">
            <Calendar
              mode="range"
              selected={previewRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              onDayMouseEnter={(day) => {
                if (draft.from && !draft.to) setHovered(day);
              }}
              onDayMouseLeave={() => setHovered(undefined)}
              classNames={{
                months: "flex gap-4 p-3",
                month: "space-y-2",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-semibold text-gray-800 dark:text-[#c8e6d0]",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-[#2d5a3d] text-gray-600 dark:text-[#a8d4b8] transition-colors",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell:
                  "text-gray-400 dark:text-[#7aab8a] rounded w-8 font-normal text-[0.75rem] text-center",
                row: "flex w-full mt-1",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal rounded hover:bg-[#e8f5ee] dark:hover:bg-[#2d5a3d] text-gray-900 dark:text-[#c8e6d0] transition-colors aria-selected:opacity-100",
                day_selected:
                  "bg-[#5a9e72] dark:bg-[#3d7a56] text-white hover:bg-[#4a8e62] dark:hover:bg-[#3d7a56] focus:bg-[#5a9e72]",
                day_today:
                  "bg-gray-100 dark:bg-[#1e3d2a] font-semibold text-[#5a9e72] dark:text-[#97cba9]",
                day_outside: "text-gray-300 dark:text-[#3d5a45] opacity-50",
                day_disabled: "text-gray-200 dark:text-[#2d3d32] opacity-30 cursor-not-allowed",
                day_range_middle:
                  "rounded-none bg-[#e8f5ee] dark:bg-[#1e3d2a] text-gray-900 dark:text-[#c8e6d0]",
                day_range_start: "rounded-l-full",
                day_range_end: "rounded-r-full",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#162820] border-t border-gray-100 dark:border-[#2d5a3d] flex justify-between items-center">
          <button
            onClick={() => handleClear()}
            disabled={!hasDraft}
            className="text-xs text-gray-500 dark:text-[#7aab8a] hover:text-red-400 dark:hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="w-3 h-3" /> Clear
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 dark:text-[#7aab8a] hover:text-gray-700 dark:hover:text-[#c8e6d0] px-3 py-1.5 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!isComplete}
              className="text-xs font-semibold text-white bg-[#5a9e72] dark:bg-[#3d7a56] px-3 py-1.5 rounded hover:bg-[#4a8e62] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const AllOrdersFilters = ({
  localFilter,
  setLocalFilter,
  appliedFilter,
  showFilters,
  setShowFilters,
  totalOrders,
  totalAllOrders,
  hasActiveFilters,
  clearFilters,
}: Props) => {
  return (
    <div className="bg-white dark:bg-[#162820] p-4 rounded-lg shadow-md mb-6 border border-transparent dark:border-[#2d5a3d]">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-between p-3 bg-primary/10 dark:bg-[#1e3d2a] rounded-lg mb-3"
      >
        <span className="flex items-center gap-2 font-semibold text-color dark:text-[#c8e6d0] text-sm sm:text-base">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          Filters{" "}
          {hasActiveFilters() &&
            `(${Object.values(appliedFilter).filter((v) => v !== "").length})`}
        </span>
        <ChevronDown
          className={`w-5 h-5 dark:text-[#7aab8a] transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`${showFilters ? "block" : "hidden"} lg:hidden space-y-3`}>
        <input
          type="text"
          placeholder="Search by name or Order ID..."
          value={localFilter.search}
          onChange={(e) => setLocalFilter({ ...localFilter, search: e.target.value })}
          autoComplete="off"
          maxLength={50}
          className={`${INPUT_CLASS} p-2 sm:p-2.5 w-full text-sm sm:text-base`}
        />
        <input
          type="text"
          placeholder="Filter by user email..."
          value={localFilter.email}
          onChange={(e) => setLocalFilter({ ...localFilter, email: e.target.value })}
          autoComplete="off"
          maxLength={50}
          className={`${INPUT_CLASS} p-2 sm:p-2.5 w-full text-sm sm:text-base`}
        />
        <select
          value={localFilter.status}
          onChange={(e) => setLocalFilter({ ...localFilter, status: e.target.value })}
          className={`${INPUT_CLASS} p-2 sm:p-2.5 w-full text-sm sm:text-base`}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">Price Range</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <input
              type="number"
              placeholder="Min"
              value={localFilter.minPrice}
              onChange={(e) => setLocalFilter({ ...localFilter, minPrice: e.target.value })}
              min="0"
              step="0.01"
              autoComplete="off"
              className={`${INPUT_CLASS} p-2 sm:p-2.5 text-sm sm:text-base`}
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilter.maxPrice}
              onChange={(e) => setLocalFilter({ ...localFilter, maxPrice: e.target.value })}
              min="0"
              step="0.01"
              autoComplete="off"
              className={`${INPUT_CLASS} p-2 sm:p-2.5 text-sm sm:text-base`}
            />
          </div>
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">Date Range</p>
          <DateRangePicker localFilter={localFilter} setLocalFilter={setLocalFilter} className="w-full" />
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name or Order ID..."
            value={localFilter.search}
            onChange={(e) => setLocalFilter({ ...localFilter, search: e.target.value })}
            autoComplete="off"
            maxLength={50}
            className={`${INPUT_CLASS} flex-1 min-w-[200px]`}
          />
          <input
            type="text"
            placeholder="Filter by user email..."
            value={localFilter.email}
            onChange={(e) => setLocalFilter({ ...localFilter, email: e.target.value })}
            autoComplete="off"
            maxLength={50}
            className={`${INPUT_CLASS} min-w-[200px]`}
          />
          <select
            value={localFilter.status}
            onChange={(e) => setLocalFilter({ ...localFilter, status: e.target.value })}
            className={`${INPUT_CLASS} min-w-[150px]`}
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
            onChange={(e) => setLocalFilter({ ...localFilter, minPrice: e.target.value })}
            min="0"
            step="0.01"
            autoComplete="off"
            className={`${INPUT_CLASS} w-32`}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={localFilter.maxPrice}
            onChange={(e) => setLocalFilter({ ...localFilter, maxPrice: e.target.value })}
            min="0"
            step="0.01"
            autoComplete="off"
            className={`${INPUT_CLASS} w-32`}
          />
          <DateRangePicker localFilter={localFilter} setLocalFilter={setLocalFilter} className="min-w-[280px]" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-[#2d5a3d]">
        <p className="text-sm text-gray-600 dark:text-[#a8d4b8]">
          Showing{" "}
          <span className="font-bold text-color dark:text-[#a8d4b8]!">{totalOrders}</span>{" "}
          of{" "}
          <span className="font-bold text-black/60 dark:text-[#c8e6d0]">{totalAllOrders}</span>{" "}
          orders
          {hasActiveFilters() && (
            <span className="text-xs text-gray-500 dark:text-[#7aab8a] ml-2">(Filtered results)</span>
          )}
        </p>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="w-40 flex gap-2 justify-center items-center bg-white dark:bg-[#1e3d2a] text-gray-800 dark:text-[#c8e6d0] border dark:border-[#2d5a3d] rounded-sm p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md"
          >
            <Trash2 className="w-4 h-4" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default AllOrdersFilters;