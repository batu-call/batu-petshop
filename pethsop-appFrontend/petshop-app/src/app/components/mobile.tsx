"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthContext } from "../context/authContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

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
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import HomeIcon from "@mui/icons-material/Home";

type Anchor = "left" | "right";

interface MenuItem {
  text: string;
  href: string;
  icon?: React.ReactNode;
  imgSrc?: string;
}

const MobileMenu = ({ anchor = "left" }: { anchor?: Anchor }) => {
  const router = useRouter();
  const { isAuthenticated, setUser, setIsAuthenticated } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully!");
      localStorage.removeItem("UserToken");
      sessionStorage.removeItem("UserToken");
      setUser(null);
      setIsAuthenticated(false);
      router.push("/Login");
      setOpen(false);
    } catch {
      toast.error("Logout failed");
    }
  };

  const categories: MenuItem[] = [
    { text: "Cat", href: "/Cat", imgSrc: "/cat_7721779.png" },
    { text: "Dog", href: "/Dog", imgSrc: "/dog.png" },
    { text: "Bird", href: "/Bird", imgSrc: "/bird.png" },
    { text: "Fish", href: "/Fish", imgSrc: "/fish.png" },
    { text: "Reptile", href: "/Reptile", imgSrc: "/reptile.png" },
    { text: "Rabbit", href: "/Rabbit", imgSrc: "/rabbit2.png" },
    { text: "Horse", href: "/Horse", imgSrc: "/Horse.png" },
  ];

  const accountItems: MenuItem[] = isAuthenticated
    ? [
      { text: "Home", href: "/main", icon: <HomeIcon sx={{ color: "#A8D1B5" }} /> },
        { text: "Profile", href: "/my-profile", icon: <AccountCircleIcon sx={{ color: "#A8D1B5" }} /> },
        { text: "Settings", href: "/settings", icon: <SettingsIcon sx={{ color: "#A8D1B5" }} /> },
        { text: "Orders", href: "/orders", icon: <ReceiptIcon sx={{ color: "#A8D1B5" }} />, },
        { text: "Billing", href: "/billing", icon: <CreditCardIcon sx={{ color: "#A8D1B5" }} /> },
      ]
    : [];

  const renderIconOrImage = (item: MenuItem) => {
    if (item.imgSrc) {
      return <Image src={item.imgSrc} alt={item.text} width={24} height={24} className="mr-3 rounded-full" />;
    }
    return item.icon ? <span className="mr-3">{item.icon}</span> : null;
  };

  const drawerList = (
    <div role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)} className="w-[250px] bg-white h-full">
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

      {accountItems.length > 0 && (
        <List className="mt-4">
          <div className="px-4 py-2 font-bold text-gray-500 uppercase">My Account</div>
          {accountItems.map((item) => (
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
      )}

      <List className="mt-4">
        <ListItem disablePadding>
          {isAuthenticated ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon sx={{ color: "#FF6347" }} /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ className: "text-[#FF6347] font-bold" }} />
            </ListItemButton>
          ) : (
            <Link href="/Login" className="w-full">
              <ListItemButton>
                <ListItemIcon><LoginIcon sx={{ color: "#32CD32" }} /></ListItemIcon>
                <ListItemText primary="Login" primaryTypographyProps={{ className: "text-[#32CD32] font-bold" }} />
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
