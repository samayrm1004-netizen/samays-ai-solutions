export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_creator: boolean;
  avatar?: string | null;
};

export type Tokens = {
  access: string;
  refresh: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url?: string | null;
  creator: User;
  created_at: string;
};

export type Booking = {
  id: number;
  product: number;
  booking_date: string;
  status: "pending" | "confirmed" | "cancelled";
  product_detail: Product;
};
