"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { AdminGuard } from "@/app/Context/AdminGuard";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import CircularText from "@/components/CircularText";

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
  image: ProductImage[];
  category: string;
  slug: string;
};

const Page = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,setFilter] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
  })

  const handlerRemove = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirm) return;
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/v1/product/products/${id}`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Product deleted ✅");
        setProduct((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Unexpected error");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error!");
      }
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/product/admin/products",{
            withCredentials:true
          }
        );
        if (response.data.success) {
          setProduct(response.data.products);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("xfghdxfgjdxfg!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      </>
    );
  }

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
    
    return matchesCategory && matchesPrice && matchesStock && matchesSearch
  });

  return (
    <div className="bg-primary">
      <AdminGuard>
        <Navbar />
        <Sidebar />
        <div className="ml-40  flex-1 h-screen">
          <div className="w-full h-screen bg-white">
            {/* FILTER INPUTS */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by name or description"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="border p-2 rounded flex-1"
            />
            <select
    value={filter.category}
    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
    className="border p-2 rounded flex-1"
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
              value={filter.minPrice}
              onChange={(e) =>
                setFilter({ ...filter, minPrice: e.target.value })
              }
              className="border p-2 rounded w-32"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filter.maxPrice}
              onChange={(e) =>
                setFilter({ ...filter, maxPrice: e.target.value })
              }
              className="border p-2 rounded w-32"
            />
            <input
              type="number"
              placeholder="Min Stock"
              value={filter.minStock}
              onChange={(e) =>
                setFilter({ ...filter, minStock: e.target.value })
              }
              className="border p-2 rounded w-32"
            />
            <input
              type="number"
              placeholder="Max Stock"
              value={filter.maxStock}
              onChange={(e) =>
                setFilter({ ...filter, maxStock: e.target.value })
              }
              className="border p-2 rounded w-32"
            />
          </div>

            <div className="w-full bg-secondary flex gap-2 mt-12 text-color justify-between">
              <div className="bg-secondary h-10 w-16"></div>
              <div className="text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center">
                Product Name
              </div>
              <div className="text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center">
                Description
              </div>
              <div className="text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center">
                Price
              </div>
              <div className="text-xl p-1 w-120 h-9 flex ml-12 items-center justify-center">
                Stock
              </div>
              <div className="text-xl p-1 w-120 h-9 ml-12 flex items-center justify-center">
                Category
              </div>
            </div>
            {filteredProducts.length === 0 ? (
              <p className="text-bold text-2xl text-color">No Product!</p>
            ) : (
              filteredProducts.map((p) => (
                <Link
                  href={`Products/${p.slug}`}
                  key={p._id}
                  className="flex items-center justify-center gap-2 border-1 border-y-teal-900 relative h-16 shadow-xl border-shadow"
                >
                  <div className="w-20 h-15 relative">
                    <Image
                      src={p.image[0]?.url}
                      alt="product"
                      fill
                      sizes="(max-width: 768px) 100vw, 80px"
                      className="object-cover flex items-center justify-center"
                    />
                  </div>
                  <div className="text-xl p-1 w-120 h-9 flex items-center justify-center ml-12 text-jost truncate text-left text-color">
                    {p.product_name}
                  </div>
                  <div className="text-xl p-1 w-120 h-9  ml-12 text-jost line-clamp-2 text-left text-color">
                    {p.description}
                  </div>
                  <div className="text-xl p-1 w-120 h-9 flex items-center justify-center ml-12 text-jost text-color">
                    {p.price}
                  </div>
                  <div className="text-xl p-1 w-120 h-9 flex items-center justify-center ml-12 text-jost text-color">
                    {p.stock}
                  </div>
                  <div className="text-xl p-1 w-120 h-9 flex item-center justify-center ml-12 text-jost text-color">
                    {p.category}
                  </div>
                  <p
                    className="cursor-pointer absolute right-0 transition duration-300 ease-in-out hover:scale-105"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlerRemove(p._id);
                    }}
                  >
                    <Image
                      src={"/trash.png"}
                      alt="trash-button"
                      width={30}
                      height={30}
                    />
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </AdminGuard>
    </div>
  );
};

export default Page;
