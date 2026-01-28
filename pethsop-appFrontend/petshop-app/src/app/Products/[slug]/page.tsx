"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/authContext";
import CircularText from "@/components/CircularText";
import { useCart } from "@/app/context/cartContext";
import { useFavorite } from "@/app/context/favoriteContext";
import { useConfirm } from "@/app/context/confirmContext";
import Footer from "@/app/Footer/page";
import ShippingInfo from "./components/Shippinginfo";
import ProductReviews from "./components/ProductReviews";
import ProductImageGallery from "./components/ProductimageGallery";
import ProductInfo from "./components/Productinfo";
import SimilarProducts from "./components/SmilarProduct";
import ProductFeatures from "./components/ProductFeatures";

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
      const ok = await confirm({
        title: "Delete Review",
        description: "Are you sure you want to delete this review?",
        confirmText: "Yes, Delete",
        cancelText: "Cancel",
        variant: "destructive",
      });
      if (!ok) return;

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
        return <ShippingInfo />;
      case "features":
        return <ProductFeatures features={product?.productFeatures || []} />;
      case "reviews":
        return (
          <ProductReviews
            reviews={reviews}
            comment={comment}
            setComment={setComment}
            rating={rating}
            setRating={setRating}
            onSubmitReview={handleAddReview}
            onDeleteReview={handleDeleteReview}
            onHelpful={handleHelpful}
            loading={loading}
            userId={user?._id}
            avgRating={avgRating}
            formatDate={formatDate}
          />
        );
      case "similar":
        return (
          <SimilarProducts
            products={similar}
            reviewStats={reviewStats}
            onAddToCart={handlerSimilarAddCart}
            isFavorite={isFavorite}
            onToggleFavorite={handleFavorite}
          />
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
                <ProductImageGallery
                  images={product.image}
                  productName={product.product_name}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  discountPercent={discountPercent}
                />

              
                <ProductInfo
                  productName={product.product_name}
                  description={product.description}
                  price={product.price}
                  salePrice={product.salePrice}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  onAddToCart={handlerAddToCart}
                  isFavorite={isFavorite(product._id)}
                  onToggleFavorite={() => handleFavorite(product._id)}
                />
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