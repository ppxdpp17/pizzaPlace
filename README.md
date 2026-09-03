# 🍕 Big Bob's / Pizza Mais — Food Ordering & Management Platform

A full-stack e-commerce and restaurant management platform built with the **MERN** stack (MongoDB, Express.js, React, Node.js), **Redis**, and **TailwindCSS**. 

Big Bob's offers an end-to-end solution for online food ordering—featuring an interactive custom pizza builder, half-and-half flavor combinations, coupon discounts, Stripe payments, and order tracking—paired with an administrative dashboard for product CRUD operations, inventory management, order state updates, and real-time sales analytics.

---

## 🎬 Application Demo

![Application Demo](./pizzaplace/assets/demo.gif)

---

## ✨ Features

### 🧑‍💻 Customer Experience
- **Secure Authentication:** Register, Login, Email Verification, and Password Reset workflows via secure token authentication.
- **Dynamic Menu & Categorization:** Paginated menu organized by categories (Pizzas, Drinks, Starters, & Desserts).
- **Advanced Pizza Customization:**
  - **Custom Pizza Builder:** Select size, crust type, sauce, and extra custom toppings.
  - **Half & Half ("Mix 2 Pizzas"):** Combine two distinct pizza flavors into a single pizza.
- **Smart Shopping Cart:** Synchronized local & database cart state with safety limits (e.g., maximum 15 items per product).
- **Coupon System:** Apply promotional codes at checkout for instant discounts.
- **Flexible Checkout & Payments:** Support for Takeaway and Delivery. Online payment via Stripe or Cash/Multibanco on delivery.
- **Order Tracking:** Paginated "My Orders" history section with real-time status monitoring.

### 🛡️ Admin Dashboard
- **Product & Ingredient Inventory Management:** Create, update, and delete menu items and manage raw ingredient stock levels for custom pizzas.
- **Real-Time Order Fulfillment:** Track incoming orders and update fulfillment status (`In Kitchen`, `Out for Delivery`, `Delivered`).
- **Business Analytics:** Interactive metric cards and charts powered by Recharts (revenue tracking, sales volume, customer counts).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling & UI:** TailwindCSS v4 + Framer Motion (animations) + Lucide React (icons)
- **State Management:** Zustand
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Feedback & Visuals:** React Hot Toast + React Confetti

### Backend & Database
- **Runtime & Server:** Node.js + Express.js
- **Database:** MongoDB (via Mongoose ORM)
- **Caching & Session Storage:** Redis (via `ioredis` / Upstash Redis)
- **Background Jobs:** `node-cron` for automated cleanup tasks
- **Media Storage:** Cloudinary API for cloud product image hosting
- **Email Service:** Mailtrap / Nodemailer for verification & reset emails
- **Payments:** Stripe API (`@stripe/stripe-js` & `stripe`)

---

## 🛡️ Security & Performance Highlights

- **JWT Authentication:** Short-lived Access Tokens & Refresh Tokens stored securely in HTTP-only cookies.
- **Password Security:** Bcrypt hashing for user credentials.
- **Rate Limiting:** Global API rate limiting combined with strict login rate limiting (`express-rate-limit`).
- **Input Sanitization:** Mongo injection prevention via `express-mongo-sanitize`.
- **Server-Side Validation:** All prices, order totals, and discounts are strictly re-calculated and validated server-side during checkout to prevent client-side data tampering.
- **Optimized Queries:** MongoDB pagination using `.skip()` and `.limit()` to ensure low memory consumption.

---

## 📁 Repository Structure

```text
.
├── backend/                  # Express.js REST API Server
│   ├── controllers/          # Business logic handlers
│   ├── jobs/                 # Cron jobs (cleanup, automated tasks)
│   ├── lib/                  # Service clients (MongoDB, Redis, Stripe, Cloudinary)
│   ├── middleware/           # Auth, rate limiting & error handling middleware
│   ├── models/               # Mongoose schemas (User, Product, Order, Coupon, etc.)
│   ├── routes/               # API routes definitions
│   ├── utils/                # Helper utilities
│   └── server.js             # Main server entry point
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components & modals
│   │   ├── pages/            # Page views (Home, Menu, Customizer, Cart, Admin, Orders)
│   │   ├── stores/           # Zustand state management stores
│   │   ├── lib/              # Axios instance & frontend utilities
│   │   └── App.jsx           # App routes & root component
│   ├── index.html
│   └── vite.config.js
├── assets/                   # README images & screenshots placeholder folder
├── package.json              # Workspace root scripts & dependencies
└── README.md                 # Project documentation
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **MongoDB** instance (Local or MongoDB Atlas)
- **Redis** instance (Local or Upstash)

### 2. Clone the Repository
```bash
git clone https://github.com/ppxdpp17/pizzaPlace.git
cd pizzaPlace
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory (or workspace root) with the required credentials:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database & Cache
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pizzaplace_db
UPSTASH_REDIS_URL=rediss://default:<password>@<host>:6379

# JWT Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
RESET_TOKEN_EXPIRE_MINUTES=60

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Payments
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Service (Mailtrap)
MAILTRAP_TOKEN=your_mailtrap_token
MAILTRAP_ENDPOINT=https://send.api.mailtrap.io/
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 5. Run the Application

Launch both Backend and Frontend development servers in separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be accessible at:
- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

All rights reserved. For demonstration and portfolio purposes only.
