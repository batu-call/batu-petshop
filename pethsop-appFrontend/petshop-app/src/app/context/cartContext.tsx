"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";

type Coupon = {
  code: string;
  percent: number;
  discountAmount: number;
};

type ApplyCouponResult = {
  discountAmount: number;
  percent: number;
} | null;

export type CartItem = {
  _id: string;
  product: {
    _id: string;
    product_name: string;
    price: number;
    salePrice?: number | null;
    image?: { url: string }[];
    slug?: string;
  };
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  coupon: Coupon | null;
  removeCoupon: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;

  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<ApplyCouponResult>;
};

const defaultContext: CartContextType = {
  cart: [],
  subtotal: 0,
  discountAmount: 0,
  total: 0,
  coupon: null,
  removeCoupon: async () => {},
  setCart: () => {},
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  fetchCart: async () => {},
  applyCoupon: async (): Promise<{
    discountAmount: number;
    percent: number;
  } | null> => {
    return null;
  },
};

export const CartContext = createContext<CartContextType>(defaultContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/getCart`,
        { withCredentials: true }
      );
      if (response.data.success) {
        const { cart, subtotal, discountAmount, total } = response.data;

        setCart(cart.items);
        setCoupon(cart.appliedCoupon ?? null);
        setSubtotal(subtotal);
        setDiscountAmount(discountAmount);
        setTotal(total);
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
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
      setCoupon(null);
      localStorage.removeItem("appliedCoupon");
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
        await fetchCart();
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
        await fetchCart();
        toast.success("Item removed!");
      }
    } catch {
      toast.error("Remove failed!");
    }
  };

  // quantity
  const updateQuantity = async (productId: string, delta: number) => {
    const item = cart.find(
      (i) =>
        (typeof i.product === "string" ? i.product : i.product._id) ===
        productId
    );

    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/updateQuantity`,
        { productId, quantity: newQuantity },
        { withCredentials: true }
      );

      if (res.data.success) {
        await fetchCart();
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
        await fetchCart();
        toast.success("Cart cleared!");
      }
    } catch {
      toast.error("Clear cart failed!");
    }
  };

  // Coupon
  const applyCoupon = async (code: string): Promise<ApplyCouponResult> => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code!");
      return null;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/apply`,
        { code: code.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchCart();
        toast.success("Coupon applied!");
        return response.data.cart?.appliedCoupon ?? null;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to apply coupon!");
      } else {
        toast.error("Unexpected error while applying coupon!");
      }
    }

    return null;
  };

  // removeCoupon
 const removeCoupon = async () => {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/remove-coupon`,
      {},
      { withCredentials: true }
    );

    await fetchCart();
    toast.success("Coupon removed!");
  } catch {
    toast.error("Failed to remove coupon!");
  }
};
  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        discountAmount,
        total,
        coupon,
        removeCoupon,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);