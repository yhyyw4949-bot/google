# متجر اشتراكات Google AI Pro في مصر (Google AI Pro Store)
### A Production-Grade, Independent Arabic-First AI Subscription Platform

A complete, fully functional, production-ready web application built for an independent digital service providing official Google AI Pro subscription invitations in Egypt, priced at **25 EGP** with cash transfers (Vodafone Cash, InstaPay, Etisalat Cash), secure byte-validated receipt uploads, 7-stage live order tracking, transactional emails, a comprehensive SaaS admin command center, an **Awwwards-inspired cinematic opening intro animation**, and an automated **5-order batch quota limit with real-time out-of-stock management**.

---

## 🌟 Key Features

### 1. Modern Futuristic AI Aesthetic & Awwwards Intro
- **Awwwards.com-Style Opening Experience**: High-impact kinetic preloader featuring a central holographic energy core, monospace quantum boot sequence (0% to 100%), real-time status feeds, soundwave visualization, and smooth curtain reveal into the landing page.
- **Dark Neon Cybernetic Palette**: Deep navy & obsidian backgrounds (`#060814`, `#070913`), electric purple & cyan gradients, glassmorphism panels, and Cairo / IBM Plex Sans Arabic typography.
- **Instant Language & Direction Switch**: Native Arabic (RTL default) and English (LTR) toggle that persists across sessions.

### 2. 5-Order Batch Limit & Automated Out-of-Stock Engine
- **Strict 5-Order Quota System**: Protects invitation allocations by strictly accepting only 5 active orders per batch.
- **Live Scarcity & Quota Indicators**: Real-time counter displaying remaining slots (e.g. `متبقي 2 من 5 طلبات فقط`) with an animated progress bar.
- **Automated Out-of-Stock ("Sold Out") State**: Once 5 orders are registered, new orders are automatically disabled both on the client UI and enforced at the server route level.
- **Admin Batch Controls**: Administrators can view quota consumption, change batch sizes, or reset the batch directly from the admin dashboard.

### 3. Transparent Truth-in-Advertising & Disclaimers
- Clear disclosure explaining that this is an **independent third-party facilitation service** and not owned or endorsed by Google LLC.
- Prominent disclaimers regarding storage, features, and regional eligibility.
- Zero password policy: **Never** asks for Google account passwords, 2FA codes, or recovery credentials.

### 4. Interactive Google AI Pro Feature Showcase
Includes 6 interactive feature cards with glowing gradient borders, icons, and official product reference links:
1. **Gemini AI**: Intelligent assistant for writing, summarizing, problem solving, and coding.
2. **Deep Research**: Comprehensive topic analysis, synthesis, and structured reporting.
3. **NotebookLM**: Study document analysis and automated review notes.
4. **AI Image and Video Creation**: Visual generation via Imagen 3.
5. **Gemini in Google Apps**: AI integration within Gmail and Google Docs.
6. **Google One Storage**: Cloud storage associated with verified plans.

### 5. Egyptian Cash & InstaPay Payment Workflow
Configurable local payment methods:
- **Vodafone Cash** (`01012345678`)
- **InstaPay Egypt** (`googleaipro@instapay`)
- **Etisalat Cash** (`01112345678`)
- **Bank Transfer**
Features one-click copy of account identifiers, clear transfer instructions, and optional sender transaction reference.

### 6. Binary Magic-Byte Receipt Upload & Private Storage
- Supported formats: **JPG, JPEG, PNG, WebP, PDF** (up to 5MB).
- **Server-Side Binary Header Validation**: Checks binary magic bytes (`\x89PNG`, `\xFF\xD8\xFF`, `%PDF`, `RIFF...WEBP`), immediately rejecting renamed executables or spoofed files.
- **Customer Access Isolation**: Files are stored under randomized UUIDs in a private container. Only the verified order customer or an administrator can access or preview receipts via `/api/receipts/[proofId]`.
- Multi-receipt history with receipt replacement while awaiting review.

### 7. Real-Time 7-Stage Order Progress Timeline
Live order lifecycle tracking:
1. **Awaiting Payment** (`في انتظار الدفع`)
2. **Receipt Submitted** (`تم رفع الإيصال`)
3. **Under Payment Review** (`قيد مراجعة الدفع`)
4. **Payment Approved** (`تم تأكيد الدفع`)
5. **Invitation Processing** (`جاري تجهيز الدعوة`)
6. **Invitation Sent** (`تم إرسال الدعوة`)
7. **Completed** (`مكتمل بنجاح`)
(With error states: Payment Rejected, More Info Required, Cancelled, Refunded).

### 8. Powerful SaaS Admin Command Center
- **Accurate Financial Metrics**: Confirmed revenue (calculated safely in integer minor units, excluding unpaid orders and deducting refunds without double-counting).
- **Delayed Orders Alerts**: Glowing high-priority warning for any order approved >5 minutes ago that hasn't received invitation dispatch.
- **Order Management & Inspection**: Full table with search, payment/fulfillment status filters, CSV export, secure receipt preview, payment approval, rejection with customer-visible reason, invitation dispatch recording, and internal notes.
- **Product & Pricing Management**: Edit price in EGP, toggle feature cards, edit disclosures, and adjust batch quota limits.
- **Audit Logs & Email Notifications**: Immutable log of every action taken and a transactional email viewer with rendered HTML preview.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Partial Prerendering)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, Glassmorphism, Custom Neon Gradients
- **Animations**: Framer Motion, Kinetic Physics, CSS Keyframes
- **Icons**: Lucide Icons
- **Database Architecture**:
  - Dual-mode architecture: Runs seamlessly with zero setup via atomic local persistent storage engine (`data/db.json`), and connects directly to **Supabase PostgreSQL** with full schema migrations (`supabase/migrations/20261016_init.sql`).
- **Security**: Binary magic-byte validation, cryptographic HS256 JWT sessions in HTTP-only cookies, Row Level Security (RLS) policies.

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
cd google-ai-pro-store
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(The application already comes with zero-config local defaults in `.env.local` so you can run it immediately without external accounts).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials

To test both perspectives immediately:

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@googleaipro.eg` | `Admin@123456` |
| **Test Customer** | `ahmed@example.com` | `User@123456` |

*(Convenient one-click demo login buttons are provided on `/login` for instant switching!)*

---

## 🧪 Automated End-to-End Testing

A complete automated test suite is provided in `scripts/test-e2e.mjs`. It verifies all 30 critical application flows:
1. Public configuration & price locking (2500 cents = 25.00 EGP).
2. Customer registration and role assignment.
3. Cookie-based authentication sessions.
4. Order creation and unique server order ID formatting (`GAP-YYYYMMDD-XXXX`).
5. Binary magic-byte validation (rejecting corrupt/renamed files, accepting valid PNGs).
6. Private storage authorization & customer access isolation.
7. Admin login & metric computations.
8. Payment approval, fulfillment status updates, and audit logging.
9. Invitation dispatch recording.
10. Order completion.
11. Transactional email notification logs.
12. Order CSV export.

To run the automated test suite:
```bash
node scripts/test-e2e.mjs
```

---

## 🗄️ Database Schema & Supabase Migrations

The complete PostgreSQL migration script is available at:
[`supabase/migrations/20261016_init.sql`](./supabase/migrations/20261016_init.sql)

Tables included:
- `profiles`: User accounts, emails, roles (`admin` / `customer`), suspension status.
- `products`: Product configuration, price in minor units, delivery targets, disclosures, feature cards.
- `payment_methods`: Egyptian cash wallets, InstaPay handles, instructions, sort orders.
- `orders`: Server-locked prices, payment statuses, fulfillment statuses, timestamps.
- `payment_proofs`: Receipts with binary MIME types, file sizes, and review statuses.
- `order_status_history`: Complete timeline of every status transition with author attribution.
- `admin_notes`: Confidential staff notes.
- `audit_logs`: Immutable security audit trail.
- `email_notifications`: Transactional email history with delivery status and HTML bodies.
- `site_settings`: Brand names, announcements, contact details, and maintenance mode.

---

## 📄 License & Disclaimers

Google AI Pro, Gemini, Google One, and Gmail are trademarks of Google LLC. This platform is an independent third-party service provider facilitating subscriptions in Egypt and does not claim any official affiliation with, sponsorship by, or endorsement from Google LLC.
