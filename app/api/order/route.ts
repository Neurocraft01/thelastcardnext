import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";
import { getRazorpayClient, verifyRazorpaySignature } from "@/lib/razorpay";
import { getSupabaseAdmin, findAuthUserByEmail } from "@/lib/supabase";
import { assertRateLimit, getClientIp, orderSchema, paymentSchema, previewSchema } from "@/lib/security";

type OrderRequest = {
  previewData?: {
    fullName?: string;
    designation?: string;
    company?: string;
    email?: string;
    phone?: string;
    cardDesign?: string;
    profileImageUrl?: string;
    coverImageUrl?: string;
    qrImageUrl?: string;
    cardDesignImageUrl?: string;
    pdfUrl?: string;
  };
  orderForm?: {
    quantity?: number;
    addressLine1?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  payment?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  totalAmount?: number;
};

function generateOrderId() {
  return `TLC-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
}

function createRandomPassword() {
  return `TLC!${crypto.randomBytes(8).toString("hex")}`;
}

async function getOnboardingLink(email: string, fullName: string) {
  const admin = getSupabaseAdmin();
  let user = await findAuthUserByEmail(email);

  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      password: createRandomPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
      app_metadata: {
        role: "customer",
      },
    });

    if (created.error || !created.data.user) {
      throw created.error ?? new Error("Unable to create user for onboarding.");
    }
    user = created.data.user;
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/reset-password`;
  const generated = await admin.auth.admin.generateLink({
    type: "recovery",
    email: user.email ?? email,
    options: { redirectTo },
  });

  if (generated.error || !generated.data.properties.action_link) {
    throw generated.error ?? new Error("Unable to generate onboarding link.");
  }

  return { userId: user.id, link: generated.data.properties.action_link };
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/order";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`order:${ip}`, 15, 60_000);

    const body = (await request.json()) as OrderRequest;
    const parsedPreview = previewSchema.safeParse(body.previewData ?? {});
    const parsedOrder = orderSchema.safeParse({
      ...body.orderForm,
      totalAmount: body.totalAmount,
    });
    const parsedPayment = paymentSchema.safeParse(body.payment ?? {});

    if (!parsedPreview.success) {
      const response = NextResponse.json({ success: false, message: "Invalid preview data." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    if (!parsedOrder.success) {
      const response = NextResponse.json({ success: false, message: "Invalid order data." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    if (!parsedPayment.success) {
      const response = NextResponse.json({ success: false, message: "Invalid payment payload." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const previewData = parsedPreview.data;
    const orderForm = parsedOrder.data;
    const payment = parsedPayment.data;

    const signatureValid = verifyRazorpaySignature(payment);
    if (!signatureValid) {
      const response = NextResponse.json({ success: false, message: "Invalid payment signature." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const razorpay = getRazorpayClient();
    const paymentDetails = await razorpay.payments.fetch(payment.razorpayPaymentId);

    if (!paymentDetails || paymentDetails.order_id !== payment.razorpayOrderId) {
      const response = NextResponse.json({ success: false, message: "Payment order mismatch." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const amountInPaise = Math.round(orderForm.totalAmount * 100);
    if (paymentDetails.amount !== amountInPaise || paymentDetails.currency !== "INR") {
      const response = NextResponse.json({ success: false, message: "Payment amount mismatch." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
      const response = NextResponse.json({ success: false, message: "Payment is not captured." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const supabase = getSupabaseAdmin();

    const existingOrderResult = await supabase
      .from("orders")
      .select("order_id")
      .eq("payment_ref", payment.razorpayPaymentId)
      .maybeSingle();

    if (existingOrderResult.error) {
      throw existingOrderResult.error;
    }

    if (existingOrderResult.data?.order_id) {
      const response = NextResponse.json({ success: true, orderId: existingOrderResult.data.order_id });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const { userId, link: onboardingLink } = await getOnboardingLink(previewData.email, previewData.fullName);
    const orderId = generateOrderId();

    const insertOrder = await supabase.from("orders").insert({
      order_id: orderId,
      user_id: userId,
      full_name: previewData.fullName,
      email: previewData.email,
      phone: previewData.phone,
      designation: previewData.designation,
      company: previewData.company,
      card_design: previewData.cardDesign,
      quantity: orderForm.quantity,
      address_line_1: orderForm.addressLine1,
      city: orderForm.city,
      state: orderForm.state,
      pin_code: orderForm.pinCode,
      payment_ref: payment.razorpayPaymentId,
      amount: orderForm.totalAmount,
      profile_image_url: body.previewData?.profileImageUrl ?? null,
      cover_image_url: body.previewData?.coverImageUrl ?? null,
      qr_image_url: body.previewData?.qrImageUrl ?? null,
      card_design_image_url: body.previewData?.cardDesignImageUrl ?? null,
      pdf_url: body.previewData?.pdfUrl ?? null,
      payment_order_id: payment.razorpayOrderId,
      payment_status: paymentDetails.status,
    });

    if (insertOrder.error) {
      throw insertOrder.error;
    }

    const insertPayment = await supabase.from("payments").upsert({
      razorpay_order_id: payment.razorpayOrderId,
      razorpay_payment_id: payment.razorpayPaymentId,
      order_id: orderId,
      amount: orderForm.totalAmount,
      currency: "INR",
      status: paymentDetails.status,
      payload: paymentDetails,
    }, {
      onConflict: "razorpay_payment_id",
    });

    if (insertPayment.error) {
      throw insertPayment.error;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT ?? "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.SMTP_FROM;

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      const response = NextResponse.json(
        {
          success: false,
          message: "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env.local",
        },
        { status: 500 },
      );
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: previewData.email,
      subject: `Your The Last Card Onboarding Link | ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
          <h2 style="margin-bottom: 8px;">Thank you for your order, ${previewData.fullName}.</h2>
          <p style="margin-top: 0; color: #4b5563;">Your order has been confirmed. Set your password securely using the one-time onboarding link below.</p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Onboarding Link:</strong> <a href="${onboardingLink}" target="_blank" rel="noreferrer">Set Password</a></p>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px;"><strong>Order Summary</strong></p>
            <p style="margin: 0;">Card Design: ${previewData.cardDesign ?? "N/A"}</p>
            <p style="margin: 0;">Quantity: ${orderForm.quantity ?? 1}</p>
            <p style="margin: 0;">Total Amount: INR ${body.totalAmount ?? "N/A"}</p>
            <p style="margin: 0;">Payment Ref: ${payment.razorpayPaymentId}</p>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">This onboarding link expires automatically and should not be shared.</p>
        </div>
      `,
    });

    logEvent({
      requestId,
      route,
      level: "info",
      message: "Order processed successfully",
      data: { orderId, paymentId: payment.razorpayPaymentId, status: paymentDetails.status },
    });

    const response = NextResponse.json({ success: true, orderId });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({
      requestId,
      route,
      level: "error",
      message: "Order API error",
      data: String(error),
    });
    await alertCritical({
      requestId,
      route,
      message: "Order API critical failure",
      data: String(error),
    });
    const response = NextResponse.json({ success: false, message: "Failed to process order request." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
