"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";
import ImageManager from "./components/ImageManager";
import ProductForm from "./components/ProductForm";
import FeatureManager from "./components/FeatureManager";
import ReviewList from "./components/ReviewsList";
import LinearProgress from "@mui/material/LinearProgress";

type Features = { name: string; description: string };
type ProductImage = { url: string; publicId: string; _id: string };
type Category = { _id: string; name: string; slug: string };

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  image: ProductImage[];
  slug: string;
  category: Category | string;
  subCategory?: string | null;
  productFeatures: Features[];
};

type Reviews = {
  _id: string;
  productId: string;
  userId: { _id: string; firstName: string; lastName: string; avatar: string };
  helpful: string[];
  rating: number;
  comment: string;
  createdAt: string;
};

const AdminProductDetails = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { confirm } = useConfirm();

  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState<Features>({ name: "", description: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products/slug/${slug}`,
          { withCredentials: true },
        );
        if (res.data.success) setProduct(res.data.product);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response)
          toast.error(error.response.data.message);
        else toast.error("Something went wrong while fetching product!");
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
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${product._id}`,
        );
        setReviews(res.data.success ? res.data.reviews : []);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response)
          toast.error(error.response.data.message);
        else toast.error("Something went wrong while fetching reviews!");
      }
    };
    fetchReviews();
  }, [product?._id]);

  const discountPercent =
    product?.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    if ((product?.image.length || 0) + newFiles.length + files.length > 6) {
      toast.error("Maximum 6 images allowed!");
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setNewPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = async (index: number) => {
    const ok = await confirm({
      title: "Remove Image",
      description: "Remove this image?",
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed from upload queue");
  };

  const deleteExistingImage = async (publicId: string, imageId: string) => {
    if (!product) return;
    const ok = await confirm({
      title: "Delete Image",
      description: "Delete this image permanently?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/${product._id}/image/${imageId}`,
        { withCredentials: true, data: { publicId } },
      );
      if (res.data.success) {
        toast.success("Image deleted successfully!");
        setProduct((prev) =>
          prev
            ? { ...prev, image: prev.image.filter((img) => img._id !== imageId) }
            : prev,
        );
        if (selectedImageIndex >= product.image.length - 1) setSelectedImageIndex(0);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response)
        toast.error(error.response.data.message || "Delete failed");
      else toast.error("Failed to delete image!");
    }
  };

  const handleUpdate = async () => {
    if (!product?._id) return toast.error("Product not found!");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("product_name", product.product_name);
      formData.append("description", product.description);
      formData.append("price", product.price.toString());
      formData.append("salePrice", product.salePrice != null ? product.salePrice.toString() : "");
      formData.append("stock", product.stock.toString());
      formData.append("isActive", product.isActive.toString());
      formData.append("isFeatured", product.isFeatured.toString());
      formData.append("productFeatures", JSON.stringify(product.productFeatures));
      if (product.category) {
        formData.append(
          "category",
          typeof product.category === "string" ? product.category : product.category.name,
        );
      }
      formData.append("subCategory", product.subCategory ?? "");
      newFiles.forEach((file) => formData.append("images", file));

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/update/${product._id}`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } },
      );

      if (res.data.success) {
        toast.success("Product updated successfully!");
        setNewFiles([]);
        setNewPreviews([]);
        const refresh = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products/slug/${slug}`,
          { withCredentials: true },
        );
        if (refresh.data.success) setProduct(refresh.data.product);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response)
        toast.error(error.response.data.message || "Update failed");
      else if (error instanceof Error) toast.error(error.message);
      else toast.error("Update failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleFeatureAdd = () => {
    if (!newFeature.name || !newFeature.description)
      return toast.error("Please fill out both fields");
    setProduct((prev) =>
      prev ? { ...prev, productFeatures: [...prev.productFeatures, newFeature] } : prev,
    );
    setNewFeature({ name: "", description: "" });
    toast.success("Feature added!");
  };

  const handleFeatureUpdate = (index: number, field: "name" | "description", value: string) => {
    if (!product) return;
    const updated = [...product.productFeatures];
    updated[index][field] = value;
    setProduct({ ...product, productFeatures: updated });
  };

  const handleFeatureDelete = async (index: number) => {
    if (!product) return;
    const ok = await confirm({
      title: "Delete Feature",
      description: "Delete this feature?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setProduct({
      ...product,
      productFeatures: product.productFeatures.filter((_, i) => i !== index),
    });
    toast.success("Feature removed");
  };

  const handleReviewDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Review",
      description: "Delete this review?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/${id}`,
        { withCredentials: true },
      );
      toast.success(res.data.message);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response)
        toast.error(error.response.data.message || "Unexpected error");
      else toast.error("Unexpected error!");
    }
  };

  const handleBulkDeleteReviews = async (ids: string[]) => {
    const ok = await confirm({
      title: "Delete Reviews",
      description: `${ids.length} review(s) will be permanently deleted. Are you sure?`,
      confirmText: "Yes, Delete All",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;

    const results = await Promise.allSettled(
      ids.map((id) =>
        axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/${id}`,
          { withCredentials: true },
        ),
      ),
    );

    const succeeded = ids.filter((_, i) => results[i].status === "fulfilled");
    const failedCount = ids.length - succeeded.length;

    if (succeeded.length > 0) {
      setReviews((prev) => prev.filter((r) => !succeeded.includes(r._id)));
      toast.success(`${succeeded.length} review(s) deleted successfully`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} review(s) could not be deleted`);
    }
  };

  const handleProductDelete = async () => {
    if (!product) return;
    const ok = await confirm({
      title: "Delete Product",
      description: "Delete this product? This cannot be undone.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${product._id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success("Product deleted");
        router.push("/AllProduct");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response)
        toast.error(error.response.data.message || "Unexpected error");
      else toast.error("Unexpected error");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="min-h-screen">
      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Updating Product...</h3>
            <LinearProgress
              sx={{ "& .MuiLinearProgress-bar": { backgroundColor: "#B1CBBB" } }}
            />
            <p className="text-sm text-gray-500 text-center mt-3">
              Please wait while we update your product
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
          {product && (
            <>
              <div className="bg-primary shadow-lg rounded-2xl flex flex-col md:flex-row overflow-hidden mb-8">
                <ImageManager
                  images={product.image}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  newPreviews={newPreviews}
                  newFiles={newFiles}
                  onFileChange={handleFileChange}
                  onRemoveNew={removeNewImage}
                  onDeleteExisting={deleteExistingImage}
                  productName={product.product_name}
                />
                <ProductForm
                  productName={product.product_name}
                  description={product.description}
                  category={product.category}
                  subCategory={product.subCategory}
                  price={product.price}
                  salePrice={product.salePrice}
                  stock={product.stock}
                  isActive={product.isActive}
                  isFeatured={product.isFeatured}
                  discountPercent={discountPercent}
                  onProductNameChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, product_name: v } : prev)
                  }
                  onDescriptionChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, description: v } : prev)
                  }
                  onCategoryChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, category: v, subCategory: null } : prev)
                  }
                  onSubCategoryChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, subCategory: v } : prev)
                  }
                  onPriceChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, price: v } : prev)
                  }
                  onSalePriceChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, salePrice: v } : prev)
                  }
                  onStockChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, stock: v } : prev)
                  }
                  onIsActiveChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, isActive: v } : prev)
                  }
                  onIsFeaturedChange={(v) =>
                    setProduct((prev) => prev ? { ...prev, isFeatured: v } : prev)
                  }
                  onUpdate={handleUpdate}
                  onDelete={handleProductDelete}
                />
              </div>

              <FeatureManager
                features={product.productFeatures}
                newFeature={newFeature}
                onFeatureUpdate={handleFeatureUpdate}
                onFeatureDelete={handleFeatureDelete}
                onNewFeatureChange={(field, value) =>
                  setNewFeature({ ...newFeature, [field]: value })
                }
                onFeatureAdd={handleFeatureAdd}
              />

              <ReviewList
                reviews={reviews}
                onDeleteReview={handleReviewDelete}
                onBulkDeleteReviews={handleBulkDeleteReviews}
                formatDate={formatDate}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductDetails;