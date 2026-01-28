"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CircularText from "@/components/CircularText";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import { useConfirm } from "@/app/Context/confirmContext";
import ImageManager from "./components/ImageManager";
import ProductForm from "./components/ProductForm";
import FeatureManager from "./components/FeatureManager";
import ReviewList from "./components/ReviewsList";

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
  salePrice?: number | null;
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
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
          { withCredentials: true },
        );
        if (response.data.success) {
          setProduct(response.data.product);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong while fetching product!");
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

  const discountPercent =
    product?.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const currentImageCount = product?.image.length || 0;
      
      if (currentImageCount + newFiles.length + files.length > 6) {
        toast.error("Maximum 6 images allowed!");
        return;
      }

      setNewFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = async (index: number) => {
    const ok = await confirm({
      title: "Remove Image",
      description: "Are you sure you want to remove this image?",
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
      description: "Are you sure you want to delete this image permanently?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!ok) return;

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/${product._id}/image/${imageId}`,
        { 
          withCredentials: true,
          data: { publicId }
        },
      );

      if (response.data.success) {
        toast.success("Image deleted successfully!");
        
        // Update local state
        setProduct((prev) => 
          prev ? {
            ...prev,
            image: prev.image.filter(img => img._id !== imageId)
          } : prev
        );
        
        // Reset selected index if needed
        if (selectedImageIndex >= product.image.length - 1) {
          setSelectedImageIndex(0);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Delete failed");
      } else {
        toast.error("Failed to delete image!");
      }
    }
  };

  const handleUpdate = async () => {
    if (!product?._id) return toast.error("Product not found!");

    try {
      const formData = new FormData();
      
      formData.append("product_name", product.product_name);
      formData.append("description", product.description);
      formData.append("price", product.price.toString());
      
      if (product.salePrice !== null && product.salePrice !== undefined) {
        formData.append("salePrice", product.salePrice.toString());
      } else {
        formData.append("salePrice", "");
      }
      
      formData.append("stock", product.stock.toString());
      formData.append("isActive", product.isActive.toString());
      formData.append("isFeatured", product.isFeatured.toString());
      formData.append("productFeatures", JSON.stringify(product.productFeatures));
      
      if (product.category) {
        formData.append("category", typeof product.category === 'string' ? product.category : product.category.name);
      }

      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/update/${product._id}`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      
      if (response.data.success) {
        toast.success("Product updated successfully!");
        setNewFiles([]);
        setNewPreviews([]);
        
        // Refresh product data
        const refreshResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products/slug/${slug}`,
          { withCredentials: true },
        );
        if (refreshResponse.data.success) {
          setProduct(refreshResponse.data.product);
        }
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
    if (!newFeature.name || !newFeature.description) {
      return toast.error("Please fill out both fields");
    }
    
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            productFeatures: [...prev.productFeatures, newFeature],
          }
        : prev,
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
      description: "Are you sure you want to delete this feature?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!ok) return;

    const updated = product.productFeatures.filter((_, i) => i !== index);
    setProduct({ ...product, productFeatures: updated });
    toast.success("Feature removed");
  };

  const handleReviewDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Review",
      description: "Are you sure you want to delete this review?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!ok) return;

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/${id}`,
        { withCredentials: true },
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

  const handleProductDelete = async () => {
    if (!product) return;

    const ok = await confirm({
      title: "Delete Product",
      description: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!ok) return;

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${product._id}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("Product deleted ✅");
        router.push("/AllProduct");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unexpected error");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
          {product && (
            <>
              {/* Main Product Card */}
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
                  price={product.price}
                  salePrice={product.salePrice}
                  stock={product.stock}
                  isActive={product.isActive}
                  isFeatured={product.isFeatured}
                  discountPercent={discountPercent}
                  onProductNameChange={(value) =>
                    setProduct({ ...product, product_name: value })
                  }
                  onDescriptionChange={(value) =>
                    setProduct({ ...product, description: value })
                  }
                  onCategoryChange={(value) =>
                    setProduct({ ...product, category: value as any })
                  }
                  onPriceChange={(value) =>
                    setProduct({ ...product, price: value })
                  }
                  onSalePriceChange={(value) =>
                    setProduct({ ...product, salePrice: value })
                  }
                  onStockChange={(value) =>
                    setProduct({ ...product, stock: value })
                  }
                  onIsActiveChange={(value) =>
                    setProduct({ ...product, isActive: value })
                  }
                  onIsFeaturedChange={(value) =>
                    setProduct({ ...product, isFeatured: value })
                  }
                  onUpdate={handleUpdate}
                  onDelete={handleProductDelete}
                />
              </div>

              {/* Features Section */}
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

              {/* Reviews Section */}
              <ReviewList
                reviews={reviews}
                onDeleteReview={handleReviewDelete}
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