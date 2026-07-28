<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Build for a 375px phone first

Almost every visitor and most hotel owners are on a phone. A layout that
only works on the desktop preview is broken for nearly everyone.

Before considering any UI change done:

- Check it at **375px wide**, not just the default preview width.
- Nothing may be wider than the viewport. If an element is cut off at the
  edge, the layout is wrong — don't leave it to horizontal scrolling.

Two mistakes have caused this here already:

- **Nested `grid-cols-2`.** A two-column grid inside a cell of another
  two-column grid leaves ~150px on a phone. Use one grid that stacks:
  `grid gap-2 sm:grid-cols-2`.
- **`<Input type="date">` in a narrow cell.** The native picker has a
  minimum width of roughly 140px and overflows below it. Never put two
  date inputs side by side without an `sm:` breakpoint, and never beside
  a button in the same row on mobile.

Default to `grid gap-N sm:grid-cols-2` for any pair of labelled fields.
Plain `grid-cols-2` is only safe for short numeric inputs.
