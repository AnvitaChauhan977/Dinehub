import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { dishImage } from "@/lib/dish-images";
import { ORDER_STATUSES, rupees, STATUS_LABEL } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Track your order — DineHub" },
      {
        name: "description",
        content: "Live status for your DineHub order, from kitchen confirmation to delivery.",
      },
      { property: "og:title", content: "Track your order — DineHub" },
      { property: "og:description", content: "Live status for your DineHub order." },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { user, loading } = useAuth();

  const order = useQuery({
    queryKey: ["order", orderId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total,address,phone,notes,created_at")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const items = useQuery({
    queryKey: ["order-items", orderId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id,name,image_key,price,quantity")
        .eq("order_id", orderId);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => void order.refetch(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, user]);

  if (loading || order.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl">SIGN IN TO TRACK THIS ORDER</h1>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/orders" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  if (!order.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl">ORDER NOT FOUND</h1>
        <Button asChild className="mt-6">
          <Link to="/orders">Back to my orders</Link>
        </Button>
      </div>
    );
  }

  const o = order.data;
  const cancelled = o.status === "cancelled";
  const activeIndex = ORDER_STATUSES.indexOf(o.status as (typeof ORDER_STATUSES)[number]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/orders" className="text-sm text-primary hover:underline">
        ← All orders
      </Link>
      <h1 className="mt-2 text-4xl sm:text-5xl">ORDER #{o.id.slice(0, 8).toUpperCase()}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed {new Date(o.created_at).toLocaleString()}
      </p>

      <div className="surface-card mt-8 p-6">
        <h2 className="text-2xl">STATUS</h2>
        {cancelled ? (
          <p className="mt-3 text-destructive">This order was cancelled.</p>
        ) : (
          <ol className="mt-5 space-y-4">
            {ORDER_STATUSES.map((s, i) => {
              const done = i <= activeIndex;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={`grid size-7 place-items-center rounded-full border ${
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={done ? "font-medium" : "text-muted-foreground"}>
                    {STATUS_LABEL[s]}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="surface-card mt-6 p-6">
        <h2 className="text-2xl">ITEMS</h2>
        <div className="mt-4 space-y-3">
          {items.data?.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <img
                src={dishImage(it.image_key)}
                alt={it.name}
                loading="lazy"
                width={64}
                height={64}
                className="size-14 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{it.name}</p>
                <p className="text-sm text-muted-foreground">× {it.quantity}</p>
              </div>
              <span>{rupees(Number(it.price) * it.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-xl">TOTAL</span>
          <span className="font-display text-2xl">{rupees(Number(o.total))}</span>
        </div>
      </div>

      <div className="surface-card mt-6 p-6 text-sm">
        <h2 className="text-2xl">DELIVERY</h2>
        <p className="mt-3">{o.address}</p>
        <p className="text-muted-foreground">{o.phone}</p>
        {o.notes && <p className="mt-2 text-muted-foreground">Note: {o.notes}</p>}
      </div>
    </div>
  );
}