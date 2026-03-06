"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "./AdminAuthContext";
import CircularText from "@/components/CircularText";

type Props = { children: ReactNode };

export const AdminGuard = ({ children }: Props) => {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.push("/");
    }
  }, [admin, loading, router, isLoginPage]);

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-primary z-50">
      <CircularText
        text="LOADING"
        spinDuration={20}
        className="text-white text-4xl"
      />
    </div>
  );

  if (!admin && !isLoginPage) return null;

  return <>{children}</>;
};