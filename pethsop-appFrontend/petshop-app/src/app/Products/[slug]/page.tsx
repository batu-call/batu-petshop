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
type Section = { _id: string; title: string; items: { _id: string; text: string }[] };
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
  stock?: string | number;
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
  const { favorites, addFavorite, removeFavorite, fetchFavorites } = useFavorite();
  const { confirm } = useConfirm();
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const [shippingFee, setShippingFee] = useState("");
  const [freeOver, setFreeOver] = useState("");
  const [shippingSections, setShippingSections] = useState<Section[]>([]);

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
    const fetchShippingSettings = async () => {
      try {
        const [feeRes, contentRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping/content`),
        ]);
        if (feeRes.data.success) {
          setShippingFee(String(feeRes.data.data.fee));
          setFreeOver(String(feeRes.data.data.freeOver));
        }
        if (contentRes.data.success && contentRes.data.data?.sections?.length > 0) {
          setShippingSections(contentRes.data.data.sections);
        }
      } catch {
      }
    };
    fetchShippingSettings();
  }, []);

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
    if (!user && !isAuthenticated) {
      router.push("/Login");
      return;
    }
    if (!product?._id || addingToCart === product._id) return;
    try {
      setAddingToCart(product._id);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
        { productId: product._id, quantity: quantity },
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success(response.data.message || "Added to cart!");
        setCart(response.data.cart.items);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handlerSimilarAddCart = async (item: Product) => {
    if (!user && !isAuthenticated) {
      router.push("/Login");
      return;
    }
    if (!item._id || addingToCart === item._id) return;
    try {
      setAddingToCart(item._id);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/addCart`,
        { productId: item._id, quantity: 1 },
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
    } finally {
      setAddingToCart(null);
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
        return (
          <ShippingInfo
            shippingFee={shippingFee}
            freeOver={freeOver}
            sections={shippingSections}
          />
        );
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
            addingToCart={addingToCart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen relative">
      <div className="min-h-screen p-4">
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
              <div className="bg-primary shadow-lg rounded-2xl flex flex-col md:flex-row max-w-6xl mx-auto overflow-hidden relative items-stretch">
                <ProductImageGallery
                  images={product.image}
                  productName={product.product_name}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  discountPercent={discountPercent}
                  stock={product.stock}
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
                  isAddingToCart={addingToCart === product._id}
                />
              </div>
            )}

            <div className="w-full h-20 flex justify-center items-center mt-8">
              <ul className="flex gap-1.5 sm:gap-5 items-center justify-center px-2 pb-2 text-jost w-full sm:w-auto">
                {["shipping", "features", "reviews", "similar"].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`bg-white dark:bg-[#1e3d2a] text-color dark:text-[#a8d4b8] text-[10px] sm:text-xs lg:text-sm border-2 dark:border-[#2d5a3d] shadow-2xl p-1 sm:p-2 flex-1 sm:w-20 sm:min-w-[120px] lg:w-40 lg:h-12 flex justify-center
                      items-center hover:bg-[#A8D1B5] dark:hover:bg-[#2d5a3d] dark:hover:text-[#c8e6d0] cursor-pointer transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97]
                      ${selectedTab === tab ? "bg-[#A8D1B5] dark:bg-[#0b8457] dark:text-[#c8e6d0] dark:border-[#0b8457]" : ""}`}
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