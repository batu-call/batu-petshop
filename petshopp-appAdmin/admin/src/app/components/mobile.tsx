"use client";
import React, { useState } from "react";
import Link from "next/link";
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
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HomeIcon from "@mui/icons-material/Home";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { useAdminAuth } from "../Context/AdminAuthContext";

type Anchor = "left" | "right";

interface MenuItem {
  text: string;
  href: string;
  icon?: React.ReactNode;
  imgSrc?: string;
}

const ICON_COLOR = "#97cba9";
const ICON_COLOR_DARK = "#7aab8a";

const getIconColor = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    ? ICON_COLOR_DARK
    : ICON_COLOR;

const MobileMenu = ({ anchor = "left" }: { anchor?: Anchor }) => {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();
  const isAuthenticated = !!admin;
  const [open, setOpen] = useState(false);

  const ic = getIconColor();

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

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
    { text: "Home",    href: "/main",    icon: <HomeIcon        sx={{ color: ic }} /> },
    { text: "Contact", href: "/Contact", icon: <ContactMailIcon sx={{ color: ic }} /> },
  ];

  // Each item now has a distinct, meaningful icon
  const adminMenu: MenuItem[] = isAuthenticated
    ? [
        {
          text: "Add Admin",
          href: "/add-admin",
          icon: <AccountCircleIcon sx={{ color: ic }} />,
        },
        {
          text: "Notifications",
          href: "/Notifications",
          icon: <NotificationsIcon sx={{ color: ic }} />,
        },
        {
          text: "Pricing & Promotions",
          href: "/Pricing-promotions",
          icon: <LocalOfferIcon sx={{ color: ic }} />,
        },
        {
          text: "Product Stats",
          href: "/ProductStats",
          icon: <BarChartIcon sx={{ color: ic }} />,
        },
        {
          text: "User Activity",
          href: "/UserActivity",
          icon: <PeopleAltIcon sx={{ color: ic }} />,
        },
        {
          text: "Order Stats",
          href: "/OrderStats",
          icon: <ShoppingCartIcon sx={{ color: ic }} />,
        },
      ]
    : [];

  const categories: MenuItem[] = [
    { text: "Cat",     href: "/category/Cat",     imgSrc: "/cat_7721779.png" },
    { text: "Dog",     href: "/category/Dog",     imgSrc: "/dog.png" },
    { text: "Bird",    href: "/category/Bird",    imgSrc: "/bird.png" },
    { text: "Fish",    href: "/category/Fish",    imgSrc: "/fish.png" },
    { text: "Reptile", href: "/category/Reptile", imgSrc: "/reptile.png" },
    { text: "Rabbit",  href: "/category/Rabbit",  imgSrc: "/rabbit2.png" },
    { text: "Horse",   href: "/category/Horse",   imgSrc: "/Horse.png" },
  ];

  const renderIconOrImage = (item: MenuItem) => {
    if (item.imgSrc) {
      return (
        <Image
          src={item.imgSrc}
          alt={item.text}
          width={32}
          height={32}
          className="mr-3 rounded-full p-1 dark:bg-[#7aab8a]!"
        />
      );
    }
    return item.icon ? <span className="mr-3">{item.icon}</span> : null;
  };

  const sectionLabel = "px-4 py-2 font-bold text-gray-400 dark:text-muted-foreground uppercase text-xs tracking-widest";
  const itemText     = "text-[#393E46] dark:text-foreground font-bold";

  const drawerList = (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      className="w-[260px] bg-white dark:bg-card h-screen flex flex-col overflow-y-auto"
    >
      {/* ── General ── */}
      <List>
        <div className={sectionLabel}>General</div>
        {general.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} className="w-full">
              <ListItemButton sx={{ "&:hover": { backgroundColor: "rgba(151,203,169,0.12)" } }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{renderIconOrImage(item)}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ className: itemText }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      {/* ── Categories ── */}
      <List>
        <div className={sectionLabel}>Categories</div>
        {categories.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} className="w-full">
              <ListItemButton sx={{ "&:hover": { backgroundColor: "rgba(151,203,169,0.12)" } }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{renderIconOrImage(item)}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ className: itemText }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      {/* ── Admin Panel ── */}
      {adminMenu.length > 0 && (
        <List>
          <div className={sectionLabel}>Admin Panel</div>
          {adminMenu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Link href={item.href} className="w-full">
                <ListItemButton sx={{ "&:hover": { backgroundColor: "rgba(151,203,169,0.12)" } }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>{renderIconOrImage(item)}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ className: itemText }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      )}

      {/* ── Login / Logout ── */}
      <List className="mt-auto border-t border-gray-100 dark:border-border">
        <ListItem disablePadding>
          {isAuthenticated ? (
            <ListItemButton
              onClick={handleLogout}
              sx={{ "&:hover": { backgroundColor: "rgba(255,99,71,0.08)" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon sx={{ color: "#FF6347" }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ className: "text-[#FF6347] font-bold" }}
              />
            </ListItemButton>
          ) : (
            <Link href="/Admin-login" className="w-full">
              <ListItemButton sx={{ "&:hover": { backgroundColor: "rgba(50,205,50,0.08)" } }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LoginIcon sx={{ color: "#97cba9" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Login"
                  primaryTypographyProps={{ className: "text-[#32CD32] font-bold" }}
                />
              </ListItemButton>
            </Link>
          )}
        </ListItem>
      </List>
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
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {drawerList}
      </Drawer>
    </>
  );
};

export default MobileMenu;