"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";

type ProductImage = {
  url: string;
  publicId?: string;
  _id?: string;
};

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: ProductImage[];
  slug: string;
  stock?: string;
};

type FavoriteContextType = {
  favorites: Product[];
  totalPages: number;
  currentPage: number;
  totalFavorites: number;
  fetchFavorites: (page?: number) => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  loading: boolean;
  loadingFav: { [key: string]: boolean };
};

const defaultContext: FavoriteContextType = {
  favorites: [],
  totalPages: 1,
  currentPage: 1,
  totalFavorites: 0,
  fetchFavorites: async () => {},
  addFavorite: async () => {},
  removeFavorite: async () => {},
  clearFavorites: async () => {},
  loading: false,
  loadingFav: {},
};

export const FavoriteContext = createContext<FavoriteContextType>(defaultContext);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFav, setLoadingFav] = useState<{ [key: string]: boolean }>({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);

  const fetchFavorites = useCallback(async (page: number = 1) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/`,
        {
          withCredentials: true,
          params: { page },
        }
      );

      if (res.data.success) {
        setFavorites(res.data.favorites);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        setTotalFavorites(res.data.totalFavorites || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addFavorite = async (productId: string) => {
    if (loadingFav[productId]) return;

    setLoadingFav((prev) => ({ ...prev, [productId]: true }));

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/add`,
        { productId },
        { withCredentials: true }
      );
      await fetchFavorites(currentPage);
      toast.success("Added to favorites!");
    } catch (err: any) {
      if (err.response?.data?.message !== "Already favorited") {
        toast.error("Failed to add favorite!");
      }
    } finally {
      setLoadingFav((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const removeFavorite = async (productId: string) => {
    if (loadingFav[productId]) return;

    setLoadingFav((prev) => ({ ...prev, [productId]: true }));

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/remove/${productId}`,
        { withCredentials: true }
      );

      const newTotal = totalFavorites - 1;
      const newTotalPages = Math.ceil(newTotal / 15);

      toast.success("Removed from favorites!");

      if (favorites.length === 1 && currentPage > 1) {
        await fetchFavorites(currentPage - 1);
      } else if (currentPage > newTotalPages && newTotalPages > 0) {
        await fetchFavorites(newTotalPages);
      } else {
        await fetchFavorites(currentPage);
      }
    } catch {
      toast.error("Failed to remove favorite!");
    } finally {
      setLoadingFav((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const clearFavorites = async () => {
    if (!isAuthenticated || favorites.length === 0) return;

    setLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/clear`,
        { withCredentials: true }
      );

      setFavorites([]);
      setTotalFavorites(0);
      setTotalPages(1);
      setCurrentPage(1);

      toast.success("All favorites cleared!");
    } catch {
      toast.error("Failed to clear favorites!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (authLoading) return;

  if (!isAuthenticated) {
    setFavorites([]);
    setTotalPages(1);
    setCurrentPage(1);
    setTotalFavorites(0);
  }
}, [isAuthenticated, user, authLoading]);

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        totalPages,
        currentPage,
        totalFavorites,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        clearFavorites,
        loading,
        loadingFav,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => useContext(FavoriteContext);