"use client";
import { Button } from "@/components/ui/button";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, Appearance } from "@stripe/stripe-js";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface Item {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  product?:
    | { _id: string; product_name: string; image: { url: string } }
    | string;
}

interface StripePayProps {
  totalAmount: number;
  items: Item[];
  fullName: string;
  email: string;
  city: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  userId: string;
  shippingFee: number;
  onPaymentSuccess: (paymentIntentId?: string) => void;
  isProcessingOrder?: boolean;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// Detect dark mode
const isDarkMode = () =>
  typeof window !== "undefined" &&
  document.documentElement.classList.contains("dark");

const getLightAppearance = (): Appearance => ({
  theme: "stripe",
  variables: {
    colorPrimary: "#97cba9",
    colorBackground: "#ffffff",
    colorText: "#393E46",
    colorDanger: "#df1b41",
    fontFamily: "Jost, Arial, Helvetica, sans-serif",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      border: "1px solid #B1CBBB",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #97cba9",
      boxShadow: "0 0 0 2px rgba(151, 203, 169, 0.25)",
    },
    ".Label": {
      color: "#393E46",
      fontWeight: "600",
    },
  },
});

const getDarkAppearance = (): Appearance => ({
  theme: "night",
  variables: {
    colorPrimary: "#7aab8a",
    colorBackground: "#1e3d2a",
    colorText: "#c8e6d0",
    colorTextSecondary: "#a8d4b8",
    colorTextPlaceholder: "#7aab8a",
    colorDanger: "#f87171",
    colorIconTab: "#7aab8a",
    colorIconTabSelected: "#c8e6d0",
    fontFamily: "Jost, Arial, Helvetica, sans-serif",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#162820",
      border: "1px solid #2d5a3d",
      color: "#c8e6d0",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #7aab8a",
      boxShadow: "0 0 0 2px rgba(122, 171, 138, 0.25)",
    },
    ".Input::placeholder": {
      color: "#7aab8a",
    },
    ".Label": {
      color: "#a8d4b8",
      fontWeight: "600",
    },
    ".Tab": {
      backgroundColor: "#162820",
      border: "1px solid #2d5a3d",
      color: "#a8d4b8",
    },
    ".Tab:hover": {
      backgroundColor: "#1e3d2a",
      color: "#c8e6d0",
    },
    ".Tab--selected": {
      backgroundColor: "#1e3d2a",
      border: "1px solid #7aab8a",
      color: "#c8e6d0",
    },
    ".TabIcon": {
      fill: "#7aab8a",
    },
    ".TabIcon--selected": {
      fill: "#c8e6d0",
    },
    ".Block": {
      backgroundColor: "#162820",
      border: "1px solid #2d5a3d",
    },
    ".Error": {
      color: "#f87171",
    },
  },
});

const StripePayForm = ({
  totalAmount,
  fullName,
  email,
  city,
  phoneNumber,
  address,
  postalCode,
  onPaymentSuccess,
  isProcessingOrder = false,
}: StripePayProps & { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName || !email || !city || !phoneNumber || !address) {
      toast.error("Please fill in all address information before payment!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    if (!stripe || !elements || isSubmitting || isProcessingOrder || loading) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: fullName,
              email,
              phone: phoneNumber,
              address: {
                city,
                line1: address,
                postal_code: postalCode || undefined,
              },
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        await onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === "processing") {
        toast("Payment is processing... You'll receive confirmation soon.");
        await onPaymentSuccess(paymentIntent.id);
      } else {
        toast.error("Payment status unknown");
        setIsSubmitting(false);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      setIsSubmitting(false);
      setLoading(false);

      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Payment failed");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error occurred");
      }
    }
  };

  const isAddressComplete = fullName && email && city && phoneNumber && address;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-4 border border-gray-200 dark:border-[#2d5a3d] rounded-lg shadow-md bg-white dark:bg-[#1e3d2a]"
    >
   <PaymentElement 
  options={{
    defaultValues: {
      billingDetails: {
        address: {
          country: "US",
        },
      },
    },
  wallets: {
  applePay: "auto",   // "never" yerine "auto"
  googlePay: "auto",  // "never" yerine "auto"
},
    layout: {
      type: "tabs",
      defaultCollapsed: false,
    },
  }}
/>

      {!isAddressComplete && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded text-sm">
          ⚠️ Please fill in all address information above before payment
        </div>
      )}

      <Button
        type="submit"
        disabled={
          !stripe ||
          loading ||
          isSubmitting ||
          isProcessingOrder ||
          !isAddressComplete
        }
        className="mt-4 w-full bg-primary dark:bg-[#0b8457] text-[#393E46] dark:text-[#c8e6d0] font-bold rounded-xl hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
      >
        {loading || isProcessingOrder
          ? "Processing..."
          : !isAddressComplete
            ? "Complete Address First"
            : `Pay $${totalAmount}`}
      </Button>
    </form>
  );
};

const StripePay = (props: StripePayProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const hasCreatedIntent = useRef(false);

  // Sync dark mode state
  useEffect(() => {
    setDarkMode(isDarkMode());

    const observer = new MutationObserver(() => {
      setDarkMode(isDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasCreatedIntent.current) return;
    if (props.totalAmount <= 0) return;

    const createPaymentIntent = async () => {
      hasCreatedIntent.current = true;

      try {
        const orderItems = props.items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        }));

        const shippingAddress = {
          fullName: props.fullName,
          email: props.email,
          address: props.address,
          city: props.city,
          phoneNumber: props.phoneNumber,
          postalCode: props.postalCode || "",
        };

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stripe/create-payment-intent`,
          {
            amount: Math.round(props.totalAmount * 100),
            metadata: {
              userId: props.userId,
              items: JSON.stringify(orderItems),
              shippingAddress: JSON.stringify(shippingAddress),
              shippingFee: props.shippingFee.toString(),
            },
          },
        );

        setClientSecret(data.clientSecret);
        setError(null);
      } catch (error: unknown) {
        console.error("Payment intent creation error:", error);
        hasCreatedIntent.current = false;

        if (axios.isAxiosError(error) && error.response) {
          const errorMessage =
            error.response.data.message || "Failed to initialize payment";
          toast.error(errorMessage);
          setError(errorMessage);
        } else if (error instanceof Error) {
          toast.error(error.message);
          setError(error.message);
        } else {
          toast.error("Unknown error occurred");
          setError("Unknown error occurred");
        }
      }
    };

    createPaymentIntent();
  }, []);

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Payment initialization failed
        </p>
        <p className="text-sm text-gray-600 dark:text-[#7aab8a] mt-2">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-[#7aab8a]">Loading payment form...</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: "en",
        appearance: darkMode ? getDarkAppearance() : getLightAppearance(),
      }}
    >
      <StripePayForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
};

export default StripePay;