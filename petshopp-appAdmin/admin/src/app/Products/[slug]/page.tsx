"use client";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CircularText from "@/components/CircularText";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CloseIcon from "@mui/icons-material/Close";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { X } from "lucide-react";

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
  };
  rating: number;
  comment: string;
  createdAt: string;
};

const AdminProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Reviews[]>([]);

  const [newFeature, setNewFeature] = useState<Features>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/v1/product/admin/products/slug/${slug}`,
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

  const discountPercent =
    product?.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleUpdate = async () => {
    if (!product?._id) return toast.error("Product not found!");

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/product/update/${product._id}`,
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
        `http://localhost:5000/api/v1/reviews/admin/${id}`,
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

  if (loading) {
    return (
      <div className="absolute inset-0 flex justify-center items-center bg-white/60 z-40">
        <CircularText
          text="LOADING"
          spinDuration={20}
          className="text-white text-4xl"
        />
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <Navbar />
      <Sidebar />
      <div className="ml-40 min-h-screen bg-gray-50 py-10 px-6">
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
                      setProduct({ ...product, stock: Number(e.target.value) })
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
                          setProduct({ ...product, isActive: e.target.checked })
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

              <Button
                onClick={handleUpdate}
                className="bg-secondary hover:bg-white text-color font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
              >
                Update Product
              </Button>
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

              {/* Close (delete) butonu */}
              <button
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete this feature?")
                  ) {
                    const updated = product.productFeatures.filter(
                      (_, i) => i !== index
                    );
                    setProduct({ ...product, productFeatures: updated });
                    toast.success("Feature removed");
                  }
                }}
                className="absolute top-2 right-2 text-color cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
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
        <div className="px-6 py-4">
          <h2 className="text-color text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
            Product Reviews
          </h2>
          {/* Reviews List */}
          {!reviews || reviews.length === 0  ? (
            <p>No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review._id} className="border p-3 rounded relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this review?")
                      ) {
                        handleDelete(review._id);
                      }
                    }}
                  >
                    <X className="shadow-2xl m-2 opacity-80 absolute right-0 top-0 transition duration-300 ease-in-out hover:scale-120 cursor-pointer" />
                  </button>
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
                      {formatDate(review.createdAt).toLocaleString()}
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
      </div>
    </div>
  );
};

export default AdminProductDetails;
