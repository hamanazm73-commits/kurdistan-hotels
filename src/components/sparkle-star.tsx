import { Star, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A premium rating star that behaves like a real star: a steady golden body
 * with a soft breathing glow, plus a tiny 4-point glint that flashes across it
 * every few seconds. `delay` staggers the twinkle so a grid of cards doesn't
 * sparkle in unison.
 */
export function SparkleStar({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <Star
        className={cn("star-glow fill-gold text-gold", className)}
        style={{ animationDelay: `${delay}s` }}
        aria-hidden
      />
      {/* the glint — a small sparkle that briefly catches the light */}
      <Sparkle
        className="star-glint pointer-events-none absolute -end-1 -top-1 size-2.5 fill-white text-white"
        style={{ animationDelay: `${delay + 1.2}s` }}
        aria-hidden
      />
    </span>
  );
}
