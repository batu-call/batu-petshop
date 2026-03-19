"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HomeIcon from "@mui/icons-material/Home";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { useAdminAuth } from "../Context/AdminAuthContext";

type Anchor = "left" | "right";

interface CategoryItem {
  text: string;
  href: string;
  imgSrc: string;
  subCategories: string[];
}

interface MenuItem {
  text: string;
  href: string;
  icon?: React.ReactNode;
  scrollTop?: boolean;
}

const MobileMenu = ({ anchor = "left" }: { anchor?: Anchor }) => {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();
  const isAuthenticated = !!admin;
  const [open, setOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);

  const ic = "#A8D1B5";

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    if (!newOpen) setOpenCat(null);
  };

  const handleNavigate = (href: string, scrollTop?: boolean) => {
    setOpen(false);
    setOpenCat(null);
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin logged out!");
      router.push("/Admin-login");
      setOpen(false);
    } catch {
      toast.error("Logout failed!");
    }
  };

  const general: MenuItem[] = [
    { text: "Home",    href: "/main",    icon: <HomeIcon        sx={{ color: ic }} />, scrollTop: true },
    { text: "Contact", href: "/Contact", icon: <ContactMailIcon sx={{ color: ic }} /> },
  ];

  const adminMenu: MenuItem[] = isAuthenticated
    ? [
        { text: "Add Admin",            href: "/add-admin",          icon: <AccountCircleIcon sx={{ color: ic }} /> },
        { text: "Notifications",        href: "/Notifications",      icon: <NotificationsIcon sx={{ color: ic }} /> },
        { text: "Pricing & Promotions", href: "/Pricing-promotions", icon: <LocalOfferIcon    sx={{ color: ic }} /> },
        { text: "Shipping & Returns", href: "/ShippingContent", icon: <LocalShippingIcon    sx={{ color: ic }} /> },
        { text: "Product Stats",        href: "/ProductStats",       icon: <BarChartIcon      sx={{ color: ic }} /> },
        { text: "User Activity",        href: "/UserActivity",       icon: <PeopleAltIcon     sx={{ color: ic }} /> },
        { text: "Order Stats",          href: "/OrderStats",         icon: <ShoppingCartIcon  sx={{ color: ic }} /> },
      ]
    : [];

  const categories: CategoryItem[] = [
    { text: "Cat",     href: "/category/Cat",     imgSrc: "/cat_7721779.png", subCategories: ["Food", "Bed", "Toy", "Litter", "Accessory"] },
    { text: "Dog",     href: "/category/Dog",     imgSrc: "/dog.png",         subCategories: ["Food", "Bed", "Toy", "Leash", "Accessory"] },
    { text: "Bird",    href: "/category/Bird",    imgSrc: "/bird.png",        subCategories: ["Food", "Cage", "Toy", "Accessory"] },
    { text: "Fish",    href: "/category/Fish",    imgSrc: "/fish.png",        subCategories: ["Food", "Tank", "Filter", "Decoration"] },
    { text: "Reptile", href: "/category/Reptile", imgSrc: "/reptile.png",     subCategories: ["Food", "Habitat", "Lighting", "Accessory"] },
    { text: "Rabbit",  href: "/category/Rabbit",  imgSrc: "/rabbit2.png",     subCategories: ["Food", "Cage", "Toy", "Accessory"] },
    { text: "Horse",   href: "/category/Horse",   imgSrc: "/Horse.png",       subCategories: ["Food", "Saddle", "Care", "Accessory"] },
  ];

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 pt-4 pb-1 flex items-center gap-2">
      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 dark:text-[#7aab8a]">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
    </div>
  );

  const drawerList = (
    <div
      role="presentation"
      className="w-[270px] bg-white dark:bg-[#0f2d1c] h-screen overflow-y-auto flex flex-col"
    >
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/10">
        <p className="text-xs text-gray-400 dark:text-[#7aab8a]">Batu Petshop</p>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Admin Menu</h2>
      </div>

      <SectionLabel label="General" />
      <List disablePadding className="px-2">
        {general.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{ borderRadius: "12px", mb: "2px" }}
              onClick={() => handleNavigate(item.href, item.scrollTop)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ className: "font-semibold text-gray-700 dark:!text-white text-sm" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <SectionLabel label="Categories" />
      <div className="px-2 flex flex-col gap-1">
        {categories.map((cat) => {
          const isOpenCat = openCat === cat.text;

          return (
            <div key={cat.text} className="rounded-2xl overflow-hidden">
              <div
                className={`flex items-center rounded-2xl transition-all duration-200 ${
                  isOpenCat
                    ? "bg-[#DDEEDD] dark:bg-[#0b8457]"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => handleNavigate(cat.href, true)}
                  className="flex-1 flex items-center gap-3 px-3 py-[10px] cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpenCat ? "bg-white/50 dark:bg-white" : "bg-[#f0f9f4] dark:bg-[#97cba9]"
                    }`}
                  >
                    <Image src={cat.imgSrc} alt={cat.text} width={24} height={24} className="object-contain" />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isOpenCat ? "text-[#0b6e45] dark:text-white" : "text-gray-700 dark:text-white/80"
                    }`}
                  >
                    {cat.text}
                  </span>
                </button>

                <button
                  onClick={() => setOpenCat(isOpenCat ? null : cat.text)}
                  className="px-4 py-[10px] cursor-pointer"
                >
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${
                      isOpenCat ? "rotate-180 text-[#0b6e45] dark:text-white" : "text-gray-300 dark:text-white/30"
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpenCat ? `${cat.subCategories.length * 44 + 16}px` : "0px" }}
              >
                <div className="px-3 pt-2 pb-3 flex flex-wrap gap-[6px]">
                  {cat.subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleNavigate(`${cat.href}?sub=${sub}`, true)}
                      className="px-3 py-[7px] rounded-xl text-xs font-bold cursor-pointer bg-[#0b8457] text-white hover:bg-[#096e47] active:scale-95 transition-all duration-150 shadow-sm"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {adminMenu.length > 0 && (
        <>
          <SectionLabel label="Admin Panel" />
          <List disablePadding className="px-2">
            {adminMenu.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  sx={{ borderRadius: "12px", mb: "2px" }}
                  onClick={() => handleNavigate(item.href)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ className: "font-semibold text-gray-700 dark:!text-white text-sm" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      <div className="mt-auto px-2 pb-5 pt-3 border-t border-gray-100 dark:border-white/10">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 group"
          >
            <LogoutIcon sx={{ color: "#FF6347", fontSize: 20 }} />
            <span className="text-sm font-semibold text-red-500 group-hover:text-red-600">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => handleNavigate("/Admin-login")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#f0f9f4] dark:bg-[#1a3d2a] hover:bg-[#DDEEDD] dark:hover:bg-[#0b8457] transition-all duration-200 group cursor-pointer"
          >
            <LoginIcon sx={{ color: "#97cba9", fontSize: 20 }} />
            <span className="text-sm font-semibold text-[#2d7a52] dark:text-[#a8d4b8] group-hover:text-[#0b6e45] dark:group-hover:text-white">
              Admin Login
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <IconButton onClick={toggleDrawer(true)} aria-label="menu" sx={{ p: 0.5 }}>
        <MenuIcon fontSize="large" className="w-8 h-8 lg:hidden text-color dark:text-foreground" />
      </IconButton>

      <Drawer
        anchor={anchor}
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: { backgroundColor: "transparent" } }}
      >
        {drawerList}
      </Drawer>
    </>
  );
};

export default MobileMenu;