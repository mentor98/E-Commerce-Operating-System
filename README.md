# Multi-Vendor E-Commerce Operating System (NexusOS)

A complete, production-ready, full-stack multi-vendor e-commerce operating system built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Express**. It includes end-to-end customer shopping, multi-vendor merchant fulfillment, executive admin governance, atomic inventory reservations, coupon engine, order tracking, zero-exposure server-side payment routing (Stripe & PayPal), security audit logs, and automated tests.

---

## 🌟 Key Features

### 1. Multi-Tenant Role-Based Access Control (RBAC)
- **Customer / Buyer**: Browse curated collections, filter by price/rating/stock/vendor, manage wishlist, write reviews, apply promo coupons, and track packages in real time.
- **Merchant / Seller Hub**: Real-time gross sales analytics, product catalogue CRUD (SKU, pricing, image galleries, technical specifications), atomic inventory replenishments (+10, +25 units), and order fulfillment with automated courier tracking code generation.
- **Marketplace Admin OS**: Executive platform GMV analytics, 10% commission treasury breakdown, vendor registry moderation, promotion code management, immutable security audit trails, and 1-click database re-seeding.
- **Instant Persona Switcher**: Seamlessly switch between Buyer (`Alex Mercer`), Tech Vendor (`Apex Audio & Tech`), Decor Vendor (`Lumina Living`), and Super Admin (`Sarah Jenkins`) or create new accounts dynamically.

### 2. Storefront & Customer Experience
- **Interactive Search & Faceted Filtering**: Real-time query matching across titles, SKUs, and descriptions; category chips, price range sliders, and in-stock toggles.
- **Product Detail Dialog**: Multi-angle image galleries, verified artisan badges, technical specs sheets, customer star breakdown, and authenticated review submission.
- **Cart & Slide-over Drawer**: Live quantity steppers, free express shipping progress bar, promo code validation with instant discount feedback, and subtotal calculation with 7.25% sales tax.
- **Live Courier Tracking**: Step-by-step progress visualizer (`Order Verified` &rarr; `Merchant Packed` &rarr; `In Transit` &rarr; `Delivered`) with courier metadata (FedEx, DHL, USPS).

### 3. Pluggable, Zero-Exposure Payment Gateway
- **Server-Side API Routing**: Client never handles secret API keys or raw credentials.
- **Supported Adapters**:
  - **Stripe**: Creates and verifies PaymentIntents server-side.
  - **PayPal**: Creates express order tokens and captures payments.
  - **Instant Simulator**: High-speed sandbox test gateway for development and automated testing.

### 4. Integrity & Security
- **Atomic JSON Store**: File-backed database with atomic writes (`server/data/store.json`), preventing corrupted states and race conditions during stock decrements.
- **Automated Security Audit Logs**: Records IP addresses, actor identities, roles, action verbs (`AUTH_LOGIN`, `ORDER_CREATED`, `PAYMENT_CAPTURED`, `INVENTORY_RESTOCK`), and entity changes.
- **Automated In-Browser QA Suite**: Integrated test runner verifying 12+ critical test cases across Auth, Stock, Coupons, Payments, and Tracking.

---

## 🏗️ Architecture

```
nexus-ecommerce-os/
├── server/
│   ├── data/
│   │   └── store.json          # Atomic JSON database persistence
│   ├── db.ts                   # DB controller with atomic file I/O & seeding
│   ├── payment-gateways.ts     # Stripe, PayPal & Simulation Gateway adapters
│   ├── test-runner.ts          # Automated backend & API test suite
│   └── types.ts                # Backend domain interfaces
├── src/
│   ├── components/
│   │   ├── admin/              # Admin OS dashboard, analytics, coupons, logs
│   │   ├── common/             # Header, Footer, Persona switcher, Test runner, API docs
│   │   ├── customer/           # Customer portal, purchase history, addresses
│   │   ├── seller/             # Seller dashboard, product CRUD, order dispatch
│   │   └── storefront/         # Product grid, hero banner, cart, checkout, tracking
│   ├── context/                # Auth, Cart, Theme, and Notification contexts
│   ├── services/
│   │   └── api.ts              # Typed REST client
│   ├── types/                  # Shared client types
│   ├── App.tsx                 # Root application router and layout
│   └── main.tsx                # React DOM entry point
├── server.ts                   # Express REST API server + Vite middleware
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# 1. Clone repository and install dependencies
npm install

# 2. Configure environment variables (optional for live Stripe/PayPal)
cp .env.example .env

# 3. Launch full-stack development server (Express + Vite on port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Port Configuration
PORT=3000
NODE_ENV=development

# Authentication & Session Secrets
JWT_SECRET=super-secret-nexus-jwt-token-key-2026

# Stripe Payment Gateway (Optional - falls back to secure simulated gateway)
STRIPE_SECRET_KEY=sk_test_51Nx...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Gateway (Optional)
PAYPAL_CLIENT_ID=AeA...
PAYPAL_CLIENT_SECRET=ELk...
PAYPAL_ENVIRONMENT=sandbox
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user persona | Public |
| `POST` | `/api/auth/register` | Register customer or vendor | Public |
| `GET` | `/api/products` | Query products with category & vendor filters | Public |
| `POST` | `/api/products` | Create new product listing | Seller / Admin |
| `PUT` | `/api/products/:id` | Update product details or stock | Seller / Admin |
| `DELETE` | `/api/products/:id` | Remove product from store | Seller / Admin |
| `POST` | `/api/products/:id/inventory` | Replenish product stock units | Seller / Admin |
| `POST` | `/api/payments/intent` | Initialize payment authorization | Customer |
| `POST` | `/api/payments/verify` | Verify & capture authorized payment | Customer |
| `GET` | `/api/orders` | List platform or merchant orders | Authenticated |
| `POST` | `/api/orders` | Place multi-vendor order & reserve inventory | Customer |
| `GET` | `/api/orders/tracking/:trackingNumber` | Live package timeline & carrier info | Public |
| `PUT` | `/api/orders/:id/status` | Update dispatch status & tracking number | Seller / Admin |
| `GET` | `/api/coupons` | Retrieve active discount codes | Public |
| `POST` | `/api/coupons` | Create promotional coupon code | Admin |
| `DELETE` | `/api/coupons/:id` | Deactivate promo code | Admin |
| `GET` | `/api/analytics` | Executive GMV and category volumes | Admin |
| `GET` | `/api/audit-logs` | Immutable security audit trail | Admin |
| `POST` | `/api/test/run` | Execute automated test runner | Developer / QA |
| `POST` | `/api/seed/reset` | Reset demo database to initial state | Admin |

---

## 🧪 Automated Testing

NexusOS includes an integrated test runner testing the entire commerce stack:

1. **In-Browser UI**: Navigate to the **Automated Tests** tab in the navigation bar and click **Run Automated Tests**.
2. **REST API**:
   ```bash
   curl -X POST http://localhost:3000/api/test/run
   ```

### Tested Modules:
- **Authentication & RBAC**: Admin, Seller, and Customer isolation.
- **Inventory Engine**: Atomic stock decrement, preventing overselling.
- **Coupon Math**: Percentage-based and fixed-dollar calculations with minimum spend requirements.
- **Order Lifecycle**: Progression from `pending` &rarr; `processing` &rarr; `shipped` with tracking codes.
- **Payment Verification**: Intent validation and signature checks.

---

## 🚢 Production Deployment

To build and run for production:

```bash
# Build Vite SPA and bundle Express server into dist/server.cjs
npm run build

# Start production server
npm start
```

The production bundle combines frontend static assets with backend API routes on a single container port (`3000`).

---

## 📄 License

MIT License. Free to use, modify, and distribute for commercial or personal multi-vendor e-commerce platforms.
