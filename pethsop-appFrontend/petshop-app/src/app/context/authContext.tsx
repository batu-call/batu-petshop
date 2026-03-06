"use client";
import axios from "axios";
import { createContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  role: "User";
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
  deleteAccount: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const hasCheckedAuth = useRef(false);
  const isCheckingAuth = useRef(false);

  const publicRoutes = ["/Login", "/Register", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some(route =>
    pathname?.startsWith(route)
  );

  const checkAuth = async () => {
    if (isCheckingAuth.current) return;

    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    isCheckingAuth.current = true;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users/me`,
        { withCredentials: true }
      );

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      isCheckingAuth.current = false;
      hasCheckedAuth.current = true;
    }
  };

  const refreshUser = async () => {
    hasCheckedAuth.current = false;
    await checkAuth();
  };

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      hasCheckedAuth.current = false;
      
      localStorage.removeItem("appliedCoupon");
      
      router.push("/");
    }
  }, [router]);

  const deleteAccount = useCallback(async (userId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/${userId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Account deleted successfully");
        
        setUser(null);
        setIsAuthenticated(false);
        hasCheckedAuth.current = false;
        
        localStorage.removeItem("appliedCoupon");
        
        router.push("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to delete account");
      } else {
        throw new Error("Failed to delete account");
      }
    }
  }, [router]);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    checkAuth();
  }, []);

 useEffect(() => {
  checkAuth();
}, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        refreshUser,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};