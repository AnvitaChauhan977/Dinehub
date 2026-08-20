import { Clock, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dishImage } from "@/lib/dish-images";
import { rupees, type MenuItem } from "@/lib/menu";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className="inline-flex size-4 items-center justify-center rounded-[3px] border"
      style={{ borderColor: isVeg ? "var(--veg)" : "var(--nonveg)" }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: isVeg ? "var(--veg)" : "var(--nonveg)" }}
      />
    </span>
  );
}

export function DishCard({ item }: { item: MenuItem }) {
  const cart = useCart();

  return (
    <article className="surface-card lift-on-hover group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={dishImage(item.image_key)}
          alt={item.name}
          loading="lazy"
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.is_popular && (
          <span className="gradient-crust absolute left-3 top-3 rounded-full px-3 py-1 font-display text-xs tracking-widest text-primary-foreground">
            POPULAR
          </span>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/60">
            <span className="font-display text-lg tracking-widest text-background">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl leading-tight">{item.name}</h3>
          <VegDot isVeg={item.is_veg} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-accent text-accent" />
            {item.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {item.prep_minutes} min
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-2xl">{rupees(item.price)}</span>
          <Button
            size="sm"
            disabled={!item.is_available}
            onClick={() => {
              cart.add({
                id: item.id,
                name: item.name,
                price: item.price,
                image_key: item.image_key,
              });
              toast.success(`${item.name} added to cart`);
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}