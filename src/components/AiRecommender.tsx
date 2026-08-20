import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DishCard } from "@/components/DishCard";
import { recommendDishes } from "@/lib/recommend.functions";
import type { Category, MenuItem } from "@/lib/menu";

const CHIPS = ["Something spicy", "Light and veg", "Comfort food", "Sweet tooth"];

export function AiRecommender({
  items,
  categories,
  history,
}: {
  items: MenuItem[];
  categories: Category[];
  history: string[];
}) {
  const recommend = useServerFn(recommendDishes);
  const [craving, setCraving] = useState("");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [picks, setPicks] = useState<MenuItem[]>([]);

  const run = async (text: string) => {
    if (text.trim().length < 2 || loading) return;
    setLoading(true);
    setReason("");
    setPicks([]);
    try {
      const result = await recommend({
        data: {
          craving: text.trim(),
          history,
          menu: items
            .filter((i) => i.is_available)
            .map((i) => ({
              id: i.id,
              name: i.name,
              description: i.description,
              price: i.price,
              is_veg: i.is_veg,
              category: categories.find((c) => c.id === i.category_id)?.name ?? "Other",
            })),
        },
      });
      setReason(result.reason);
      setPicks(result.ids.map((id) => items.find((i) => i.id === id)).filter(Boolean) as MenuItem[]);
    } catch {
      setReason("Couldn't fetch suggestions right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="surface-card gradient-warm p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          <span className="font-display text-xl tracking-widest">TASTE CONCIERGE</span>
        </div>
        <h2 className="mt-2 text-3xl sm:text-4xl">Not sure what to eat?</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Tell us your mood and our AI picks three dishes from tonight&apos;s menu, tuned to what
          you&apos;ve ordered before.
        </p>

        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void run(craving);
          }}
        >
          <Input
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
            placeholder="e.g. creamy, not too spicy, under ₹350"
            className="bg-card sm:max-w-md"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Thinking…" : "Suggest dishes"}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCraving(c);
                void run(c);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {c}
            </button>
          ))}
        </div>

        {reason && <p className="mt-5 text-sm font-medium text-foreground">{reason}</p>}

        {picks.length > 0 && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((p) => (
              <DishCard key={p.id} item={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}