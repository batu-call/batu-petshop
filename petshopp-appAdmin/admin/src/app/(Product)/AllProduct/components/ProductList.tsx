"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, Star, Trash2 } from "lucide-react";
import { Product } from "./useAdminProducts";
import { useConfirm } from "@/app/Context/confirmContext";

type Props = {
  products: Product[];
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
  removeProduct: (id: string) => void;
};

const ProductList = ({
  products,
  hasActiveFilters,
  clearFilters,
  removeProduct,
}: Props) => {
  const { confirm } = useConfirm();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Product",
      description: "Are you sure you want to delete this product?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (ok) removeProduct(id);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 flex justify-center">
          <Package className="w-16 h-16 text-color2 dark:text-[#7aab8a]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 dark:text-[#c8e6d0] mb-2">
          No products found
        </h3>
        <p className="text-gray-500 dark:text-[#7aab8a] mb-6">
          {hasActiveFilters()
            ? "Try adjusting your filters to see more results"
            : "Start by adding your first product"}
        </p>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="bg-primary dark:bg-[#0b8457] text-white px-6 py-2 rounded-lg hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] hover:text-[#393E46] dark:hover:text-[#c8e6d0] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  const clampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-all",
    maxWidth: "100%",
  };

  return (
    <>
      {products.map((p) => {
        const isLowStock = p.stock <= 5;

        return (
          <Link key={p._id} href={`Products/${p.slug}`} className="block">
            <div className="flex flex-col lg:flex-row group gap-3 border dark:border-[#2d5a3d] p-3 md:p-2 items-start lg:items-center relative hover:bg-gray-50 dark:hover:bg-[#1e3d2a] cursor-pointer transition-colors">
              <div className="w-full h-50 lg:w-16 lg:h-16 relative shrink-0">
                <Image
                  src={p.image[0]?.url || "/placeholder.png"}
                  alt="product"
                  fill
                  sizes="(max-width: 1024px) 100vw, 64px"
                  className="object-contain lg:object-cover rounded"
                />
                {p.isFeatured && (
                  <div className="absolute top-0 left-0 w-5 h-5 bg-[#97cba9] dark:bg-[#0b8457] rounded-br-lg flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col lg:flex-row gap-3 min-w-0 overflow-hidden w-full">
                <div className="w-full lg:flex-1 min-w-0 overflow-hidden lg:flex lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Product</p>
                  <span className="block truncate text-xs xl:text-sm dark:text-[#c8e6d0]">
                    {p.product_name}
                  </span>
                </div>

                <div className="w-full lg:flex-1 min-w-0 overflow-hidden lg:flex lg:items-start">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Description</p>
                  <span className="text-sm md:text-md lg:text-sm dark:text-[#a8d4b8]" style={clampStyle}>
                    {p.description}
                  </span>
                </div>

                {/* Price */}
                <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Price</p>
                  <div className="flex flex-col items-start lg:items-center">
                    {p.salePrice && p.salePrice < p.price ? (
                      <>
                        <span className="text-xs line-through text-red-400 opacity-70 font-medium leading-tight">
                          ${p.price.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-[#393E46] dark:text-[#c8e6d0] leading-tight">
                          ${p.salePrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm dark:text-[#c8e6d0]">${p.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Stock — kırmızı renk 5 ve altı */}
                <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Stock</p>
                  <span
                    className={`text-sm md:text-md lg:text-sm font-semibold ${
                      isLowStock
                        ? "text-red-500 dark:text-red-400"
                        : "dark:text-[#c8e6d0]"
                    }`}
                  >
                    {p.stock}
                  </span>
                </div>

                <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Sold</p>
                  <span className="text-sm md:text-md lg:text-sm dark:text-[#c8e6d0]">
                    {p.sold || 0}
                  </span>
                </div>

                <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Category</p>
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-sm md:text-md lg:text-sm dark:text-[#c8e6d0] lg:flex lg:justify-center">
                      {p.category}
                    </span>
                    {p.subCategory && (
                      <span className="text-[10px] font-medium px-1.5 py-[2px] rounded bg-[#DDEEDD] dark:bg-[#0b8457]/40 text-[#2d6a4a] dark:text-[#a8d4b8] w-fit">
                        {p.subCategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Created</p>
                  <span className="text-sm md:text-md lg:text-sm text-gray-600 dark:text-[#a8d4b8]">
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex-1 min-w-0 lg:flex lg:justify-center lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Updated</p>
                  <span className="text-sm md:text-md lg:text-sm text-gray-600 dark:text-[#a8d4b8]">
                    {new Date(p.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-start lg:items-center">
                  <p className="lg:hidden text-xs text-gray-500 dark:text-[#7aab8a]">Status</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold h-7 ${
                      p.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="md:hidden w-full flex justify-end mt-1">
                <button
                  onClick={(e) => handleDelete(e, p._id)}
                  className="flex items-center gap-1.5 text-[#393E46] dark:text-[#c8e6d0] text-xs font-semibold border border-[#A8D1B5] dark:border-[#2d5a3d] px-3 py-1.5 rounded-lg bg-secondary dark:bg-[#1e3d2a] hover:bg-[#97cba9] dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-105 active:scale-[0.97] cursor-pointer"
                >
                  <Trash2 size={13} />
                  Delete Product
                </button>
              </div>

              <button
                onClick={(e) => handleDelete(e, p._id)}
                className="hidden md:flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-gray-400 dark:text-[#7aab8a] hover:text-white hover:bg-[#97cba9] dark:hover:bg-[#0b8457] transition-all duration-200 cursor-pointer ml-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Link>
        );
      })}
    </>
  );
};

export default ProductList;