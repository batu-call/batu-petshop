import { config } from "dotenv";
config({ path: "./Config/config.env" });

import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";
import { Order } from "../../Models/orderSchema.js";
import { Product } from "../../Models/ProductSchema.js";
import { User } from "../../Models/userSchema.js";
import Coupon from "../../Models/couponSchema.js";
import ShippingSetting from "../../Models/ShippingSetting.js";
import { LoginActivity } from "../../Models/LoginActivitySchema.js";
import { Session } from "../../Models/sessionSchema.js";
import { ChatHistory } from "../../Models/ChatHistorySchema.js";
import { Review } from "../../Models/reviewsSchema.js";
import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import ErrorHandler from "../../Middlewares/errorMiddleware.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Sabitler ────────────────────────────────────────────────────────────────
const DAILY_MAX        = 200;
const SESSION_MAX      = 50;
const MAX_HISTORY      = 10;   // kaç mesaj geçmişe alınsın
const MAX_TOOL_CHARS   = 1500; // tool sonucu max karakter

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
      role: "admin",
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

  getOrderStats: async ({ startDate, endDate, status }) => {
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .select("totalAmount status shippingFee discountAmount")
      .lean();

    const totalRevenue  = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalDiscount = orders.reduce((s, o) => s + (o.discountAmount || 0), 0);
    const totalShipping = orders.reduce((s, o) => s + (o.shippingFee   || 0), 0);

    return {
      totalOrders:   orders.length,
      totalRevenue:  +totalRevenue.toFixed(2),
      totalDiscount: +totalDiscount.toFixed(2),
      totalShipping: +totalShipping.toFixed(2),
      avgOrderValue: orders.length ? +(totalRevenue / orders.length).toFixed(2) : 0,
      byStatus: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
    };
  },

  getOrderDetail: async ({ orderId }) => {
    const order = await Order.findById(orderId)
      .populate({ path: "user",          select: "firstName lastName email phone" })
      .populate({ path: "items.product", select: "product_name image slug category" })
      .lean();
    return order || { error: "Order not found" };
  },

  getOrdersByCity: async ({ startDate, endDate }) => {
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }
    return Order.aggregate([
      { $match: filter },
      { $group: { _id: "$shippingAddress.city", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
  },

  getTopProducts: async ({ sortBy = "sold", limit = 5, category }) => {
    const filter = {};
    if (category) filter.category = category;
    const sort =
      sortBy === "stock" ? { stock: 1 } :
      sortBy === "price" ? { price: -1 } : { sold: -1 };
    return Product.find(filter)
      .sort(sort).limit(Math.min(limit, 10))
      .select("product_name sold stock price salePrice category isFeatured slug").lean();
  },

  getLowStockProducts: async ({ threshold = 10 }) =>
    Product.find({ stock: { $lte: threshold }, isActive: true })
      .select("product_name stock category price slug").sort({ stock: 1 }).limit(20).lean(),

  getProductStats: async () => {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, inStock, outOfStock, active, inactive, featured, sold, newMonth, byCategory] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ stock: { $gt: 0 } }),
        Product.countDocuments({ stock: 0 }),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: false }),
        Product.countDocuments({ isFeatured: true }),
        Product.aggregate([{ $group: { _id: null, total: { $sum: "$sold" } } }]),
        Product.countDocuments({ createdAt: { $gte: monthStart } }),
        Product.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 }, totalSold: { $sum: "$sold" } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    const [topSold, criticalStock] = await Promise.all([
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5)
        .select("product_name sold stock price category slug").lean(),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
    ]);

    return {
      totalProducts: total, inStock, outOfStock,
      activeProducts: active, inactiveProducts: inactive,
      featuredCount: featured, criticalStock,
      totalSold: sold[0]?.total || 0,
      newThisMonth: newMonth,
      categoryData: byCategory,
      topSold,
    };
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

  getTopCustomers: async ({ limit = 5 }) =>
    Order.aggregate([
      { $group: { _id: "$user", orderCount: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
      { $sort: { totalSpent: -1 } },
      { $limit: Math.min(limit, 10) },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: {
          "user.firstName": 1, "user.lastName": 1,
          "user.email": 1,     "user.phone": 1,
          "user.createdAt": 1,
          orderCount: 1,       totalSpent: 1,
      }},
    ]),

  getUserProfile: async ({ userId }) => {
    const user = await User.findById(userId)
      .select("firstName lastName email phone address role authProvider createdAt").lean();
    if (!user) return { error: "User not found" };
    const stats = await Order.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
    ]);
    return { ...user, orderCount: stats[0]?.count || 0, totalSpent: +(stats[0]?.total || 0).toFixed(2) };
  },

  getCoupons: async ({ activeOnly = false }) => {
    const coupons = await Coupon.find(activeOnly ? { status: true } : {}).lean();
    const now = new Date();
    return coupons.map((c) => {
      let computedStatus = "active";
      if (!c.status)                                          computedStatus = "inactive";
      else if (c.validUntil && now > new Date(c.validUntil)) computedStatus = "expired";
      else if (c.validFrom  && now < new Date(c.validFrom))  computedStatus = "scheduled";
      else if (c.maxUsage   && c.usedCount >= c.maxUsage)    computedStatus = "limit_reached";
      return {
        code: c.code, percent: c.percent,
        minAmount: c.minAmount || 0, maxUsage: c.maxUsage || null,
        usedCount: c.usedCount || 0, validFrom: c.validFrom || null,
        validUntil: c.validUntil || null, status: computedStatus,
        userSpecific: c.applicableToUsers.length > 0,
        productSpecific: c.applicableToProducts.length > 0,
      };
    });
  },

  getCouponStats: async () => {
    const coupons = await Coupon.find().lean();
    const now = new Date();
    return coupons.reduce(
      (acc, c) => {
        if (!c.status)                                          acc.inactive++;
        else if (c.validUntil && now > new Date(c.validUntil)) acc.expired++;
        else if (c.maxUsage && c.usedCount >= c.maxUsage)      acc.limitReached++;
        else                                                    acc.active++;
        acc.totalUsed += c.usedCount || 0;
        return acc;
      },
      { active: 0, inactive: 0, expired: 0, limitReached: 0, totalUsed: 0, total: coupons.length },
    );
  },

  getShippingSettings: async () => {
    const s = await ShippingSetting.findOne().lean();
    return s ? { fee: s.fee, freeOver: s.freeOver, enabled: s.enabled } : { fee: 0, freeOver: 0, enabled: true };
  },

  getSiteAnalytics: async () => {
    const now          = new Date();
    const todayStart   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const activeCutoff = new Date(now.getTime() - 15 * 60 * 1000);

    const [weeklyActive, activeNow, todayUsers, totalUsers, avgSession] = await Promise.all([
      LoginActivity.distinct("userId", { loginAt: { $gte: sevenDaysAgo } }),
      LoginActivity.distinct("userId", { loginAt: { $gte: activeCutoff } }),
      User.countDocuments({ createdAt: { $gte: todayStart }, role: "User" }),
      User.countDocuments({ role: "User" }),
      Session.aggregate([
        { $match: { duration: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: "$duration" } } },
      ]),
    ]);

    return {
      weeklyActiveUsers: weeklyActive.length,
      activeNow:         activeNow.length,
      todayNewUsers:     todayUsers,
      totalUsers,
      avgSessionMinutes: avgSession.length ? Math.round(avgSession[0].avg / 60000) : 0,
    };
  },

  getUserGrowth: async ({ days = 7 }) => {
    const now        = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startDate  = new Date(todayStart.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    const raw = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: "User" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return Array.from({ length: days }, (_, i) => {
      const date   = new Date(todayStart.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split("T")[0];
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), newUsers: raw.find((d) => d._id === dayStr)?.count || 0 };
    });
  },

  getRevenueStats: async ({ days = 30 }) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
    const totalOrders  = revenue.reduce((s, r) => s + r.orders, 0);
    return {
      totalRevenue:  +totalRevenue.toFixed(2),
      totalOrders,
      avgOrderValue: totalOrders ? +(totalRevenue / totalOrders).toFixed(2) : 0,
      daily: revenue,
    };
  },
};

// ─── Tool Tanımları ───────────────────────────────────────────────────────────
const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "getOrderStats",
      description: "Order statistics: total orders, revenue, discounts, shipping, breakdown by status.",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", description: "ISO date e.g. 2024-01-01" },
          endDate:   { type: "string", description: "ISO date e.g. 2024-01-31" },
          status:    { type: "string", enum: ["pending","paid","shipped","delivered","cancelled","cancellation_requested"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getOrderDetail",
      description: "Full details of a specific order: user info, items, tracking, payment, status.",
      parameters: {
        type: "object",
        properties: { orderId: { type: "string" } },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getOrdersByCity",
      description: "Order counts and revenue grouped by shipping city.",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string" },
          endDate:   { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTopProducts",
      description: "Top products sorted by: sold (best sellers), price (most expensive), or stock (low stock first).",
      parameters: {
        type: "object",
        properties: {
          sortBy:   { type: "string", enum: ["sold","stock","price"] },
          limit:    { type: "number" },
          category: { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getLowStockProducts",
      description: "Active products at or below a stock threshold (default 10), sorted by stock ascending.",
      parameters: { type: "object", properties: { threshold: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductStats",
      description: "Full inventory overview: totals, active/inactive, featured, critical stock, top sellers, category breakdown.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getPriceRange",
      description: "Min, max, avg effective price (uses salePrice when active) across all or category-filtered products.",
      parameters: {
        type: "object",
        properties: { category: { type: "string", enum: ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"] } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTopCustomers",
      description: "Customers ranked by total spend. Includes name, email, phone, join date, order count.",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserProfile",
      description: "Specific user profile: contact info, role, plus their order count and total spend.",
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
      name: "getCoupons",
      description: "List coupons with computed status: active/inactive/expired/scheduled/limit_reached.",
      parameters: {
        type: "object",
        properties: { activeOnly: { type: "boolean" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCouponStats",
      description: "Coupon counts by status + total usage.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getShippingSettings",
      description: "Shipping fee, free shipping threshold, enabled status.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getSiteAnalytics",
      description: "Live stats: users online now, weekly active, today's signups, total users, avg session duration.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserGrowth",
      description: "Daily new user registrations for last N days (default 7).",
      parameters: { type: "object", properties: { days: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "getRevenueStats",
      description: "Revenue, order count, avg order value, daily breakdown for last N days. Excludes cancelled orders.",
      parameters: { type: "object", properties: { days: { type: "number" } } },
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
    } catch (_) {}
  }
  XML_TOOL_RE.lastIndex = 0;
  return calls;
};

const runChat = async (systemPrompt, userMessage, history = []) => {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  const newMessages = [{ role: "user", content: userMessage }];

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

    let nextResponse;
    try {
      nextResponse = await groq.chat.completions.create({
        model:       "llama-3.3-70b-versatile",
        messages,
        max_tokens:  2048,
        temperature: 0.3,
      });
    } catch (err) {
      if (err?.status === 400 && err?.error?.failed_generation) {
        const xmlCalls = parseXmlToolCalls(err.error.failed_generation);
        if (xmlCalls.length > 0) {
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
export const adminChat = catchAsyncError(async (req, res, next) => {
  const { message, sessionId } = req.body;
  if (!message?.trim())      return next(new ErrorHandler("Message required", 400));
  if (message.length > 1000) return next(new ErrorHandler("Message too long (max 1000 chars)", 400));

  const userId    = req.user?._id?.toString();
  const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "Admin";
  const sid       = sessionId || uuidv4();

  const session = await getOrCreateSession(sid, userId);
  checkRateLimit(session);

  // FIX: sistem promptu kısa ve öz — tool listesi zaten toolDefinitions'da var, tekrar yazmaya gerek yok
  const systemPrompt = `You are an admin AI co-pilot for a pet store. Today: ${new Date().toISOString()}. Admin: ${adminName}.
Always fetch real data — never guess or fabricate. Add business insight: not just facts but trends and action suggestions.
Format money as $1,234.50. For empty results say so and suggest follow-up. Off-topic requests: politely decline.
For destructive actions add ⚠️ and ask for confirmation.`;

  const history = prepareHistory(session.messages);
  let answer, newMessages;

  try {
    ({ answer, newMessages } = await runChat(systemPrompt, message, history));
  } catch (err) {
    console.error("[adminChat] error:", err.message);
    if (err.status === 429) {
      return res.status(200).json({ success: true, answer: "Rate limit reached. Please wait a moment.", sessionId: sid });
    }
    return res.status(200).json({ success: true, answer: "Something went wrong. Please try again.", sessionId: sid });
  }

  for (const msg of newMessages) {
    pushMessage(session, msg.role, msg.content, {
      tool_calls:   msg.tool_calls   || null,
      tool_call_id: msg.tool_call_id || null,
    });
  }
  await session.save();

  res.status(200).json({
    success: true,
    answer,
    sessionId: sid,
    usage: { sessionMessages: session.messageCount, dailyMessages: session.dailyMessageCount },
  });
});

export const getChatHistory = catchAsyncError(async (req, res, next) => {
  const { sessionId } = req.params;
  if (!sessionId) return next(new ErrorHandler("Session ID required", 400));

  const session = await ChatHistory.findOne({ sessionId }).lean();
  if (!session)  return next(new ErrorHandler("Session not found", 404));

  const visible = session.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp }));

  res.status(200).json({ success: true, sessionId, messages: visible, messageCount: session.messageCount });
});

export const clearChatSession = catchAsyncError(async (req, res, next) => {
  const { sessionId } = req.params;
  if (!sessionId) return next(new ErrorHandler("Session ID required", 400));
  await ChatHistory.deleteOne({ sessionId });
  res.status(200).json({ success: true, message: "Chat session cleared" });
});