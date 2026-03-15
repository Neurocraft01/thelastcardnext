import { NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpayClient } from "@/lib/razorpay";
import { assertRateLimit, getClientIp } from "@/lib/security";

const schema = z.object({
  amount: z.number().min(1),
  currency: z.string().default("INR"),
  receipt: z.string().min(3).max(80),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    await assertRateLimit(`rzp-order:${ip}`, 20, 60_000);

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid payment order payload." }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(parsed.data.amount * 100),
      currency: parsed.data.currency,
      receipt: parsed.data.receipt,
      payment_capture: true,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order API error", error);
    return NextResponse.json({ success: false, message: "Failed to create Razorpay order." }, { status: 500 });
  }
}
