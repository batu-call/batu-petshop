import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartContext";


interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phoneNumber: string;
  postalCode?: string;
}

interface UseOrderProps {
  calculatedShippingFee: number;
  shippingAddress: ShippingAddress;
}

export function useOrder({ calculatedShippingFee, shippingAddress }: UseOrderProps) {
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const { fullName, email, address, city, phoneNumber, postalCode } = shippingAddress;

  const orderCreate = useCallback(
    async (paymentIntentId?: string | null) => {
      if (isProcessingOrder) return null;

      if (!cart.length) {
        toast.error("The cart is empty!");
        return null;
      }

      if (!fullName?.trim() || !email?.trim() || !city?.trim() || !phoneNumber?.trim() || !address?.trim()) {
        toast.error("Please fill in all address information");
        return null;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return null;
      }

      setIsProcessingOrder(true);

      const orderItems = cart.map((item) => ({
        product: item.product._id,
        name: item.product.product_name,
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
        image: item.product.image?.[0]?.url ?? "",
      }));

      const payload = {
        items: orderItems,
        shippingFee: calculatedShippingFee,
        shippingAddress: {
          fullName: fullName.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          phoneNumber: phoneNumber.trim(),
          postalCode: postalCode?.trim() || undefined,
        },
        paymentIntentId: paymentIntentId ?? null,
      };

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order`,
          payload,
          { withCredentials: true },
        );

        if (response.data.success) {
          toast.success("Your order has been saved!");
          return response.data.order;
        } else {
          toast.error(response.data.message || "Order could not be created.");
          return null;
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message || "Server error.");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error.");
        }
        return null;
      } finally {
        setIsProcessingOrder(false);
      }
    },
    [cart, calculatedShippingFee, fullName, email, address, city, phoneNumber, postalCode, isProcessingOrder],
  );

  const handlePaymentSuccess = async (paymentIntentId?: string | null) => {
    const order = await orderCreate(paymentIntentId);
    if (order) {
      await clearCart();
      router.push(`/Success?orderId=${order._id}`);
    } else {
      await clearCart();
      toast.success("Payment successful! Your order is being processed.");
      router.push(`/Success?paymentIntentId=${paymentIntentId}`);
    }
  };

  return { orderCreate, handlePaymentSuccess, isProcessingOrder };
}