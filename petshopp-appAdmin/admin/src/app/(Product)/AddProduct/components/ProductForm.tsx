"use client";

import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@/components/ui/button";
import { ProductFormData, SUB_CATEGORIES } from "../hooks/useAddProduct";

const getMuiSx = (isDark: boolean) => ({
  mb: 2,
  "& .MuiInputLabel-root": { color: isDark ? "#7aab8a" : undefined },
  "& .MuiInputLabel-root.Mui-focused": { color: "#B1CBBB" },
  "& .MuiOutlinedInput-root": {
    color: isDark ? "#c8e6d0" : "#393E46",
    backgroundColor: isDark ? "#0d1f18" : undefined,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isDark ? "#2d5a3d" : undefined,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isDark ? "#7aab8a" : undefined,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#B1CBBB",
    },
  },
});

const getMenuProps = (isDark: boolean) => ({
  PaperProps: {
    sx: {
      backgroundColor: isDark ? "#162820" : undefined,
      "& .MuiMenuItem-root": {
        color: isDark ? "#c8e6d0" : "#393E46",
        "&:hover": {
          backgroundColor: isDark ? "#1e3d2a" : "rgba(177,203,187,0.2)",
        },
        "&.Mui-selected": {
          backgroundColor: isDark ? "#2d5a3d" : "rgba(177,203,187,0.3)",
        },
        "&.Mui-selected:hover": {
          backgroundColor: isDark ? "#2d5a3d" : "rgba(177,203,187,0.4)",
        },
      },
    },
  },
});

type Props = {
  formData: ProductFormData;
  setFormData: (f: ProductFormData) => void;
  uploading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  isDark?: boolean;
};

const ProductForm = ({
  formData,
  setFormData,
  uploading,
  handleChange,
  handleSubmit,
  isDark = false,
}: Props) => {
  const sx = getMuiSx(isDark);
  const menuProps = getMenuProps(isDark);

  const subCatList = formData.category
    ? (SUB_CATEGORIES[formData.category] ?? [])
    : [];

  return (
    <div className="flex-1">
      <h2 className="text-color dark:text-[#c8e6d0]! text-2xl mb-4 text-jost font-semibold">
        Add New Product
      </h2>

      <TextField
        label="Product Name"
        name="product_name"
        value={formData.product_name}
        onChange={handleChange}
        fullWidth
        disabled={uploading}
        sx={sx}
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        multiline
        disabled={uploading}
        sx={sx}
      />

      <TextField
        label="Price"
        name="price"
        value={formData.price}
        onChange={handleChange}
        fullWidth
        disabled={uploading}
        sx={sx}
      />

      <TextField
        select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        fullWidth
        disabled={uploading}
        sx={sx}
        SelectProps={{ MenuProps: menuProps }}
      >
        <MenuItem value="Cat">Cat</MenuItem>
        <MenuItem value="Dog">Dog</MenuItem>
        <MenuItem value="Fish">Fish</MenuItem>
        <MenuItem value="Bird">Bird</MenuItem>
        <MenuItem value="Reptile">Reptile</MenuItem>
        <MenuItem value="Rabbit">Rabbit</MenuItem>
        <MenuItem value="Horse">Horse</MenuItem>
      </TextField>

      {subCatList.length > 0 && (
        <TextField
          select
          label="Sub Category"
          name="subCategory"
          value={formData.subCategory}
          onChange={handleChange}
          fullWidth
          disabled={uploading}
          sx={sx}
          SelectProps={{ MenuProps: menuProps }}
        >
        
          <MenuItem value="">
            <em style={{ color: isDark ? "#7aab8a" : "#999" }}>None</em>
          </MenuItem>
          {subCatList.map((sub) => (
            <MenuItem key={sub} value={sub}>
              {sub}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        label="Stock"
        name="stock"
        type="number"
        value={formData.stock}
        onChange={handleChange}
        fullWidth
        disabled={uploading}
        sx={sx}
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.isActive}
            color="success"
            disabled={uploading}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
        }
        label={
          <span className="text-color dark:text-[#a8d4b8]!">Active Product</span>
        }
      />
      <FormControlLabel
        control={
          <Switch
            checked={formData.isFeatured}
            color="success"
            disabled={uploading}
            onChange={(e) =>
              setFormData({ ...formData, isFeatured: e.target.checked })
            }
          />
        }
        label={
          <span className="text-color dark:text-[#a8d4b8]!">
            Featured Product
          </span>
        }
      />

      <Button
        onClick={handleSubmit}
        disabled={uploading}
        className="mt-3 w-full bg-primary dark:bg-[#0b8457] hover:bg-[#A8D1B5] dark:hover:bg-[#2d5a3d] text-[#393E46] dark:text-[#c8e6d0] font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
      >
        {uploading ? "Uploading..." : "Add Product"}
      </Button>
    </div>
  );
};

export default ProductForm;
