import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

/**
 * Returns a short-lived presigned PUT URL so the browser uploads a hotel
 * image/video straight to an S3-compatible bucket (Cloudflare R2), bypassing
 * the serverless body limit. The caller's Firebase ID token is verified first.
 */
async function isSignedIn(idToken: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return true; // can't verify (dev / self-host) — allow
  if (!idToken) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { users?: unknown[] };
    return Array.isArray(data.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: {
    contentType?: string;
    kind?: string;
    filename?: string;
    idToken?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  if (!(await isSignedIn(payload.idToken ?? ""))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !publicBase || !accessKeyId || !secretAccessKey) {
    return NextResponse.json({ error: "storage not configured" }, { status: 500 });
  }

  const kind = payload.kind === "video" ? "videos" : "images";
  const contentType =
    payload.contentType || (kind === "videos" ? "video/mp4" : "image/jpeg");
  const ext = (payload.filename?.split(".").pop() || (kind === "videos" ? "mp4" : "jpg"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);
  const key = `hotels/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const s3 = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: 3600 }, // 1h — big videos on slow connections need time
    );
    const publicUrl = `${publicBase.replace(/\/$/, "")}/${key}`;
    return NextResponse.json({ uploadUrl, publicUrl, contentType });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "sign-failed" },
      { status: 500 },
    );
  }
}
