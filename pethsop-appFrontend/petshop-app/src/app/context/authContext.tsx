"use client";
import axios from "axios";
import { createContext, useState, ReactNode, useEffect } from "react";


export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  role: "User"

}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  loading: boolean;

}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  loading:true
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [loading, setLoading] = useState(true);



     useEffect(() => {
  const checkAuth = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/users/me`, { withCredentials: true });
        if (res.data.success) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          console.log(res.data.user)
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } 
      finally {
        setLoading(false);
      }
  };
  checkAuth();
}, []);


  

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated,loading }}>
      {children}
    </AuthContext.Provider>
  );
};
