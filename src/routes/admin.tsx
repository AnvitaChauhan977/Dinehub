import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, menuQuery, rupees, STATUS_LABEL } from "@/lib/menu";
import { dishImage, dishImageKeys } from "@/lib/dish-images";

const STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — DineHub" },
      {
        name: "description",
        content: "Manage the DineHub menu, update dish availability and move orders through the kitchen.",
      },
      { property: "og:title", content: "Admin dashboard — DineHub" },
      { property: "og:description", content: "Manage the menu and orders for DineHub." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const categories = useQuery(categoriesQuery);
  const menu = useQuery(menuQuery);

  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total,address,phone,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_key: dishImageKeys[0] ?? "",
    is_veg: true,
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl">ADMINS ONLY</h1>
        <p className="mt-2 text-muted-foreground">
          This dashboard is limited to restaurant staff accounts.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const revenue = (orders.data ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + Number(o.total), 0);
  const active = (orders.data ?? []).filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  ).length;

  const addDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) {
      toast.error("Add a dish name and a valid price.");
      return;
    }
    const { error } = await supabase.from("menu_items").insert({
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category_id: form.category_id || null,
      image_key: form.image_key,
      is_veg: form.is_veg,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Dish added to the menu");
    setForm({ ...form, name: "", description: "", price: "" });
    void qc.invalidateQueries({ queryKey: ["menu-items"] });
  };

  const toggleAvailability = async (id: string, next: boolean) => {
    const { error } = await supabase.from("menu_items").update({ is_available: next }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["menu-items"] });
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as never })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Order marked ${STATUS_LABEL[status] ?? status}`);
    void qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">ADMIN DASHBOARD</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Total orders", String(orders.data?.length ?? 0)],
          ["Active orders", String(active)],
          ["Revenue", rupees(revenue)],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-3">
          {orders.isLoading && <Skeleton className="h-24 w-full" />}
          {orders.data?.length === 0 && (
            <p className="text-muted-foreground">No orders yet.</p>
          )}
          {orders.data?.map((o) => (
            <div
              key={o.id}
              className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <p className="font-display text-xl">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="truncate text-sm text-muted-foreground">{o.address}</p>
                <p className="text-xs text-muted-foreground">
                  {o.phone} · {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl">{rupees(Number(o.total))}</span>
                <Select value={o.status} onValueChange={(v) => void setStatus(o.id, v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="menu" className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form className="surface-card h-fit space-y-4 p-6" onSubmit={addDish}>
            <h2 className="text-2xl">ADD A DISH</h2>
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Name</Label>
              <Input
                id="d-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-desc">Description</Label>
              <Textarea
                id="d-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-price">Price (₹)</Label>
              <Input
                id="d-price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Photo</Label>
              <Select
                value={form.image_key}
                onValueChange={(v) => setForm({ ...form, image_key: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dishImageKeys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="d-veg">Vegetarian</Label>
              <Switch
                id="d-veg"
                checked={form.is_veg}
                onCheckedChange={(v) => setForm({ ...form, is_veg: v })}
              />
            </div>
            <Button type="submit" className="w-full">
              Add dish
            </Button>
          </form>

          <div className="space-y-3">
            {(menu.data ?? []).map((m) => (
              <div key={m.id} className="surface-card flex items-center gap-3 p-3">
                <img
                  src={dishImage(m.image_key)}
                  alt={m.name}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="size-14 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{rupees(m.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {m.is_available ? "Available" : "Sold out"}
                  </span>
                  <Switch
                    checked={m.is_available}
                    aria-label={`Toggle availability for ${m.name}`}
                    onCheckedChange={(v) => void toggleAvailability(m.id, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}