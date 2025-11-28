"use client";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
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
import StarOutlineIcon from "@mui/icons-material/StarOutline";

type Reviews = {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
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
  const [selectedTab, setSelectedTab] = useState("shipping");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/slug/${slug}`
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
    if (!product) return;
    const fetchSimilarProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const filtered = response.data.products.filter(
            (p: Product) => p._id !== product._id
          );
          setSimilar(filtered);
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
  }, [product]);

  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${product._id}`
        );
        if (response.data.success) {
          setReviews(response.data.review);
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
  }, [product]);

  const handlerAddToCart = async () => {
    if (user || isAuthenticated) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
          { productId: product?._id, quantity: quantity },
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success(response.data.message || "Added to cart!");
          router.push("/Cart");
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
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success(response.data.message || "Added to cart!");
          router.push("/Cart");
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
        { withCredentials: true }
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
          <div className="px-6 py-4">
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Product Reviews
            </h2>
            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                required
                className="border p-2 w-full rounded"
              />
              <div className="flex gap-5 mb-5">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="border p-2 rounded"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r} className="text-color">
                      {r} ☆
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white px-4 py-2 rounded cursor-pointer transition duration-300 ease-in-out hover:scale-110"
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review._id} className="border p-3 rounded">
                    <div className="justify-between flex">
                      <div className="flex gap-5">
                        <p>
                          {Array.from({ length: review.rating }, (_, i) => (
                            <span key={i}>
                              <StarOutlineIcon className="text-color2" />
                            </span>
                          ))}
                        </p>
                        <h2 className="text-sm flex justify-center items-center text-color">
                          {review.userId?.firstName
                            ? review.userId.firstName.charAt(0).toUpperCase() +
                              review.userId.firstName.slice(1)
                            : "User"}{" "}
                          {review.userId?.lastName
                            ? review.userId.lastName[0].toUpperCase()
                            : ""}
                        </h2>
                      </div>

                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-xl text-color font-semibold mt-8">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "similar":
        return (
          <div className="p-6">
            <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
              Similar Products
            </h2>
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              style={
                {
                  "--swiper-theme-color": "#393E46",
                  "--swiper-navigation-size": "30px",
                } as React.CSSProperties
              }
              spaceBetween={20}
              slidesPerView={5}
              loop={true}
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              navigation
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="py-8 mt-7"
            >
              {similar.map((item) => (
                <SwiperSlide key={item._id}>
                  <Link href={`/Products/${item.slug}`}>
                    <div className="bg-primary w-80 h-120 rounded-2xl shadow-md hover:shadow-xl grid overflow-hidden justify-between transition duration-300 ease-in-out hover:scale-[1.02] relative p-4 my-5 cursor-pointer">
                      {/* IMAGE */}
                      <div className="flex items-center justify-center p-4">
                        {item.image && item.image.length > 0 ? (
                          <Image
                            src={item.image[0].url}
                            alt={item.product_name}
                            width={400}
                            height={400}
                            className="rounded-full w-60 h-60 object-cover border-4 border-white shadow-2xl"
                          />
                        ) : (
                          <p className="text-white text-sm">No image!</p>
                        )}
                      </div>

                      {/* Product Name */}
                      <div className="px-4 py-2 text-center flex items-center justify-center">
                        <h2 className="text-white text-lg truncate font-semibold text-center w-64 mx-auto">
                          {item.product_name}
                        </h2>
                      </div>

                      {/* Description */}
                      <div className="px-4 py-2 h-[70px] overflow-hidden">
                        <p className="text-sm text-color font-semibold line-clamp-3 leading-snug">
                          {item.description}
                        </p>
                      </div>

                      {/* Price & Button */}
                      <div className="flex gap-2 justify-between items-center mt-auto">
                        <h2 className="text-color text-2xl font-semibold ml-3">
                          {item.price},00$
                        </h2>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlerSimilarAddCart(item);
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
      <Navbar />
      <Sidebar />
      <div className="ml-40 min-h-screen bg-gray-50 py-10 px-6">
        {loading ? (
          <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {product && (
              <div className="bg-primary shadow-lg rounded-2xl flex flex-col md:flex-row max-w-6xl mx-auto overflow-hidden">
                <div className="relative w-full md:w-1/2 h-80 md:h-auto overflow-hidden group cursor-zoom-in">
                  {product.image?.[0]?.url ? (
                    <Image
                      src={product.image[0].url}
                      alt={product.product_name}
                      fill
                      className="object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-125"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6">
                  <h1 className="text-4xl font-bold text-color flex justify-center items-center">
                    {product.product_name}
                  </h1>
                  <p className="text-color text-lg">{product.description}</p>
                  <div className="flex flex-col gap-4">
                    <span className="text-3xl font-semibold text-color">
                      ${product.price ? product.price * quantity : 0}
                    </span>
                    <div className="flex items-center gap-3 justify-center">
                      <Button
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        className="bg-white hover:bg-[#e7eaf6] text-gray-800 w-7 h-7 flex items-center justify-center rounded cursor-pointer"
                      >
                        -
                      </Button>
                      <span className="text-xl font-medium">{quantity}</span>
                      <Button
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="bg-white hover:bg-[#e7eaf6] text-gray-800 w-7 h-7 flex items-center justify-center rounded cursor-pointer"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      onClick={handlerAddToCart}
                      className="bg-white hover:bg-white text-color font-medium py-3 rounded-lg mt-3 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02]"
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
              <ul className="flex gap-5 justify-center items-center text-jost">
                {["shipping", "features", "reviews", "similar"].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`bg-white text-color text-sm border-2 shadow-2xl p-2 w-40 h-12 flex justify-center items-center hover:bg-[#A8D1B5] cursor-pointer ${
                      selectedTab === tab ? "bg-[#A8D1B5]" : ""
                    }`}
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
    </div>
  );
};

export default ProductDetails;
