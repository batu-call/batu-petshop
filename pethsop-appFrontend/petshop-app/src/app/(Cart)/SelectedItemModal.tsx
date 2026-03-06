"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartItemType } from "./CartItem";

interface SelectedItemModalProps {
  selectedItem: CartItemType;
  onClose: () => void;
}

const SelectedItemModal = ({
  selectedItem,
  onClose,
}: SelectedItemModalProps) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-2xl w-full max-w-sm relative shadow-xl transform transition-all duration-300 flex flex-col max-h-[90vh]"
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:opacity-45 cursor-pointer text-2xl z-10"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Kaydırma Alanı: İsmin veya açıklamanın çok uzun olması durumunda modalı korur */}
        <div className="flex flex-col items-center text-center overflow-y-auto overflow-x-hidden scrollbar-hide">
          {selectedItem.product.image?.[0]?.url && (
            <div className="w-full max-w-[260px] mt-2 flex-shrink-0">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={selectedItem.product.image[0].url}
                  alt={selectedItem.product.product_name}
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Ürün İsmi: break-words ve w-full ile yana taşmayı engelledik */}
          <h2 className="text-xl sm:text-2xl font-semibold mt-4 text-gray-800 break-words w-full">
            {selectedItem.product.product_name}
          </h2>

          {/* Açıklama: break-words ekledik ki tek kelime çok uzunsa (link vs) kutuyu bozmasın */}
          {selectedItem.product.description && (
            <div className="mt-4 w-full">
              <p className="px-4 py-3 text-sm sm:text-base text-gray-600 leading-relaxed bg-gray-50 rounded-xl border border-gray-200 break-words text-center">
                {selectedItem.product.description}
              </p>
            </div>
          )}

          {/* Fiyat Bilgisi */}
          <div className="text-lg sm:text-xl font-bold mt-4 text-gray-900 flex-shrink-0">
            $
            {(
              selectedItem.product.salePrice ?? selectedItem.product.price
            ).toFixed(2)}
            <span className="mx-2 text-gray-400">×</span>
            {selectedItem.quantity}
            <span className="mx-2 text-gray-400">=</span>$
            {(
              (selectedItem.product.salePrice ?? selectedItem.product.price) *
              selectedItem.quantity
            ).toFixed(2)}
          </div>

          {selectedItem.product.slug && (
            <Link href={`/Products/${selectedItem.product.slug}`} className="w-full flex-shrink-0">
              <Button
                className="mt-5 w-full bg-primary hover:bg-[#D6EED6] text-gray-900 font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md cursor-pointer"
                onClick={onClose}
              >
                View Full Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedItemModal;