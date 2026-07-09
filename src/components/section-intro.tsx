import { cn } from "@/lib/utils";

/** A consistent, premium section header: a small gold "eyebrow" label with an
    accent line, a bold title, and an optional subtitle. Used across the home
    sections so they read as one polished system. */
export function SectionIntro({
  eyebrow,
  title,
  subtitle,
  center = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", center && "text-center", className)}>
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-2.5",
            center && "justify-center",
          )}
        >
          <span className="h-0.5 w-6 rounded-full bg-gold" />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
            {eyebrow}
          </span>
          {center && <span className="h-0.5 w-6 rounded-full bg-gold" />}
        </div>
      )}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-2.5 text-muted-foreground",
            center ? "mx-auto max-w-xl" : "max-w-xl",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
