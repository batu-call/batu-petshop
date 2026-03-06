export type OrderItems = {
  product:
    | string
    | {
        _id: string;
        product_name: string;
        image: { url: string }[];
        price: number;
        slug: string;
      };
  name: string;
  price: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  postalCode: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
};

export type OrdersType = {
  _id: string;
  user: User | null;
  items: OrderItems[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  couponCode?: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};