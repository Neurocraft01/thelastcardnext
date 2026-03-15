"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type PreviewData = {
  fullName: string;
  designation: string;
  company: string;
  email: string;
  phone: string;
  cardDesign: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  qrImageUrl?: string;
  cardDesignImageUrl?: string;
  pdfUrl?: string;
};

type OrderForm = {
  quantity: number;
  addressLine1: string;
  city: string;
  state: string;
  pinCode: string;
};

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type PaymentPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const basePrice = 649;

export default function OrderPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    quantity: 1,
    addressLine1: "",
    city: "",
    state: "",
    pinCode: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("tlc-preview");
    if (!raw) {
      router.replace("/preview");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PreviewData;
      setPreviewData(parsed);
    } catch {
      router.replace("/preview");
    }
  }, [router]);

  const total = useMemo(() => basePrice * orderForm.quantity, [orderForm.quantity]);

  const onSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewData || !paymentPayload) {
      window.alert("Please complete payment before placing order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previewData,
          orderForm,
          totalAmount: total,
          payment: paymentPayload,
        }),
      });

      const result = (await response.json()) as { success?: boolean; message?: string; orderId?: string };

      if (!response.ok || !result.success || !result.orderId) {
        throw new Error(result.message || "Unable to place order. Please try again.");
      }

      localStorage.removeItem("tlc-preview");
      router.push(`/order/success?orderId=${result.orderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error occurred.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRazorpayPayment = async () => {
    if (!previewData) return;
    if (!window.Razorpay) {
      window.alert("Razorpay SDK not loaded.");
      return;
    }

    setIsPaying(true);
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `TLC-${Date.now()}`,
        }),
      });

      const orderResult = (await orderRes.json()) as {
        success?: boolean;
        message?: string;
        order?: { id: string; amount: number; currency: string };
      };

      if (!orderRes.ok || !orderResult.success || !orderResult.order) {
        throw new Error(orderResult.message ?? "Unable to create payment order.");
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: "The Last Card",
        description: "NFC Card Order",
        order_id: orderResult.order.id,
        handler: (response: RazorpayPaymentResponse) => {
          setPaymentPayload({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          window.alert("Payment completed. Click 'Place Order' to finalize.");
        },
        prefill: {
          name: previewData.fullName,
          email: previewData.email,
          contact: previewData.phone,
        },
        theme: {
          color: "#D4AF37",
        },
      });

      razorpay.open();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  if (!previewData) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#09090b] text-zinc-300">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] px-6 py-10 text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/preview" className="text-xs uppercase tracking-[0.18em] text-zinc-300 hover:text-[#ffcc00]">
            Back to Preview
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffcc00]">Step 2 of 2 | Order & Payment</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6">
            <h1 className="font-display text-4xl gold-text">Complete Your Order</h1>
            <p className="mt-3 text-zinc-300">Confirm shipping and payment details. You will receive a secure onboarding link after order confirmation.</p>

            <form className="mt-8 space-y-4" onSubmit={onSubmitOrder}>
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="input"
                  value={orderForm.quantity}
                  onChange={(e) =>
                    setOrderForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, Number(e.target.value) || 1),
                    }))
                  }
                />
              </div>

              <div>
                <label className="label">Address Line 1</label>
                <input className="input" placeholder="Street, Building, Landmark" value={orderForm.addressLine1} onChange={(e) => setOrderForm((prev) => ({ ...prev, addressLine1: e.target.value }))} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">City</label>
                  <input className="input" value={orderForm.city} onChange={(e) => setOrderForm((prev) => ({ ...prev, city: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" value={orderForm.state} onChange={(e) => setOrderForm((prev) => ({ ...prev, state: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Pin Code</label>
                  <input className="input" value={orderForm.pinCode} onChange={(e) => setOrderForm((prev) => ({ ...prev, pinCode: e.target.value }))} required />
                </div>
              </div>

              <button
                type="button"
                onClick={startRazorpayPayment}
                disabled={isPaying}
                className="w-full rounded-full border border-[#ffcc00]/45 px-8 py-4 text-sm font-extrabold uppercase tracking-[0.17em] text-[#ffcc00] transition hover:bg-[#ffcc00]/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPaying ? "Opening Razorpay..." : "Pay with Razorpay"}
              </button>

              <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                Payment status: {paymentPayload ? "Captured by checkout" : "Pending"}
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !paymentPayload}
                className="mt-2 w-full rounded-full bg-[#ffcc00] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.17em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#ffcc00]/25 bg-zinc-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Order Summary</p>
            <div className="mt-4 rounded-2xl border border-zinc-700 bg-black p-3">
              <Image
                src={`/assets/img/card_design/${previewData.cardDesign}`}
                alt="Card design"
                width={1200}
                height={760}
                className="h-auto w-full rounded-xl object-cover"
              />
            </div>

            <div className="mt-5 space-y-2 border-b border-zinc-700 pb-5 text-sm text-zinc-300">
              <p><span className="text-zinc-500">Name:</span> {previewData.fullName}</p>
              <p><span className="text-zinc-500">Email:</span> {previewData.email}</p>
              <p><span className="text-zinc-500">Phone:</span> {previewData.phone}</p>
              <p><span className="text-zinc-500">Card:</span> {previewData.cardDesign.replace(" - front.jpeg", "")}</p>
            </div>

            <div className="mt-5 space-y-2 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Price per card</span>
                <span>INR {basePrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quantity</span>
                <span>{orderForm.quantity}</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-700 pt-3 text-base font-bold text-[#ffcc00]">
                <span>Total</span>
                <span>INR {total}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
