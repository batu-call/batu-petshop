"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CircularText from "@/components/CircularText";
import { AuthContext } from "@/app/context/authContext";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";

type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  image: ProductImage[];
  slug: string;
};

const Fish = () => {
  const router = useRouter();
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); 
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products?category=Fish`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setProduct(response.data.products);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const handlerAddToCart = async (product: Product) => {
    if (user || isAuthenticated) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
          { productId: product._id, quantity: 1 },
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success(response.data.message || "Added to cart!");
          return;
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong!");
        }
      }
    } else {
      router.push("/Login");
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="ml-0 md:ml-24 lg:ml-40 flex-1 flex flex-col items-center justify-center md:items-start md:justify-start min-h-screen bg-white p-6 mt-3 md:mt-0">
        {loading ? (
          <div className="md:ml-25 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-6 lg:gap-8 sm:p-0">
            {product.map((p) => (
              <Link
                key={p._id}
                href={`/Products/${p.slug}`}
                className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative"
              >
                {/* IMAGE */}
                <div className="flex items-center justify-center p-4">
                  {p.image && p.image.length > 0 ? (
                    <Image
                      src={p.image[0].url}
                      alt={p.product_name}
                      width={400}
                      height={400}
                      className="rounded-full w-28 h-28 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <p className="text-white text-sm">No image!</p>
                  )}
                </div>

                {/* NAME */}
                <div className="px-4 py-2 text-center">
                  <h2 className="text-white text-sm sm:text-base truncate font-semibold">
                    {p.product_name}
                  </h2>
                </div>

                {/* DESCRIPTION */}
                <div className="px-4 py-3 sm:px-4 sm:py-2 h-20 sm:h-24 md:h-28 overflow-hidden">
                  <h2 className="text-sm sm:text-base text-color font-semibold line-clamp-3 leading-snug">
                    {p.description}
                  </h2>
                </div>

                {/* PRICE & BUTTON */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                  <h2 className="text-color text-sm sm:text-base xl:text-lg m-4 ml-3 font-semibold">
                    {p.price},00$
                  </h2>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerAddToCart(p);
                    }}
                    className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base m-4 transition-colors duration-400"
                  >
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

export default Fish;
