"use client";
import axios from "axios";
import { createContext, useState, ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken, isMobile } from "@/app/utils/authHelper";

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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  loading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const hasCheckedAuth = useRef(false);
  const isCheckingAuth = useRef(false);

  // Public routes
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
        let headers = {};
    if (isMobile()) {
      const token = getAuthToken();
      if (token) {
        headers = { Authorization: `Bearer ${token}` };
      }
    }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users/me`,
        { withCredentials: true ,headers }
      );

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      const status = error.response?.status;

      setUser(null);
      setIsAuthenticated(false);

      if ((status === 401 || status === 403) && !isPublicRoute) {
        router.replace("/Login");
      }
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

  useEffect(() => {
    if (hasCheckedAuth.current) return;

    checkAuth();
  }, []);

  useEffect(() => {
    if (isPublicRoute) return;

    if (!hasCheckedAuth.current) {
      checkAuth();
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
