"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Button } from "@/components/ui/button";
import ScrollFloat from "@/components/ScrollFloat";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import type { Swiper as SwiperType } from "swiper"; 

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

const NewArrivals = () => {
  const router = useRouter();
  const [product, setProduct] = useState<Product[]>([]);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/product/latest/products",
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
          toast.error("Unknown error!");
        }
      }
    };
    fetchProduct();
  }, []);

  const handlerAddToCart = async (product: Product) => {
    if (user || isAuthenticated) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/cart/addCart",
          { productId: product._id, quantity: 1 },
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success(
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div>{response.data.message || "Added to cart!"}</div>
              <button
                onClick={() => {
                  toast.dismiss();
                  router.push("/Cart");
                }}
                style={{
                  marginTop: 6,
                  padding: "6px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Go To Cart
              </button>
            </div>
          );
        }
      } catch {
        toast.error("Something went wrong!");
      }
    } else {
      router.push("/Login");
    }
  };

  return (
    <div className="ml-40 flex-1 min-h-screen bg-white p-6">
      <div className="text-color font-bold text-jost flex items-center justify-center mt-14">
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
        >
          New Arrivals
        </ScrollFloat>
      </div>

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)} 
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        style={{ "--swiper-theme-color": "#393E46" ,  "--swiper-navigation-size": "30px"} as React.CSSProperties}
        spaceBetween={20}
        slidesPerView={5}
        loop
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        navigation
        className="py-8 mt-14 h-auto"
      >
        {product.map((p) => (
          <SwiperSlide key={p._id}>
            <Link href={`/Products/${p.slug}`}>
              <div className="bg-primary w-80 h-120 rounded-2xl shadow-md hover:shadow-xl grid overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative p-4 my-5 cursor-pointer">
                <div className="flex items-center justify-center p-4">
                  {p.image?.length ? (
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

                <div className="px-4 py-2 text-center flex items-center justify-center">
                  <h2 className="text-white text-lg truncate font-semibold text-center w-64 mx-auto">
                    {p.product_name}
                  </h2>
                </div>

                 <div className="px-4 py-2 h-[70px] overflow-hidden">
                  <p className="text-sm text-color font-semibold line-clamp-3 leading-snug">
                    {p.description}
                  </p>
                </div>

                <div className="flex gap-2 justify-between items-center mt-auto">
                  <h2 className="text-color text-2xl font-semibold ml-3">
                    {p.price},00$
                  </h2>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerAddToCart(p);
                    }}
                    className="bg-secondary text-color cursor-pointer hover:bg-white text-base m-2"
                  >
                    Add To Cart
                  </Button>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination */}
      <div className="flex justify-center mt-8 gap-2">
        {product.map((_, index) => (
          <div
            key={index}
            onClick={() => swiperRef.current?.slideToLoop(index)} 
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === activeIndex
                ? "bg-[#393E46] scale-125"
                : "bg-gray-300 scale-100 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;
