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
      <p key={`p${blocks.length}`} className="leading-relaxed">
        {para.join(" ")}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`u${blocks.length}`} className="list-disc space-y-1 ps-6">
        {list.map((it, i) => (
          <li key={i}>{it}</li>
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
        <h3 key={`h3${blocks.length}`} className="mt-6 text-lg font-bold">
          {line.slice(4)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push(
        <h2 key={`h2${blocks.length}`} className="mt-8 text-xl font-bold">
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
    <div className="space-y-4 text-[15px] text-foreground/90">{blocks}</div>
  );
}
