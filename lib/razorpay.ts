import crypto from "node:crypto";
import Razorpay from "razorpay";
import { getEnvVar } from "./env";

export function getRazorpayClient() {
  return new Razorpay({
    key_id: getEnvVar("RAZORPAY_KEY_ID"),
    key_secret: getEnvVar("RAZORPAY_KEY_SECRET"),
  });
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const secret = getEnvVar("RAZORPAY_KEY_SECRET");
  const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (expectedSignature.length !== params.razorpaySignature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(params.razorpaySignature));
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  const webhookSecret = getEnvVar("RAZORPAY_WEBHOOK_SECRET");
  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");
  if (expectedSignature.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}
