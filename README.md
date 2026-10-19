# FoodExpress — AI-Powered Food Delivery Platform

FoodExpress is a modern, production-grade, full-stack food delivery web application built with **React**, **Node.js (Express)**, and a persistent database. It features an intelligent **AI Craving Predictor** engine powered by Google Gemini and behavioral order heuristics, **100% Cash on Delivery (COD)** checkout, interactive real-time order tracking, and a password-protected **Admin Command Dashboard** with monthly charts, CSV export, and dish management.

---

## 🌟 Key Features

### 1. 🤖 AI Craving Predictor (Main AI Feature)
- **Deep Taste Intelligence**: Analyzes each user's completed order history, ordering cadence (e.g. weekend burger treats, weekday curries), dietary preferences, and flavor affinities.
- **Clear Rationale**: Features "Why this recommendation?" explanations for every suggested dish.
- **New Visitor Onboarding**: Interactive mood/preference selector (Spicy, Cheesy Comfort, Juicy Burgers, Indian Curry, Wok Noodles, Vegetarian) to provide immediate tailored recommendations before order history accumulates.
- **1-Click Cart Addition**: Add predicted items directly to the cart.
- **Google Gemini Integration**: Uses `gemini-3.8-flash` on the server when `GEMINI_API_KEY` is present, with an intelligent heuristic scoring fallback.

### 2. 🍕 Rich Multi-Category Menu & Advanced Search
- 7 Cuisines & Categories: **Pizza, Burger, Indian, Chinese, Snacks, Desserts, Beverages**.
- Real-time search by dish name, ingredients, or descriptions.
- Vegetarian / Non-Vegetarian diet preference filter (with authentic standard culinary indicators).
- Price range slider and multiple sorting options (Popularity, Customer Rating, Price Low to High, Price High to Low).
- Immediate availability toggles ("Available" vs "Sold Out").

### 3. 💵 100% Cash on Delivery (COD) Only Checkout
- **Strictly Cash on Delivery**: No UPI, wallets, or debit/credit card inputs.
- Validates full customer name, mobile phone, and delivery address.
- Server-side price calculation and stock validation (prevents client price tampering).
- Delivery fee policy ($2.99 standard, **FREE delivery on orders over $50** with an interactive cart progress bar).
- Confetti celebration upon order confirmation with unique Order ID (e.g. `FX-10482`).

### 4. 📦 Order History & Live Stage Tracking
- Step-by-step order journey: `Order Received` ➔ `Confirmed` ➔ `In Kitchen` ➔ `Rider on Way` ➔ `Delivered` (or `Cancelled`).
- Safe cancellation policy: allowed only while order is Pending or Confirmed.
- **1-Click Reorder**: Instant re-add of all dishes from a past order into the cart.
- Guest order tracking by Order ID lookup.

### 5. 🛡️ Password-Protected Admin Dashboard
- **Security Check**: Secured via server-side verification using the `ADMIN_PASSWORD` environment variable (default: `MOJ MARO`).
- **Zero Information Leak**: No admin metrics or order records are transmitted to the browser before successful authentication.
- **8 Summary KPI Cards**:
  - Total Orders
  - Orders Today
  - Orders This Month
  - Pending Orders
  - Delivered Orders
  - Cancelled Orders
  - Gross Monthly Revenue ($)
  - Cash on Delivery Payments Pending Collection ($)
- **Monthly Analytics & Trends**:
  - Interactive **Recharts** bar chart showing day-by-day orders for any chosen month.
  - Month-over-month comparison line chart (Orders vs Gross Revenue).
  - Selectable Month and Year filters.
  - **CSV Export**: Download orders database into a standard spreadsheet file.
- **Menu Management**:
  - Add new dishes (name, description, price, category, veg/non-veg, prep time, image URL).
  - Edit existing dishes and prices.
  - 1-click toggle availability (instantly reflects in customer menu).
  - Delete dishes with confirmation dialog.
- **Orders Management**:
  - Update order status live (Pending ➔ Delivered).
  - Mark Cash on Delivery as "Collected" upon rider check-in.

---

## 🔐 Credentials & Demo Accounts

### Administrator Access
- **Admin Password**: `MOJ MARO`
- Navigate to the **Admin** tab in the navbar.
- Can be changed via the `ADMIN_PASSWORD` environment variable in `.env`.

### Sample Customer Demo Account
- **Email**: `alex@example.com`
- **Password**: `password123`
- Pre-populated with historical completed orders across Pizza, Burgers, and Indian cuisine to immediately showcase the **AI Craving Predictor** without needing to create new orders first!
- (A **1-Click Demo Login** button is also available inside the Sign In modal).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Canvas Confetti.
- **Data Visualizations**: Recharts.
- **Backend**: Node.js, Express, TSX, Dotenv.
- **Database**: Persistent file-backed JSON database store with atomic disk writes (`data/foodexpress_db.json`).
- **AI Engine**: Google Gen AI SDK (`@google/genai`) with `gemini-3.8-flash` & heuristic scoring.
- **Authentication**: PBKDF2 cryptographic password hashing with unique salt and secure session tokens.

---

## 🚀 Running the Project Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following variables are set:
```ini
PORT=3000
ADMIN_PASSWORD="MOJ MARO"
# Optional: GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Start the Full-Stack Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📊 Database Schema & Preloaded Seeds

The database is automatically created in `data/foodexpress_db.json` upon initial server start. It includes:
- **Users**: Unique ID, full name, email, PBKDF2 hash, salt, phone, address, timestamps.
- **FoodItems**: 17 pre-seeded gourmet items covering all 7 categories (Pizza, Burger, Indian, Chinese, Snacks, Desserts, Beverages) with high-definition photography.
- **Orders**: Realistic order entries spanning current and previous months (August, September, October 2026) to provide immediate live data for analytics.
- **Admin Sessions**: In-database token verification with time-to-live expiration.
- **Reset to Seeds**: Administrators can reset the database at any time using the "Reset Demo Seeds" button in the admin portal.
