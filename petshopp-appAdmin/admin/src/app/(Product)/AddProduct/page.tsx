"use client";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { AdminGuard } from "@/app/Context/AdminGuard";
import Image from "next/image";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";

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
  const [feature, setFeature] = useState<Features>({ name: "", description: "" });
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
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof ProductFormData;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
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
      const data = new FormData();
      (Object.keys(formData) as (keyof ProductFormData)[]).forEach((key) => {
        if (key === "productFeatures") {
          data.append(key, JSON.stringify(formData.productFeatures));
        } else {
          data.append(key, String(formData[key]));
        }
      });
      if (file) data.append("image", file);

      const res = await axios.post(
        "http://localhost:5000/api/v1/product/products",
        data,
        { withCredentials: true }
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
        setFile(null);
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

  return (
    <div className="bg-primary min-h-screen">
      <AdminGuard>
        <Navbar />
        <Sidebar />

        <div className="flex flex-col lg:flex-row gap-6 bg-white shadow-2xl ml-60 mt-20 p-8 rounded-2xl max-w-[1600px] mx-auto">
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
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              sx={{
                mt: 3,
                backgroundColor: "#B1CBBB",
                color: "#393E46",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#A3C3AA",
                  transform: "scale(1.02)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Add Product
            </Button>
          </div>

          {/* MIDDLE - IMAGE */}
          <div className="flex-1 flex flex-col items-center justify-start">
            <h2 className="text-color text-2xl mb-2 text-jost font-semibold">
              Product Image
            </h2>
            <div className="border-2 h-80 w-full relative rounded-lg overflow-hidden">
              {file ? (
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Selected Product"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-color2 text-center mt-32">No image selected</p>
              )}
            </div>
            <Button
              variant="contained"
              component="label"
              sx={{
                mt: 2,
                backgroundColor: "#B1CBBB",
                color: "#393E46",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#A3C3AA" },
              }}
            >
              Upload Image
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
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
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this feature?")) {
                      const updated = formData.productFeatures.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, productFeatures: updated });
                      toast.success("Feature removed");
                    }
                  }}
                  className="absolute top-2 right-2 text-color cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            ))}

            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <input
                placeholder="Feature name"
                value={feature.name}
                onChange={(e) => setFeature({ ...feature, name: e.target.value })}
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
                sx={{
                  backgroundColor: "#B1CBBB",
                  color: "#393E46",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#A3C3AA", transform: "scale(1.05)" },
                }}
              >
                Add Feature
              </Button>
            </div>
          </div>
        </div>
      </AdminGuard>
    </div>
  );
};

export default AddProduct;
