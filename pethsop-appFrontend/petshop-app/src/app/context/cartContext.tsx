"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";



export type CartItem = {
  _id: string;
  product: string | { _id: string; product_name: string; image: { url: string } };
  image: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  slug: string;
};

type CartContextType = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
};

const defaultContext: CartContextType = {
  cart: [],
  setCart: () => {},
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  fetchCart: async () => {},
};

export const CartContext = createContext<CartContextType>(defaultContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
   const { isAuthenticated } = useContext(AuthContext);



  // GetCart
  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/getCart`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setCart(response.data.cart.items);
      }
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred during cart fetch!");
        }
      }
  };

 useEffect(() => {
  if (isAuthenticated) {
    fetchCart();
  } else {
    setCart([]); 
  }
}, [isAuthenticated]);


  // AddToCart
  const addToCart = async (productId: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
        { productId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCart(response.data.cart.items);
        toast.success("Product added to cart!");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Add cart failed");
      } else {
        toast.error("Unexpected error while adding item!");
      }
    }
  };


  // RemoveCart
  const removeFromCart = async (productId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/removeCart/${productId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCart(response.data.cart.items);
        toast.success("Item removed!");
      }
    } catch {
      toast.error("Remove failed!");
    }
  };

  // Quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/updateQuantity`,
        { productId, quantity },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCart(response.data.cart.items);
      }
    } catch {
      toast.error("Failed to update quantity!");
    }
  };

  // AllCartClear
  const clearCart = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/removeAllCart`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCart([]);
        toast.success("Cart cleared!");
      }
    } catch {
      toast.error("Clear cart failed!");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);
