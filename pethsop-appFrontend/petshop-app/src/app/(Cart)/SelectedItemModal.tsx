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
        className="bg-white p-6 rounded-2xl w-full max-w-sm relative shadow-xl transform transition-all duration-300 scale-100 opacity-100"
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:opacity-45 cursor-pointer text-2xl"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center">
          {selectedItem.product.image?.[0]?.url && (
            <div className="w-full max-w-[260px] mt-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={selectedItem.product.image[0].url}
                  alt={selectedItem.product.product_name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-semibold mt-4 text-gray-800">
            {selectedItem.product.product_name}
          </h2>

          {selectedItem.product.description && (
            <p className="mt-4 px-4 py-3 text-sm sm:text-base text-gray-600 leading-relaxed bg-gray-50 rounded-xl border border-gray-200">
              {selectedItem.product.description}
            </p>
          )}

          <div className="text-lg sm:text-xl font-bold mt-4 text-gray-900">
            $
            {(
              selectedItem.product.salePrice ??
              selectedItem.product.price
            ).toFixed(2)}
            <span className="mx-2 text-gray-400">×</span>
            {selectedItem.quantity}
            <span className="mx-2 text-gray-400">=</span>$
            {(
              (selectedItem.product.salePrice ??
                selectedItem.product.price) * selectedItem.quantity
            ).toFixed(2)}
          </div>

          {selectedItem.product.slug && (
            <Link href={`/Products/${selectedItem.product.slug}`}>
              <Button
                className="mt-5 bg-primary hover:bg-[#D6EED6] text-gray-900 font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md cursor-pointer"
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
