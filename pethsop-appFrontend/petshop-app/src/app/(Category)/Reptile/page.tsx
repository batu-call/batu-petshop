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

const Reptile = () => {
  const router = useRouter();
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products?category=Reptile`,
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
      <div className="ml-0 md:ml-32 lg:ml-40 flex-1 flex flex-col items-center justify-center md:items-start md:justify-start min-h-screen bg-white md:p-6 mt-3 md:mt-0">
        {loading ? (
          <div className="md:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 cursor-pointer">
            {product.map((p) => (
              <Link
                key={p._id}
                href={`/Products/${p.slug}`}
                className="bg-primary w-66 sm:w-72 md:w-70 lg:w-66 xl:w-74 2xl:w-80 rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative"
              >
                <div className="flex items-center justify-center p-4">
                  {p.image && p.image.length > 0 ? (
                    <Image
                      src={p.image[0].url}
                      alt={p.product_name}
                      width={400}
                      height={400}
                      className="rounded-full w-40 h-40 sm:w-40 sm:h-40 md:w-50 md:h-50 lg:w-50 lg:h-50 xl:w-60 xl:h-60 object-cover border-4 border-white shadow-2xl"
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
                  <h2 className="text-color text-sm xl:text-lg m-4 ml-3 font-semibold">
                    {p.price},00$
                  </h2>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerAddToCart(p);
                    }}
                    className="bg-secondary text-color cursor-pointer hover:bg-white text-base m-4 transition-colors duration-400"
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

export default Reptile;


