import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DishCard } from "@/components/DishCard";
import { categoriesQuery, menuQuery } from "@/lib/menu";

const searchSchema = z.object({
  q: z.string().catch(""),
  category: z.string().catch("all"),
  diet: z.enum(["all", "veg", "nonveg"]).catch("all"),
});

export const Route = createFileRoute("/menu")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Menu — DineHub" },
      {
        name: "description",
        content:
          "Search starters, mains, fast food, desserts and drinks. Filter by category or veg preference and add dishes straight to your cart.",
      },
      { property: "og:title", content: "Menu — DineHub" },
      {
        property: "og:description",
        content: "Search and filter the full DineHub menu, then order in a tap.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const categories = useQuery(categoriesQuery);
  const menu = useQuery(menuQuery);

  const term = search.q.trim().toLowerCase();
  const activeCategory = (categories.data ?? []).find((c) => c.slug === search.category);

  const items = (menu.data ?? []).filter((i) => {
    if (activeCategory && i.category_id !== activeCategory.id) return false;
    if (search.diet === "veg" && !i.is_veg) return false;
    if (search.diet === "nonveg" && i.is_veg) return false;
    if (term && !`${i.name} ${i.description}`.toLowerCase().includes(term)) return false;
    return true;
  });

  const setSearch = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({ search: { ...search, ...patch }, replace: true });

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">THE MENU</h1>
      <p className="mt-2 text-muted-foreground">
        {menu.isLoading ? "Loading dishes…" : `${items.length} dishes available right now.`}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.q}
            onChange={(e) => setSearch({ q: e.target.value })}
            placeholder="Search dishes…"
            className="bg-card pl-9"
            aria-label="Search dishes"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button className={chip(search.category === "all")} onClick={() => setSearch({ category: "all" })}>
            All
          </button>
          {(categories.data ?? []).map((c) => (
            <button
              key={c.id}
              className={chip(search.category === c.slug)}
              onClick={() => setSearch({ category: c.slug })}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Everything"],
              ["veg", "Veg only"],
              ["nonveg", "Non-veg"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              className={chip(search.diet === value)}
              onClick={() => setSearch({ diet: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {menu.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-lg" />
            ))
          : items.map((item) => <DishCard key={item.id} item={item} />)}
      </div>

      {!menu.isLoading && items.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">
          No dishes match that. Try clearing the filters.
        </p>
      )}
    </div>
  );
}