"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type ProductImage = { url: string; publicId: string; _id: string };

interface AdminImageManagerProps {
  images: ProductImage[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  newPreviews: string[];
  newFiles: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveNew: (index: number) => void;
  onDeleteExisting: (publicId: string, imageId: string) => void;
  productName: string;
}

const ImageManager: React.FC<AdminImageManagerProps> = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  newPreviews,
  newFiles,
  onFileChange,
  onRemoveNew,
  onDeleteExisting,
  productName,
}) => {
  const totalImages = images.length + newFiles.length;

  return (
    <div className="w-full md:w-1/2 p-4">
      {/* Main Image */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-4 bg-gray-100">
        {images && images.length > 0 ? (
          <>
            <Image
              src={images[selectedImageIndex]?.url || images[0].url}
              alt={productName}
              fill
              className="object-contain"
              priority
            />
            {/* Delete Button for Current Image */}
            <button
              onClick={() => {
                const currentImage = images[selectedImageIndex];
                if (currentImage) {
                  onDeleteExisting(currentImage.publicId, currentImage._id);
                }
              }}
              className="absolute top-3 right-3 bg-secondary hover:bg-white text-color rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10 cursor-pointer"
              title="Delete this image"
            >
              <Trash2 size={18} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">No Image Available</p>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {images.map((img, index) => (
            <div
              key={img._id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-20 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 group ${
                selectedImageIndex === index
                  ? "ring-4 ring-secondary scale-105 shadow-xl"
                  : "ring-2 ring-gray-300 opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 15vw"
              />
              {/* Delete button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteExisting(img.publicId, img._id);
                }}
                className="absolute top-1 right-1 bg-secondary hover:bg-white text-color rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Images Preview */}
      {newPreviews.length > 0 && (
        <div className="mb-4">
          <h3 className="text-color font-semibold mb-2 text-sm">
            New Images to Upload:
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {newPreviews.map((preview, index) => (
              <div
                key={index}
                className="relative h-20 border-2 border-dashed border-secondary rounded-lg overflow-hidden group"
              >
                <Image
                  src={preview}
                  alt={`New image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => onRemoveNew(index)}
                  className="absolute top-1 right-1 bg-secondary text-color rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Button
        asChild
        disabled={totalImages >= 6}
        className="w-full bg-secondary hover:bg-white text-color font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <label className={totalImages >= 6 ? "cursor-not-allowed" : "cursor-pointer"}>
          {totalImages >= 6 ? "Maximum Images Reached" : `Add Images (${totalImages}/6)`}
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={onFileChange}
            disabled={totalImages >= 6}
          />
        </label>
      </Button>
    </div>
  );
};

export default ImageManager;