"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import MobileMenu from "../components/mobile";
import { useAdminAuth } from "../Context/AdminAuthContext";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { setAdmin } = useAdminAuth();

  const pageTitle = () => {
    const staticTitles: Record<string, string> = {
      "/": "Dashboard",
      "/AddProduct": "Add Product",
      "/AllProduct": "All Products",
      "/ProductStats": "Product Statistics",
      "/AllUsers": "All Users",
      "/AllAdmin": "All Admins",
      "/AddAdmin": "Add Admin",
      "/UserActivity": "User Activity",
      "/AllOrders": "All Orders",
      "/ProcessingOrders": "Processing Orders",
      "/CompletedOrders": "Completed Orders",
      "/AllCoupon": "Pricing & Promotions",
      "/OrderStats": "Order Statistics",
      "/Contact": "Admin Contact",
    };

    if (staticTitles[pathname]) {
      return staticTitles[pathname];
    }

    if (pathname.startsWith("/Cat")) return "Cat Products";
    if (pathname.startsWith("/Dog")) return "Dog Products";
    if (pathname.startsWith("/Bird")) return "Bird Products";
    if (pathname.startsWith("/Fish")) return "Fish Products";
    if (pathname.startsWith("/Reptile")) return "Reptile Products";
    if (pathname.startsWith("/Rabbit")) return "Rabbit Products";
    if (pathname.startsWith("/Horse")) return "Horse Products";

    return "Admin Panel";
  };

  const NavbarMenu = [
  {
    key: "products",
    label: "Products",
    items: [
      { label: "Add Product", href: "/AddProduct" },
      { label: "All Products", href: "/AllProduct" },
      { label: "Product Stats", href: "/ProductStats" },
    ],
  },
  {
    key: "users",
    label: "Users",
    items: [
      { label: "All Users", href: "/AllUsers" },
      { label: "All Admin", href: "/AllAdmin" },
      { label: "Add Admin", href: "/AddAdmin" },
      { label: "User Activity", href: "/UserActivity" },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    items: [
      { label: "All Orders", href: "/AllOrders" },
      { label: "Processing Orders", href: "/ProcessingOrders" },
      { label: "Completed Orders", href: "/CompletedOrders" },
      { label: "Pricing & Promotions", href: "/AllCoupon" },
      { label: "Order Stats", href: "/OrderStats" },
    ],
  },
];


  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/logout`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Logged out successfully!");
        setAdmin(null);
      }
      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="md:ml-24 lg:ml-40 h-14 sm:h-14 lg:h-18 bg-primary shadow-md lg:relative fixed w-full md:w-[calc(100%-6rem)] lg:w-[calc(100%-10rem)] z-30 opacity-95">
      {/* Top Navbar */}
      <div>
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <MobileMenu anchor="left" />
          </div>

            {/* Page Name */}
          <div className="hidden md:flex items-center p-4">
            <h1 className="text-xl font-bold text-white">{pageTitle()}</h1>
          </div>

          {/* Hamburger (Mobile) */}
          <div
            className="w-40 lg:hidden items-center justify-end inline-block text-color rounded-2xl mt-2 md:mt-0 mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Button className="bg-secondary hover:bg-secondary cursor-pointer flex items-center justify-between text-color mt-1 ml-4">
              {menuOpen ? (
                <div className="flex gap-3">
                  <div className="w-full">Admin Panel</div>
                  <div>
                    <ChevronUp />
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-full">Admin Panel</div>
                  <div>
                    <ChevronDown />
                  </div>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Menu */}
        <div
         className="hidden lg:flex md:ml-24 gap-8 justify-center mb-12 mr-4 p-2 absolute top-2 right-2 z-100">
          {NavbarMenu.map((menu) => (
            <div key={menu.key} className="relative group">
              <button className="w-40 h-9 rounded-xl bg-secondary text-color flex items-center justify-center gap-2 transition duration-300 ease-in-out hover:scale-105">
                <span>{menu.label}</span>
                <ChevronDown
          size={16}
          className="transition-transform duration-300 group-hover:rotate-180"
        />
              </button>    
              <div className="absolute top-full hidden group-hover:flex flex-col w-48 bg-white shadow-lg rounded-xl z-10">
                {menu.items.map((item) =>(
                  <Link key={item.href} 
                  href={item.href} 
                  className="px-4 py-2 hover:bg-gray-200 border-b last:border-b-0 border-secondary transition duration-200 rounded-xl hover:scale-[1.05]
    active:scale-[0.97]
     "
                  >
                     {item.label}
                  </Link>
                ))}
                </div> 
                      
            </div>
            
          ))}
           <Button
    onClick={handleLogout}
    className="bg-secondary text-color w-40 text-base hover:bg-secondary cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md"
  >
    Logout
  </Button>
        </div>
      </div>

      {menuOpen && (
  <div
    className="fixed inset-0 bg-black/10 z-40 lg:hidden"
    onClick={() => {
      setMenuOpen(false);
      setOpenDropdown(null);
    }}
  />
)}

      {/* Mobile Menu */}
     {menuOpen && (
  <div className="lg:hidden fixed top-14 left-0 right-0 flex flex-col pb-4 border-t border-gray-700 bg-primary z-50">
    {NavbarMenu.map((menu) => {
      const isOpen = openDropdown === menu.key;

      return (
        <div
          key={menu.key}
          className="border border-secondary rounded-md overflow-hidden md:ml-24 "
        >
          {/* HEADER */}
          <button
            onClick={() => toggleDropdown(menu.key)}
            className="w-full flex items-center justify-between px-4 py-3 text-color bg-primary transition"
          >
            <span className="font-medium">{menu.label}</span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ITEMS */}
          {isOpen && (
            <div className="flex flex-col bg-secondary">
              {menu.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                  className="px-6 py-3 text-sm text-color border-t border-secondary transition hover:bg-primary/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
)}


    </div>
  );
};

export default Navbar;
