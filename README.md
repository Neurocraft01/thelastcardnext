# The Last Card (Next.js)

This is a new Next.js implementation of your existing project flow with matching luxury-style UI and expanded page coverage:

1. User lands on website and clicks **Get a Free Preview**.
2. User sees live design preview of the card based on entered details.
3. User completes order and payment details.
4. User receives a secure onboarding link by email via SMTP.

## Added Integrations

- Razorpay checkout and signature verification.
- Server-authoritative payment verification via Razorpay payment fetch + amount/order/status checks.
- Supabase order persistence.
- Supabase Auth login/register/reset flow with protected dashboard/editor routes.
- Cloudinary storage for profile, cover, qr, card design images, and pdf files.
- Signed Cloudinary direct-upload flow (server-issued signature, direct browser upload, ownership completion).
- Security middleware headers + API rate limiting + zod validation.
- Explicit role policy layers for `/admin` and `/superadmin` routes and APIs.

## Project Location

This app is created in a new directory:

`thelastcard-nextjs`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment example and fill SMTP values:

```bash
cp .env.example .env.local
```

Required values in `.env.local`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `RECONCILIATION_CRON_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ALERT_WEBHOOK_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

3. Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important Flow Files

- Landing page: `app/page.tsx`
- Free preview page: `app/preview/page.tsx`
- Order and payment page: `app/order/page.tsx`
- Success page: `app/order/success/page.tsx`
- SMTP + Supabase + payment-verification order endpoint: `app/api/order/route.ts`
- Razorpay order endpoint: `app/api/razorpay/order/route.ts`
- Razorpay webhook endpoint: `app/api/razorpay/webhook/route.ts`
- Payment reconciliation endpoint (cron): `app/api/internal/reconcile-payments/route.ts`
- Cloudinary signed upload signature endpoint: `app/api/upload/signature/route.ts`
- Cloudinary upload completion endpoint: `app/api/upload/complete/route.ts`
- Auth pages: `app/auth/*`
- Session cookie bridge endpoint: `app/api/auth/session/route.ts`
- Dashboard pages: `app/dashboard/*`
- Admin policy page: `app/admin/page.tsx`
- Superadmin policy page: `app/superadmin/page.tsx`
- Profile editor: `app/editor/page.tsx`
- Public profile by slug: `app/u/[slug]/page.tsx`
- Legal pages: `app/privacy`, `app/terms`, `app/refund`, `app/shipping`

## Supabase Schema

Apply all migrations in `supabase/migrations` in timestamp order.

It creates:

- `profiles`
- `orders`
- `payments`
- `assets`
- `audit_logs`
- `payment_events`
- `reconciliation_jobs`

with indexes and baseline RLS policies.

## Upload Flow (Signed Direct Upload)

1. Browser calls `POST /api/upload/signature` with `assetType`, `filename`, `fileSize`, `mimeType`.
2. Server validates file constraints + auth and returns signed Cloudinary params.
3. Browser uploads directly to Cloudinary `/auto/upload`.
4. Browser calls `POST /api/upload/complete` to persist ownership in Supabase `assets`.

Legacy `POST /api/upload` is disabled (410 Gone).

## Admin and Superadmin Controls

Policy roles:

- `customer`: user-facing features
- `admin`: customer + admin operational controls
- `superadmin`: full platform governance controls

Protected policy routes:

- `/admin` (admin, superadmin)
- `/superadmin` (superadmin only)

Admin APIs:

- `GET /api/admin/overview` (orders/payments/assets/profiles counts)

Superadmin APIs:

- `GET /api/superadmin/users`
- `POST /api/superadmin/roles` with payload:

```json
{
	"email": "user@example.com",
	"role": "admin"
}
```

or

```json
{
	"userId": "uuid",
	"role": "superadmin"
}
```

## Initial Role Setup

1. Create first user via register flow.
2. In Supabase dashboard (Auth -> Users), set that user `app_metadata.role` to `superadmin`.
3. Login as that user.
4. Use `/superadmin` controls + `POST /api/superadmin/roles` to assign admins.

## Production Readiness Checklist

Before launch, verify all of the following:

1. `.env.local` has all required secrets and production URLs.
2. `supabase/migrations/20261014_init_core_tables.sql` is applied.
3. All migrations (including audit and payment event/reconciliation migrations) are applied.
4. Razorpay is in production mode with webhook configured to `POST /api/razorpay/webhook`.
5. Upstash Redis is configured for distributed rate limiting.
6. A scheduler (Render Cron, GitHub Actions schedule, or external cron) calls `POST /api/internal/reconcile-payments` with `Authorization: Bearer <RECONCILIATION_CRON_SECRET>`.
7. SMTP sender domain is verified (SPF/DKIM/DMARC configured).
8. At least one `superadmin` account exists.
9. Alerts/log monitoring is configured (application + payment failures + auth failures).

## Notes

- Card assets and branding files were copied to `public/assets` from your existing project.
- Order placement is finalized only after server-side Razorpay verification.
- Plaintext credentials were replaced with a secure password setup link.
