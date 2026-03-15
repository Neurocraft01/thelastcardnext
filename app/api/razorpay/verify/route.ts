import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { assertRateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  razorpayOrderId: z.string().min(3),
  razorpayPaymentId: z.string().min(3),
  razorpaySignature: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    await assertRateLimit(`rzp-verify:${ip}`, 40, 60_000);

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid signature payload." }, { status: 400 });
    }

    const valid = verifyRazorpaySignature(parsed.data);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid payment signature." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay verify API error", error);
    return NextResponse.json({ success: false, message: "Failed to verify payment." }, { status: 500 });
  }
}
