"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  previews: string[];
  uploading: boolean;
  removeImage: (index: number) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ProductImages = ({ previews, uploading, removeImage, handleFileChange }: Props) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start">
      <h2 className="text-color dark:text-[#c8e6d0] text-2xl mb-2 text-jost font-semibold">
        Product Images ({previews.length}/6)
      </h2>

      {previews.length > 0 ? (
        <div className="relative w-full h-87 sm:h-100 md:h-112 lg:min-h-auto rounded-xl overflow-hidden mb-4">
          <Image src={previews[0]} alt="" fill aria-hidden
            className="object-cover scale-110 blur-2xl opacity-60" />
          <Image src={previews[0]} alt="Main Product" fill priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="relative z-10 object-cover transition-transform duration-300 ease-in-out" />
        </div>
      ) : (
        <div className="w-full h-87 sm:h-100 md:h-112 lg:min-h-auto bg-gray-100 dark:bg-[#0d1f18] flex items-center justify-center rounded-xl border-2 border-gray-300 dark:border-[#2d5a3d] mb-4">
          <p className="text-gray-400 dark:text-[#7aab8a] text-lg">No image selected</p>
        </div>
      )}

      {previews.length > 1 && (
        <div className="grid grid-cols-3 gap-2 w-full mb-4">
          {previews.slice(1).map((preview, index) => (
            <div key={index + 1} className="relative h-24 border dark:border-[#2d5a3d] rounded-lg overflow-hidden group">
              <Image src={preview} alt={`Product ${index + 2}`} fill className="object-cover" />
              <button
                onClick={() => removeImage(index + 1)}
                disabled={uploading}
                className="absolute top-1 right-1 bg-[#393E46] dark:bg-[#0d1f18] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <Button
          onClick={() => removeImage(0)}
          disabled={uploading}
          className="mb-2 bg-secondary dark:bg-[#1e3d2a] text-red-600 dark:text-red-400 hover:bg-[#A8D1B5] dark:hover:bg-[#2d5a3d] font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer border dark:border-[#2d5a3d]"
        >
          Remove Main Image
        </Button>
      )}

      <Button
        asChild
        disabled={previews.length >= 6 || uploading}
        className="mt-2 bg-primary dark:bg-[#0b8457] hover:bg-[#A8D1B5] dark:hover:bg-[#2d5a3d] text-[#393E46] dark:text-[#c8e6d0] font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <label className={previews.length >= 6 || uploading ? "cursor-not-allowed" : "cursor-pointer"}>
          Upload Images
          <input type="file" hidden multiple accept="image/*" onChange={handleFileChange}
            disabled={previews.length >= 6 || uploading} />
        </label>
      </Button>
      <p className="text-xs text-gray-500 dark:text-[#7aab8a] mt-2">You can upload up to 6 images</p>
    </div>
  );
};

export default ProductImages;