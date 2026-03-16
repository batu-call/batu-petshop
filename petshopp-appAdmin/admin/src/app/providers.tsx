"use client";

import { AdminAuthProvider } from "./Context/AdminAuthContext";
import { AdminGuard } from "./Context/AdminGuard";
import { ConfirmProvider } from "./Context/confirmContext";
import Navbar from "./Navbar/page";
import Sidebar from "./Sidebar/page";
import { usePathname } from "next/navigation";
import ToastProvider from "@/components/ui/ToastProvider";
import { useEffect } from "react";
import AdminChatWidget from "./chat/page";

import { ThemeProvider } from "next-themes";
import ScrollToTopButton from "./components/ScrollToTopButton";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
 useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [pathname]);

  const isLoginPage = pathname === "/";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <AdminAuthProvider>
        <AdminGuard>
          <ConfirmProvider>
            {!isLoginPage && (
              <>
                <Navbar />
                <Sidebar />
              </>
            )}
            <main className={!isLoginPage ? "md:ml-24 lg:ml-40 pt-14 lg:pt-0" : ""}>
              {children}
            </main>
            {!isLoginPage && (
              <>
                <AdminChatWidget />
                <ScrollToTopButton />
              </>
            )}
          </ConfirmProvider>
        </AdminGuard>
        <ToastProvider />
      </AdminAuthProvider>
    </ThemeProvider>
  );
}