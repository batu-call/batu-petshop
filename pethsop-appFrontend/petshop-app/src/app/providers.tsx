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
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import ScrollToTopButton from "./components/ScrollToTopButton";
import CustomerChatWidget from "./chat/page";
import { ThemeProvider } from "next-themes";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const hasCustomNavbar =
    pathname === "/AllProduct" ||
    pathname.startsWith("/category");

  const hideNavbarAndSidebar =
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password") ||
    pathname === "/Success" ||
    !pathname;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <SessionProvider>
        <CustomerChatWidget />
        <AuthProvider>
          <ScrollToTop />
          <CartProvider>
            <FavoriteProvider>
              <ConfirmProvider>
                {!hideNavbarAndSidebar && (
                  <>
                    {!hasCustomNavbar && <Navbar />}
                    <Sidebar />
                  </>
                )}

                <main
                  className={
                    !hideNavbarAndSidebar
                      ? hasCustomNavbar
                        ? "md:ml-24 lg:ml-40"
                        : "md:ml-24 lg:ml-40"
                      : ""
                  }
                >
                  {children}
                </main>
              </ConfirmProvider>
            </FavoriteProvider>
          </CartProvider>
          <ToastProvider />
          <ScrollToTopButton />
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}