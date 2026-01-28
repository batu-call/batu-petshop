export type ProductImage = { 
  url: string; 
  publicId: string; 
  _id: string 
};

export type Category = { 
  _id: string; 
  name: string; 
  slug: string 
};

export type Features = { 
  name: string; 
  description: string 
};

export type Product = {
  _id: string;
  product_name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: ProductImage[];
  slug: string;
  category: Category;
  productFeatures: Features[];
};

export type Reviews = {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  helpful: string[];
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewStats = {
  [productId: string]: {
    count: number;
    avgRating: number;
  };
};