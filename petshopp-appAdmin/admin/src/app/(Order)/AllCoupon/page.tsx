"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";

type Discount = {
  _id: string;
  code: string;
  percent: number;
  minAmount: number;
};

const DiscountAdminPage = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/`,
        { withCredentials: true }
      );
      setDiscounts(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const createDiscount = async () => {
    if (!code || !percent) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/`,
        {
          code,
          percent: Number(percent),
          minAmount: Number(minAmount),
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Discount code created!");
        setCode("");
        setPercent("");
        setMinAmount("");
        fetchDiscounts();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create discount");
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Deleted!");
        fetchDiscounts();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  return (
    <>
        <Navbar/>
        <Sidebar/>
    <div className="p-6 md:ml-24 lg:ml-40">
      <h1 className="text-3xl font-bold mb-6 text-color">Discount Code Management</h1>

      {/* CREATE NEW DISCOUNT */}
      <div className="bg-white shadow-xl p-6 rounded-xl mb-6 w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-4 text-color">Create New Code</h2>

        <div className="flex flex-col gap-4">
          <TextField
            label="Discount Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            size="small"
            fullWidth
            variant="standard"
            autoComplete="off"
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.5, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
          />

          <TextField
            label="Discount %"
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            size="small"
            fullWidth
            variant="standard"
            autoComplete="off"
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.5, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
          />

          <TextField
            label="Minimum Order Amount (Optional)"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            size="small"
            fullWidth
            variant="standard"
            autoComplete="off"
                  slotProps={{ inputLabel: { sx: { color: "#B1CBBB", "&.Mui-focused": { color: "#393E46", backgroundColor: "#B1CBBB", padding: 0.5, borderRadius: 1, }, }, }, }}
                  sx={{ "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB", }, }}
          />

          <Button
            onClick={createDiscount}
            className="bg-primary h-11 text-lg font-semibold hover:bg-[#D6EED6] hover:text-[#393E46] transition cursor-pointer"
          >
            Create Discount
          </Button>
        </div>
      </div>

      {/* LIST DISCOUNTS */}
      <div className="bg-white shadow-xl p-6 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4 text-color">All Discount Codes</h2>

        {loading ? (
          <p>Loading...</p>
        ) : discounts.length === 0 ? (
          <p className="text-gray-500">No discount codes found.</p>
        ) : (
          discounts.map((d) => (
            <div
              key={d._id}
              className="flex justify-between items-center bg-primary p-4 rounded-lg mb-2"
            >
              <div className="text-lg font-semibold">
                <span className="mr-2 bg-white px-2 py-1 rounded shadow">
                  {d.code}
                </span>
                — {d.percent}% OFF{" "}
                {d.minAmount > 0 && (
                  <span className="text-sm ml-2 text-gray-700">
                    (Min: ${d.minAmount})
                  </span>
                )}
              </div>

              <ClearIcon
                onClick={() => deleteDiscount(d._id)}
                className="cursor-pointer text-[#393E46] hover:scale-110 transition"
              />
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default DiscountAdminPage;
