import type { ReactNode } from "react";

/**
 * Renders a post body written in a tiny, safe subset of Markdown:
 *   "## "  heading      "### " sub-heading
 *   "- "   bullet        blank line = new paragraph
 * Everything is rendered as React text, so owner-written content can never
 * inject HTML or scripts.
 */
export function PostContent({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    blocks.push(
      <p key={`p${blocks.length}`} className="leading-8">
        {para.join(" ")}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`u${blocks.length}`} className="space-y-2 ps-1">
        {list.map((it, i) => (
          <li key={i} className="flex gap-2.5 leading-8">
            {/* a gold dot rather than a bullet glyph — a list marker is one of
                the few places a house colour can show without shouting */}
            <span
              aria-hidden
              className="mt-3 size-1.5 shrink-0 rounded-full bg-gold"
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushPara();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      flushPara();
      blocks.push(
        <h3 key={`h3${blocks.length}`} className="mt-8 text-lg font-bold tracking-tight">
          {line.slice(4)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push(
        <h2 key={`h2${blocks.length}`} className="mt-10 text-2xl font-extrabold tracking-tight">
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushList();
  flushPara();

  return (
    // 17px with generous leading: this is long-form reading, not UI text,
    // and Kurdish and Arabic script in particular need the extra line height
    <div className="space-y-5 text-[17px] text-foreground/85">{blocks}</div>
  );
}
