"use client";

import LinearProgress from "@mui/material/LinearProgress";
import CircularText from "@/components/CircularText";
import { useAddProduct } from "./hooks/useAddProduct";
import { useTheme } from "next-themes";
import ProductForm from "./components/ProductForm";
import ProductImages from "./components/ProductImages";
import ProductFeatures from "./components/ProductFeatures";

const AddProduct = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    formData,
    setFormData,
    feature,
    setFeature,
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
  } = useAddProduct();

  return (
    <div className="min-h-screen flex items-center justify-center pt-4 pb-8 px-4 ">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary dark:bg-[#0E5F44] z-50">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-4xl" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 bg-white dark:bg-[#162820] shadow-2xl p-4 sm:p-6 lg:p-8 rounded-2xl max-w-[1600px] mx-auto w-full border border-transparent dark:border-[#2d5a3d]">
          {uploading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#162820] p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 border dark:border-[#2d5a3d]">
                <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-[#c8e6d0]">
                  Uploading Product...
                </h3>
                <LinearProgress
                  sx={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : undefined,
                    "& .MuiLinearProgress-bar": { backgroundColor: "#B1CBBB" },
                  }}
                />
                <p className="text-sm text-gray-500 dark:text-[#7aab8a] text-center mt-3">
                  Please wait while we upload your images
                </p>
              </div>
            </div>
          )}

          <ProductForm
            formData={formData}
            setFormData={setFormData}
            uploading={uploading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isDark={isDark}
          />

          <ProductImages
            previews={previews}
            uploading={uploading}
            removeImage={removeImage}
            handleFileChange={handleFileChange}
          />

          <ProductFeatures
            productFeatures={formData.productFeatures}
            feature={feature}
            setFeature={setFeature}
            uploading={uploading}
            handleAddFeature={handleAddFeature}
            handleDeleteFeature={handleDeleteFeature}
            updateFeatureInList={updateFeatureInList}
          />
        </div>
      )}
    </div>
  );
};

export default AddProduct;