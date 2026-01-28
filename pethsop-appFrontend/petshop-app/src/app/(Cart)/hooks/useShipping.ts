import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface ShippingSettings {
  fee: number;
  freeOver: number;
}

interface UseShippingReturn {
  shippingFee: number;
  freeOver: number;
  calculatedShippingFee: number;
  loading: boolean;
  error: string | null;
}

export const useShipping = (subtotal: number): UseShippingReturn => {
  const [shippingFee, setShippingFee] = useState(0);
  const [freeOver, setFreeOver] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get<{
          success: boolean;
          data: ShippingSettings;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setShippingFee(res.data.data.fee);
          setFreeOver(res.data.data.freeOver);
          setError(null);
        }
      } catch (err) {
        const errorMessage = "Failed to load shipping settings";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingSettings();
  }, []);

  // Calculate shipping fee based on subtotal and free shipping threshold
  const calculatedShippingFee =
    freeOver > 0 && subtotal >= freeOver ? 0 : shippingFee;

  return {
    shippingFee,
    freeOver,
    calculatedShippingFee,
    loading,
    error,
  };
};