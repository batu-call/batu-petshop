"use client";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CircularText from "@/components/CircularText";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CloseIcon from "@mui/icons-material/Close";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import { useConfirm } from "@/app/Context/confirmContext";

type Features = {
  name: string;
  description: string;
};

type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};
type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  image: ProductImage[];
  slug: string;
  category: Category;
  productFeatures: Features[];
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

const AdminProductDetails = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Reviews[]>([]);

  const [newFeature, setNewFeature] = useState<Features>({
    name: "",
    description: "",
  });
  const { admin } = useAdminAuth();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products/slug/${slug}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setProduct(response.data.product);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong while fetching reviews!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${product._id}`
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

  const discountPercent =
    product?.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleUpdate = async () => {
    if (!product?._id) return toast.error("Product not found!");

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/update/${product._id}`,
        {
          product_name: product.product_name,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice === undefined ? null : product.salePrice,
          stock: product.stock,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          productFeatures: product.productFeatures,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Product updated successfully!");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Update failed");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Update failed!");
      }
    }
  };

  const handleFeatureAdd = () => {
    if (!newFeature.name || !newFeature.description)
      return toast.error("Please fill out both fields");
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            productFeatures: [...prev.productFeatures, newFeature],
          }
        : prev
    );
    setNewFeature({ name: "", description: "" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/${id}`,
        { withCredentials: true }
      );

      toast.success(response.data.message);

      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Unexpected error");
      } else {
        toast.error("Unexpected error!");
      }
    }
  };
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

  const handlerRemove = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Product deleted ✅");
        router.push("/AllProduct");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unexpected error");
    }
  };

  return (
    <div className="h-screen relative">
      <Navbar />
      <Sidebar />
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="md:ml-24 lg:ml-40 min-h-screen bg-gray-50 py-10 px-6">
          {product && (
            <div className="bg-primary shadow-lg rounded-2xl flex flex-col md:flex-row max-w-6xl mx-auto overflow-hidden">
              <div className="relative w-full md:w-1/2 h-80 md:h-auto">
                {product.image?.[0]?.url ? (
                  <Image
                    src={product.image[0].url}
                    alt={product.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6">
                <input
                  value={product.product_name}
                  onChange={(e) =>
                    setProduct({ ...product, product_name: e.target.value })
                  }
                  className="text-3xl font-bold text-color bg-white border p-2 rounded"
                />

                <textarea
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  className="text-color text-lg bg-white border p-2 rounded"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-lg text-color font-semibold">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) =>
                      setProduct({ ...product, price: Number(e.target.value) })
                    }
                    className="text-xl font-semibold text-color bg-white border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-lg text-color font-semibold">
                    Sale Price (optional)
                  </label>
                  <input
                    type="number"
                    value={product.salePrice ?? ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        salePrice: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="text-xl font-semibold text-color bg-white border p-2 rounded"
                  />
                  {discountPercent > 0 && (
                    <p className="text-sm text-zinc-600 font-semibold">
                      %{discountPercent} discount is being applied
                    </p>
                  )}
                </div>

                {/* Stock + Switch controls */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <label className="text-lg text-color font-semibold">
                      Stock:
                    </label>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          stock: Number(e.target.value),
                        })
                      }
                      className="border border-white p-2 rounded w-28 text-xl text-color flex justify-center items-center"
                    />
                  </div>

                  <div>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={product.isActive}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              isActive: e.target.checked,
                            })
                          }
                          color="success"
                        />
                      }
                      label="Active Product"
                      className="text-color text-2xl text-jost font-semibold"
                    />
                  </div>
                  <div className="text-color text-2xl text-jost">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={product.isFeatured}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              isFeatured: e.target.checked,
                            })
                          }
                          color="success"
                        />
                      }
                      label="Featured Product"
                    />
                  </div>
                </div>

                  <div className="flex flex-col">
                <Button
                  onClick={handleUpdate}
                  className="bg-secondary hover:bg-white text-color font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
                >
                  Update Product
                </Button>
                <Button
                  onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Product",
                        description:
                          "Are you sure you want to delete this product?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handlerRemove(product._id);
                    }}
                  className="bg-[#393E46] hover:bg-white text-white hover:text-[#393E46] font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
                >
                  Delete Product
                </Button>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="max-w-4xl mx-auto mt-12 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-color mb-4">
              Product Features
            </h2>

            {product?.productFeatures.map((f, index) => (
              <div
                key={index}
                className="flex items-start gap-3 border-b py-2 mb-2 relative group"
              >
                <input
                  value={f.name}
                  onChange={(e) => {
                    const updated = [...product.productFeatures];
                    updated[index].name = e.target.value;
                    setProduct({ ...product, productFeatures: updated });
                  }}
                  className="border p-2 rounded w-1/3"
                />
                <textarea
                  value={f.description}
                  onChange={(e) => {
                    const updated = [...product.productFeatures];
                    updated[index].description = e.target.value;
                    setProduct({ ...product, productFeatures: updated });
                  }}
                  className="border p-2 rounded w-2/3"
                />

                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const ok = await confirm({
                      title: "Delete Feature",
                      description:
                        "Are you sure you want to delete this feature?",
                      confirmText: "Yes, Delete",
                      cancelText: "Cancel",
                      variant: "destructive",
                    });

                    if (!ok) return;

                    const updated = product.productFeatures.filter(
                      (_, i) => i !== index
                    );

                    setProduct({ ...product, productFeatures: updated });
                    toast.success("Feature removed");
                  }}
                  className="absolute top-2 right-2
  text-color cursor-pointer
  opacity-100 lg:opacity-0 lg:group-hover:opacity-100
  transition-all duration-300 hover:scale-110"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            ))}

            {/* Add new feature */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <input
                placeholder="Feature name"
                value={newFeature.name}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, name: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <input
                placeholder="Feature description"
                value={newFeature.description}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, description: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <Button
                onClick={handleFeatureAdd}
                className="bg-secondary hover:bg-[#A8D1B5] text-color font-semibold px-6 transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
              >
                Add Feature
              </Button>
            </div>
          </div>

          {/* Reviews */}
          <div className="px-6 py-10 max-w-4xl mx-auto">
            <h2 className="text-color text-3xl md:text-4xl font-bold flex items-center justify-center py-4 border-b-2 border-color2 mb-8">
              Product Reviews
            </h2>

            {!reviews || reviews.length === 0 ? (
              <p className="text-center text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const reviewUser = review.userId;

                  return (
                    <div
                      key={review._id}
                      className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative"
                    >
                      {admin && (
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

                            if (!ok) return;

                            handleDelete(review._id);
                          }}
                          className="absolute top-2 right-2
  text-color cursor-pointer
  opacity-100 lg:opacity-0 lg:group-hover:opacity-100
  transition-all duration-300 hover:scale-110"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      )}

                      {/* HEADER */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                            <Image
                              src={
                                review.userId?.avatar || "/default-avatar.png"
                              }
                              alt="user avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-color">
                              {reviewUser
                                ? `${reviewUser.firstName} ${reviewUser.lastName?.[0]}.`
                                : "Deleted User"}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* RATING */}
                        <div className="flex text-yellow-500 mr-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <StarOutlineIcon key={i} fontSize="small" />
                          ))}
                        </div>
                      </div>

                      {/* COMMENT */}
                      <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductDetails;
