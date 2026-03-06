"use client";
import React, { useRef, useState, useContext, createContext } from "react";
import Link from "next/link";

const DropdownContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function Dropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownButton({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useContext(DropdownContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="focus:outline-none"
    >
      {children}
    </button>
  );
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const { open } = useContext(DropdownContext);
  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-52 z-[300] rounded-xl shadow-xl overflow-hidden
      bg-white dark:bg-[#162820]
      border border-gray-100 dark:border-[#2d5a3d]">
      {children}
    </div>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2d5a3d]
      text-sm font-semibold text-color dark:text-[#c8e6d0] bg-gray-50 dark:bg-[#1e3d2a]">
      {children}
    </div>
  );
}


interface DropdownItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DropdownItem({ href, onClick, children, className = "" }: DropdownItemProps) {
  const { setOpen } = useContext(DropdownContext);

  const baseClass = `flex items-center gap-2 w-full px-4 py-2.5 text-sm
    text-color dark:text-[#c8e6d0]!
    hover:bg-gray-50 dark:hover:bg-[#1e3d2a]
    hover:text-color dark:hover:text-[#c8e6d0]
    border-b last:border-b-0 border-gray-50 dark:border-[#2d5a3d]
    transition-colors duration-150 cursor-pointer ${className}`;

  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };

  if (href && href !== "#") {
    return (
      <Link href={href} onClick={() => setOpen(false)} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={baseClass}>
      {children}
    </button>
  );
}