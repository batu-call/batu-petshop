"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirm } from "@/app/Context/confirmContext";

export type Features = {
  name: string;
  description: string;
};

export type ProductFormData = {
  product_name: string;
  description: string;
  price: string;
  category: string;
  subCategory: string; 
  productFeatures: Features[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
};


export const SUB_CATEGORIES: Record<string, string[]> = {
  Cat:     ["Food", "Bed", "Toy", "Litter", "Accessory"],
  Dog:     ["Food", "Bed", "Toy", "Leash",  "Accessory"],
  Bird:    ["Food", "Cage", "Toy", "Accessory"],
  Fish:    ["Food", "Tank", "Filter", "Decoration"],
  Reptile: ["Food", "Habitat", "Lighting", "Accessory"],
  Rabbit:  ["Food", "Cage", "Toy", "Accessory"],
  Horse:   ["Food", "Saddle", "Care", "Accessory"],
};

const INITIAL_FORM: ProductFormData = {
  product_name: "",
  description: "",
  price: "",
  category: "",
  subCategory: "", 
  productFeatures: [],
  stock: 100,
  isActive: true,
  isFeatured: false,
};

export const useAddProduct = () => {
  const { confirm } = useConfirm();

  const [formData, setFormData]     = useState<ProductFormData>(INITIAL_FORM);
  const [feature, setFeature]       = useState<Features>({ name: "", description: "" });
  const [files, setFiles]           = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData((prev) => ({ ...prev, category: value, subCategory: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);

    if (files.length + newFiles.length > 6) {
      toast.error("Maximum 6 images allowed!");
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
    Promise.all(
      newFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((newPreviews) => setPreviews((prev) => [...prev, ...newPreviews]))
      .catch((error) => {
        console.error("Error reading files:", error);
        toast.error("Error loading image previews");
      });
  };

  const removeImage = async (index: number) => {
    if (window.innerWidth < 1024) {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      toast.success("Image removed");
      return;
    }
    const ok = await confirm({
      title: "Remove Image",
      description: "Are you sure you want to remove this image?",
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleAddFeature = () => {
    if (!feature.name || !feature.description)
      return toast.error("Please fill out both fields");
    setFormData((prev) => ({
      ...prev,
      productFeatures: [...prev.productFeatures, feature],
    }));
    setFeature({ name: "", description: "" });
  };

  const handleDeleteFeature = async (index: number) => {
    if (window.innerWidth < 1024) {
      setFormData({ ...formData, productFeatures: formData.productFeatures.filter((_, i) => i !== index) });
      toast.success("Feature removed");
      return;
    }
    const ok = await confirm({
      title: "Delete Feature",
      description: "Are you sure you want to delete this feature?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setFormData({ ...formData, productFeatures: formData.productFeatures.filter((_, i) => i !== index) });
    toast.success("Feature removed");
  };

  const handleSubmit = async () => {
    try {
      if (files.length === 0) return toast.error("Please upload at least one image");
      setUploading(true);

      const data = new FormData();
      (Object.keys(formData) as (keyof ProductFormData)[]).forEach((key) => {
        if (key === "productFeatures") {
          data.append(key, JSON.stringify(formData.productFeatures));
        } else {
          data.append(key, String(formData[key]));
        }
      });
      files.forEach((file) => data.append("images", file));

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
        data,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            console.log(`Upload Progress: ${pct}%`);
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setFormData(INITIAL_FORM);
        setFiles([]);
        setPreviews([]);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Something went wrong");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setUploading(false);
    }
  };

  const updateFeatureInList = (index: number, field: keyof Features, value: string) => {
    const updated = [...formData.productFeatures];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, productFeatures: updated });
  };

  return {
    formData,
    setFormData,
    feature,
    setFeature,
    files,
    previews,
    loading,
    uploading,
    handleChange,
    handleFileChange,
    removeImage,
    handleAddFeature,
    handleDeleteFeature,
    handleSubmit,
    updateFeatureInList,
  };
};