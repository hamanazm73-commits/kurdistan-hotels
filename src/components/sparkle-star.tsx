import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A premium rating star with a soft, breathing golden glow — like the steady
 * light of a real star gently brightening and dimming. `delay` staggers the
 * glow so a grid of cards doesn't pulse in unison.
 */
export function SparkleStar({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <Star
      className={cn("star-glow shrink-0 fill-gold text-gold", className)}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    />
  );
}
