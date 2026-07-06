import { ImageResponse } from "next/og";

export const runtime = "nodejs";

/**
 * Kurdistan Hotels logo, rendered as a PNG so it works in email clients (Gmail
 * blocks SVG/data-URI images but shows a normal hosted PNG). Also reusable
 * anywhere a logo image is needed. Cached hard — it never changes.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg,#1e3a5f,#16293f)",
          alignItems: "center",
          justifyContent: "center",
          gap: "30px",
        }}
      >
        {/* emblem: a gold circle holding a small navy tower with gold windows */}
        <div
          style={{
            display: "flex",
            width: "116px",
            height: "116px",
            borderRadius: "58px",
            background: "#f5c542",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              width: "52px",
              background: "#1e3a5f",
              borderRadius: "7px 7px 0 0",
              padding: "9px 0",
            }}
          >
            {[0, 1, 2].map((r) => (
              <div key={r} style={{ display: "flex", gap: "7px" }}>
                <div style={{ width: "9px", height: "9px", background: "#f5c542" }} />
                <div style={{ width: "9px", height: "9px", background: "#f5c542" }} />
              </div>
            ))}
          </div>
        </div>

        {/* wordmark */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "50px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            KURDISTAN
          </div>
          <div
            style={{
              fontSize: "31px",
              fontWeight: 600,
              color: "#f5c542",
              letterSpacing: "9px",
            }}
          >
            HOTELS
          </div>
        </div>
      </div>
    ),
    {
      width: 640,
      height: 200,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
