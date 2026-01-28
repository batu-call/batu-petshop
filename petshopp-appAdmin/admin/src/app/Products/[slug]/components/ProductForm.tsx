"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

interface AdminProductFormProps {
  productName: string;
  description: string;
  category: string | Category;
  price: number;
  salePrice?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  discountPercent: number;
  onProductNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onSalePriceChange: (value: number | null) => void;
  onStockChange: (value: number) => void;
  onIsActiveChange: (value: boolean) => void;
  onIsFeaturedChange: (value: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
}

const CATEGORIES = ["Cat", "Dog", "Fish", "Bird", "Reptile", "Rabbit", "Horse"];

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  productName,
  description,
  category,
  price,
  salePrice,
  stock,
  isActive,
  isFeatured,
  discountPercent,
  onProductNameChange,
  onDescriptionChange,
  onCategoryChange,
  onPriceChange,
  onSalePriceChange,
  onStockChange,
  onIsActiveChange,
  onIsFeaturedChange,
  onUpdate,
  onDelete,
}) => {
  const categoryValue = typeof category === 'string' ? category : category?.name || '';

  return (
    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6">
      <input
        value={productName}
        onChange={(e) => onProductNameChange(e.target.value)}
        className="text-3xl font-bold text-color bg-white border p-2 rounded"
      />

      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="text-color text-lg bg-white border p-2 rounded"
      />

      {/* Category Selector */}
      <TextField
        select
        label="Category"
        value={categoryValue}
        onChange={(e) => onCategoryChange(e.target.value)}
        fullWidth
        sx={{
          "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#B1CBBB",
            },
          },
          "& .MuiSelect-select": { color: "#393E46" },
        }}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                "& .MuiMenuItem-root": {
                  color: "#393E46",
                  "&:hover": {
                    backgroundColor: "rgba(177, 203, 187, 0.2)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(177, 203, 187, 0.3)",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "rgba(177, 203, 187, 0.4)",
                  },
                },
              },
            },
          },
        }}
      >
        {CATEGORIES.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </TextField>

      <div className="flex flex-col gap-2">
        <label className="text-lg text-color font-semibold">Price ($)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="text-xl font-semibold text-color bg-white border p-2 rounded"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-lg text-color font-semibold">
          Sale Price (optional)
        </label>
        <input
          type="number"
          value={salePrice ?? ""}
          onChange={(e) =>
            onSalePriceChange(e.target.value ? Number(e.target.value) : null)
          }
          className="text-xl font-semibold text-color bg-white border p-2 rounded"
        />
        {discountPercent > 0 && (
          <p className="text-sm text-zinc-600 font-semibold">
            %{discountPercent} discount is being applied
          </p>
        )}
      </div>

      {/* Stock + Switch controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <label className="text-lg text-color font-semibold">Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => onStockChange(Number(e.target.value))}
            className="border border-white p-2 rounded w-28 text-xl text-color flex justify-center items-center"
          />
        </div>

        <div>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => onIsActiveChange(e.target.checked)}
                color="success"
              />
            }
            label="Active Product"
            className="text-color text-2xl text-jost font-semibold"
          />
        </div>
        <div className="text-color text-2xl text-jost">
          <FormControlLabel
            control={
              <Switch
                checked={isFeatured}
                onChange={(e) => onIsFeaturedChange(e.target.checked)}
                color="success"
              />
            }
            label="Featured Product"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <Button
          onClick={onUpdate}
          className="bg-secondary hover:bg-white text-color font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
        >
          Update Product
        </Button>
        <Button
          onClick={onDelete}
          className="bg-[#393E46] hover:bg-white text-white hover:text-[#393E46] font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
        >
          Delete Product
        </Button>
      </div>
    </div>
  );
};

export default AdminProductForm;