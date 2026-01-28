"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TextField from "@mui/material/TextField";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { AdminGuard } from "@/app/Context/AdminGuard";
import Image from "next/image";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Features = {
  name: string;
  description: string;
};

type ProductFormData = {
  product_name: string;
  description: string;
  price: string;
  category: string;
  productFeatures: Features[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
};

const AddProduct = () => {
  const [feature, setFeature] = useState<Features>({
    name: "",
    description: "",
  });
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: "",
    description: "",
    price: "",
    category: "",
    productFeatures: [],
    stock: 100,
    isActive: true,
    isFeatured: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { confirm } = useConfirm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof ProductFormData;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Maksimum 6 resim kontrolü
      if (files.length + newFiles.length > 6) {
        toast.error("Maximum 6 images allowed!");
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
      
      // Preview oluştur
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = async (index: number) => {
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

  const handleSubmit = async () => {
    try {
      if (files.length === 0) {
        return toast.error("Please upload at least one image");
      }

      const data = new FormData();
      (Object.keys(formData) as (keyof ProductFormData)[]).forEach((key) => {
        if (key === "productFeatures") {
          data.append(key, JSON.stringify(formData.productFeatures));
        } else {
          data.append(key, String(formData[key]));
        }
      });
      
      // Tüm resimleri ekle
      files.forEach((file) => {
        data.append("images", file);
      });

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products`,
        data,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setFormData({
          product_name: "",
          description: "",
          price: "",
          category: "",
          productFeatures: [],
          stock: 100,
          isActive: true,
          isFeatured: false,
        });
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
    }
  };

  const handleDeleteFeature = async (index: number) => {
    const ok = await confirm({
      title: "Delete Feature",
      description: "Are you sure you want to delete this feature?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!ok) return;

    const updated = formData.productFeatures.filter((_, i) => i !== index);
    setFormData({ ...formData, productFeatures: updated });
    toast.success("Feature removed");
  };

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#f6f7f9] h-full flex items-center justify-center mt-80 md:mt-70 lg:mt-0">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 bg-white shadow-2xl p-8 rounded-2xl max-w-[1600px] mx-auto">
          {/* LEFT SIDE - FORM */}
          <div className="flex-1">
            <h2 className="text-color text-2xl mb-4 text-jost font-semibold">
              Add New Product
            </h2>

            <TextField
              label="Product Name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              fullWidth
              sx={{
                mb: 2,
                "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#B1CBBB",
                  },
              }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              sx={{
                mb: 2,
                "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#B1CBBB",
                  },
              }}
            />
            <TextField
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              sx={{
                mb: 2,
                "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#B1CBBB",
                  },
              }}
            />
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              sx={{
                mb: 2,
                "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#B1CBBB",
                  },
                "& .MuiSelect-select": { color: "#393E46" },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        color: "#393E46",
                        "&:hover": {
                          backgroundColor: "rgba(177, 203, 187, 0.2)",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "rgba(177, 203, 187, 0.3)",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "rgba(177, 203, 187, 0.4)",
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="Cat">Cat</MenuItem>
              <MenuItem value="Dog">Dog</MenuItem>
              <MenuItem value="Fish">Fish</MenuItem>
              <MenuItem value="Bird">Bird</MenuItem>
              <MenuItem value="Reptile">Reptile</MenuItem>
              <MenuItem value="Rabbit">Rabbit</MenuItem>
              <MenuItem value="Horse">Horse</MenuItem>
            </TextField>

            <TextField
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
              sx={{
                mb: 2,
                "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#B1CBBB",
                  },
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  color="success"
                />
              }
              label="Active Product"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  color="success"
                />
              }
              label="Featured Product"
            />

            <Button
              onClick={handleSubmit}
              className="
    mt-3
    w-full
    bg-primary 
    hover:bg-[#A8D1B5]
    text-[#393E46]
    font-semibold
    transition-all
    duration-200
    ease-in-out
    hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md
    cusor-poiinter
  "
            >
              Add Product
            </Button>
          </div>

          {/* MIDDLE - IMAGES */}
          <div className="flex-1 flex flex-col items-center justify-start">
            <h2 className="text-color text-2xl mb-2 text-jost font-semibold">
              Product Images ({previews.length}/6)
            </h2>
            
            {/* Main Image Preview */}
            <div className="border-2 h-80 w-full relative rounded-lg overflow-hidden mb-4">
              {previews.length > 0 ? (
                <Image
                  src={previews[0]}
                  alt="Main Product"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-color2 text-center mt-32">
                  No image selected
                </p>
              )}
            </div>

            {/* Thumbnail Grid */}
            {previews.length > 1 && (
              <div className="grid grid-cols-3 gap-2 w-full mb-4">
                {previews.slice(1).map((preview, index) => (
                  <div
                    key={index + 1}
                    className="relative h-24 border rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={preview}
                      alt={`Product ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeImage(index + 1)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Remove First Image Button */}
            {previews.length > 0 && (
              <Button
                onClick={() => removeImage(0)}
                className="mb-2 bg-red-500 hover:bg-red-600 text-white"
              >
                Remove Main Image
              </Button>
            )}

            <Button
              asChild
              disabled={previews.length >= 6}
              className="
            mt-2
            bg-primary 
    hover:bg-[#A8D1B5]
            text-[#393E46]
            font-semibold
            transition-colors
            hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md
     disabled:opacity-50
     disabled:cursor-not-allowed
          "
            >
              <label className={previews.length >= 6 ? "cursor-not-allowed" : "cursor-pointer"}>
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={previews.length >= 6}
                />
              </label>
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              You can upload up to 6 images
            </p>
          </div>

          {/* RIGHT - FEATURES */}
          <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-color mb-4">
              Product Features
            </h2>

            {formData.productFeatures.map((f, index) => (
              <div
                key={index}
                className="flex items-start gap-3 border-b py-2 mb-2 relative group"
              >
                <input
                  value={f.name}
                  onChange={(e) => {
                    const updated = [...formData.productFeatures];
                    updated[index].name = e.target.value;
                    setFormData({ ...formData, productFeatures: updated });
                  }}
                  className="border p-2 rounded w-1/3"
                />
                <textarea
                  value={f.description}
                  onChange={(e) => {
                    const updated = [...formData.productFeatures];
                    updated[index].description = e.target.value;
                    setFormData({ ...formData, productFeatures: updated });
                  }}
                  className="border p-2 rounded w-2/3"
                />
                <button
                  onClick={() => handleDeleteFeature(index)}
                  className="absolute top-2 right-2
  text-color cursor-pointer
  opacity-100 lg:opacity-0 lg:group-hover:opacity-100
  transition-all duration-300 hover:scale-110"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            ))}

            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <input
                placeholder="Feature name"
                value={feature.name}
                onChange={(e) =>
                  setFeature({ ...feature, name: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <input
                placeholder="Feature description"
                value={feature.description}
                onChange={(e) =>
                  setFeature({ ...feature, description: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <Button
  onClick={handleAddFeature}
  className="
    bg-primary 
    hover:bg-[#A8D1B5]
    text-[#393E46]
    font-semibold
    transition-all
    duration-20
    hover:scale-[1.05]
    active:scale-[0.97]
     hover:shadow-md
  "
>
  Add Feature
</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;