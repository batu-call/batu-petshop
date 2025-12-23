"use client";
import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/page";
import Sidebar from "../Sidebar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import CircularText from "@/components/CircularText";
import { Heart } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useCart } from "../context/cartContext";
import { useFavorite } from "../context/favoriteContext";

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
  salePrice?: number | null;
  stock: string;
  image: ProductImage[];
  slug: string;
};

const AllProduct = () => {
  const router = useRouter();
  const [product, setProduct] = useState<Product[]>([]);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
    const { favorites, addFavorite, removeFavorite, fetchFavorites } =
      useFavorite();
  const [reviewsCount, setReviewsCount] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setProduct(response.data.products);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);




 useEffect(() => {
  const fetchReviewCounts = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/counts`
    );
    setReviewsCount(res.data.counts);
  };

  fetchReviewCounts();
}, []);



  const handlerAddToCart = async (product: Product) => {
    if (!user && !isAuthenticated) return router.push("/Login");

    try {
      await addToCart(product._id);
    } catch {
      toast.error("Something went wrong!");
    }
  };

   useEffect(() => {
     fetchFavorites();
   }, [fetchFavorites]);
 
   const handleFavorite = async (productId: string) => {
     if (!isAuthenticated) {
       router.push("/Login");
       return;
     }
 
     const isFav = favorites.some((f) => f._id === productId);
 
     if (isFav) {
       await removeFavorite(productId);
     } else {
       await addFavorite(productId);
     }
   };
 
   const isFavorite = (productId: string) =>
     favorites.some((f) => f._id === productId);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 cursor-pointer">
            {product.map((p) => {
              const discountPercent =
                p.salePrice && p.salePrice < p.price
                  ? Math.round(((p.price - p.salePrice) / p.price) * 100)
                  : 0;

              return (
                <Link
                  key={p._id}
                  href={`/Products/${p.slug}`}
                  className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden justify-between hover:-translate-y-2 relative"
                >
                  {/* DISCOUNT BADGE */}
                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-secondary text-color text-xs font-bold px-2 py-1 rounded-full z-10">
                      %{discountPercent} OFF
                    </span>
                  )}

                  {/* FAVORITE */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFavorite(p._id);
                    }}
                  >
                    {isFavorite(p._id) ? (
                      <FavoriteIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <Heart className="text-gray-400 w-5 h-5" />
                    )}
                  </Button>

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
                  <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                    <h2 className="text-white text-sm sm:text-base md:text-lg truncate font-semibold">
                      {p.product_name}
                    </h2>
                    <div className="flex items-center justify-center gap-1 text-gray-200 text-sm mt-1">
                      ⭐ {reviewsCount[p._id] || 0} Reviews
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="px-4 py-3 sm:px-4 sm:py-2 h-20 sm:h-24 md:h-28 overflow-hidden">
                    <h2 className="text-sm sm:text-base text-color font-semibold line-clamp-3 leading-snug">
                      {p.description}
                    </h2>
                  </div>

                  {/* PRICE */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                    <div className="flex flex-col items-center">
                      {p.salePrice && p.salePrice < p.price ? (
                        <>
                          <span className="line-through text-color text-xs opacity-55 font-bold">
                            {p.price},00$
                          </span>
                          <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                            {p.salePrice},00$
                          </span>
                        </>
                      ) : (
                        <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                          {p.price},00$
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlerAddToCart(p);
                      }}
                      className="bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base m-4"
                    >
                      Add To Cart
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AllProduct;
