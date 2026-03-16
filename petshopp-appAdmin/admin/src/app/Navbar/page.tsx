"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Bell } from "lucide-react";
import MobileMenu from "../components/mobile";
import { useAdminAuth } from "../Context/AdminAuthContext";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
  DropdownLabel,
} from "@/app/components/dropdown/index";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { setAdmin, admin } = useAdminAuth();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const pageTitle = () => {
    const staticTitles: Record<string, string> = {
      "/": "Dashboard",
      "/AddProduct": "Add Product",
      "/AllProduct": "All Products",
      "/AllUsers": "All Users",
      "/AllAdmin": "All Admins",
      "/AddAdmin": "Add Admin",
      "/AllOrders": "All Orders",
      "/AllCoupon": "Pricing & Promotions",
      "/Contact": "Admin Contact",
    };

    if (staticTitles[pathname]) return staticTitles[pathname];

    if (pathname.startsWith("/category/Cat")) return "Cat Products";
    if (pathname.startsWith("/category/Dog")) return "Dog Products";
    if (pathname.startsWith("/category/Bird")) return "Bird Products";
    if (pathname.startsWith("/category/Fish")) return "Fish Products";
    if (pathname.startsWith("/category/Reptile")) return "Reptile Products";
    if (pathname.startsWith("/category/Rabbit")) return "Rabbit Products";
    if (pathname.startsWith("/category/Horse")) return "Horse Products";

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
        { label: "User Activity", href: "/UserActivity" },
      ],
    },
    {
      key: "orders",
      label: "Orders",
      items: [
        { label: "All Orders", href: "/AllOrders" },
        { label: "Order Management", href: "/OrderManagement" },
        { label: "Order Stats", href: "/OrderStats" },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/logout`,
        { withCredentials: true },
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

  const handleMouseEnter = (key: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const cancelClose = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <div className="md:ml-24 lg:ml-40 h-14 sm:h-14 lg:h-18 bg-primary dark:bg-[#1e3d2a] shadow-md lg:relative fixed w-full md:w-[calc(100%-6rem)] lg:w-[calc(100%-10rem)] z-30 opacity-95">
      <div className="flex items-center justify-between h-14 sm:h-14 lg:h-18 px-2 md:px-4">
        {/* Left — hamburger + page title */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <MobileMenu anchor="left" />
          </div>
          <div className="hidden md:flex items-center">
            <h1 className="text-xl font-bold text-white dark:text-[#c8e6d0]">
              {pageTitle()}
            </h1>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          {/* Tablet toggle */}
          <div
            className="lg:hidden text-color rounded-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Button className="bg-secondary dark:bg-[#2d5a3d] hover:bg-secondary cursor-pointer flex items-center justify-between text-color dark:text-[#c8e6d0] w-36 rounded-xl">
              {menuOpen ? (
                <div className="flex gap-3 items-center w-full">
                  <span className="flex-1">Admin Panel</span>
                  <ChevronUp size={16} />
                </div>
              ) : (
                <div className="flex gap-3 items-center w-full">
                  <span className="flex-1">Admin Panel</span>
                  <ChevronDown size={16} />
                </div>
              )}
            </Button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex gap-4 items-center mr-2">
            {NavbarMenu.map((menu) => {
              const isOpen = openDropdown === menu.key;
              return (
                <div
                  key={menu.key}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(menu.key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => toggleDropdown(menu.key)}
                    className="w-40 h-9 rounded-xl bg-secondary dark:bg-[#2d5a3d] text-color dark:text-[#c8e6d0] flex items-center justify-center gap-2 transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97]"
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className="absolute top-full pt-1 flex flex-col w-48 z-[110]"
                      onMouseEnter={cancelClose}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white dark:bg-[#162820] shadow-lg rounded-xl overflow-hidden border dark:border-[#2d5a3d]">
                        {menu.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#1e3d2a] dark:text-[#c8e6d0] border-b last:border-b-0 border-secondary dark:border-[#2d5a3d] transition duration-200 hover:scale-[1.02] active:scale-[0.97] block"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dark mode toggle */}
          <ThemeToggle />

          {/* Admin avatar dropdown */}
          <Dropdown>
            <DropdownButton>
              <div className="relative mt-1 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]">
                {admin?.avatar ? (
                  <Image
                    src={admin.avatar}
                    alt="admin avatar"
                    fill
                    sizes="(max-width: 640px) 32px, (max-width: 1024px) 36px, 40px"
                    className="object-cover rounded-full border-2 border-white/40 dark:border-[#2d5a3d]"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border-2 border-white/40 dark:border-[#2d5a3d] bg-secondary dark:bg-[#2d5a3d] flex items-center justify-center">
                    <span className="text-xs font-bold text-color dark:text-[#c8e6d0]">
                      {admin?.firstName?.[0]?.toUpperCase() ?? "A"}
                    </span>
                  </div>
                )}
              </div>
            </DropdownButton>
            <div className="z-[200]">
              <DropdownMenu>
                <DropdownLabel>
                  <span className="text-sm font-bold text-color dark:text-[#c8e6d0]">
                    {`${admin?.firstName ?? ""} ${admin?.lastName ?? ""}`.trim() ||
                      "Admin"}
                  </span>
                </DropdownLabel>
                <DropdownItem href="/AddAdmin">
                  <PersonAddIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Add Admin
                </DropdownItem>
                <DropdownItem href="/Notifications">
                  <NotificationsIcon sx={{ color: "#A8D1B5", mr: 1 }} />{" "}
                  Notifications
                </DropdownItem>
                <DropdownItem href="/Pricing-promotions">
                  <LocalOfferIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Pricing &
                  Promotions
                </DropdownItem>
                <DropdownItem onClick={handleLogout} href="#">
                  <LogoutIcon sx={{ color: "#A8D1B5", mr: 1 }} /> Logout
                </DropdownItem>
              </DropdownMenu>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-40 lg:hidden"
          onClick={() => {
            setMenuOpen(false);
            setOpenDropdown(null);
          }}
        />
      )}

      {/* Mobile/Tablet dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 flex flex-col pb-1 border-t border-gray-700 bg-primary dark:bg-[#1e3d2a] z-50 pointer-events-auto">
          {NavbarMenu.map((menu) => {
            const isOpen = openDropdown === menu.key;
            return (
              <div
                key={menu.key}
                className="border border-secondary dark:border-[#2d5a3d] rounded-md overflow-hidden md:ml-24"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(menu.key);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-color dark:text-[#c8e6d0] bg-primary dark:bg-[#1e3d2a] transition"
                >
                  <span className="font-medium">{menu.label}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-col bg-secondary dark:bg-[#162820]">
                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-6 py-3 text-sm text-color dark:text-[#a8d4b8] border-t border-secondary dark:border-[#2d5a3d] transition hover:bg-primary/10 dark:hover:bg-[#1e3d2a]"
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