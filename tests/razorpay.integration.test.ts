import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { POST as verifyPaymentSignature } from "../app/api/razorpay/verify/route";
import { verifyRazorpayWebhookSignature } from "../lib/razorpay";

function createPaymentSignature(orderId: string, paymentId: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

test("razorpay verify route accepts valid payment signature", async () => {
  process.env.RAZORPAY_KEY_SECRET = "unit-test-secret";
  const razorpayOrderId = "order_123456789";
  const razorpayPaymentId = "pay_123456789";
  const razorpaySignature = createPaymentSignature(razorpayOrderId, razorpayPaymentId, process.env.RAZORPAY_KEY_SECRET);

  const request = new Request("http://localhost/api/razorpay/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  });

  const response = await verifyPaymentSignature(request);
  assert.equal(response.status, 200);
});

test("razorpay verify route rejects invalid payment signature", async () => {
  process.env.RAZORPAY_KEY_SECRET = "unit-test-secret";
  const request = new Request("http://localhost/api/razorpay/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({
      razorpayOrderId: "order_123456789",
      razorpayPaymentId: "pay_123456789",
      razorpaySignature: "invalid-signature",
    }),
  });

  const response = await verifyPaymentSignature(request);
  assert.equal(response.status, 400);
});

test("webhook signature helper validates signed payload", () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = "webhook-secret";
  const payload = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_abc" } } } });
  const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(payload).digest("hex");

  assert.equal(verifyRazorpayWebhookSignature(payload, signature), true);
  assert.equal(verifyRazorpayWebhookSignature(payload, "invalid-signature"), false);
});
