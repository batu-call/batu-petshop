"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CircularText from "@/components/CircularText";
import Link from "next/link";
import axios from "axios";
import { CheckCircle, Package, MapPin, ArrowRight, Home } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderData {
  _id: string;
  totalAmount: number;
  shippingFee?: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    city: string;
    address: string;
  };
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/${orderId}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(fetchOrder, 1000);
  }, [orderId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-[#97cba9] z-50">
        <CircularText text="ORDER SUCCESS" spinDuration={20} className="text-white text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#97cba9]/20 via-white to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-[#97cba9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#97cba9]/30">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful! 🎉</h1>
          <p className="text-gray-500">Thank you for your purchase.</p>
          {orderId && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Order #{orderId.slice(-8).toUpperCase()}
            </p>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#97cba9]/10 to-green-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#97cba9]" />
                <h2 className="font-black text-gray-900">Order Summary</h2>
              </div>
            </div>

            {/* Items */}
            <div className="px-6 py-4 space-y-3">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 ml-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{order.items.length - 3} more item(s)
                </p>
              )}
            </div>

            {/* Total */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
              {order.shippingFee !== undefined && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shippingFee === 0 ? "Free" : `$${order.shippingFee.toFixed(2)}`}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900">
                <span>Total</span>
                <span className="text-[#5a9677]">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Shipping To</p>
                  <p className="text-sm font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-gray-500">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/my-orders" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#97cba9] text-white font-bold rounded-xl hover:bg-[#7fb894] transition-all hover:shadow-lg hover:shadow-[#97cba9]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              <Package className="w-4 h-4" />
              View My Orders
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    </div>
  );
}