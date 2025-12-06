"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF","#455d7a","#233142"];

interface Product {
  _id:string,
  product_name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt:Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
}


const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<{name: string; count: number }[]>([]);
  const [totalSold, setTotalSold] = useState(0);



  const categoryLength = Array.from(new Set(products.map(p => p.category)));

  const newlyAddedThisMonth  = products.filter(p => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });

  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/v1/product/products");
        const allProducts = response.data.products;
        setProducts(allProducts);

        
        const counts: Record<string, number> = {};
        allProducts.forEach((p:Product) => {
          if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
          }
        });

        const formatted = Object.entries(counts).map(([name, count]) => ({
          name,
          count,
        }));

        setCategoryData(formatted);

      } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
  const fetchSoldProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/order/allOrders",{withCredentials:true});
      const allOrders = response.data.orders || [];

      const soldCount = allOrders.reduce((acc: number, order: Order) => {
        const orderTotal = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return acc + orderTotal;
      }, 0);

      setTotalSold(soldCount);
    } catch (error) {
      console.error("aaaa:", error);
    }
  };

  fetchSoldProducts();
}, []);



  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="ml-40 p-6 flex h-auto mt-20">
        {/* Stats Left */}
        <div className="">
        <h2 className="text-2xl font-semibold mb-4 text-color flex justify-center items-center">Product Distribution by Category</h2>

        <PieChart width={500} height={400}>
          <Pie
            data={categoryData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>


        <div className="mt-8">
          <div className="text-gray-600">
            Featured Products (isFeatured): <b>{products.filter(p => p.isFeatured).length}</b>
            <b>{products.filter(p => p.isFeatured).map((p) =>(
              <div key={p._id}>
                {p.product_name}
              </div>
            ))}</b>
          </div>
        </div>
        </div>
        {/* Stats Right */}
        <div className="w-full bg-primary flex items-center justify-center gap-10 rounded-sm text-jost">
          
          <div className="w-50 h-50 bg-white shadow-xl rounded-sm">
            <p className="text-2xl w-full text-color flex justify-center items-center mt-5">Total Products</p>
            <div className="text-color text-4xl h-auto mt-10 w-full flex items-center justify-center">{products.length}</div>
            </div>

            <div className="w-50 h-50 bg-white shadow-xl rounded-sm">
            <p className="text-2xl w-full text-color flex justify-center items-center mt-5">Categories</p>
            <div className="text-color text-4xl h-auto mt-10 w-full flex items-center justify-center">{categoryLength.length}</div>
            </div>

            <div className="w-50 h-50 bg-white shadow-xl rounded-sm">
            <p className="text-2xl w-full text-color flex justify-center items-center mt-5">In Stock</p>
            <div className="text-color text-4xl h-auto mt-10 w-full flex items-center justify-center">{products.filter(p => p.stock > 0).length}</div>
            </div>

            <div className="w-50 h-50 bg-white shadow-xl rounded-sm">
            <p className="text-2xl w-full text-color flex justify-center items-center mt-5">Sold Products</p>
            <div className="text-color text-4xl h-auto mt-10 w-full flex items-center justify-center">{totalSold}</div>
            </div>

            <div className="w-50 h-50 bg-white shadow-xl rounded-sm">
              <div className="flex flex-col">
            <p className="text-2xl w-full text-color flex justify-center items-center">Newly Added</p>
            <p className="text-2xl w-full text-color flex justify-center items-center">(This Month)</p>
              </div>
            <div className="text-color text-4xl h-auto mt-6 w-full flex items-center justify-center">{newlyAddedThisMonth.length}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
