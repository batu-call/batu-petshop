"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
import CircularText from "@/components/CircularText";

type ProductImage = { url: string; publicId: string; _id: string };
type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  image: ProductImage[];
  slug: string;
};

const Reptile = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handlerRemove = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/v1/product/products/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Product deleted ✅");
        setProduct((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response)
        toast.error(error.response.data.message || "Unexpected error");
      else if (error instanceof Error) toast.error(error.message);
      else toast.error("Unexpected error!");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/product/products?category=Reptile",
          { withCredentials: true }
        );
        if (response.data.success) setProduct(response.data.products);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response)
          toast.error(error.response.data.message);
        else if (error instanceof Error) toast.error(error.message);
        else toast.error("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="ml-40 flex-1 min-h-screen bg-white p-6">
        {loading ? (
          <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 cursor-pointer">
            {product.map((p) => (
              <Link
                key={p._id}
                href={`/Products/${p.slug}`}
                className="bg-primary w-80 rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative"
              >
                <div className="flex items-center justify-center p-4 relative">
                  <button
                    className="absolute top-2 right-2 transition duration-300 ease-in-out hover:scale-[1.02] cursor-pointer hover:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerRemove(p._id);
                    }}
                  >
                    <X className="shadow-2xl m-2 opacity-80" />
                  </button>
                  {p.image && p.image.length > 0 ? (
                    <Image
                      src={p.image[0].url}
                      alt={p.product_name}
                      width={400}
                      height={400}
                      className="rounded-full w-60 h-60 object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <p className="text-white text-sm">No image!</p>
                  )}
                </div>
                <div className="px-4 py-2 text-center">
                  <h2 className="text-white text-lg truncate font-semibold">
                    {p.product_name}
                  </h2>
                </div>
                <div className="px-4 py-2 h-[70px] overflow-hidden">
                  <h2 className="text-sm text-color font-semibold line-clamp-3 leading-snug">
                    {p.description}
                  </h2>
                </div>
                <div className="flex gap-2 justify-between items-center">
                  <h2 className="text-color text-2xl m-4 ml-3 font-semibold">
                    {p.price},00$
                  </h2>
                  <Button className="bg-secondary text-color cursor-pointer hover:bg-white text-base m-4">
                    Add To Cart
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Reptile;
