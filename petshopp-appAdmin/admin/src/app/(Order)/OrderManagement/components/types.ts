export interface OrderItem {
  product: string | { _id: string; product_name: string; image: { url: string }[] };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  email?: string;
  city: string;
  phoneNumber: string;
  address: string;
  postalCode?: string;
}

export interface OrderUser {
  _id: string;
  name: string;
  avatar: string;
}

export interface OrderTracking {
  trackingNumber?: string;
  cargoCompany?: "UPS" | "DHL" | "FedEx" | "USPS" | "Other" | "";
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
}

export interface Order {
  _id: string;
  user?: OrderUser | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  couponCode?: string;
  status: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
  tracking?: OrderTracking;
}

export interface Stats {
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  cancellation_requested: number;
}

export const CARGO_COMPANIES = ["UPS", "DHL", "FedEx", "USPS", "Other"] as const;
export const ITEMS_PER_PAGE = 15;