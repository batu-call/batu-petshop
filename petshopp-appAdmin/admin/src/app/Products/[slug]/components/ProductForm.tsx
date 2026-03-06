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

const SUB_CATEGORIES: Record<string, string[]> = {
  Cat: ["Food", "Bed", "Toy", "Litter", "Accessory"],
  Dog: ["Food", "Bed", "Toy", "Leash", "Accessory"],
  Bird: ["Food", "Cage", "Toy", "Accessory"],
  Fish: ["Food", "Tank", "Filter", "Decoration"],
  Reptile: ["Food", "Habitat", "Lighting", "Accessory"],
  Rabbit: ["Food", "Cage", "Toy", "Accessory"],
  Horse: ["Food", "Saddle", "Care", "Accessory"],
};

interface AdminProductFormProps {
  productName: string;
  description: string;
  category: string | Category;
  subCategory?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  discountPercent: number;
  onProductNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string | null) => void;
  onPriceChange: (value: number) => void;
  onSalePriceChange: (value: number | null) => void;
  onStockChange: (value: number) => void;
  onIsActiveChange: (value: boolean) => void;
  onIsFeaturedChange: (value: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
}

const CATEGORIES = ["Cat", "Dog", "Fish", "Bird", "Reptile", "Rabbit", "Horse"];

const inputCls =
  "border border-gray-300 dark:border-border bg-white dark:bg-accent text-gray-900 dark:text-foreground placeholder-gray-400 dark:placeholder-muted-foreground p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-primary w-full";

const selectSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--tw-bg, #ffffff)",
    borderRadius: "14px",
    fontSize: "15px",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#97cba9" },
    "&.Mui-focused fieldset": { borderColor: "#97cba9", borderWidth: "2px" },
    ".dark & fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    ".dark &:hover fieldset": { borderColor: "#97cba9" },
    ".dark &.Mui-focused fieldset": {
      borderColor: "#97cba9",
      borderWidth: "2px",
    },
  },
  "& .MuiSelect-select": {
    color: "#111827",
    ".dark &": { color: "#f3f4f6" },
    padding: "14px",
  },
  ".dark & .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      mt: 1,
      borderRadius: "14px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      "& .MuiMenuItem-root": {
        fontSize: "14px",
        color: "#111827",
        borderRadius: "10px",
        mx: 1,
        my: 0.5,
        "&:hover": { backgroundColor: "rgba(151, 203, 169, 0.15)" },
        "&.Mui-selected": {
          backgroundColor: "rgba(151, 203, 169, 0.25)",
          fontWeight: 600,
        },
        "&.Mui-selected:hover": {
          backgroundColor: "rgba(151, 203, 169, 0.35)",
        },
      },
    },
  },
};

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  productName,
  description,
  category,
  subCategory,
  price,
  salePrice,
  stock,
  isActive,
  isFeatured,
  discountPercent,
  onProductNameChange,
  onDescriptionChange,
  onCategoryChange,
  onSubCategoryChange,
  onPriceChange,
  onSalePriceChange,
  onStockChange,
  onIsActiveChange,
  onIsFeaturedChange,
  onUpdate,
  onDelete,
}) => {
  const categoryValue =
    typeof category === "string" ? category : category?.name || "";
  const subCatList = categoryValue ? (SUB_CATEGORIES[categoryValue] ?? []) : [];

  return (
    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6">
      {/* Product Name */}
      <input
        value={productName}
        onChange={(e) => onProductNameChange(e.target.value)}
        className={`text-3xl font-bold ${inputCls}`}
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className={`text-lg h-40 ${inputCls}`}
      />

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-lg text-color dark:text-foreground font-semibold">
          Category
        </label>
        <TextField
          select
          value={categoryValue}
          fullWidth
          size="medium"
          onChange={(e) => {
            onCategoryChange(e.target.value);
            onSubCategoryChange(null);
          }}
          sx={selectSx}
          SelectProps={{ MenuProps: menuProps }}
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {subCatList.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-lg text-color dark:text-foreground font-semibold">
            Sub Category
          </label>
          <TextField
            select
            value={subCategory ?? ""}
            fullWidth
            size="medium"
            onChange={(e) => onSubCategoryChange(e.target.value || null)}
            sx={selectSx}
            SelectProps={{ MenuProps: menuProps }}
          >
            <MenuItem value="">
              <em style={{ color: "#999" }}>None</em>
            </MenuItem>
            {subCatList.map((sub) => (
              <MenuItem key={sub} value={sub}>
                {sub}
              </MenuItem>
            ))}
          </TextField>
        </div>
      )}

      {/* Price */}
      <div className="flex flex-col gap-2">
        <label className="text-lg text-color dark:text-foreground font-semibold">
          Price ($)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className={`text-xl font-semibold ${inputCls}`}
        />
      </div>

      {/* Sale Price */}
      <div className="flex flex-col gap-2">
        <label className="text-lg text-color dark:text-foreground font-semibold">
          Sale Price (optional)
        </label>
        <input
          type="number"
          value={salePrice ?? ""}
          onChange={(e) =>
            onSalePriceChange(e.target.value ? Number(e.target.value) : null)
          }
          className={`text-xl font-semibold ${inputCls}`}
        />
        {discountPercent > 0 && (
          <p className="text-sm text-zinc-600 dark:text-muted-foreground font-semibold">
            %{discountPercent} discount is being applied
          </p>
        )}
      </div>

      {/* Stock + Switches */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <label className="text-lg text-color dark:text-foreground font-semibold">
            Stock:
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => onStockChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-border bg-white dark:bg-accent text-color dark:text-white! p-2 rounded w-28 text-xl flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-primary"
          />
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => onIsActiveChange(e.target.checked)}
              color="success"
            />
          }
          label="Active Product"
          className="text-color dark:text-foreground text-2xl text-jost font-semibold"
        />
        <div className="text-color dark:text-foreground text-2xl text-jost">
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

      {/* Buttons */}
      <div className="flex flex-col">
        <Button
          onClick={onUpdate}
          className="bg-secondary dark:bg-primary/80 hover:bg-secondary/60 dark:hover:opacity-90 text-color dark:text-primary-foreground font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
        >
          Update Product
        </Button>
        <Button
          onClick={onDelete}
          className="bg-destructive hover:bg-destructive/80 text-white dark:hover:text-white font-semibold py-3 rounded-lg mt-4 cursor-pointer transition duration-300 ease-in-out hover:scale-105"
        >
          Delete Product
        </Button>
      </div>
    </div>
  );
};

export default AdminProductForm;
