"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import CircularText from "@/components/CircularText";
import { useConfirm } from "@/app/Context/confirmContext";
import CloseIcon from "@mui/icons-material/Close";

type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};

type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: string;
  stock: string;
  isActive: boolean;
  image: ProductImage[];
  category: string;
  slug: string;
};

const Page = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
  });
  const { confirm } = useConfirm();

  const handlerRemove = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Product deleted ✅");
        setProduct((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unexpected error");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setProduct(response.data.products);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = product.filter((p) => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(filter.search.toLowerCase()) ||
      p.description.toLowerCase().includes(filter.search.toLowerCase());

    const matchesCategory = !filter.category || p.category === filter.category;

    const matchesPrice =
      (!filter.minPrice || Number(p.price) >= Number(filter.minPrice)) &&
      (!filter.maxPrice || Number(p.price) <= Number(filter.maxPrice));

    const matchesStock =
      (!filter.minStock || Number(p.stock) >= Number(filter.minStock)) &&
      (!filter.maxStock || Number(p.stock) <= Number(filter.maxStock));

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  return (
    <div>
      <Navbar />
      <Sidebar />

      <div className="md:ml-24 lg:ml-40 flex-1 min-h-screen p-4">
        {loading ? (
          <div className="fixed inset-0 flex justify-center items-center bg-primary z-50">
            <CircularText
              text="LOADING"
              spinDuration={20}
              className="text-white text-4xl"
            />
          </div>
        ) : (
          <>
            {/* FILTER */}
            <div className="flex flex-wrap gap-2 mb-6">
              <input
                type="text"
                placeholder="Search"
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                className="border p-2 rounded flex-1 min-w-[200px]"
              />

              <select
                value={filter.category}
                onChange={(e) =>
                  setFilter({ ...filter, category: e.target.value })
                }
                className="border p-2 rounded min-w-[150px]"
              >
                <option value="">All Category</option>
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Reptile">Reptile</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Horse">Horse</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                className="border p-2 rounded w-32"
                value={filter.minPrice}
                onChange={(e) =>
                  setFilter({ ...filter, minPrice: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Max Price"
                className="border p-2 rounded w-32"
                value={filter.maxPrice}
                onChange={(e) =>
                  setFilter({ ...filter, maxPrice: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Min Stock"
                className="border p-2 rounded w-32"
                value={filter.minStock}
                onChange={(e) =>
                  setFilter({ ...filter, minStock: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Max Stock"
                className="border p-2 rounded w-32"
                value={filter.maxStock}
                onChange={(e) =>
                  setFilter({ ...filter, maxStock: e.target.value })
                }
              />
            </div>

            <div className="sticky top-0 z-10 hidden md:flex bg-secondary py-2 text-color font-semibold">
              <div className="w-20"></div>
              <div className="w-48 ml-12">Product</div>
              <div className="w-64 ml-12">Description</div>
              <div className="w-32 ml-6">Price</div>
              <div className="w-32 ml-6">Stock</div>
              <div className="w-32 ml-6">Category</div>
              <div className="w-32 ml-14">Active</div>
            </div>

            {/* LIST */}
            {filteredProducts.length === 0 ? (
              <p className="text-xl mt-6">No Product!</p>
            ) : (
              filteredProducts.map((p) => (
                <Link
                  key={p._id}
                  href={`Products/${p.slug}`}
                  className="flex flex-col md:flex-row group gap-3 border p-3 md:p-2 items-start md:items-center relative hover:bg-gray-50"
                >
                  {/* IMAGE */}
                  <div className="w-full aspect-square md:w-20 md:h-20 relative shrink-0 bg-gray-50">
                    <Image
                      src={p.image[0]?.url || "/placeholder.png"}
                      alt="product"
                      fill
                      className="object-contain md:object-cover rounded"
                    />
                  </div>

                  <div className="w-full md:w-48 md:ml-6">
                    <p className="md:hidden text-xs text-gray-500">Product</p>
                    {p.product_name}
                  </div>

                  <div className="w-full md:w-64 md:ml-6 line-clamp-2">
                    <p className="md:hidden text-xs text-gray-500">
                      Description
                    </p>
                    {p.description}
                  </div>

                  <div className="w-full md:w-32 md:ml-6">
                    <p className="md:hidden text-xs text-gray-500">Price</p>
                    {p.price}
                  </div>

                  <div className="w-full md:w-32 md:ml-6">
                    <p className="md:hidden text-xs text-gray-500">Stock</p>
                    {p.stock}
                  </div>

                  <div className="w-full md:w-32 md:ml-6">
                    <p className="md:hidden text-xs text-gray-500">Category</p>
                    {p.category}
                  </div>

                  <div className="w-full md:w-32 md:ml-6 flex items-center justify-between gap-2">
                    <div>
                      <p className="md:hidden text-xs text-gray-500">Status</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          p.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>


                      {/* Delete sm-lg-xl */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const ok = await confirm({
                          title: "Delete Product",
                          description:
                            "Are you sure you want to delete this product?",
                          confirmText: "Yes, Delete",
                          cancelText: "Cancel",
                          variant: "destructive",
                        });

                        if (ok) handlerRemove(p._id);
                      }}
                      className="md:hidden text-[#393E46] text-xs font-semibold border border-[#A8D1B5] px-2 py-1 rounded"
                    >
                      Delete Product
                    </button>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Product",
                        description:
                          "Are you sure you want to delete this product?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handlerRemove(p._id);
                    }}
                    className="hidden xl:block absolute top-8 right-2 cursor-pointer transition hover:scale-110"
                  >
                    <Image
                      src="/trash.png"
                      alt="delete"
                      width={26}
                      height={26}
                    />
                  </button>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const ok = await confirm({
                        title: "Delete Product",
                        description:
                          "Are you sure you want to delete this product?",
                        confirmText: "Yes, Delete",
                        cancelText: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) handlerRemove(p._id);
                    }}
                    className="hidden md:block xl:hidden absolute top-2 right-2 text-color cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    <CloseIcon fontSize="small" />
                  </button>

                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
