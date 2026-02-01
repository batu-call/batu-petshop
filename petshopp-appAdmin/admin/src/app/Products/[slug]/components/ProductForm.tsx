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
  const categoryValue =
    typeof category === "string" ? category : category?.name || "";

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

      <div className="flex flex-col gap-2">
        <label className="text-lg text-color font-semibold">Category</label>
        <TextField
          select
          value={categoryValue}
          onChange={(e) => onCategoryChange(e.target.value)}
          fullWidth
          size="medium"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              fontSize: "15px",

              "& fieldset": {
                borderColor: "#E5E7EB",
              },

              "&:hover fieldset": {
                borderColor: "#97cba9",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#97cba9",
                borderWidth: "2px",
              },
            },

            "& .MuiSelect-select": {
              color: "#111827",
              padding: "14px",
            },
          }}
          SelectProps={{
            MenuProps: {
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

                    "&:hover": {
                      backgroundColor: "rgba(151, 203, 169, 0.15)",
                    },

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
            },
          }}
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </div>

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
