"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/authContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CircularText from "@/components/CircularText";
import Link from "next/link";
import type { Swiper as SwiperType } from "swiper";
import { Heart, StarHalf } from "lucide-react";
import { useCart } from "@/app/context/cartContext";
import { useFavorite } from "@/app/context/favoriteContext";
import {
  Star,
  RateReview,
  Send,
  ThumbUp,
  VerifiedUser,
  StarBorder,
} from "@mui/icons-material";
import { useConfirm } from "@/app/context/confirmContext";
import Footer from "@/app/Footer/page";

type ReviewStats = {
  [productId: string]: {
    count: number;
    avgRating: number;
  };
};

type Reviews = {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  helpful: string[];
  rating: number;
  comment: string;
  createdAt: string;
};
type Features = { name: string; description: string };
type ProductImage = { url: string; publicId: string; _id: string };
type Category = { _id: string; name: string; slug: string };
type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: ProductImage[];
  slug: string;
  category: Category;
  productFeatures: Features[];
};

const ProductDetails = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const { slug } = useParams();
  const [product, setProduct] = useState<Product>();
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [similar, setSimilar] = useState<Product[]>([]);
  const router = useRouter();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState("similar");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType>(null);
  const { setCart } = useCart();
  const { favorites, addFavorite, removeFavorite, fetchFavorites } =
    useFavorite();
  const { confirm } = useConfirm();
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/slug/${slug}`,
        );
        if (response.data.success) {
          setProduct(response.data.product);
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
  }, [slug]);

  useEffect(() => {
    if (!product?._id) return;
    const fetchSimilarProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/similar/${product._id}?limit=7`,
        );
        if (response.data.success) {
          setSimilar(response.data.products);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong!");
        }
      }
    };
    fetchSimilarProducts();
  }, [product?._id]);

  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${product._id}`,
        );
        if (response.data.success) {
          setReviews(response.data.reviews);
        } else {
          setReviews([]);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong while fetching reviews!");
        }
      }
    };
    fetchReviews();
  }, [product?._id]);

  const handlerAddToCart = async () => {
    if (user || isAuthenticated) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
          { productId: product?._id, quantity: quantity },
          { withCredentials: true },
        );
        if (response.data.success) {
          toast.success(response.data.message || "Added to cart!");
          setCart(response.data.cart.items);
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

  const handlerSimilarAddCart = async (item: Product) => {
    if (user || isAuthenticated) {
      if (!item._id) return toast.error("Product not found!");
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
          { productId: item._id, quantity: quantity },
          { withCredentials: true },
        );
        if (response.data.success) {
          setCart(response.data.cart.items);
          toast.success(response.data.message || "Added to cart!");
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

  const handleAddReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return toast.error("Please log in to comment");
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/add`,
        { productId: product?._id, comment, rating },
        { withCredentials: true },
      );
      setReviews((prev) => [response.data.review, ...prev]);
      setComment("");
      setRating(5);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${id}`,
        { withCredentials: true },
      );

      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const handleHelpful = async (id: string) => {
    if (!isAuthenticated)
      return toast("You need to log in to like this comment.");
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/helpful/${id}`,
      {},
      { withCredentials: true },
    );

    setReviews((prev) =>
      prev.map((r) => (r._id === id ? { ...r, helpful: res.data.helpful } : r)),
    );
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

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/stats`,
        );
        setReviewStats(response.data.stats);
      } catch {
        toast.error("Failed to load reviews");
      }
    };

    fetchReviewStats();
  }, []);

  const isFavorite = (productId: string) =>
    favorites.some((f) => f._id === productId);

  const discountPercent =
    product?.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const renderTabContent = () => {
    switch (selectedTab) {
      case "shipping":
        return (
          <div className="mx-auto max-w-[800px] px-6 py-4">
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Returns Policy
            </h2>
            <div className="text-xl md:text-2xl text-color text-jost leading-relaxed mb-12">
              <ul className="list-disc list-inside space-y-3">
                <li>You can return your order within 14 days of delivery.</li>
                <li>
                  Items must be unused, in their original packaging and in
                  resellable condition.
                </li>
                <li>
                  To start a return, please contact our customer service with
                  your order details.
                </li>
                <li>
                  Return shipping costs are the responsibility of the customer
                  unless the product is defective.
                </li>
                <li>
                  If you receive a damaged or incorrect product, please contact
                  us within 48 hours of receiving your order.
                </li>
                <li>
                  Once your return is approved and received, we will process
                  your refund within 5–7 business days.
                </li>
              </ul>
            </div>
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Shipping Information
            </h2>
            <div className="text-xl md:text-2xl text-color text-jost leading-relaxed">
              <ul className="list-disc list-inside space-y-3">
                <li>Orders are processed within 1–3 business days.</li>
                <li>
                  Delivery usually takes 3–7 business days depending on your
                  location.
                </li>
                <li>We ship via xxx.</li>
                <li>Free shipping on orders over $100.</li>
              </ul>
            </div>
          </div>
        );
      case "features":
        return (
          <div className="mx-auto max-w-[800px] px-6 py-4">
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Product Features
            </h2>
            <div className="text-xl md:text-2xl text-color text-jost leading-relaxed mb-12">
              {product?.productFeatures &&
              product.productFeatures.length > 0 ? (
                <ul className="list-disc list-inside space-y-3">
                  {product.productFeatures.map((feature, index) => (
                    <li key={index} className="text-color">
                      <strong className="text-color opacity-90 font-semibold mb-2 text-shadow-2xs">
                        {feature.name}
                      </strong>
                      <p className="text-color">{feature.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-600 mt-4">
                  {product?.productFeatures[0]?.description}
                </p>
              )}
            </div>
          </div>
        );
      case "reviews":
        return (
          <main className="px-4 pb-24 pt-2 max-w-lg mx-auto font-sans bg-gray-50 min-h-dvh">
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Product Reviews
            </h2>
            {/* SUMMARY */}
            <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100  mt-2">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="block text-4xl font-bold text-gray-900">
                    {reviews.length
                      ? (
                          reviews.reduce((a, b) => a + b.rating, 0) /
                          reviews.length
                        ).toFixed(1)
                      : "0.0"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {reviews.length} Review
                  </span>
                </div>

                <div className="h-12 w-px bg-gray-200"></div>

                <div className="flex flex-col">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => {
                      if (avgRating >= i) {
                        return <Star key={i} fontSize="small" />;
                      }

                      if (avgRating >= i - 0.5 && avgRating < i) {
                        return <StarHalf key={i} fontSize="small" />;
                      }

                      return <StarBorder key={i} fontSize="small" />;
                    })}
                  </div>
                  <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <VerifiedUser
                      className="text-green-500 text-xs"
                      sx={{ fontSize: 16 }}
                    />
                    Our customers recommend
                  </span>
                </div>
              </div>
            </div>

            {/* ADD REVIEW */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-color mb-4 flex items-center gap-2">
                <RateReview className="text-color2" />
                Write a Review
              </h2>

              <form
                onSubmit={handleAddReview}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
              >
                <div className="flex flex-col items-center mb-6">
                  <label className="text-sm font-medium text-gray-500">
                    Your Rating
                  </label>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setRating(i)}
                        className={`transition-transform cursor-pointer ${
                          rating >= i ? "text-yellow-500" : "text-gray-300"
                        } hover:scale-125`}
                      >
                        <Star sx={{ fontSize: 32 }} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  placeholder="Write your review..."
                  className="w-full bg-gray-50 border border-[#97cba9] rounded-xl p-4 text-sm focus:ring-2 focus:bg-[#D6EED6] outline-none resize-none mb-4 max-h-40"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-[#D6EED6] cursor-pointer text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : "Submit Review"}
                  <Send sx={{ fontSize: 18 }} />
                </button>
              </form>
            </section>

            {/* REVIEWS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-color ">
                  Latest Reviews
                </h2>
                <span className="text-xs text-color2 font-semibold cursor-pointer">
                  Newest
                </span>
              </div>

              <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative"
                  >
                    <div className="absolute bottom-5 right-10 cursor-pointer">
                      {user?._id === review.userId?._id && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const ok = await confirm({
                              title: "Delete Review",
                              description:
                                "Are you sure you want to delete this review?",
                              confirmText: "Yes, Delete",
                              cancelText: "Cancel",
                              variant: "destructive",
                            });
                            if (ok) {
                              handleDeleteReview(review._id);
                            }
                          }}
                          className="text-xs text-color2 hover:text-[#D6EED6] font-medium cursor-pointer mb-1 transition duration-300 ease-in-out active:scale-[0.97]"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gray-300">
                          <Image
                            src={review.userId?.avatar || "/default-avatar.png"}
                            alt="user avatar"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-color">
                            {review.userId?.firstName || "User"}{" "}
                            {review.userId?.lastName?.[0]}
                          </h3>
                          <p className="text-[10px] text-gray-400">
                            {formatDate(review.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex text-yellow-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} sx={{ fontSize: 16 }} />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
                      {review.comment}
                    </p>

                    <div className="mt-4">
                      <button
                        onClick={() => handleHelpful(review._id)}
                        className={`text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer duration-300 ease-in-out hover:scale-102 active:scale-[0.97]

                            ${
                              review.helpful.includes(user?._id ?? "")
                                ? "text-color2"
                                : "text-gray-400 hover:text-[#97cba9]"
                            }
                            `}
                      >
                        <ThumbUp sx={{ fontSize: 14 }} />
                        Helpful ({review.helpful?.length ?? 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        );
      case "similar":
        return (
          <div className="p-4">
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Similar Products
            </h2>
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
                320: { slidesPerView: 2, spaceBetween: 5 },
                1024: { slidesPerView: 3, spaceBetween: 5 },
                1280: { slidesPerView: 4, spaceBetween: 5 },
                1600: { slidesPerView: 5, spaceBetween: 5 },
              }}
              loop
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              navigation
              preventClicks={true}
              preventClicksPropagation={false}
              className="py-4 lg:mt-12 custom-swiper items-center"
            >
              {similar.map((item) => {
                const discountPercent =
                  item.salePrice && item.salePrice < item.price
                    ? Math.round(
                        ((item.price - item.salePrice) / item.price) * 100,
                      )
                    : 0;

                const stats = reviewStats[item._id];

                return (
                  <SwiperSlide key={item._id} className="p-2">
                    <Link
                      key={item._id}
                      href={`/Products/${item.slug}`}
                      className="bg-primary w-full sm:w-auto rounded-2xl shadow-md hover:shadow-xl flex flex-col overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative h-76 sm:h-82 md:h-90 lg:h-100"
                    >
                      {/* DISCOUNT BADGE */}
                      {discountPercent > 0 && (
                        <span className="absolute top-2 left-2 bg-secondary text-color text-[8px] sm:text-xs font-bold px-2 py-1 rounded-full z-10">
                          %{discountPercent} OFF
                        </span>
                      )}

                      {/* favorite */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer group"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavorite(item._id);
                        }}
                      >
                        <Heart
                          className={`w-3 h-3 transition-colors duration-300 active:scale-[0.97] group-hover:scale-110 ${
                            isFavorite(item._id)
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                          fill={isFavorite(item._id) ? "currentColor" : "none"}
                        />
                      </Button>

                      {/* image */}
                      <div className="flex items-center justify-center p-2 sm:p-4">
                        {item.image && item.image.length > 0 ? (
                          <Image
                            src={item.image[0].url}
                            alt={item.product_name}
                            width={400}
                            height={400}
                            sizes="
    (max-width: 640px) 50vw,
    (max-width: 1024px) 33vw,
    (max-width: 1536px) 25vw,
    20vw
  "
                            className="rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-44 xl:h-44 object-cover border-2 sm:border-4 border-white shadow-2xl"
                          />
                        ) : (
                          <p className="text-white text-sm">No image!</p>
                        )}
                      </div>

                      <div className="px-2 sm:px-4 py-1 sm:py-2 text-center">
                        <h2 className="text-white text-xs sm:text-base md:text-lg truncate font-semibold">
                          {item.product_name}
                        </h2>
                      </div>

                      {/* Review stars & count */}
                      {stats && stats.count > 0 && (
                        <div className="flex items-center justify-center gap-1 text-gray-200 mt-1">
                          <div className="flex text-yellow-500">
                            {[...Array(Math.round(stats.avgRating))].map(
                              (_, i) => (
                                <Star key={i} sx={{ fontSize: 16 }} />
                              ),
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs text-color3 font-semibold">
                            ( {stats.count} )
                          </span>
                        </div>
                      )}

                      <div className="px-4 py-3 sm:px-4 sm:py-2 h-12 sm:h-24 md:h-24 overflow-hidden mt-1">
                        <h2 className="text-[10px] sm:text-xs lg:text-sm text-color font-semibold line-clamp-2 md:line-clamp-3 leading-snug">
                          {item.description}
                        </h2>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center px-2 sm:px-4 py-2">
                        <div className="flex flex-col items-center">
                          {item.salePrice && item.salePrice < item.price ? (
                            <>
                              <span className="line-through text-color text-xs opacity-55 font-bold">
                                ${item.price.toFixed(2)}
                              </span>
                              <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                                ${item.salePrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-color text-sm sm:text-base xl:text-lg font-semibold">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlerSimilarAddCart(item);
                          }}
                          className="w-full sm:w-auto h-auto bg-secondary text-color cursor-pointer hover:bg-white text-sm sm:text-base transition-colors duration-400 ease-in-out active:scale-[0.97]"
                        >
                          Add To Cart
                        </Button>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Custom Pagination */}
            <div className="flex justify-center mt-8 gap-2">
              {similar.map((_, index) => (
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
      default:
        return null;
    }
  };

  return (
    <div className="h-screen relative">
      <div className="min-h-screen bg-gray-50 p-4">
        {loading ? (
          <div className="lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {product && (
              <div className="bg-primary shadow-lg rounded-2xl flex flex-col md:flex-row max-w-6xl mx-auto overflow-hidden relative">
                {/* IMAGE GALLERY - LEFT SIDE */}
                <div className="w-full md:w-1/2 p-4 flex gap-3">
                  {/* Thumbnail Column - Only show if there are multiple images */}
                  {product.image && product.image.length > 1 && (
                    <div className="flex flex-col gap-2 w-20">
                      {product.image.slice(0, 5).map((img, index) => (
                        <div
                          key={img._id || index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative h-20 w-20 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                            selectedImageIndex === index
                              ? "ring-4 ring-secondary scale-105 shadow-xl"
                              : "ring-2 ring-gray-300 opacity-70 hover:opacity-100 hover:scale-105"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={`${product.product_name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Image */}
                  <div className="flex-1 relative overflow-hidden group cursor-zoom-in">
                    {/* DISCOUNT BADGE */}
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 bg-secondary text-color text-xs font-bold px-3 py-1 rounded-full z-10">
                        %{discountPercent} OFF
                      </span>
                    )}

                    {product.image && product.image.length > 0 ? (
                      <div className="relative w-full h-80 md:h-auto">
                        <Image
                          src={product.image[selectedImageIndex]?.url || product.image[0].url}
                          alt={product.product_name}
                          fill
                          className="object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-125"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                        No Image
                      </div>
                    )}
                  </div>
                </div>

                {/* PRODUCT INFO - RIGHT SIDE */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6 relative">
                  <div className="absolute right-0 top-0">
                    {/* favorite */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-full hover:bg-[#D6EED6] absolute top-0 right-0 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavorite(product._id);
                      }}
                    >
                      <Heart
                        className={`w-3 h-3 transition-colors duration-300 active:scale-[0.97] ${
                          isFavorite(product._id)
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                        fill={isFavorite(product._id) ? "currentColor" : "none"}
                      />
                    </Button>
                  </div>
                  <h1
                    className="
    text-2xl md:text-4xl 
    font-bold 
    text-color 
    text-center
    break-words
    leading-tight
  "
                  >
                    {product.product_name}
                  </h1>
                  <p className="text-color text-lg break-words whitespace-normal">
                    {product.description}
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      {product.salePrice &&
                      product.salePrice < product.price ? (
                        <>
                          <span className="line-through text-color opacity-50 text-sm">
                            ${(product.price * quantity).toFixed(2)}
                          </span>
                          <span className="text-2xl font-semibold text-color">
                            ${(product.salePrice * quantity).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-semibold text-color">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 justify-center">
                      <Button
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        className="bg-white hover:bg-[#e7eaf6] text-gray-800 w-7 h-7 flex items-center justify-center rounded cursor-pointer active:scale-[0.97]"
                      >
                        -
                      </Button>
                      <span className="text-xl font-medium">{quantity}</span>
                      <Button
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="bg-white hover:bg-[#e7eaf6] text-gray-800 w-7 h-7 flex items-center justify-center rounded cursor-pointer active:scale-[0.97]"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      onClick={handlerAddToCart}
                      className="bg-white hover:bg-white text-color font-medium py-2 rounded-lg mt-3 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.97]"
                    >
                      <p className="text-color text-jost">
                        Add To Cart ({quantity})
                      </p>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full h-20 flex justify-center items-center mt-8">
              <ul className="flex gap-5 items-center sm:justify-center justify-start overflow-x-auto whitespace-nowrap px-2 pb-2 text-jost">
                {["shipping", "features", "reviews", "similar"].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`bg-white text-color text-xs lg:text-sm border-2 shadow-2xl p-2 w-20 min-w-[120px] lg:w-40 lg:h-12 flex justify-center
                      items-center hover:bg-[#A8D1B5] cursor-pointer transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97]
                      ${selectedTab === tab ? "bg-[#A8D1B5]" : ""}`}
                  >
                    {tab === "shipping"
                      ? "Shipping & Returns"
                      : tab === "features"
                        ? "Product Features"
                        : tab === "reviews"
                          ? "Product Reviews"
                          : "Similar Products"}
                  </Button>
                ))}
              </ul>
            </div>
            <div className="w-full h-auto border">{renderTabContent()}</div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetails;