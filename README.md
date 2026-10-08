# 🍽️ KORA Kitchen — Restaurant E-Commerce & Management Platform

A modern, full-stack restaurant ordering system and admin management portal designed with a minimalist aesthetic, high-resolution media, seamless payments, and real-time inventory management.

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Responsive Menu & Story**: Minimalist layout featuring KORA brand identity, curated culinary visuals, and brand values.
- **Scrollbar-Free Category Filtering**: Dynamic horizontal category bar with smooth touch/arrow scrolling.
- **Product Details & Customization**: Interactive item selection with real-time stock validation and quantity limits.
- **Shopping Cart**: Local state persistence with instant subtotal calculation and clear cart options.
- **Dual Payment Integration**:
  - **PayHere Gateway (Sandbox)**: Secure online payment processing with HMAC signature verification.
  - **WhatsApp Ordering**: Direct order dispatch to restaurant WhatsApp with pre-formatted items and total.

### 🛡️ Admin Management Portal (`/admin`)
- **Role-Based Protection**: JWT authentication restricted strictly to `ADMIN` users. Admin users are automatically isolated to the admin dashboard.
- **Top-Right Header Bar**: Clean user status display (`Signed in as admin`) and `Logout` button with immediate redirection to `/login`.
- **Dashboard Analytics**: Real-time totals for Products, Categories, Total Orders, Pending Orders, and Paid Revenue.
- **Low Stock Monitoring**: Real-time breakdown of items with 5 or fewer units remaining.
- **Kitchen Workflow Management**: Order status tracking (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` / `CANCELLED`).
- **Automatic Inventory Restock**: Cancelling an order automatically releases reserved stock back into available inventory.
- **Cloudinary Media Upload**: Direct image upload integration for dishes and categories.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS Custom Variables
- **Icons**: Lucide React

### **Backend**
- **Framework**: FastAPI (Python 3.12+)
- **ORM & DB**: SQLAlchemy, PostgreSQL (Supabase)
- **Authentication**: OAuth2 Password Flow, PyJWT, Argon2 Password Hashing
- **Server**: Uvicorn

### **Third-Party Integrations**
- **Cloud Storage**: Cloudinary SDK (Food Media & Category Assets)
- **Payments**: PayHere Payment Gateway (Sandbox)
- **Messaging**: WhatsApp Click-to-Chat API

---

## 📁 Project Structure

```
restaurant-ecommerce/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint
│   │   ├── database.py          # SQLAlchemy session & DB connection
│   │   ├── config.py            # Environment configuration
│   │   ├── models/              # Database models (User, Product, Category, Order, OrderItem)
│   │   ├── schemas/             # Pydantic data schemas
│   │   ├── routers/             # API routes (auth, products, categories, orders, admin, payments)
│   │   └── services/            # Cloudinary & inventory service logic
│   ├── seed_data.py             # Automated seed script for database & Cloudinary
│   └── requirements.txt         # Python dependencies
│
└── frontend/
    ├── app/
    │   ├── page.tsx             # Landing / Home page
    │   ├── menu/                # Menu page with category filters
    │   ├── cart/                # Cart page
    │   ├── checkout/            # Checkout with PayHere & WhatsApp
    │   ├── admin/               # Protected Admin Dashboard & Management
    │   ├── login/               # Authentication page
    │   └── globals.css          # KORA CSS design tokens
    ├── components/              # UI Components (Navbar, Cart, Products, Auth)
    ├── lib/                     # API client & PayHere helper functions
    └── types/                   # TypeScript interfaces
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **PostgreSQL**: Supabase or local PostgreSQL instance
- **Cloudinary Account**: For media uploads

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/` root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   SECRET_KEY=your_super_secret_jwt_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   PAYHERE_MERCHANT_ID=your_merchant_id
   PAYHERE_MERCHANT_SECRET=your_merchant_secret
   ```

5. Seed the database with sample menu items and Cloudinary assets:
   ```bash
   python seed_data.py
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Backend will run on: `http://localhost:8000`

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_PAYHERE_MERCHANT_ID=your_merchant_id
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Frontend will run on: `http://localhost:3000`

---

## 🔑 Default Admin Credentials

After running `seed_data.py`:
- **Email**: `admin@kora.com`
- **Password**: `admin123`
- **Admin Portal**: `http://localhost:3000/admin`

---

## 📜 License

This project is developed for educational and portfolio demonstration purposes.