import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Timer, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DishCard } from "@/components/DishCard";
import { AiRecommender } from "@/components/AiRecommender";
import { categoriesQuery, menuQuery } from "@/lib/menu";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DineHub — Order Food Online & Track Live" },
      {
        name: "description",
        content:
          "Browse a chef-curated menu, add dishes to your cart, order in seconds and track your delivery live with DineHub.",
      },
      { property: "og:title", content: "DineHub — Order Food Online & Track Live" },
      {
        property: "og:description",
        content: "Chef-curated menu, one-tap ordering, live order tracking and AI dish picks.",
      },
    ],
  }),
  component: Index,
});

const PERKS = [
  { icon: Timer, title: "Ready in 20", body: "Most dishes leave the kitchen in under 20 minutes." },
  { icon: Truck, title: "Live tracking", body: "Follow every stage from kitchen to your door." },
  { icon: BadgeCheck, title: "Chef curated", body: "A tight menu, cooked to order, no filler." },
];

function Index() {
  const categories = useQuery(categoriesQuery);
  const menu = useQuery(menuQuery);
  const popular = (menu.data ?? []).filter((i) => i.is_popular).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="A warmly lit table filled with freshly cooked DineHub dishes"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <span className="inline-block rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            Now delivering across the city
          </span>
          <h1 className="mt-5 max-w-2xl text-5xl leading-[0.95] sm:text-7xl">
            REAL FOOD,
            <br />
            ORDERED IN SECONDS.
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground">
            DineHub brings the whole restaurant to your phone — browse the menu, build your cart,
            pay on delivery and watch your order move in real time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/menu">
                Explore the menu <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/orders">Track an order</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="surface-card flex items-start gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                <p.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-lg">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <h2 className="text-3xl sm:text-4xl">BROWSE BY CATEGORY</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {(categories.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/menu"
              search={{ category: c.slug, q: "", diet: "all" as const }}
              className="surface-card lift-on-hover px-5 py-3 font-display text-xl tracking-wide"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">MOST LOVED</h2>
          <Link to="/menu" className="text-sm font-medium text-primary hover:underline">
            See full menu
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menu.isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))
            : popular.map((item) => <DishCard key={item.id} item={item} />)}
        </div>
      </section>

      <div className="mt-20">
        <AiRecommender items={menu.data ?? []} categories={categories.data ?? []} history={[]} />
      </div>
    </>
  );
}
