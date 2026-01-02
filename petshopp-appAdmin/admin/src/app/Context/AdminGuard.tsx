"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"  ;
import { useAdminAuth } from "./AdminAuthContext";
import CircularText from "@/components/CircularText";
import Navbar from "../Navbar/page";

type Props = { children: ReactNode };

export const AdminGuard = ({ children }: Props) => {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin && pathname !== "/") {
      router.push("/");
    }
  }, [admin, loading, router, pathname]);

  if (loading) return 
  <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
  if (!admin && pathname !== "/") return null;

  return <>{children}</>;
};
