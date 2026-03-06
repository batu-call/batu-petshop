"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
  DropdownLabel,
} from "@/app/components/dropdown/index";
import { AuthContext } from "@/app/context/authContext";
import { CartContext } from "@/app/context/cartContext";
import { FavoriteContext } from "@/app/context/favoriteContext";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type Props = {
  handleLogout: () => void;
};

const NavbarUserActions = ({ handleLogout }: Props) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { totalFavorites } = useContext(FavoriteContext);

  return (
    <>
      <ThemeToggle />

      {/* Cart Icon */}
      <div className="relative">
        <Link href="/Cart">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 flex items-center justify-center transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]">
            <ShoppingCartIcon
              className="text-color dark:text-white"
              sx={{ fontSize: { xs: 20, sm: 26, md: 28, lg: 32 } }}
            />
            {cart.length > 0 && (
              <div
                className="absolute -top-2 -right-2 w-4 h-4 lg:w-5 lg:h-5 rounded-full
                bg-white dark:bg-[#c8e6d0]
                text-color dark:text-[#162820]
                text-xs font-bold
                flex items-center justify-center
                border border-gray-200 dark:border-transparent
                shadow-sm"
              >
                {cart.length}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Avatar / Login */}
      <div className="mr-2 lg:mr-3">
        {loading ? (
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gray-200 dark:bg-[#2d5a3d] animate-pulse" />
        ) : isAuthenticated ? (
          <Dropdown>
            <DropdownButton>
              <div className="relative mt-1 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-9 lg:h-9 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] z-[200]">
                <Image
                  src={user?.avatar || "/default-avatar.png"}
                  alt="user avatar"
                  fill
                  sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, (max-width: 1024px) 36px, 40px"
                  className="object-cover rounded-full border-2 border-white/40 dark:border-[#2d5a3d]"
                />
                {totalFavorites > 0 && (
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full
                    bg-[#57B394] dark:bg-[#c8e6d0]
                    border-2 border-white dark:border-[#162820]
                    shadow-sm"
                  />
                )}
              </div>
            </DropdownButton>

            <div className="z-[200]">
              <DropdownMenu>
                <DropdownLabel>My Account</DropdownLabel>

                <DropdownItem href="/my-profile">
                  <AccountCircleIcon sx={{ color: "#A8D1B5", mr: 1 }} />
                  Profile
                </DropdownItem>

                <DropdownItem href="/favorite" className="flex items-center gap-2">
                  <FavoriteBorderIcon sx={{ color: "#A8D1B5" }} />
                  <span>Favorite</span>
                  <span className="text-xs font-bold bg-secondary text-color px-2 py-0.5 rounded-xl">
                    {totalFavorites}
                  </span>
                </DropdownItem>

                <DropdownItem href="/my-orders">
                  <ReceiptIcon sx={{ color: "#A8D1B5", mr: 1 }} />
                  Orders
                </DropdownItem>

                <DropdownItem href="/settings">
                  <SettingsIcon sx={{ color: "#A8D1B5", mr: 1 }} />
                  Settings
                </DropdownItem>

                <DropdownItem onClick={handleLogout} href="#">
                  <LogoutIcon sx={{ color: "#A8D1B5", mr: 1 }} />
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </div>
          </Dropdown>
        ) : (
          <div className="flex items-center justify-center">
            <Link href="/Login">
              <Button className="cursor-pointer bg-secondary dark:bg-[#1e3d2a] text-color dark:text-[#c8e6d0] w-24 lg:w-32 text-base hover:bg-secondary dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default NavbarUserActions;