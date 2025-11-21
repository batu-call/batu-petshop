"use client";
import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./authContext";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartContextType = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => {},
});

type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const {user} = useContext(AuthContext)



  useEffect(() => {
    const refreshCart = async() => {
      if(!user) return 
      try {
        const response = await axios.get("http://localhost:5000/api/v1/cart/getCart",{withCredentials:true});
        if(response.data.cart.items){
          setCart(response.data.cart.items);
        }
      } catch (err) {
      console.error("Error fetching cart:", err);
    }
    }
    refreshCart();
  },[user])





  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};
