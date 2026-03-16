import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function useShipping(subtotal: number) {
  const [shippingFee, setShippingFee] = useState(0);
  const [freeOver, setFreeOver] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(true);

  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`,
          { withCredentials: true },
        );
        if (res.data.success) {
          setShippingFee(res.data.data.fee);
          setFreeOver(res.data.data.freeOver);
        }
      } catch {
        toast.error("Failed to load shipping settings");
      } finally {
        setShippingLoading(false);
      }
    };

    fetchShippingSettings();
  }, []);

  const calculatedShippingFee =
    freeOver > 0 && subtotal >= freeOver ? 0 : shippingFee;

  return { calculatedShippingFee, shippingLoading };
}