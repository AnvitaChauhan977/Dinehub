import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { rupees, STATUS_LABEL } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — DineHub" },
      {
        name: "description",
        content: "See every DineHub order you've placed and follow its status in real time.",
      },
      { property: "og:title", content: "My orders — DineHub" },
      { property: "og:description", content: "Follow your DineHub orders from kitchen to door." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading } = useAuth();

  const orders = useQuery({
    queryKey: ["orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total,address,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16"><Skeleton className="h-40 w-full" /></div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl">SIGN IN TO SEE YOUR ORDERS</h1>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/orders" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">MY ORDERS</h1>

      <div className="mt-8 space-y-4">
        {orders.isLoading &&
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}

        {orders.data?.length === 0 && (
          <div className="surface-card p-10 text-center">
            <p className="text-muted-foreground">You haven&apos;t ordered anything yet.</p>
            <Button asChild className="mt-4">
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        )}

        {orders.data?.map((o) => (
          <Link
            key={o.id}
            to="/orders/$orderId"
            params={{ orderId: o.id }}
            className="surface-card lift-on-hover flex items-center justify-between gap-4 p-5"
          >
            <div className="min-w-0">
              <p className="font-display text-xl">#{o.id.slice(0, 8).toUpperCase()}</p>
              <p className="truncate text-sm text-muted-foreground">{o.address}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl">{rupees(Number(o.total))}</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                {STATUS_LABEL[o.status] ?? o.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}