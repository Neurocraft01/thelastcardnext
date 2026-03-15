import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";
import { assertRateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  accessToken: z.string().min(20),
  refreshToken: z.string().min(20).optional(),
});

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    await assertRateLimit(`auth-session:${ip}`, 40, 60_000);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid session payload." }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ACCESS_COOKIE, parsed.data.accessToken, {
      ...baseCookie,
      maxAge: 60 * 60,
    });

    if (parsed.data.refreshToken) {
      response.cookies.set(REFRESH_COOKIE, parsed.data.refreshToken, {
        ...baseCookie,
        maxAge: 60 * 60 * 24 * 14,
      });
    }

    return response;
  } catch (error) {
    console.error("Auth session POST error", error);
    return NextResponse.json({ success: false, message: "Failed to create session." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
  return response;
}
