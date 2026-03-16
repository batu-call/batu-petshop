# 🐾 PetShop E-Commerce Platform

A full-stack, production-ready **PetShop e-commerce platform** including a user-facing application, an admin dashboard, and a backend API.

The system provides a complete online shopping experience with authentication, cart, favorites, orders, payments, AI-powered chat assistants, email notifications, analytics, and full administrative management.

---

## 🛠️ Quick Start

```bash
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
```

---

## 🚀 Tech Stack

### Frontend (User Application)
- Next.js (App Router)
- TypeScript
- Context API (Auth, Cart, Favorites)
- Stripe payment integration
- Google OAuth (NextAuth)
- Groq AI integration (Chat Widget)
- Responsive & SEO-friendly pages
- Dark / Light mode
- Modern UI components and animations

### Admin Panel
- Next.js (App Router)
- TypeScript
- Role-based authentication
- Product, order, user, admin, and coupon management
- Full analytics dashboard
- AI-powered admin assistant (Groq)
- Email & notification system

### Backend (API)
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT authentication
- Stripe integration
- Cloudinary image upload
- Resend email service
- RESTful API architecture

---

## ✨ Features

### 🧑‍💻 User Side

#### 🔐 Authentication
- Register, login, logout
- Google OAuth (Continue with Google)
- Forgot password / Reset password via email
- Remember me
- JWT-based session management

#### 🏠 Homepage
- Hero section with animated pet visuals
- Featured products carousel
- Category-based sidebar navigation (Cat, Dog, Bird, Fish, Reptile, Rabbit, Horse)

#### 🛍️ Product Listing
- Category-based product browsing
- Subcategory filtering
- Discount badge (% OFF)
- Low stock warning ("Only X left")
- Star rating & review count display
- Sort & filter (price, stock, sold, featured)
- Pagination

#### 📦 Product Detail
- Multi-image gallery with zoom modal
- Swipe support (mobile)
- Parallax scroll effect
- Intersection Observer reveal animation
- Shimmer effect on load
- Blur background (adapts to image aspect ratio)
- Discount price display (original + sale price)
- Stock status
- Shipping & Returns tab
- Product Features tab
- Similar Products section
- Customer reviews & ratings

#### 🛒 Cart
- Add / remove products
- Quantity update
- Coupon code application
- Free shipping threshold display
- Cart summary with subtotal and discount

#### 💳 Checkout & Payment
- Stripe payment integration
- Shipping address form
- Order summary
- Payment success page

#### 📋 My Orders
- Full order history
- Status tracking (Pending / Paid / Shipped / Delivered / Cancelled)
- Filter by status
- Cancel order
- Order detail view

#### ❤️ Favorites
- Add / remove favorite products
- Favorites list page

#### 👤 Profile
- Personal information management
- Avatar upload
- Security & password change
- Notification preferences (order updates, promotions, newsletter)

#### 📞 Contact
- Contact form
- Google Maps integration

#### 📄 Static Pages
- About Us / Our Story & Mission / Meet Our Team
- Returns Policy
- Shipping Information

#### 🤖 AI Customer Chat Widget
- Powered by Groq AI
- Product recommendations by category or keyword
- Hot deals & discounted product discovery
- Order status queries
- Rich message bubbles (bold, bullets, numbered lists)
- Product cards with image, price, discount
- Order cards with status badge
- Suggestion chips on first open
- Slide-in message animations
- Clear chat history
- Fully responsive (mobile & desktop)

---

### 🛠️ Admin Panel

#### 🔐 Admin Authentication
- Secure login for admin accounts only
- Role-based access control
- JWT session management

#### 📊 Analytics Overview Dashboard
- Total visitors, revenue, orders
- Last 7 days login activity graph
- Session duration tracking
- Active users today

#### 📈 Product Analytics
- Product distribution by category (pie chart)
- Total products, in-stock, out-of-stock counts
- Low stock alerts
- Featured products list
- Active / inactive product breakdown

#### 📋 Order Management
- Full order list with filters (status, date, user, price range)
- Status board overview (Pending / Paid / Shipped / Delivered / Cancelled / Refund Requests)
- Detailed order modal (customer info, shipping address, items, totals)
- Order status update
- Cancel / refund management

#### 📊 Order Statistics
- Monthly orders chart (last 6 months)
- Status-based order counts
- Revenue tracking

#### 📦 Product Management
- Full product list with advanced filters (search, category, price, stock, sold, status, featured)
- Add new product (name, description, price, sale price, category, subcategory, stock)
- Edit existing products
- Delete product with confirmation
- Up to 6 image upload per product (Cloudinary)
- Active / Inactive toggle
- Featured product toggle
- isFeatured badge display
- Product Features section (name + description pairs)

#### 👥 User Management
- Full user list with search & filters
- User detail view (name, email, phone, address, role)
- Total orders & last order date per user
- Delete user with confirmation

#### 👮 Admin Management
- View all admin accounts
- Add new admin account
- Delete admin with confirmation
- Admin avatar support
- Role management

#### 💬 Customer Messages
- View all customer messages and inquiries
- Message subject & status tracking
- Reply via email directly from admin panel
- AI-assisted reply suggestions
- Message history per customer

#### 📧 Email & Notification System
- Compose & send bulk emails
- Segment targeting: All Users / Orders & Shipping / Sales & Promotions / Newsletter
- Subscriber count per segment
- Email history log
- Send push notifications to user groups
- Notification Center with subscription overview

#### 🎟️ Coupon & Discount Management
- Create coupon codes
- Discount type: percentage or fixed amount
- Set minimum order amount
- Set expiry date
- Usage limit configuration
- Delete coupons

#### 🚚 Shipping Settings
- Free shipping threshold configuration
- Standard shipping fee management
- Update shipping logic settings

#### 🤖 AI Admin Assistant
- Powered by Groq AI
- Query store data in natural language
- Questions: orders this month, best sellers, low stock, top customers, orders by city, cancelled orders
- Returns product cards (image, price, stock, sold)
- Returns order cards (status, items, total)
- Quick question chips always visible
- Rich text responses (bullets, numbered lists, bold, headers)
- Slide-in message animations
- Clear chat with confirmation
- Admin avatar from AdminAuthContext

---

## 🎨 UI / UX

- Dark / Light mode (next-themes)
- Fully responsive design (mobile, tablet, desktop)
- Smooth page transition animations
- Toast notifications (react-hot-toast)
- Confirm dialog system (custom ConfirmProvider)
- Circular loading animation
- Scroll to top button
- Intersection Observer reveal animations
- Parallax scroll effects
- Shimmer effects on image load
- Swipe gesture support (mobile)

---

## 📁 Project Structure

```
petshop-appFrontend/
└── petshop-app/
    └── .env.local.example

petshop-appBackend/
└── Config/
    └── config.env.example

petshop-appAdmin/
└── admin/
    └── .env.example
```

---

## 🔐 Environment Variables

### Backend

| Variable | Description |
|---|---|
| PORT | Server port (e.g. 5000) |
| NODE_ENV | `production` or `development` |
| FRONTEND_URL | Deployed frontend URL |
| ADMIN_URL | Deployed admin panel URL |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET_KEY | Secure random string for JWT signing |
| JWT_EXPIRES | JWT lifetime (e.g. `7d`) |
| COOKIE_EXPIRES | Cookie lifetime in days (e.g. `7`) |
| RESEND_API_KEY | API key from Resend email service |
| CONTACT_RECEIVER_MAIL | Email to receive contact form messages |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| STRIPE_SECRET_KEY | Stripe Secret API key |

### Frontend

| Variable | Description |
|---|---|
| NEXT_PUBLIC_API_URL | Backend API base URL |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe publishable API key |

### Admin Panel

| Variable | Description |
|---|---|
| NEXT_PUBLIC_API_URL | Backend API base URL |

---

## ⚠️ Important Notes

**Admin Access:** For security reasons, new admin accounts cannot be created from the admin panel directly. The first admin account must be manually updated in MongoDB by setting the user's `role` field to `Admin`.

**Architecture:** The Frontend and Admin Panel are completely independent Next.js applications. Regular users cannot access the admin panel — only accounts with the `Admin` role can log in.

**AI Chat:** Both the customer and admin chat widgets are powered by Groq AI. The backend handles all AI requests securely — API keys are never exposed to the client.

---

## 📦 Third-Party Assets

This project includes several animations sourced from LottieFiles.

All animations are used under the **Lottie Simple License**, which allows free use in commercial projects, including client work and distributed applications.

These assets are integrated as part of the UI and are not redistributed, resold, or used as standalone products.