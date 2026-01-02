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
    <div className="w-full h-14 sm:h-14 lg:h-18 bg-primary shadow-md relative">
      {/* Top Navbar */}
      <div>
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <MobileMenu anchor="left" />
          </div>

            {/* Page Name */}
          <div className="hidden md:flex ml-44 items-center p-4">
            <h1 className="text-xl font-bold text-white">{pageTitle()}</h1>
          </div>

          {/* Hamburger (Mobile) */}
          <div
            className="w-40 lg:hidden items-center justify-end inline-block text-color rounded-2xl mt-2 mr-2"
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
        <div className="hidden lg:flex md:ml-24 gap-8 justify-center mb-12 mr-4 p-2 absolute top-2 right-2 z-100">
          {/* Products */}
          <div className="relative group">
            <button className="w-40 h-9 rounded-xl bg-secondary text-color flex items-center justify-center gap-1 transition duration-300 ease-in-out hover:scale-105">
              Products <ChevronDown size={16} />
            </button>
            <div className="absolute hidden group-hover:flex flex-col w-48 bg-white shadow-lg rounded-xl z-10">
              <Link
                href="/AddProduct"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Add Product
              </Link>
              <Link
                href="/AllProduct"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                All Products
              </Link>
              <Link
                href="/ProductStats"
                className="px-4 py-2 hover:bg-gray-200 transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Product Stats
              </Link>
            </div>
          </div>

          {/* Users */}
          <div className="relative group">
            <button className="w-40 h-9 rounded-xl bg-secondary text-color flex items-center justify-center gap-1 transition duration-300 ease-in-out hover:scale-105">
              Users <ChevronDown size={16} />
            </button>
            <div className="absolute hidden group-hover:flex flex-col w-48 bg-white shadow-lg rounded-xl z-10">
              <Link
                href="/AllUsers"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                All Users
              </Link>
              <Link
                href="/AllAdmin"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                All Admin
              </Link>
              <Link
                href="/AddAdmin"
                className="px-4 py-2 hover:bg-gray-200 transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Add Admin
              </Link>
              <Link
                href="/UserActivity"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                User Activity
              </Link>
            </div>
          </div>

          {/* Orders */}
          <div className="relative group">
            <button className="w-40 h-9 rounded-xl bg-secondary text-color flex items-center justify-center gap-1 transition duration-300 ease-in-out hover:scale-105">
              Orders <ChevronDown size={16} />
            </button>
            <div className="absolute hidden group-hover:flex flex-col w-48 bg-white shadow-lg rounded-xl z-10">
              <Link
                href="/AllOrders"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                All Orders
              </Link>
              <Link
                href="/ProcessingOrders"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Processing Orders
              </Link>
              <Link
                href="/CompletedOrders"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Completed Orders
              </Link>
              <Link
                href="/AllCoupon"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Pricing & Promotions
              </Link>
              <Link
                href="/OrderStats"
                className="px-4 py-2 hover:bg-gray-200 transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Order Stats
              </Link>
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            className="bg-secondary text-color w-40 text-base hover:bg-secondary cursor-pointer transition duration-300 ease-in-out hover:scale-105"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col pb-4 bg-secondary border-t border-gray-700 relative z-50 mt-3">
          {/* Products */}
          <div>
            <button
              onClick={() => toggleDropdown("products")}
              className="w-full text-white py-2 transition flex justify-center items-center cursor-pointer"
            >
              <span className="hover:bg-secondary/50 text-color flex justify-center items-center p-2 rounded-sm">
                Products <ChevronDown size={18} className="ml-1" />
              </span>
            </button>
            {openDropdown === "products" && (
              <div className="flex flex-col bg-primary rounded-md ">
                <Link
                  href="/AddProduct"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Add Product
                </Link>
                <Link
                  href="/AllProduct"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  All Products
                </Link>
                <Link
                  href="/ProductStats"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Product Stats
                </Link>
              </div>
            )}
          </div>

          {/* Users */}
          <div>
            <button
              onClick={() => toggleDropdown("users")}
              className="w-full text-color text-jost flex items-center justify-center py-2 transition cursor-pointer"
            >
              <span className="hover:bg-secondary/50 text-color flex justify-center items-center p-2 rounded-sm">
                Users <ChevronDown size={18} className="ml-1" />
              </span>
            </button>
            {openDropdown === "users" && (
              <div className="flex flex-col bg-primary rounded-md">
                <Link
                  href="/AllUsers"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  All Users
                </Link>
                <Link
                  href="/AllAdmin"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  All Admin
                </Link>
                <Link
                  href="/AddAdmin"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Add Admin
                </Link>
                <Link
                  href="/UserActivity"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  User Activity
                </Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <div>
            <button
              onClick={() => toggleDropdown("orders")}
              className="w-full text-color flex items-center justify-center py-2 transition cursor-pointer"
            >
              <span className="hover:bg-secondary/50 text-color flex justify-center items-center p-2 rounded-sm">
                Orders <ChevronDown size={18} className="ml-1" />
              </span>
            </button>
            {openDropdown === "orders" && (
              <div className="flex flex-col bg-primary rounded-md">
                <Link
                  href="/AllOrders"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  All Orders
                </Link>
                <Link
                  href="/ProcessingOrders"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Processing Orders
                </Link>
                <Link
                  href="/CompletedOrders"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Completed Orders
                </Link>
                <Link
                  href="/AllCoupon"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Pricing & Promotions
                </Link>
                <Link
                  href="/OrderStats"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Order Stats
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
