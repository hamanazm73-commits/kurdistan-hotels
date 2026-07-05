import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

/**
 * Serves a hotel image OR video from R2 through Vercel's CDN. The free r2.dev
 * URL is rate-limited/uncached (slow, flaky) and awkward for video, so we fetch
 * via the fast S3 API. Images are buffered + long-cached; video honours HTTP
 * Range requests (206) so it streams and seeks properly in the browser.
 */
function client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<NextResponse> {
  const { key } = await params;
  const Key = key.map((k) => decodeURIComponent(k)).join("/");
  const Bucket = process.env.S3_BUCKET;
  if (!Bucket || !process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY_ID) {
    return new NextResponse("storage not configured", { status: 500 });
  }

  const range = req.headers.get("range") ?? undefined;
  const cache = "public, max-age=31536000, immutable";

  try {
    const s3 = client();
    const obj = await s3.send(
      new GetObjectCommand({ Bucket, Key, Range: range }),
    );
    const contentType = obj.ContentType || "application/octet-stream";

    // Range request (video seeking): stream the partial content back as 206.
    if (range && obj.ContentRange) {
      const stream = obj.Body?.transformToWebStream();
      const headers = new Headers({
        "Content-Type": contentType,
        "Content-Range": obj.ContentRange,
        "Accept-Ranges": "bytes",
        "Cache-Control": cache,
      });
      if (obj.ContentLength != null)
        headers.set("Content-Length", String(obj.ContentLength));
      return new NextResponse(stream as ReadableStream, {
        status: 206,
        headers,
      });
    }

    // Full object (images, or video without a Range header): buffer + cache.
    const bytes = await obj.Body?.transformToByteArray();
    if (!bytes) return new NextResponse("not found", { status: 404 });
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": cache,
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
