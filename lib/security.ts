import { z } from "zod";
import { runRateLimit } from "./rate-limit";

const routePolicies: Record<string, { limit: number; windowMs: number }> = {
  order: { limit: 15, windowMs: 60_000 },
  "upload-signature": { limit: 60, windowMs: 60_000 },
  "upload-complete": { limit: 60, windowMs: 60_000 },
  "admin-overview": { limit: 60, windowMs: 60_000 },
  "superadmin-users": { limit: 60, windowMs: 60_000 },
  "superadmin-roles": { limit: 60, windowMs: 60_000 },
  upload: { limit: 30, windowMs: 60_000 },
  "rzp-order": { limit: 20, windowMs: 60_000 },
  "rzp-verify": { limit: 40, windowMs: 60_000 },
  "rzp-webhook": { limit: 120, windowMs: 60_000 },
  "reconcile-payments": { limit: 10, windowMs: 60_000 },
  "auth-session": { limit: 40, windowMs: 60_000 },
};

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

export function getClientIp(request: Request) {
  const header = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  return (header?.split(",")[0] ?? "unknown").trim();
}

export async function assertRateLimit(key: string, maxRequests = 20, windowMs = 60_000) {
  const policyName = key.split(":")[0] ?? key;
  const policy = routePolicies[policyName] ?? { limit: maxRequests, windowMs };
  const result = await runRateLimit({
    key: `ratelimit:${key}`,
    limit: policy.limit,
    windowMs: policy.windowMs,
  });

  if (!result.allowed) {
    throw new Error("Rate limit exceeded. Please try again shortly.");
  }
}

export const previewSchema = z.object({
  fullName: z.string().min(2).max(120).transform(sanitizeText),
  designation: z.string().min(2).max(120).transform(sanitizeText),
  company: z.string().max(120).transform(sanitizeText).optional().default(""),
  email: z.email().transform((v) => v.toLowerCase().trim()),
  phone: z.string().min(6).max(20).transform(sanitizeText),
  cardDesign: z.string().min(2).max(100).transform(sanitizeText),
});

export const orderSchema = z.object({
  quantity: z.number().int().min(1).max(500),
  addressLine1: z.string().min(4).max(200).transform(sanitizeText),
  city: z.string().min(2).max(100).transform(sanitizeText),
  state: z.string().min(2).max(100).transform(sanitizeText),
  pinCode: z.string().min(3).max(20).transform(sanitizeText),
  totalAmount: z.number().min(1),
});

export const paymentSchema = z.object({
  razorpayOrderId: z.string().min(8).max(80).transform(sanitizeText),
  razorpayPaymentId: z.string().min(8).max(80).transform(sanitizeText),
  razorpaySignature: z.string().min(10).max(200).transform(sanitizeText),
});
