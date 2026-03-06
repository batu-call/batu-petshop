import { config } from "dotenv";
config({ path: "./Config/config.env" });

import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";
import { Order } from "../../Models/orderSchema.js";
import { Product } from "../../Models/ProductSchema.js";
import { Cart } from "../../Models/CartSchema.js";
import Coupon from "../../Models/couponSchema.js";
import Favorite from "../../Models/favoriteSchema.js";
import ShippingSetting from "../../Models/ShippingSetting.js";
import { ChatHistory } from "../../Models/ChatHistorySchema.js";
import { Review } from "../../Models/reviewsSchema.js";
import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Sabitler ────────────────────────────────────────────────────────────────
const DAILY_MAX      = 50;
const SESSION_MAX    = 20;
const MAX_HISTORY    = 10;
const MAX_TOOL_CHARS = 1500;

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
const trimResult = (result) => {
  const str = JSON.stringify(result);
  if (str.length <= MAX_TOOL_CHARS) return str;
  if (Array.isArray(result))
    return JSON.stringify({ data: result.slice(0, 10), note: `Showing 10 of ${result.length} items` });
  return str.slice(0, MAX_TOOL_CHARS) + "...[truncated]";
};

const getOrCreateSession = async (sessionId, userId) => {
  let session = await ChatHistory.findOne({ sessionId });
  if (!session) {
    session = await ChatHistory.create({
      sessionId,
      userId: userId || null,
      role: "customer",
      messages: [],
      messageCount: 0,
    });
  }
  return session;
};

const checkRateLimit = (session) => {
  const now = new Date();
  if (session.dailyResetAt < now) {
    session.dailyMessageCount = 0;
    session.dailyResetAt = new Date(now.setHours(24, 0, 0, 0));
  }
  if (session.dailyMessageCount >= DAILY_MAX)
    throw new ErrorHandler(`Daily limit reached (${DAILY_MAX}). Try again tomorrow.`, 429);
  if (session.messageCount >= SESSION_MAX)
    throw new ErrorHandler(`Session limit reached (${SESSION_MAX}). Start a new chat.`, 429);
};

// FIX: tool mesajlarını geçmişe dahil etme — gereksiz token harcar
const prepareHistory = (stored) =>
  stored
    .slice(-MAX_HISTORY)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

const pushMessage = (session, role, content, extras = {}) => {
  session.messages.push({ role, content, timestamp: new Date(), ...extras });
  session.messageCount      += 1;
  session.dailyMessageCount += 1;
  session.lastActivity = new Date();
};

// ─── Tool Fonksiyonları ───────────────────────────────────────────────────────
const tools = {

  searchProducts: async ({ query, category, onSale, limit = 5 }) => {
    const filter = { isActive: true, stock: { $gt: 0 } };
    if (category) filter.category = category;
    if (onSale)   filter.salePrice = { $ne: null };
    if (query) {
      const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ product_name: rx }, { description: rx }];
    }
    return Product.find(filter).limit(Math.min(limit, 5))
      .select("product_name price salePrice category stock image slug isFeatured").lean();
  },

  browseProducts: async ({ sortBy = "newest", category, limit = 5 }) => {
    const filter = { isActive: true, stock: { $gt: 0 } };
    if (category) filter.category = category;
    const sort =
      sortBy === "price_high" ? { price: -1 } :
      sortBy === "price_low"  ? { price: 1 }  :
      sortBy === "popular"    ? { sold: -1 }   :
      sortBy === "featured"   ? { isFeatured: -1 } : { createdAt: -1 };
    return Product.find(filter).sort(sort).limit(Math.min(limit, 5))
      .select("product_name price salePrice category stock image slug isFeatured sold").lean();
  },

  filterProducts: async ({ category, minPrice, maxPrice, onSale, minRating, sortBy = "default", limit = 5 }) => {
    const VALID_SORT = ["default","price-asc","price-desc","rating","name-asc","name-desc","popular","newest"];
    const safeSortBy = VALID_SORT.includes(sortBy) ? sortBy : "default";
    const safeLimit  = Math.min(Math.max(Number(limit) || 5, 1), 10);
    const SELECT     = "product_name price salePrice category stock image slug isFeatured sold";

    const filter = { isActive: true, stock: { $gt: 0 } };
    if (category) filter.category = category;
    if (onSale)   filter.salePrice = { $ne: null };

    if (minPrice || maxPrice) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
      filter.$or = [
        { salePrice: { $ne: null, $gte: min, $lte: max } },
        { salePrice: null, price: { $gte: min, $lte: max } },
      ];
    }

    if (minRating) {
      const safeMin = Math.min(Math.max(Number(minRating), 1), 5);
      const ratingStats = await Review.aggregate([
        { $group: { _id: "$productId", avgRating: { $avg: "$rating" } } },
        { $match: { avgRating: { $gte: safeMin } } },
      ]);
      const ids = ratingStats.map((s) => s._id);
      if (!ids.length) return { products: [], message: `No products with rating >= ${safeMin}.` };
      filter._id = { $in: ids };
    }

    if (safeSortBy === "rating") {
      const all = await Product.find(filter).select(SELECT).lean();
      if (!all.length) return { products: [], message: "No products found." };
      const stats = await Review.aggregate([
        { $match: { productId: { $in: all.map((p) => p._id) } } },
        { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
      ]);
      const map = {};
      stats.forEach((s) => { map[s._id.toString()] = s; });
      return {
        products: all
          .map((p) => ({ ...p, avgRating: +(map[p._id.toString()]?.avgRating || 0).toFixed(1), reviewCount: map[p._id.toString()]?.reviewCount || 0 }))
          .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
          .slice(0, safeLimit),
        total: all.length,
      };
    }

    if (safeSortBy === "price-asc" || safeSortBy === "price-desc") {
      const dir = safeSortBy === "price-asc" ? 1 : -1;
      const [products, total] = await Promise.all([
        Product.aggregate([
          { $match: filter },
          { $addFields: { effectivePrice: { $cond: [
              { $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }, { $lt: ["$salePrice", "$price"] }] },
              "$salePrice", "$price",
          ] } } },
          { $sort: { effectivePrice: dir } },
          { $limit: safeLimit },
          { $project: { product_name:1, price:1, salePrice:1, category:1, stock:1, image:1, slug:1, isFeatured:1, sold:1 } },
        ]),
        Product.countDocuments(filter),
      ]);
      return { products, total };
    }

    const sort =
      safeSortBy === "popular"   ? { sold: -1 }          :
      safeSortBy === "newest"    ? { createdAt: -1 }      :
      safeSortBy === "name-asc"  ? { product_name: 1 }   :
      safeSortBy === "name-desc" ? { product_name: -1 }  :
      { isFeatured: -1, createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).limit(safeLimit).select(SELECT).lean(),
      Product.countDocuments(filter),
    ]);

    return products.length ? { products, total } : { products: [], message: "No products found." };
  },

  getHotDeals: async ({ limit = 5 }) =>
    Product.find({ isActive: true, stock: { $gt: 0 }, salePrice: { $ne: null } })
      .sort({ updatedAt: -1 }).limit(Math.min(limit, 5))
      .select("product_name price salePrice category image slug stock").lean(),

  getShippingSettings: async () => {
    const s = await ShippingSetting.findOne().lean();
    return s ? { fee: s.fee, freeOver: s.freeOver, enabled: s.enabled } : { fee: 0, freeOver: 0, enabled: true };
  },

  getSimilarProducts: async ({ productId, category, limit = 4 }) => {
    const filter = { isActive: true, stock: { $gt: 0 } };
    if (productId && /^[0-9a-fA-F]{24}$/.test(productId)) filter._id = { $ne: productId };
    if (category) filter.category = category;
    const products = await Product.find(filter).sort({ sold: -1, createdAt: -1 }).limit(Math.min(limit, 5))
      .select("product_name price salePrice category stock image slug isFeatured").lean();
    return products.length ? products : { message: "No similar products found." };
  },

  getTopRatedProducts: async ({ category, limit = 5, minRating = 4 }) => {
    const safeMin = Math.min(Math.max(Number(minRating) || 4, 1), 5);
    const filter  = { isActive: true, stock: { $gt: 0 } };
    if (category) filter.category = category;

    const products = await Product.find(filter).lean();
    if (!products.length) return { message: "No products found.", items: [] };

    const stats = await Review.aggregate([
      { $match: { productId: { $in: products.map((p) => p._id) } } },
      { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
      { $match: { avgRating: { $gte: safeMin } } },
      { $sort: { avgRating: -1, reviewCount: -1 } },
      { $limit: Math.min(limit, 5) },
    ]);

    if (!stats.length) return { message: `No products with rating >= ${safeMin}. Try 'best rated products' instead.`, items: [] };

    return stats.map((s) => {
      const p = products.find((x) => x._id.toString() === s._id.toString());
      if (!p) return null;
      return { _id: p._id, product_name: p.product_name, price: p.price, salePrice: p.salePrice ?? null, category: p.category, stock: p.stock, image: p.image, slug: p.slug, avgRating: +s.avgRating.toFixed(1), reviewCount: s.reviewCount };
    }).filter(Boolean);
  },

  getPriceRange: async ({ category }) => {
    const filter = { isActive: true };
    if (category) filter.category = category;
    const stats = await Product.aggregate([
      { $match: filter },
      { $project: { effectivePrice: { $cond: [
          { $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }, { $lt: ["$salePrice", "$price"] }] },
          "$salePrice", "$price",
      ] } } },
      { $match: { effectivePrice: { $gt: 0 } } },
      { $group: { _id: null, min: { $min: "$effectivePrice" }, max: { $max: "$effectivePrice" }, avg: { $avg: "$effectivePrice" } } },
    ]);
    return stats.length
      ? { min: Math.floor(stats[0].min), max: Math.ceil(stats[0].max), avg: Math.round(stats[0].avg), category: category || "all" }
      : { min: 0, max: 0, avg: 0, category: category || "all" };
  },

  checkDiscountAvailability: async () => {
    const now   = new Date();
    const valid = (await Coupon.find({ status: true }).lean()).filter((c) => {
      if (c.validFrom  && now < new Date(c.validFrom))  return false;
      if (c.validUntil && now > new Date(c.validUntil)) return false;
      if (c.maxUsage   && c.usedCount >= c.maxUsage)    return false;
      return true;
    });
    if (!valid.length) return { hasActiveCoupons: false, message: "No active discounts right now." };
    const maxDiscount = Math.max(...valid.map((c) => c.percent));
    return {
      hasActiveCoupons: true,
      count: valid.length,
      maxDiscount,
      discounts: valid.map((c) => ({ percent: c.percent, minAmount: c.minAmount || 0 })),
      message: `${valid.length} active discount(s) — up to ${maxDiscount}% off!`,
    };
  },

  getUserOrders: async ({ userId }) =>
    Order.find({ user: userId })
      .populate({ path: "items.product", select: "product_name image slug category" })
      .sort({ createdAt: -1 }).limit(10)
      .select("status totalAmount shippingFee discountAmount couponCode tracking createdAt items note").lean(),

  getOrderDetail: async ({ orderId, userId }) => {
    const filter = { _id: orderId };
    if (userId) filter.user = userId;
    const order = await Order.findOne(filter)
      .populate({ path: "user",          select: "firstName lastName email" })
      .populate({ path: "items.product", select: "product_name image slug" }).lean();
    return order || { error: "Order not found" };
  },

  getUserFavorites: async ({ userId }) => {
    const favs = await Favorite.find({ userId })
      .populate({ path: "productId", match: { isActive: true }, select: "product_name price salePrice image slug category stock" }).lean();
    return favs.filter((f) => f.productId).map((f) => f.productId);
  },

  getUserCart: async ({ userId }) => {
    const cart = await Cart.findOne({ user: userId })
      .populate({ path: "items.product", select: "product_name price salePrice image slug stock" }).lean();
    if (!cart || !cart.items.length) return { items: [], total: 0, appliedCoupon: null };
    const total = cart.items.reduce((sum, item) => {
      const price = item.product?.salePrice ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
    return { itemCount: cart.items.length, items: cart.items, total: +total.toFixed(2), appliedCoupon: cart.appliedCoupon || null };
  },
};

// ─── Tool Tanımları ───────────────────────────────────────────────────────────
const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Search products by keyword, category, or sale filter. Returns up to 5 in-stock products.",
      parameters: {
        type: "object",
        properties: {
          query:    { type: "string" },
          category: { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] },
          onSale:   { type: "boolean" },
          limit:    { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browseProducts",
      description: "Browse products with sorting: price_high, price_low, popular, newest, featured.",
      parameters: {
        type: "object",
        properties: {
          sortBy:   { type: "string", enum: ["price_high","price_low","popular","newest","featured"] },
          category: { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] },
          limit:    { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filterProducts",
      description: "Filter + sort with multiple criteria: price range, category, on-sale, min rating, sort order.",
      parameters: {
        type: "object",
        properties: {
          category:  { type: "string",  enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] },
          minPrice:  { type: "number" },
          maxPrice:  { type: "number" },
          onSale:    { type: "boolean" },
          minRating: { type: "number", description: "Min avg review rating 1-5" },
          sortBy:    { type: "string",  enum: ["default","price-asc","price-desc","rating","name-asc","name-desc","popular","newest"] },
          limit:     { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getHotDeals",
      description: "Currently discounted products (salePrice set), sorted by most recently updated.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "getShippingSettings",
      description: "Shipping fee and free shipping minimum threshold.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getSimilarProducts",
      description: "Products similar to one the customer is viewing, based on same category.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          category:  { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] },
          limit:     { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTopRatedProducts",
      description: "Highest rated products by customer reviews. Use for 'best rated', 'top reviewed', 'what customers recommend'.",
      parameters: {
        type: "object",
        properties: {
          category:  { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] },
          limit:     { type: "number" },
          minRating: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPriceRange",
      description: "Min, max, avg product price. Use for 'how expensive are products', 'what is the price range'.",
      parameters: {
        type: "object",
        properties: { category: { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkDiscountAvailability",
      description: "Check active discounts: count, max %, per-coupon percent+minAmount. NEVER reveals coupon codes.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserOrders",
      description: "Logged-in user's last 10 orders with status, amounts, tracking, products.",
      parameters: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getOrderDetail",
      description: "Full details of one specific order. Pass userId for security.",
      parameters: {
        type: "object",
        properties: { orderId: { type: "string" }, userId: { type: "string" } },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserFavorites",
      description: "User's saved/favorited products (active, in-stock only).",
      parameters: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserCart",
      description: "User's cart: items, item count, total price, applied coupon.",
      parameters: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"],
      },
    },
  },
];

// AI Runner
// Groq llama-3.3-70b bazen tool sonrası <function=...> XML üretiyor → bunu yakala ve manuel çalıştır
const XML_TOOL_RE = /<function=(\w+)\s+(\{.*?\})\s*(?:\/>|<\/function>)/gs;

const parseXmlToolCalls = (text) => {
  const calls = [];
  let match;
  while ((match = XML_TOOL_RE.exec(text)) !== null) {
    try {
      calls.push({ name: match[1], args: JSON.parse(match[2]) });
    } catch (_) { /* malformed JSON, skip */ }
  }
  XML_TOOL_RE.lastIndex = 0; // reset regex state
  return calls;
};

const runChat = async (systemPrompt, userMessage, history = []) => {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  const newMessages = [{ role: "user", content: userMessage }];

  // İlk istek: tools ile
  let response = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages,
    tools:       toolDefinitions,
    tool_choice: "auto",
    max_tokens:  2048,
    temperature: 0.3,
  });

  let assistantMsg = response.choices[0].message;

  while (assistantMsg.tool_calls?.length > 0) {
    messages.push(assistantMsg);
    newMessages.push({
      role:       "assistant",
      content:    assistantMsg.content || "",
      tool_calls: assistantMsg.tool_calls,
    });

    // Paralel tool çalıştır
    const toolResults = await Promise.all(
      assistantMsg.tool_calls.map(async (call) => {
        const fn = tools[call.function.name];
        let result;
        try {
          const args = JSON.parse(call.function.arguments);
          result = await Promise.race([
            fn ? fn(args) : Promise.resolve({ error: "Unknown tool" }),
            new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout (5s)")), 5000)),
          ]);
        } catch (err) {
          result = { error: err.message };
        }
        return { id: call.id, result };
      })
    );

    for (const { id, result } of toolResults) {
      const msg = { role: "tool", tool_call_id: id, content: trimResult(result) };
      messages.push(msg);
      newMessages.push(msg);
    }

    // Sonraki istekler: tools OLMADAN — XML bug riskini azaltır
    let nextResponse;
    try {
      nextResponse = await groq.chat.completions.create({
        model:       "llama-3.3-70b-versatile",
        messages,
        max_tokens:  2048,
        temperature: 0.3,
      });
    } catch (err) {
      // Groq tool_use_failed hatası: failed_generation içindeki XML tool call'ları parse et
      if (err?.status === 400 && err?.error?.failed_generation) {
        const xmlCalls = parseXmlToolCalls(err.error.failed_generation);

        if (xmlCalls.length > 0) {
          // XML içindeki tool'ları manuel çalıştır
          const recoveryResults = await Promise.all(
            xmlCalls.map(async ({ name, args }) => {
              const fn = tools[name];
              let result;
              try {
                result = await Promise.race([
                  fn ? fn(args) : Promise.resolve({ error: "Unknown tool" }),
                  new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout (5s)")), 5000)),
                ]);
              } catch (e) {
                result = { error: e.message };
              }
              return { name, result };
            })
          );

          // Tool sonuçlarını mesaja ekle ve modelden düz metin cevabı iste
          const recoveryContext = recoveryResults
            .map(({ name, result }) => `${name} result: ${trimResult(result)}`)
            .join("\n");

          messages.push({
            role:    "user",
            content: `Here are the tool results:\n${recoveryContext}\nPlease respond based on these results.`,
          });

          nextResponse = await groq.chat.completions.create({
            model:       "llama-3.3-70b-versatile",
            messages,
            max_tokens:  2048,
            temperature: 0.3,
          });
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    assistantMsg = nextResponse.choices[0].message;
  }

  newMessages.push({ role: "assistant", content: assistantMsg.content });
  return { answer: assistantMsg.content, newMessages };
};

// ─── Controller ───────────────────────────────────────────────────────────────
export const customerChat = catchAsyncError(async (req, res, next) => {
  const { message, sessionId } = req.body;
  if (!message?.trim())     return next(new ErrorHandler("Message required", 400));
  if (message.length > 500) return next(new ErrorHandler("Message too long (max 500 chars)", 400));

  const userId   = req.user?._id?.toString() || null;
  const userName = req.user?.firstName || null;
  const sid      = sessionId || uuidv4();

  const session = await getOrCreateSession(sid, userId);
  checkRateLimit(session);

  const systemPrompt = `You are a warm, helpful pet store assistant for Batu Pet Shop.
${userName ? `Customer: ${userName}. Greet by name on first message only.` : "Guest user."}
${userId
  ? `User ID: ${userId}`
  : `Guest — never call getUserOrders, getUserFavorites, getUserCart. Say "Please log in to see this" if asked.`
}
Always use tools for product/order/cart data — never invent. Off-topic (unrelated to pets or this store): "I can only help with pet store questions 🐾"

━━━ STORE INFO ━━━
Name: Batu Pet Shop
Website: batupetshop.com
Email: contact@batupetshop.com
Phone: +1 (415) 555-0199
Address: 742 Evergreen Terrace, Springfield, USA
This is an online store — open 24/7. Customer support replies within 1 business day.

━━━ SHIPPING ━━━
- Orders processed in 1–3 business days.
- Delivery: 3–7 business days depending on location.
- Free shipping on orders over $100 (use getShippingSettings tool for exact current threshold).
- We ship via standard carriers. No same-day delivery available.
- To check shipping cost for an order: use getShippingSettings tool.

━━━ RETURNS & REFUNDS ━━━
- Returns accepted within 14 days of delivery.
- Items must be unused, in original packaging, in resellable condition.
- To start a return: contact us at contact@batupetshop.com with order details.
- Return shipping cost is the customer's responsibility unless the item is defective.
- Damaged or incorrect items: contact us within 48 hours of receiving.
- Refunds processed within 5–7 business days after return is received and approved.

━━━ ACCOUNT & MEMBERSHIP ━━━
- Create account: /Register
- Login: /Login
- Forgot password: go to /Login → click "Forgot your password?" → enter email → reset link sent by email.
- Favorites: available after login — use the heart icon on any product.
- No loyalty program currently.
- Newsletter: unsubscribe via the link at the bottom of any newsletter email.

━━━ PET CARE TIPS (answer briefly, then suggest relevant products) ━━━
Cats: Feed kittens 3–4x/day; adults 2x/day. Regular vet checkups, vaccinations, and grooming.
Dogs: Feed 2x/day based on size/breed. Daily walks, training, and socialization are important.
Birds: Fresh water and food daily. Social interaction is key. Avoid drafts and toxic fumes.
Fish: Don't overfeed (once or twice/day, what they eat in 2 min). Keep tank clean, monitor water temp.
Reptiles: Lighting and temperature are critical — research your specific species' needs.
Rabbits: Hay should be 80% of diet. Fresh veggies daily. Need space to exercise.
Horses: Quality hay/grass, fresh water always. Regular farrier and vet visits.
General: Always consult a vet for health concerns — these are general tips only.

━━━ PRODUCT RESPONSE FORMAT ━━━
Warm sentence first, then:
\`\`\`json
[{"_id":"...","product_name":"...","price":0,"salePrice":null,"image":[{"url":"...","publicId":"..."}],"slug":"...","category":"...","stock":0}]
\`\`\`
Max 5, stock>0 only, salePrice=null if no discount. No text after closing \`\`\`.
Then ask: "Want to see similar products, check deals, or add an item to your cart?"

━━━ ORDER RESPONSE FORMAT ━━━
\`\`\`json
[{"_id":"...","status":"...","totalAmount":0,"shippingFee":0,"discountAmount":0,"couponCode":"","tracking":{"trackingNumber":"","cargoCompany":"","trackingUrl":"","estimatedDelivery":null},"createdAt":"...","items":[{"product":{"_id":"...","product_name":"...","image":[{"url":"..."}],"slug":"..."},"quantity":1,"price":0,"name":"..."}]}]
\`\`\``;

  const history = prepareHistory(session.messages);
  let answer, newMessages;

  try {
    ({ answer, newMessages } = await runChat(systemPrompt, message, history));
  } catch (err) {
    console.error("[customerChat] error:", err.message);
    if (err.status === 429) {
      return res.status(200).json({ success: true, answer: "I'm a bit busy 🐾 Please try again in a few seconds!", sessionId: sid });
    }
    return res.status(200).json({ success: true, answer: "Oops, something went wrong 😅 Could you try again?", sessionId: sid });
  }

  for (const msg of newMessages) {
    pushMessage(session, msg.role, msg.content, {
      tool_calls:   msg.tool_calls   || null,
      tool_call_id: msg.tool_call_id || null,
    });
  }
  await session.save();

  res.status(200).json({ success: true, answer, sessionId: sid });
});