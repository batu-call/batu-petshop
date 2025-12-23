"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import MobileMenu from "../components/mobile";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/admin/logout",
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Logged out successfully!");
      }
      sessionStorage.removeItem("adminToken");
      localStorage.removeItem("adminToken");
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
    <div className="w-full h-30 bg-primary shadow-md relative">
      {/* Top Navbar */}
      <div>
        <div className="absolute top-3 md:hidden">
          <MobileMenu anchor="left" />
        </div>
        {/* Logo */}
        <Link href="/main" className="fixed">
          <Image
            src="/logo.png"
            alt="main-icon"
            width={500}
            height={500}
            className="hidden md:flex justify-center items-center w-40 h-40"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Me */}
        <h2 className="ml-40 absolute top-0 color-white opacity-20 hidden md:flex">
          This website is a portfolio project created for demonstration purposes
          only. All products shown are fictitious and not for sale. Designed and
          developed by Batuhan Callioglu.
        </h2>

        {/* Hamburger (Mobile) */}
        <div
          className="sm:hidden cursor-pointer ml-30"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <div className="flex">
              <span className="flex">Admin Panel <ChevronDown/> </span>
            </div>
          ) : (
            <div className="flex">
              <span className="flex">Admin Panel <ChevronDown/> </span>
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex md:flex gap-8 justify-center mb-12 mr-4 p-2 absolute  top-10 right-15">
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
                href="/UserActivity"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                User Activity
              </Link>
                <Link
                href="/AllAdmin"
                className="px-4 py-2 hover:bg-gray-200 border-b border-secondary transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                All Admin
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 hover:bg-gray-200 transition duration-300 ease-in-out hover:scale-105 rounded-xl"
              >
                Add Admin
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
                Discount Code
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
        <div className="sm:hidden flex flex-col gap-2 pb-4 bg-secondary border-t border-gray-700 relative z-50">
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
              <div className="flex flex-col bg-primary rounded-md mx-4">
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
                  href="/"
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
              <div className="flex flex-col bg-primary rounded-md mx-4">
                <Link
                  href="/AllUsers"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  All Users
                </Link>
                <Link
                  href="/"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  User Activity
                </Link>
                <Link
                  href="/register"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Add Admin
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
              <div className="flex flex-col bg-primary rounded-md mx-4">
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
                  href="/OrderStats"
                  className="text-color px-4 py-2 hover:bg-secondary/50 border border-secondary"
                >
                  Order Stats
                </Link>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="flex justify-center mt-2">
            <Button
              onClick={handleLogout}
              className="bg-secondary text-color w-40 text-base hover:bg-secondary"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
