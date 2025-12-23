"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  stock:string
  image: { url: string }[];
  slug: string;
};

type FavoriteContextType = {
  favorites: Product[];
  fetchFavorites: () => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  loading: boolean;
};

const defaultContext: FavoriteContextType = {
  favorites: [],
  fetchFavorites: async () => {},
  addFavorite: async () => {},
  removeFavorite: async () => {},
  loading: false,
};

export const FavoriteContext = createContext<FavoriteContextType>(defaultContext);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
  if (!isAuthenticated) return;

  setLoading(true);
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/`,
      { withCredentials: true }
    );

    if (res.data.success) {
      setFavorites(res.data.favorites);
    }
  } catch {
    toast.error("Failed to fetch favorites!");
  } finally {
    setLoading(false);
  }
}, [isAuthenticated]);

  // Add favorite
  const addFavorite = async (productId: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/add`, { productId }, { withCredentials: true });
      if (res.data.success) {
        await fetchFavorites();
        toast.success("Added to favorites!");
      }
    } catch {
      toast.error("Failed to add favorite!");
    }
  };

  // Remove favorite
  const removeFavorite = async (productId: string) => {
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/remove/${productId}`, { withCredentials: true });
      if (res.data.success) {
        setFavorites((prev) => prev.filter((p) => p._id !== productId));
        toast.success("Removed from favorites!");
      }
    } catch {
      toast.error("Failed to remove favorite!");
    }
  };

useEffect(() => {
  if (!isAuthenticated) {
    setFavorites([]);
  } else {
    fetchFavorites();
  }
}, [isAuthenticated, fetchFavorites]);

  return (
    <FavoriteContext.Provider value={{ favorites, fetchFavorites, addFavorite, removeFavorite, loading }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => useContext(FavoriteContext);
