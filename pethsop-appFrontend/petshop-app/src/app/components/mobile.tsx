
"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
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
import HomeIcon from '@mui/icons-material/Home';

type Anchor = "left" | "right";

const MobileMenu = ({ anchor = "left" }: { anchor?: Anchor }) => {
  const router = useRouter();
  const { isAuthenticated, setUser, setIsAuthenticated } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Logged out successfully!");
      }
      localStorage.removeItem("UserToken");
      sessionStorage.removeItem("UserToken");
      setUser(null);
      setIsAuthenticated(false);
      router.push("/Login");
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  const menuItems = [
    { text: "Home", href: "/main", icon: <HomeIcon sx={{ color: "#A8D1B5" }} /> },
    ...(isAuthenticated
      ? [
          { text: "Profile", href: "/my-profile", icon: <AccountCircleIcon sx={{ color: "#A8D1B5" }} /> },
          { text: "Settings", href: "/settings", icon: <SettingsIcon sx={{ color: "#A8D1B5" }} /> },
          { text: "Orders", href: "/orders", icon: <ReceiptIcon sx={{ color: "#A8D1B5" }} /> },
          { text: "Billing", href: "/billing", icon: <CreditCardIcon sx={{ color: "#A8D1B5" }} /> },
        ]
      : []
    ),
  ];

  const drawerList = (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      className="w-[250px] bg-white h-full"
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} className="w-full">
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ className: "text-color font-bold" }}/>
              </ListItemButton>
            </Link>
          </ListItem>
        ))}

        <ListItem disablePadding>
          {isAuthenticated ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: "#FF6347" }} />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ className: "text-[#FF6347] font-bold" }} />
            </ListItemButton>
          ) : (
            <Link href="/Login" className="w-full">
              <ListItemButton>
                <ListItemIcon>
                  <LoginIcon sx={{ color: "#32CD32" }} />
                </ListItemIcon>
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
      <IconButton
        onClick={toggleDrawer(true)}
        aria-label="menu"
        sx={{
          color: 'black',
          p: 0.5,
        }}
      >
        <MenuIcon fontSize="large" className="w-8 h-8 lg:hidden text-color font-bold" />
      </IconButton>
      
      <Drawer
        anchor={anchor}
        open={open}
        onClose={toggleDrawer(false)}
      >
        {drawerList}
      </Drawer>
    </>
  );
};

export default MobileMenu;