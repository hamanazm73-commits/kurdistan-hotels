import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A row of five gold stars filled to `value` (supports halves, e.g. 4.5).
 * Kept LTR so the fill always reads left-to-right, even on RTL pages.
 */
export function StarRating({
  value,
  size = 16,
  showValue = false,
  className,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(5, value || 0));
  return (
    <span
      dir="ltr"
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, v - i));
          return (
            <span
              key={i}
              className="relative inline-block shrink-0"
              style={{ width: size, height: size }}
            >
              {/* faint base star */}
              <Star
                size={size}
                strokeWidth={0}
                fill="currentColor"
                className="absolute inset-0 text-gold/25"
              />
              {/* gold fill, clipped to this star's share of the rating */}
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star
                    size={size}
                    strokeWidth={0}
                    fill="currentColor"
                    className="text-gold drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.25)]"
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span
          className="font-extrabold text-gold"
          style={{ fontSize: Math.round(size * 0.82) }}
        >
          {v.toFixed(1)}
        </span>
      )}
    </span>
  );
}
