"use client";
import React, { useState, useRef, useEffect, createContext, useContext, ReactNode } from "react";
import Link from "next/link";


interface DropdownProps {
  children: ReactNode;
}

interface DropdownItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

interface DropdownLabelProps {
  children: ReactNode;
}

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);


export const Dropdown = ({ children }: DropdownProps) => (
  <DropdownProvider>
    <div className="relative inline-block text-left">{children}</div>
  </DropdownProvider>
);

export const DropdownButton = ({ children }: DropdownProps) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("DropdownButton must be used within a Dropdown");
  const { setOpen } = context;

  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="flex items-center cursor-pointer"
    >
      {children}
    </button>
  );
};

export const DropdownMenu = ({ children }: DropdownProps) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenu must be used within a Dropdown");
  const { open, menuRef } = context;

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl py-2 z-50 border border-gray-200"
    >
      {children}
    </div>
  );
};

export const DropdownItem = ({ children, href, onClick, className }: DropdownItemProps) => {
  const base = "px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer block";

  if (href) {
    return (
      <Link href={href} className={`${base} ${className || ""}`}>
        {children}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={`${base} ${className || ""}`}>
      {children}
    </div>
  );
};

export const DropdownDivider = () => <div className="border-t border-gray-200 my-2" />;

export const DropdownLabel = ({ children }: DropdownLabelProps) => (
  <div className="px-4 py-2 text-xs text-gray-400 uppercase">{children}</div>
);


const DropdownProvider = ({ children }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen, menuRef }}>
      {children}
    </DropdownContext.Provider>
  );
};
