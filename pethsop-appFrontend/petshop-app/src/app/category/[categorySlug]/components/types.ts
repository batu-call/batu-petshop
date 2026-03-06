export type ReviewStats = {
  [productId: string]: {
    count: number;
    avgRating: number;
  };
};

export type ProductImage = {
  url: string;
  publicId: string;
  _id: string;
};

export type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: ProductImage[];
  slug: string;
  category?: string;
  subCategory?: string | null;
  stock?: string;
  isFeatured?: boolean;
};