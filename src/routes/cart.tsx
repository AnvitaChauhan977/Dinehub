import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { dishImage } from "@/lib/dish-images";
import { rupees } from "@/lib/menu";
import { supabase } from "@/integrations/supabase/client";

const DELIVERY_FEE = 39;

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — DineHub" },
      {
        name: "description",
        content: "Review your dishes, add delivery details and place your DineHub order.",
      },
      { property: "og:title", content: "Your cart — DineHub" },
      { property: "og:description", content: "Review your dishes and place your order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("profiles")
      .select("phone,address")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setAddress((v) => v || (data.address ?? ""));
        setPhone((v) => v || (data.phone ?? ""));
      });
    return () => {
      active = false;
    };
  }, [user]);

  const total = cart.subtotal + (cart.lines.length ? DELIVERY_FEE : 0);

  const placeOrder = async () => {
    if (!user) {
      void navigate({ to: "/auth", search: { redirect: "/cart" } });
      return;
    }
    if (!address.trim() || !phone.trim()) {
      toast.error("Please add a delivery address and phone number.");
      return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        address: address.trim(),
        phone: phone.trim(),
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      setPlacing(false);
      toast.error(error?.message ?? "Could not place the order.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      cart.lines.map((l) => ({
        order_id: order.id,
        menu_item_id: l.id,
        name: l.name,
        image_key: l.image_key,
        price: l.price,
        quantity: l.quantity,
      })),
    );
    setPlacing(false);
    if (itemsError) {
      toast.error(itemsError.message);
      return;
    }
    cart.clear();
    toast.success("Order placed! Track it below.");
    void navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
  };

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="text-4xl">YOUR CART IS EMPTY</h1>
        <p className="mt-2 text-muted-foreground">Add a dish or two and come back.</p>
        <Button asChild className="mt-6">
          <Link to="/menu">Browse the menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">YOUR CART</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {cart.lines.map((line) => (
            <div key={line.id} className="surface-card flex items-center gap-4 p-3">
              <img
                src={dishImage(line.image_key)}
                alt={line.name}
                loading="lazy"
                width={96}
                height={96}
                className="size-20 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-xl">{line.name}</h2>
                <p className="text-sm text-muted-foreground">{rupees(line.price)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => cart.setQty(line.id, line.quantity - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-medium">{line.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => cart.setQty(line.id, line.quantity + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="hidden w-24 text-right font-display text-xl sm:block">
                {rupees(line.price * line.quantity)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${line.name}`}
                onClick={() => cart.remove(line.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <aside className="surface-card h-fit space-y-4 p-6">
          <h2 className="text-2xl">CHECKOUT</h2>

          <div className="space-y-1.5">
            <Label htmlFor="addr">Delivery address</Label>
            <Textarea
              id="addr"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat, street, landmark, city"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ph">Phone</Label>
            <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes for the kitchen</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Less spicy, no onion…"
            />
          </div>

          <div className="space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{rupees(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{rupees(DELIVERY_FEE)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-display text-xl">TOTAL</span>
              <span className="font-display text-2xl">{rupees(total)}</span>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={placeOrder} disabled={placing || loading}>
            {user ? (placing ? "Placing order…" : "Place order") : "Sign in to order"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Pay on delivery</p>
        </aside>
      </div>
    </div>
  );
}