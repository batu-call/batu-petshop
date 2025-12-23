"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CircularText from "@/components/CircularText";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { AuthContext } from "@/app/context/authContext";
import { FavoriteContext } from "@/app/context/favoriteContext";

type ProductImage = {
  url: string;
  publicId?: string;
  _id?: string;
};
 
type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  stock: string;
  image: ProductImage[];
  slug: string;
};

const Favorite = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { favorites, removeFavorite,loading ,fetchFavorites } = useContext(FavoriteContext);

  const [reviewsCount, setReviewsCount] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchReviewsCount = async () => {
      const counts: { [key: string]: number } = {};

      for (const p of favorites) {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${p._id}/count`,
            { withCredentials: true }
          );
          counts[p._id] = res.data.count;
        } catch {
          counts[p._id] = 0;
        }
      }

      setReviewsCount(counts);
    };

    if (favorites.length > 0) fetchReviewsCount();
  }, [favorites]);

  const handlerAddToCart = async (product: Product) => {
    if (!user && !isAuthenticated) {
      router.push("/Login");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
        { productId: product._id, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to cart!");
    } catch {
      toast.error("Something went wrong!");
    }
  };

 useEffect(() => {
   fetchFavorites();
}, [fetchFavorites]);


  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="md:ml-25 lg:ml-40 flex-1 min-h-screen bg-white p-6">
        {loading ? (
          <div className="md:ml-25 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <div>
            <div className="w-full flex items-center justify-center">
              <h2 className="text-2xl text-color font-semibold">
                Favorite
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 cursor-pointer mt-12">
              {favorites.map((p) => (
                <Link
                  key={p._id}
                  href={`/Products/${p.slug}`}
                  className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden justify-between hover:-translate-y-2 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(p._id);
                    }}
                  >
                    <FavoriteIcon className="text-gray-400 w-1 h-1" />
                  </Button>

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

                  <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                    <h2 className="text-white text-sm sm:text-base md:text-lg truncate font-semibold">
                      {p.product_name}
                    </h2>
                    <div className="flex items-center justify-center gap-1 text-gray-200 text-sm mt-1">
                      <span>{reviewsCount[p._id] || 0} Reviews</span>
                    </div>
                  </div>

                  <div className="px-4 py-3 sm:px-4 sm:py-2 h-20 sm:h-24 md:h-28 overflow-hidden">
                    <h2 className="text-sm sm:text-base text-color font-semibold line-clamp-3 leading-snug">
                      {p.description}
                    </h2>
                  </div>

                  <div className="flex gap-2 justify-between items-center">
                    <h2 className="text-color text-sm sm:text-base xl:text-lg m-4 ml-3 font-semibold">
                      {p.price},00$
                    </h2>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlerAddToCart(p);
                      }}
                      className=" bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base m-4"
                    >
                      Add To Cart
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Favorite;
