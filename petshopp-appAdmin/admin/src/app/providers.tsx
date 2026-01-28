"use client";

import { AdminAuthProvider } from "./Context/AdminAuthContext";
import { AdminGuard } from "./Context/AdminGuard";
import { ConfirmProvider } from "./Context/confirmContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar/page";
import Sidebar from "./Sidebar/page";
import { usePathname } from "next/navigation";
import ToastProvider from "@/components/ui/ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/";

  return (
    <AdminAuthProvider>
      <AdminGuard>
        <ConfirmProvider>
          {!isLoginPage && (
            <>
              <Navbar />
              <Sidebar />
            </>
          )}
          <main
            className={!isLoginPage ? "md:ml-24 lg:ml-40 pt-14 lg:pt-0" : ""}
          >
            {children}
          </main>
        </ConfirmProvider>
      </AdminGuard>
      <ToastProvider />
    </AdminAuthProvider>
  );
}
