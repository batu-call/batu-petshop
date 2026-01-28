"use client";
import React from "react";
import Image from "next/image";

type ProductImage = { url: string; publicId: string; _id: string };

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  discountPercent: number;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  selectedImageIndex,
  setSelectedImageIndex,
  discountPercent,
}) => {
  return (
    <div className="w-full md:w-1/2 flex gap-2">
      {/* Thumbnails */}
      {images && images.length > 1 && (
        <div className="flex flex-col gap-3 p-2">
          {images.slice(0, 5).map((img, index) => (
            <div
              key={img._id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-20 w-20 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 bg-gray-100
                ${
                  selectedImageIndex === index
                    ? "ring-4 ring-[#A8D1B5] scale-105 shadow-xl"
                    : "ring-2 ring-gray-200 opacity-70 hover:opacity-100 hover:scale-105"
                }`}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover" 
                sizes="80px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1 relative">
        {/* DISCOUNT BADGE */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-3 bg-secondary text-color text-sm font-bold px-4 py-2 rounded-full z-10 shadow-lg">
            {discountPercent}% OFF
          </div>
        )}

        {images && images.length > 0 ? (
          <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden group">
            <Image
              src={images[selectedImageIndex]?.url || images[0].url}
              alt={productName}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-xl border-2 border-gray-300">
            <p className="text-gray-400 text-lg">No Image Available</p>
          </div>
        )}

        {images && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;