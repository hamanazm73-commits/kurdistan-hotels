import { cn } from "@/lib/utils";

/**
 * The Kurdistan Hotels emblem: an Erbil-citadel mark under a star, inside a
 * fine gold double ring, on a deep-navy rounded badge. Used in the header,
 * footer and (as PNGs) the favicon and emails. Pass sizing via `className`.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-xl bg-[#15304A] shadow-md",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="size-[82%]" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke="#DFB250"
          strokeWidth="2.4"
        />
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="none"
          stroke="#DFB250"
          strokeWidth="1"
        />
        {/* star */}
        <path
          d="M50 27 l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6Z"
          fill="#DFB250"
        />
        {/* citadel towers */}
        <g fill="#DFB250">
          <rect x="33" y="52" width="8" height="17" />
          <rect x="46" y="45" width="8" height="24" />
          <rect x="59" y="52" width="8" height="17" />
        </g>
        <path
          d="M30 69 H70"
          stroke="#DFB250"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
