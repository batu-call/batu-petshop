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
import SettingsIcon from "@mui/icons-material/Settings";
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

const MobileMenu = ({ anchor = "left" }: { anchor?: Anchor }) => {
  const router = useRouter();
  const { admin, logout } = useAdminAuth(); 
  const isAuthenticated = !!admin;

  const [open, setOpen] = useState(false);
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
    { text: "Home", href: "/main", icon: <HomeIcon sx={{ color: "#A8D1B5" }} /> },
    { text: "Contact", href: "/Contact", icon: <ContactMailIcon sx={{ color: "#A8D1B5" }} /> }
  ];

  const adminMenu: MenuItem[] = isAuthenticated
    ? [
        { text: "Product Stats", href: "/ProductStats", icon: <AccountCircleIcon sx={{ color: "#A8D1B5" }} /> },
        { text: "User Activity", href: "/UserActivity", icon: <AccountCircleIcon sx={{ color: "#A8D1B5" }} /> },
        { text: "Order Stats", href: "/OrderStats", icon: <AccountCircleIcon sx={{ color: "#A8D1B5" }} /> },
      ]
    : [];

    const categories: MenuItem[] = [
    { text: "Cat", href: "/category/Cat", imgSrc: "/cat_7721779.png" },
    { text: "Dog", href: "/category/Dog", imgSrc: "/dog.png" },
    { text: "Bird", href: "/category/Bird", imgSrc: "/bird.png" },
    { text: "Fish", href: "/category/Fish", imgSrc: "/fish.png" },
    { text: "Reptile", href: "/category/Reptile", imgSrc: "/reptile.png" },
    { text: "Rabbit", href: "/category/Rabbit", imgSrc: "/rabbit2.png" },
    { text: "Horse", href: "/category/Horse", imgSrc: "/Horse.png" },
  ];

  const renderIconOrImage = (item: MenuItem) => {
    if (item.imgSrc) {
      return <Image src={item.imgSrc} alt={item.text} width={24} height={24} className="mr-3 rounded-full" />;
    }
    return item.icon ? <span className="mr-3">{item.icon}</span> : null;
  };

  const drawerList = (
    <div role="presentation" onClick={toggleDrawer(false)} className="w-[250px] bg-white h-full">

      {/* GENERAL */}
      <List>
        <div className="px-4 py-2 font-bold text-gray-500 uppercase text-sm">General</div>
        {general.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} className="w-full">
              <ListItemButton>
                <ListItemIcon>{renderIconOrImage(item)}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      <List>
        <div className="px-4 py-2 font-bold text-gray-500 uppercase">Categories</div>
        {categories.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} className="w-full">
              <ListItemButton>
                <ListItemIcon>{renderIconOrImage(item)}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ className: "text-color font-bold" }} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      {/* ADMIN MENU */}
      {adminMenu.length > 0 && (
        <List className="mt-4">
          <div className="px-4 py-2 font-bold text-gray-500 uppercase text-sm">Admin Panel</div>
          {adminMenu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Link href={item.href} className="w-full">
                <ListItemButton>
                  <ListItemIcon>{renderIconOrImage(item)}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      )}

      {/* LOGIN / LOGOUT */}
      <List className="mt-4">
        <ListItem disablePadding>
          {isAuthenticated ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon sx={{ color: "#FF6347" }} /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ className: "text-[#FF6347] font-bold" }} />
            </ListItemButton>
          ) : (
            <Link href="/Admin-login" className="w-full">
              <ListItemButton>
                <ListItemIcon><LoginIcon sx={{ color: "#32CD32" }} /></ListItemIcon>
                <ListItemText primary="Admin Login" primaryTypographyProps={{ className: "text-[#32CD32] font-bold" }} />
              </ListItemButton>
            </Link>
          )}
        </ListItem>
      </List>

    </div>
  );

  return (
    <>
      <IconButton onClick={toggleDrawer(true)} aria-label="menu" sx={{ color: "blue", p: 0.5 }}>
        <MenuIcon fontSize="large" className="w-8 h-8 lg:hidden text-color font-bold" />
      </IconButton>

      <Drawer anchor={anchor} open={open} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>
    </>
  );
};

export default MobileMenu;
