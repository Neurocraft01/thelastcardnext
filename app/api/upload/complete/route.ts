import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { getUploadFolder } from "@/lib/cloudinary";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertRateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  assetType: z.enum(["profile", "cover", "qr", "cardDesign", "pdf"]),
  secureUrl: z.url(),
  publicId: z.string().min(5).max(400),
  bytes: z.number().int().positive(),
  resourceType: z.string().min(3).max(30),
});

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/upload/complete";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`upload-complete:${ip}`, 60, 60_000);

    const auth = await getAuthenticatedUserFromRequest(request);
    if (!auth) {
      const response = NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const response = NextResponse.json({ success: false, message: "Invalid upload completion payload." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const folder = getUploadFolder(parsed.data.assetType);
    const expectedPrefix = `${folder}/${auth.user.id}-`;
    if (!parsed.data.publicId.startsWith(expectedPrefix)) {
      const response = NextResponse.json({ success: false, message: "Upload ownership validation failed." }, { status: 403 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const supabase = getSupabaseAdmin();
    const persistedAsset = await supabase.from("assets").insert({
      user_id: auth.user.id,
      asset_type: parsed.data.assetType,
      secure_url: parsed.data.secureUrl,
      public_id: parsed.data.publicId,
      bytes: parsed.data.bytes,
      resource_type: parsed.data.resourceType,
    });

    if (persistedAsset.error) {
      throw persistedAsset.error;
    }

    await writeAuditLog({
      actorUserId: auth.user.id,
      actorRole: auth.role,
      action: "asset.uploaded",
      targetType: "asset",
      targetId: parsed.data.publicId,
      requestId,
      metadata: { assetType: parsed.data.assetType },
    });

    logEvent({ requestId, route, level: "info", message: "Upload completion persisted", data: { publicId: parsed.data.publicId } });
    const response = NextResponse.json({ success: true, data: { secure_url: parsed.data.secureUrl } });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Upload complete API error", data: String(error) });
    await alertCritical({ requestId, route, message: "Upload complete critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Failed to finalize upload." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
