"use client";
import { AuthProvider } from "./context/authContext";
import { CartProvider } from "./context/cartContext";
import { FavoriteProvider } from "./context/favoriteContext";
import { ConfirmProvider } from "./context/confirmContext";
import ToastProvider from "@/components/ToastProvider";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages that have their own Navbar component with filters
  const hasCustomNavbar =
    pathname === "/AllProduct" ||
    pathname.startsWith("/category");

  // Pages that don't need navbar or sidebar at all
  const hideNavbarAndSidebar =
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password") ||
    pathname === "/Success"

  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
            <ConfirmProvider>
              {!hideNavbarAndSidebar && (
                <>
                  {/* Show default Navbar only if page doesn't have custom navbar */}
                  {!hasCustomNavbar && <Navbar />}
                  
                  <Sidebar />
                </>
              )}

              <main
                className={
                  !hideNavbarAndSidebar
                    ? hasCustomNavbar
                      ? "md:ml-24 lg:ml-40" 
                      : "md:ml-24 lg:ml-40 pt-14 lg:pt-0"
                    : ""
                }
              >
                {children}
              </main>
            </ConfirmProvider>
          </FavoriteProvider>
        </CartProvider>
        <ToastProvider />
      </AuthProvider>
    </SessionProvider>
  );
}