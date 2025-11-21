"use client";
import { Button } from "@/components/ui/button";
import { PaymentElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Item {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  product?: { _id: string; product_name: string; image: { url: string } } | string;
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
  onPaymentSuccess: (paymentIntentId?: string) => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const StripePayForm = ({
  totalAmount,
  fullName,
  email,
  city,
  phoneNumber,
  address,
  postalCode,
  onPaymentSuccess,
}: StripePayProps & { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

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
                postal_code: postalCode,
              },
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("✅ Payment successful!");
        onPaymentSuccess(paymentIntent.id);
      } else {
        toast("Payment is still processing...");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-4 border rounded-lg shadow-md bg-white"
    >
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="mt-4 w-full">
        {loading ? "Processing..." : `Pay $${totalAmount}`}
      </Button>
    </form>
  );
};

const StripePay = (props: StripePayProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/create-payment-intent",
          { amount: props.totalAmount * 100 }
        );
        setClientSecret(data.clientSecret);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Unknown error occurred");
        }
      }
    };
    createPaymentIntent();
  }, [props.totalAmount]);

  if (!clientSecret) return <p>Loading payment form...</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: "auto" }}>
      <StripePayForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
};

export default StripePay;
