"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export type ProductImage = { url: string; publicId: string; _id: string };

export type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  sold: number;
  isActive: boolean;
  isFeatured?: boolean;
  image: ProductImage[];
  category: string;
  subCategory?: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type Filters = {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minSold: string;
  maxSold: string;
  minStock: string;
  maxStock: string;
  isActive: string;
  isFeatured: string;
  onSale: string;
};

export const useAdminProducts = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page")) || 1;

  const getInitialFilters = (): Filters => ({
    search:     searchParams.get("search")     || "",
    category:   searchParams.get("category")   || "",
    minPrice:   searchParams.get("minPrice")   || "",
    maxPrice:   searchParams.get("maxPrice")   || "",
    minSold:    searchParams.get("minSold")    || "",
    maxSold:    searchParams.get("maxSold")    || "",
    minStock:   searchParams.get("minStock")   || "",
    maxStock:   searchParams.get("maxStock")   || "",
    isActive:   searchParams.get("isActive")   || "",
    isFeatured: searchParams.get("isFeatured") || "",
    onSale:     searchParams.get("onSale")     || "", 
  });

  const [products, setProducts]                 = useState<Product[]>([]);
  const [totalPages, setTotalPages]             = useState(1);
  const [totalProducts, setTotalProducts]       = useState(0);
  const [filteredProducts, setFilteredProducts] = useState(0);
  const [loading, setLoading]                   = useState(true);
  const [localFilter, setLocalFilter]           = useState<Filters>(getInitialFilters);
  const [appliedFilter, setAppliedFilter]       = useState<Filters>(getInitialFilters);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount       = useRef(true);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("?page=1", { scroll: false });
      return;
    }
    const newFilters = getInitialFilters();
    setLocalFilter(newFilters);
    setAppliedFilter(newFilters);
  }, [
    searchParams.get("page"),     searchParams.get("search"),
    searchParams.get("category"), searchParams.get("minPrice"),
    searchParams.get("maxPrice"), searchParams.get("minSold"),
    searchParams.get("maxSold"),  searchParams.get("minStock"),
    searchParams.get("maxStock"), searchParams.get("isActive"),
    searchParams.get("isFeatured"), searchParams.get("onSale"), 
  ]);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      setAppliedFilter(localFilter);
      const params = new URLSearchParams();
      params.set("page", "1");
      if (localFilter.search)     params.set("search",     localFilter.search);
      if (localFilter.category)   params.set("category",   localFilter.category);
      if (localFilter.minPrice)   params.set("minPrice",   localFilter.minPrice);
      if (localFilter.maxPrice)   params.set("maxPrice",   localFilter.maxPrice);
      if (localFilter.minSold)    params.set("minSold",    localFilter.minSold);
      if (localFilter.maxSold)    params.set("maxSold",    localFilter.maxSold);
      if (localFilter.minStock)   params.set("minStock",   localFilter.minStock);
      if (localFilter.maxStock)   params.set("maxStock",   localFilter.maxStock);
      if (localFilter.isActive)   params.set("isActive",   localFilter.isActive);
      if (localFilter.isFeatured) params.set("isFeatured", localFilter.isFeatured);
      if (localFilter.onSale)     params.set("onSale",     localFilter.onSale); 
      router.push(`?${params.toString()}`, { scroll: false });
    }, 600);

    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [
    localFilter.search,   localFilter.category, localFilter.minPrice,
    localFilter.maxPrice, localFilter.minSold,  localFilter.maxSold,
    localFilter.minStock, localFilter.maxStock, localFilter.isActive,
    localFilter.isFeatured, localFilter.onSale, router, 
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = { page };
        if (appliedFilter.search)     params.search     = appliedFilter.search;
        if (appliedFilter.category)   params.category   = appliedFilter.category;
        if (appliedFilter.minPrice)   params.minPrice   = appliedFilter.minPrice;
        if (appliedFilter.maxPrice)   params.maxPrice   = appliedFilter.maxPrice;
        if (appliedFilter.minSold)    params.minSold    = appliedFilter.minSold;
        if (appliedFilter.maxSold)    params.maxSold    = appliedFilter.maxSold;
        if (appliedFilter.minStock)   params.minStock   = appliedFilter.minStock;
        if (appliedFilter.maxStock)   params.maxStock   = appliedFilter.maxStock;
        if (appliedFilter.isActive)   params.isActive   = appliedFilter.isActive;
        if (appliedFilter.isFeatured) params.isFeatured = appliedFilter.isFeatured;
        if (appliedFilter.onSale)     params.onSale     = appliedFilter.onSale; 

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products`,
          { params, withCredentials: true },
        );
        if (response.data.success) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages || 1);
          setTotalProducts(response.data.totalProducts || 0);
          setFilteredProducts(response.data.filteredProducts || 0);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [
    page,
    appliedFilter.search,   appliedFilter.category, appliedFilter.minPrice,
    appliedFilter.maxPrice, appliedFilter.minSold,  appliedFilter.maxSold,
    appliedFilter.minStock, appliedFilter.maxStock, appliedFilter.isActive,
    appliedFilter.isFeatured, appliedFilter.onSale, 
  ]);

  const removeProduct = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/products/${id}`,
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setFilteredProducts((prev) => prev - 1);
        setTotalProducts((prev) => prev - 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unexpected error");
    }
  };

  const clearFilters = () => {
    const emptyFilters: Filters = {
      search: "", category: "", minPrice: "", maxPrice: "",
      minStock: "", minSold: "", maxSold: "", maxStock: "",
      isActive: "", isFeatured: "", onSale: "", // ✅
    };
    setLocalFilter(emptyFilters);
    setAppliedFilter(emptyFilters);
    router.push("?page=1", { scroll: false });
  };

  const hasActiveFilters = () => Object.values(appliedFilter).some((v) => v !== "");

  const toggleFeatured = (val: string) => {
    const newVal = localFilter.isFeatured === val ? "" : val;
    setLocalFilter({ ...localFilter, isFeatured: newVal });
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (appliedFilter.search)     params.set("search",     appliedFilter.search);
    if (appliedFilter.category)   params.set("category",   appliedFilter.category);
    if (appliedFilter.minPrice)   params.set("minPrice",   appliedFilter.minPrice);
    if (appliedFilter.maxPrice)   params.set("maxPrice",   appliedFilter.maxPrice);
    if (appliedFilter.minSold)    params.set("minSold",    appliedFilter.minSold);
    if (appliedFilter.maxSold)    params.set("maxSold",    appliedFilter.maxSold);
    if (appliedFilter.minStock)   params.set("minStock",   appliedFilter.minStock);
    if (appliedFilter.maxStock)   params.set("maxStock",   appliedFilter.maxStock);
    if (appliedFilter.isActive)   params.set("isActive",   appliedFilter.isActive);
    if (appliedFilter.isFeatured) params.set("isFeatured", appliedFilter.isFeatured);
    if (appliedFilter.onSale)     params.set("onSale",     appliedFilter.onSale); // ✅
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    page, products, totalPages, totalProducts, filteredProducts,
    loading, localFilter, setLocalFilter, appliedFilter,
    hasActiveFilters, clearFilters, toggleFeatured, goToPage, removeProduct,
  };
};