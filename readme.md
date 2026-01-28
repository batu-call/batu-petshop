# 🐾 PetShop E-Commerce Platform

A full-stack, production-ready **PetShop e-commerce platform** including a user-facing application, an admin dashboard, and a backend API.

The system provides a complete online shopping experience with authentication, cart, favorites, orders, payments, and administrative management.

---

## 🛠️ Quick Start

# 1. Clone the repository
git clone https://github.com/batu-call/batu-petshop.git

# 2. Run the Backend
cd petshop-appBackend
npm install
npm run dev

# 3. Run the Frontend (User Application)
cd petshop-appFrontend/petshop-app
npm install
npm run dev

# 4. Run the Admin Panel
cd petshop-appAdmin/admin
npm install
npm run dev

## 🚀 Tech Stack

### Frontend (User Application)
- Next.js (App Router)
- TypeScript
- Context API (Auth, Cart, Favorites)
- Stripe payment integration
- Responsive & SEO-friendly pages
- Modern UI components and animations

### Admin Panel
- Next.js
- TypeScript
- Role-based authentication
- Product, order, user, and coupon management
- Dashboard with basic analytics

### Backend (API)
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT authentication
- Stripe integration
- Image upload with Multer
- RESTful API architecture

---

## ✨ Features

### User Side
- User authentication (register, login, password reset)
- Product listing and category-based browsing
- Product details with reviews and ratings
- Cart and favorites system
- Secure checkout with Stripe
- Order history
- Fully responsive design

### Admin Panel
- Admin authentication
- Product management (CRUD)
- Order management and status tracking
- User management
- Coupon and discount system
- Basic statistics and analytics

### Backend
- Secure REST API
- Role-based authorization
- Centralized error handling
- Modular controller and service structure

---

## 📁 Project Structure

petshop-appFrontend/
└── petshop-app/
    └── .env.local.example

petshop-appBackend/
└── Config/
    └── config.env.example

petshop-appAdmin/
└── admin/
    └── .env.example



## 🔐 Environment Variables


### Backend Environment Variables

The backend requires the following environment variables to function correctly.

For production deployment, these variables must be configured via the hosting provider (e.g. Render).

For local development:
1. Copy `/Config/config.env.example`
2. Rename it to `config.env`
3. Fill in the required values

| Variable | Description |
|--------|------------|
| PORT | Server port (e.g. 5000) |
| NODE_ENV | Environment name (`production` or `development`) |
| FRONTEND_URL | Deployed frontend URL (e.g. https://your-frontend.vercel.app) |
| ADMIN_URL | Deployed admin panel URL (e.g. https://your-admin.vercel.app) |
| MONGO_URI | MongoDB connection string from MongoDB Atlas |
| JWT_SECRET_KEY | Random secure string (used for JWT signing) |
| JWT_EXPIRES | JWT lifetime (e.g. `7d`) |
| COOKIE_EXPIRES | Cookie lifetime in days (e.g. `7`) |
| RESEND_API_KEY | API key from Resend email service |
| CONTACT_RECEIVER_MAIL | Email address to receive contact form messages |
| CLOUDINARY_CLOUD_NAME | Cloudinary account cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| STRIPE_SECRET_KEY | Stripe **Secret** API key |


All third-party credentials (MongoDB, Stripe, Cloudinary, Resend) must be obtained from their respective service dashboards.

### Frontend Environment Variables

The frontend application requires the following environment variables.

For production deployment, configure these via the hosting provider (e.g. Vercel).

For local development:

Copy frontend/.env.local.example

Rename it to .env.local

Fill in the required values

| Variable | Description |
|--------|------------|
| NEXT_PUBLIC_API_URL | Backend API base URL (e.g. https://your-backend.onrender.com) |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe publishable API key |


### Admin Panel Environment Variables

The admin dashboard requires the following environment variable.

For production deployment, configure this via the hosting provider (e.g. Vercel).

For local development:

Copy admin/.env.example

Rename it to .env

Fill in the required values

| Variable | Description |
|--------|------------|
| NEXT_PUBLIC_API_URL | Backend API base URL (e.g. https://your-backend.onrender.com) |

Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.



### Important Notes

Admin Access: For security reasons, new admin accounts cannot be created from the admin panel. The first admin account must be manually updated in the database (MongoDB) by setting the user’s role value to Admin.

Architecture: The Frontend (User Application) and Admin Panel are completely independent applications. Regular users cannot access the admin panel; only accounts with the Admin role can log in.
