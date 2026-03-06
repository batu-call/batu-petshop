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
  image: ProductImage[];
  slug: string;
};

export interface NavbarProps {
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
  priceRange?: number[];
  setPriceRange?: (range: number[]) => void;
  tempPriceRange?: number[];
  setTempPriceRange?: (range: number[]) => void;
  priceStats?: { min: number; max: number };
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  showOnSale?: boolean;
  setShowOnSale?: (show: boolean) => void;
  minRating?: number;
  setMinRating?: (rating: number) => void;
  hasActiveFilters?: () => boolean;
  clearAllFilters?: () => void;
  handlePriceChange?: (event: Event, newValue: number | number[]) => void;
  handlePriceChangeCommitted?: () => void;
}

export const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating", label: "Highest Rated" },
];

export const CATEGORY_TITLES = [
  "Cat Products",
  "Dog Products",
  "Bird Products",
  "Fish Products",
  "Reptile Products",
  "Rabbit Products",
  "Horse Products",
];

export const PAGE_TITLES: Record<string, string> = {
  "/my-profile": "My Profile",
  "/favorite": "Favorite",
  "/orders": "My Orders",
  "/Cart": "Shopping Cart",
  "/Order": "All Users",
  "/AllProduct": "All Product",
  "/Contact": "Contact Us",
  "/settings": "Setting",
};

export const ROTATING_TEXTS: Record<string, string[]> = {
  "Cat Products": ["Cats", "Are", "Awesome!", "Meow!"],
  "Dog Products": ["Dogs", "Are", "Loyal!", "Woof!"],
  "Bird Products": ["Birds", "Can", "Sing!", "Tweet!"],
  "Fish Products": ["Fishes", "Swim", "Gracefully!", "Splash!"],
  "Reptile Products": ["Reptiles", "Are", "Cold-Blooded!", "Hiss!"],
  "Rabbit Products": ["Rabbits", "Are", "Cute!", "Hop!"],
  "Horse Products": ["Horses", "Are", "Majestic!", "Neigh!"],
};