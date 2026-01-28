"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CircularText from "@/components/CircularText";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#455d7a",
  "#233142",
];

interface Product {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  items: OrderItem[];
}

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<
    { name: string; count: number }[]
  >([]);
  const [totalSold, setTotalSold] = useState(0);
  const [loading, setLoading] = useState(true);

  const categoryLength = Array.from(new Set(products.map((p) => p.category)));

  const newlyAddedThisMonth = products.filter((p) => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/admin/products`,
          {withCredentials:true}
        );

        const allProducts = response.data.products;
        setProducts(allProducts);

        const counts: Record<string, number> = {};
        allProducts.forEach((p: Product) => {
          counts[p.category] = (counts[p.category] || 0) + 1;
        });

        setCategoryData(
          Object.entries(counts).map(([name, count]) => ({ name, count }))
        );
      } catch (error) {
        console.error("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/order/allOrders`,
          { withCredentials: true }
        );

        const orders: Order[] = response.data.orders || [];

        const soldCount = orders.reduce((acc, order) => {
          return (
            acc + order.items.reduce((sum, item) => sum + item.quantity, 0)
          );
        }, 0);

        setTotalSold(soldCount);
      } catch (error) {
        console.error("Order fetch error:", error);
      }
    };

    fetchSoldProducts();
  }, []);

  return (
    <>
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex items-center justify-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 md:mt-20">
          {/* LEFT: PIE + FEATURED */}
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-semibold mb-4 text-center text-color">
              Product Distribution by Category
            </h2>

            <div className="w-full h-[350px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <p className="font-semibold mb-2">
                Featured Products ({products.filter((p) => p.isFeatured).length}
                )
              </p>
              <ul className="list-disc ml-5 text-sm">
                {products
                  .filter((p) => p.isFeatured)
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p._id}>{p.product_name}</li>
                  ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: STATS */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox title="Total Products" value={products.length} />
            <StatBox
              title="In Stock"
              value={products.filter((p) => p.stock > 0).length}
            />
            <StatBox title="Sold Products" value={totalSold} />
            <StatBox
              title="New This Month"
              value={newlyAddedThisMonth.length}
            />
            <StatBox
              title="Active Products"
              value={products.filter((p) => p.isActive === true).length}
            />
            <StatBox
              title="Inactive Products"
              value={products.filter((p) => p.isActive === false).length}
            />
          </div>
        </div>
      )}
    </>
  );
};

const StatBox = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-primary shadow rounded p-4 flex flex-col items-center justify-center">
    <p className="text-lg text-color">{title}</p>
    <p className="text-3xl font-bold text-color mt-2">{value}</p>
  </div>
);

export default Page;
