"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortIconProps = {
  field: string;
  currentField: string;
  currentOrder: string;
};

const SortIcon = ({ field, currentField, currentOrder }: SortIconProps) => {
  if (currentField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40 dark:opacity-30" />;
  return currentOrder === "asc"
    ? <ArrowUp className="w-3 h-3 text-color dark:text-[#a8d4b8]" />
    : <ArrowDown className="w-3 h-3 text-color dark:text-[#a8d4b8]" />;
};

type SortableHeaderProps = {
  field: string;
  label: string;
  className?: string;
  sortBy: string;
  sortOrder: string;
  handleSort: (field: string) => void;
};

const SortableHeader = ({ field, label, className = "", sortBy, sortOrder, handleSort }: SortableHeaderProps) => (
  <button
    onClick={() => handleSort(field)}
    className={`flex items-center gap-1 hover:text-color2 dark:hover:text-[#c8e6d0] transition-colors cursor-pointer ${className}`}
  >
    {label}
    <SortIcon field={field} currentField={sortBy} currentOrder={sortOrder} />
  </button>
);

export default SortableHeader;