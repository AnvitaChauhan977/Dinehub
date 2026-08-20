import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image_key: string | null;
  is_veg: boolean;
  is_available: boolean;
  is_popular: boolean;
  rating: number;
  prep_minutes: number;
};

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,sort_order")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
};

export const menuQuery = {
  queryKey: ["menu-items"],
  queryFn: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select(
        "id,category_id,name,description,price,image_key,is_veg,is_available,is_popular,rating,prep_minutes",
      )
      .order("name");
    if (error) throw error;
    return (data ?? []).map((d) => ({ ...d, price: Number(d.price), rating: Number(d.rating) }));
  },
};

export const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};