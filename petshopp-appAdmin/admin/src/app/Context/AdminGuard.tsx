"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"  ;
import { useAdminAuth } from "./AdminAuthContext";
import CircularText from "@/components/CircularText";

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

  if (loading) return <div className="absolute top-90 left-220">
  <CircularText
  text="LOADING"
  onHover="speedUp"
  spinDuration={20}
  className="custom-class"
/>
  </div>;
  if (!admin && pathname !== "/") return null;

  return <>{children}</>;
};
