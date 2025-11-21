"use client";
import { ReactNode, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import CircularText from "@/components/CircularText";
import { AuthContext } from "./authContext";

type Props = { children: ReactNode; requireAuth?: boolean };

export const UserGuard = ({ children, requireAuth = true }: Props) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push("/");
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-primary z-50">
        <CircularText
          text="LOADING"
          onHover="speedUp"
          spinDuration={20}
          className="text-white text-4xl"
        />
      </div>
    );
  }

  if (requireAuth && !user) return null; 

  return <>{children}</>; 
};
