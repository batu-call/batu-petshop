"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

type Admin = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
};

type AdminAuthContextType = {
  admin: Admin | null;
  loading: boolean;
  setAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

 
 
 useEffect(() => {
  const fetchAdmin = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/me`,{
        withCredentials: true,
      });
      if (response.data.success) 
        setAdmin(response.data.admin);
      else setAdmin(null);
    } catch (err) {
    console.error("Fetch admin error:", err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  fetchAdmin();
}, []); 


 const logout = async () => {
  try {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/logout`, {}, {
      withCredentials: true, 
    });
    setAdmin(null);
  } catch (error) {
    console.error("Logout error:", error);
  }
};
  return (
    <AdminAuthContext.Provider value={{ admin, loading, setAdmin, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return context;
};
