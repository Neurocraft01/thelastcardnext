import { NextResponse } from "next/server";
import { z } from "zod";
import { createSignedUploadPayload, getCloudinaryPublicConfig } from "@/lib/cloudinary";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";
import { assertRateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  assetType: z.enum(["profile", "cover", "qr", "cardDesign", "pdf"]),
  filename: z.string().min(1).max(120),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(3).max(80),
});

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PDF_TYPES = new Set(["application/pdf"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80) || "upload";
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/upload/signature";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`upload-signature:${ip}`, 60, 60_000);

    const auth = await getAuthenticatedUserFromRequest(request);
    if (!auth) {
      const response = NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const response = NextResponse.json({ success: false, message: "Invalid upload signature payload." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const isPdf = parsed.data.assetType === "pdf";
    const validMime = isPdf ? PDF_TYPES.has(parsed.data.mimeType) : IMAGE_TYPES.has(parsed.data.mimeType);
    const maxAllowed = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;

    if (!validMime) {
      const response = NextResponse.json({ success: false, message: "Unsupported file type." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    if (parsed.data.fileSize > maxAllowed) {
      const response = NextResponse.json({ success: false, message: "File is too large." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const signed = createSignedUploadPayload({
      assetType: parsed.data.assetType,
      userId: auth.user.id,
      safeFilename: sanitizeFilename(parsed.data.filename),
    });

    const publicConfig = getCloudinaryPublicConfig();

    logEvent({
      requestId,
      route,
      level: "info",
      message: "Upload signature issued",
      data: { assetType: parsed.data.assetType, userId: auth.user.id },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        cloudName: publicConfig.cloudName,
        apiKey: publicConfig.apiKey,
        folder: signed.folder,
        publicId: signed.publicId,
        resourceType: signed.resourceType,
        timestamp: signed.timestamp,
        signature: signed.signature,
      },
    });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Upload signature API error", data: String(error) });
    await alertCritical({ requestId, route, message: "Upload signature critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Failed to generate upload signature." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
