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
import { Heart } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useCart } from "../context/cartContext";

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/latest/products`,
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

  useEffect(() => {
  if (!isAuthenticated) return; 

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const favProducts: Product[] = res.data.favorites;
        setFavorites(favProducts.map((p) => p._id));
      }
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong!");
        }
      }
  };

  fetchFavorites();
}, [isAuthenticated]);

  

  const handlerAddToCart = async (product: Product) => {
  if (!user && !isAuthenticated) return router.push("/Login");

  try {
    await addToCart(product._id);
  } catch {
    toast.error("Something went wrong!");
  }
};

  const handlerFavorite = async (productId: string) => {
    if (!user && !isAuthenticated) return router.push("/Login");

    try {
      if (favorites.includes(productId)) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/remove/${productId}`,
          { withCredentials: true }
        );
        setFavorites((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from favorites!");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorite/add`,
          { productId },
          { withCredentials: true }
        );
        setFavorites((prev) => [...prev, productId]);
        toast.success("Added to favorites!");
      }
    } catch {
      toast.error("Favorite action failed!");
    }
  };

  return (
    <div className="md:ml-24 lg:ml-40 flex-1 h-auto bg-white p-6">
      <div className="text-color font-bold text-jost flex items-center justify-center lg:mt-14">
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
        style={
          {
            "--swiper-theme-color": "#393E46",
            "--swiper-navigation-size": "25px",
          } as React.CSSProperties
        }
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 10 },
          480: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
          1440: { slidesPerView: 4, spaceBetween: 20 },
          1441: { slidesPerView: 5, spaceBetween: 20 },
        }}
        loop
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        navigation
        className="py-8 mt-2 lg:mt-14 custom-swiper"
      >
        {product.map((p) => (
          <SwiperSlide key={p._id}>
            <Link
              href={`/Products/${p.slug}`}
              className="flex items-center justify-center w-full"
            >
          
              <div className="bg-primary rounded-2xl shadow-md hover:shadow-xl grid overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative p-4 my-5 cursor-pointer">
                <div className="flex items-center justify-center p-4">
                   <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handlerFavorite(p._id);
                  }}
                >
                  {favorites.includes(p._id) ? (
                    <FavoriteIcon className="text-gray-400 w-3 h-3" />
                  ) : (
                    <Heart className="text-gray-400 w-5 h-5" />
                  )}
                </Button>
                  {p.image?.length ? (
                    <Image
                      src={p.image[0].url}
                      alt={p.product_name}
                      width={400}
                      height={400}
                      className="rounded-full w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 xl:w-60 xl:h-60 object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <p className="text-white text-sm">No image!</p>
                  )}
                </div>

                <div className="px-4 py-2 text-center flex items-center justify-center">
                  <h2 className="text-white text-sm sm:text-lg truncate font-semibold text-center">
                    {p.product_name}
                  </h2>
                </div>

                <div className="px-4 py-2 h-17.5 overflow-hidden">
                  <p className="text-xs sm:text-sm text-color font-semibold line-clamp-3 leading-snug">
                    {p.description}
                  </p>
                </div>

                <div className="flex gap-2 justify-between items-center mt-auto">
                  <h2 className="text-color text-sm md:text-md lg:text-lg xl:text-2xl font-semibold ml-3">
                    {p.price},00$
                  </h2>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerAddToCart(p);
                    }}
                    className="bg-secondary text-color cursor-pointer hover:bg-white text-xs sm:text-base m-2"
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
