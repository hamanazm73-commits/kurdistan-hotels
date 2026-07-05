import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

/**
 * Serves a hotel image from R2 through Vercel's CDN. The free r2.dev URL is
 * rate-limited and uncached, so images loaded there are slow/flaky. This route
 * fetches the object via the (fast, unlimited) S3 API and returns it with a
 * long cache header, so Vercel's edge caches it and repeat loads are instant.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<NextResponse> {
  const { key } = await params;
  const objectKey = key.map((k) => decodeURIComponent(k)).join("/");

  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return new NextResponse("storage not configured", { status: 500 });
  }

  try {
    const s3 = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: objectKey }),
    );
    const bytes = await obj.Body?.transformToByteArray();
    if (!bytes) return new NextResponse("not found", { status: 404 });

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": obj.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
