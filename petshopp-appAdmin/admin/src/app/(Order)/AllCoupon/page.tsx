"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CircularText from "@/components/CircularText";
import InputAdornment from "@mui/material/InputAdornment";

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

  const [shippingFee, setShippingFee] = useState("");
  const [freeOver, setFreeOver] = useState("");

  const [discountLoading, setDiscountLoading] = useState(true);
  const [shippingLoading, setShippingLoading] = useState(true);

  const loading = discountLoading || shippingLoading;

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon`,
        { withCredentials: true },
      );
      setDiscounts(res.data.data || []);
    } catch {
      toast.error("Failed to load discount codes");
    } finally {
      setDiscountLoading(false);
    }
  };

  const fetchShippingSettings = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setShippingFee(String(res.data.data.fee));
        setFreeOver(String(res.data.data.freeOver));
      }
    } catch {
      toast.error("Failed to load shipping settings");
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchShippingSettings();
  }, []);

  const createDiscount = async () => {
    if (!code || !percent) {
      toast.error("Please fill required fields");
      return;
    }

    const percentValue = Number(percent);
    const minAmountValue = minAmount ? Number(minAmount) : 0;

    if (percentValue <= 0 || percentValue > 100) {
      toast.error("Discount percent must be between 1 and 100");
      return;
    }

    if (minAmountValue < 0) {
      toast.error("Minimum amount cannot be negative");
      return;
    }

    const exists = discounts.find(
      (d) => d.code.toLowerCase() === code.toLowerCase(),
    );

    if (exists) {
      toast.error("This discount code already exists!");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon`,
        {
          code: code.trim().toUpperCase(),
          percent: percentValue,
          minAmount: minAmount ? minAmountValue : undefined,
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Discount code created!");
        setCode("");
        setPercent("");
        setMinAmount("");
        fetchDiscounts();
      }
    } catch (error) {
      toast.error("Failed to create discount");
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coupon/${id}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Deleted!");
        fetchDiscounts();
      }
    } catch {
      toast.error("Failed to delete discount");
    }
  };

  const updateShipping = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/shipping`,
        {
          fee: Number(shippingFee),
          freeOver: Number(freeOver),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Shipping settings updated!");
      }
    } catch {
      toast.error("Failed to update shipping settings");
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      )}

      <div className="p-6">
        {/* CREATE DISCOUNT */}
        <div className="bg-white shadow-xl p-6 rounded-xl mb-6 max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-color">
            Create Discount Code
          </h2>
          <div className="flex flex-col gap-4">
            <TextField
              label="Discount Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              variant="standard"
              fullWidth
              slotProps={{
                inputLabel: {
                  sx: {
                    color: "#B1CBBB",
                    "&.Mui-focused": { color: "#B1CBBB" },
                  },
                },
              }}
              sx={{
                "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
              }}
            />

            <TextField
              label="Discount %"
              type="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              variant="standard"
              fullWidth
              slotProps={{
                inputLabel: {
                  sx: {
                    color: "#B1CBBB",
                    "&.Mui-focused": { color: "#B1CBBB" },
                  },
                },
              }}
              sx={{
                "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
              }}
            />

            <TextField
              label="Minimum Order Amount (Optional)"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              variant="standard"
              fullWidth
              slotProps={{
                inputLabel: {
                  sx: {
                    color: "#B1CBBB",
                    "&.Mui-focused": { color: "#B1CBBB" },
                  },
                },
              }}
              sx={{
                "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
              }}
            />

            <Button onClick={createDiscount} className="bg-primary">
              Create Discount
            </Button>
          </div>
        </div>

        {/* SHIPPING SETTINGS */}
        <div className="bg-white shadow-xl p-6 rounded-xl mb-6 max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-color">
            Shipping Settings
          </h2>

          <div className="flex flex-col gap-4">
            <TextField
              label="Shipping Fee"
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              variant="standard"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
                inputLabel: {
                  sx: {
                    color: "#B1CBBB",
                    "&.Mui-focused": { color: "#B1CBBB" },
                  },
                },
              }}
              sx={{
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#B1CBBB",
                },
              }}
            />

            <TextField
              label="Free Shipping Over"
              type="number"
              value={freeOver}
              onChange={(e) => setFreeOver(e.target.value)}
              variant="standard"
              fullWidth
               slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
                inputLabel: {
                  sx: {
                    color: "#B1CBBB",
                    "&.Mui-focused": { color: "#B1CBBB" },
                  },
                },
              }}
              sx={{
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#B1CBBB",
                },
              }}
            />

            <Button onClick={updateShipping} className="bg-primary">
              Save Shipping Settings
            </Button>
          </div>
        </div>

        {/* DISCOUNT LIST */}
        <div className="bg-white shadow-xl p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4 text-color">
            All Discount Codes
          </h2>

          {discounts.length === 0 ? (
            <p className="text-gray-500">No discount codes found.</p>
          ) : (
            discounts.map((d) => (
              <div
                key={d._id}
                className="flex justify-between items-center bg-primary p-4 rounded-lg mb-2"
              >
                <div className="font-semibold">
                  <span className="bg-white px-2 py-1 rounded mr-2">
                    {d.code}
                  </span>
                  — {d.percent}% OFF
                  {d.minAmount > 0 && (
                    <span className="text-sm ml-2">(Min: ${d.minAmount})</span>
                  )}
                </div>

                <ClearIcon
                  onClick={() => deleteDiscount(d._id)}
                  className="cursor-pointer hover:scale-110"
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
