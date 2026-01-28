"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CircularText from "@/components/CircularText";
import Link from "next/link";
import HomeIcon from '@mui/icons-material/Home';
import { Button } from "@/components/ui/button";

export default function SuccessContent() {
  
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-primary z-50">
        <CircularText
          text="ORDER SUCCESS"
          spinDuration={20}
          className="text-color text-4xl"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-primary">
      <h1 className="text-3xl font-bold text-white">Payment Successful 🎉</h1>
      {orderId && <p className="text-gray-600 mt-2">Order ID: {orderId}</p>}
      <p className="mt-2 text-gray-500">Thank you for your purchase!</p>

      <Link href={"/"} className="mt-4 text-white underline">
      <Button className="bg-white hover:bg-white cursor-pointer transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97]">
        <HomeIcon style={{ color: 'white' }} className="bg-primary"/> <span className="text-color">Back to Home</span>
      </Button>
      </Link>
    </div>
  );
}
