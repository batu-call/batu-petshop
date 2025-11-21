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
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  image: ProductImage[];
  slug: string;
  category: Category;
  productFeatures: Features[];
};

const AdminProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);

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
          `http://localhost:5000/api/v1/product/products/slug/${slug}`
        );
        if (response.data.success) {
          setProduct(response.data.product);
        }
      } catch (error: unknown) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleUpdate = async () => {
    if (!product?._id) return toast.error("Product not found!");

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/product/update/${product._id}`,
        {
          product_name: product.product_name,
          description: product.description,
          price: product.price,
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
    }catch (error: unknown) {
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
        if (confirm("Are you sure you want to delete this feature?")) {
          const updated = product.productFeatures.filter((_, i) => i !== index);
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
      </div>
    </div>
  );
};

export default AdminProductDetails;
