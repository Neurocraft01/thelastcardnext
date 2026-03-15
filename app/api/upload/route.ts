import { NextResponse } from "next/server";
import { assertRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    await assertRateLimit(`upload:${ip}`, 30, 60_000);
    return NextResponse.json(
      { success: false, message: "Legacy upload endpoint is disabled. Use /api/upload/signature and /api/upload/complete." },
      { status: 410 },
    );
  } catch (error) {
    console.error("Upload API error", error);
    return NextResponse.json({ success: false, message: "Failed to upload file." }, { status: 500 });
  }
}
