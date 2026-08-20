import { Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="gradient-crust grid size-8 place-items-center rounded-md text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="font-display text-xl tracking-widest">DINEHUB</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Smart restaurant &amp; food ordering platform. Open daily, 11am – 11pm.
        </p>
      </div>
    </footer>
  );
}