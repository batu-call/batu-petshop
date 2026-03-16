import { Product } from "../../../../Models/ProductSchema.js";
import { Review } from "../../../../Models/reviewsSchema.js";
import { Order } from "../../../../Models/orderSchema.js";
import { Cart } from "../../../../Models/CartSchema.js";
import Favorite from "../../../../Models/favoriteSchema.js";
import ShippingSetting from "../../../../Models/ShippingSetting.js";
import Coupon from "../../../../Models/couponSchema.js";

const PRODUCT_SELECT = "product_name price salePrice category subCategory stock image slug isFeatured";

const compactImages = (item) => {
  if (!item || typeof item !== "object" || !item.image) return item;
  return { ...item, image: item.image?.length ? [{ url: item.image[0].url }] : [] };
};

const buildProductFilter = ({ category, subCategory, onSale }) => {
  const filter = { isActive: true, stock: { $gt: 0 } };
  if (category)    filter.category    = category;
  if (subCategory) filter.subCategory = subCategory;
  if (onSale)      filter.salePrice   = { $ne: null };
  return filter;
};

export { compactImages };

export const tools = {

  searchProducts: async ({ query, category, subCategory, onSale, limit = 5 }) => {
    const safeLimit = Math.min(limit, 5);
    const escQuery  = query ? new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
    const attempt = async (cat, sub, withQuery) => {
      const f = buildProductFilter({ category: cat, subCategory: sub, onSale });
      if (withQuery && escQuery) f.$or = [{ product_name: escQuery }, { description: escQuery }];
      return Product.find(f).limit(safeLimit).select(PRODUCT_SELECT).lean();
    };
    let products = await attempt(category, subCategory, true);
    if (!products.length && subCategory) products = await attempt(category, subCategory, false);
    if (!products.length && subCategory) products = await attempt(category, null, true);
    if (!products.length && category)    products = await attempt(category, null, false);
    if (!products.length)                products = await attempt(null, null, true);
    return products.map(compactImages);
  },

  browseProducts: async ({ sortBy = "newest", category, subCategory, limit = 5 }) => {
    const filter = buildProductFilter({ category, subCategory });
    const sort =
      sortBy === "price_high" ? { price: -1 }    :
      sortBy === "price_low"  ? { price: 1 }      :
      sortBy === "popular"    ? { sold: -1 }       :
      sortBy === "featured"   ? { isFeatured: -1 } : { createdAt: -1 };
    const products = await Product.find(filter).sort(sort).limit(Math.min(limit, 5)).select(PRODUCT_SELECT).lean();
    return products.map(compactImages);
  },

  filterProducts: async ({ category, subCategory, minPrice, maxPrice, onSale, minRating, sortBy = "default", limit = 5 }) => {
    const VALID_SORT = ["default","price-asc","price-desc","rating","name-asc","name-desc","popular","newest"];
    const safeSortBy = VALID_SORT.includes(sortBy) ? sortBy : "default";
    const safeLimit  = Math.min(Math.max(Number(limit) || 5, 1), 5);
    const filter     = buildProductFilter({ category, subCategory, onSale });
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
      const ids = (await Review.aggregate([
        { $group: { _id: "$productId", avg: { $avg: "$rating" } } },
        { $match: { avg: { $gte: safeMin } } },
      ])).map((s) => s._id);
      if (!ids.length) return [];
      filter._id = { $in: ids };
    }
    if (safeSortBy === "rating") {
      const all = await Product.find(filter).select(PRODUCT_SELECT).lean();
      if (!all.length) return [];
      const stats = await Review.aggregate([
        { $match: { productId: { $in: all.map((p) => p._id) } } },
        { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      const map = Object.fromEntries(stats.map((s) => [s._id.toString(), s]));
      return all.map((p) => ({ ...compactImages(p), avgRating: +(map[p._id.toString()]?.avg || 0).toFixed(1) }))
        .sort((a, b) => b.avgRating - a.avgRating).slice(0, safeLimit);
    }
    if (safeSortBy === "price-asc" || safeSortBy === "price-desc") {
      const dir = safeSortBy === "price-asc" ? 1 : -1;
      const products = await Product.aggregate([
        { $match: filter },
        { $addFields: { effectivePrice: { $cond: [{ $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }, { $lt: ["$salePrice", "$price"] }] }, "$salePrice", "$price"] } } },
        { $sort: { effectivePrice: dir } },
        { $limit: safeLimit },
        { $project: { product_name:1, price:1, salePrice:1, category:1, subCategory:1, stock:1, image:1, slug:1, isFeatured:1 } },
      ]);
      return products.map(compactImages);
    }
    const sort =
      safeSortBy === "popular"   ? { sold: -1 }         :
      safeSortBy === "newest"    ? { createdAt: -1 }     :
      safeSortBy === "name-asc"  ? { product_name: 1 }  :
      safeSortBy === "name-desc" ? { product_name: -1 } : { isFeatured: -1, createdAt: -1 };
    const products = await Product.find(filter).sort(sort).limit(safeLimit).select(PRODUCT_SELECT).lean();
    return products.map(compactImages);
  },

  getHotDeals: async ({ limit = 5 }) => {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 }, salePrice: { $ne: null } })
      .sort({ updatedAt: -1 }).limit(Math.min(limit, 5))
      .select("product_name price salePrice category subCategory slug stock image").lean();
    return products.map(compactImages);
  },

  getSimilarProducts: async ({ productId, category, subCategory, limit = 4 }) => {
    const filter = buildProductFilter({ category, subCategory });
    if (productId && /^[0-9a-fA-F]{24}$/.test(productId)) filter._id = { $ne: productId };
    let products = await Product.find(filter).sort({ sold: -1, createdAt: -1 }).limit(Math.min(limit, 5)).select(PRODUCT_SELECT).lean();
    if (products.length < 2 && subCategory && category) {
      delete filter.subCategory;
      products = await Product.find(filter).sort({ sold: -1, createdAt: -1 }).limit(Math.min(limit, 5)).select(PRODUCT_SELECT).lean();
    }
    return products.map(compactImages);
  },

  getTopRatedProducts: async ({ category, subCategory, limit = 5, minRating = 4 }) => {
    const safeMin  = Math.min(Math.max(Number(minRating) || 4, 1), 5);
    const filter   = buildProductFilter({ category, subCategory });
    const products = await Product.find(filter).select(PRODUCT_SELECT).lean();
    if (!products.length) return [];
    const stats = await Review.aggregate([
      { $match: { productId: { $in: products.map((p) => p._id) } } },
      { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $match: { avg: { $gte: safeMin } } },
      { $sort: { avg: -1, count: -1 } },
      { $limit: Math.min(limit, 5) },
    ]);
    if (!stats.length) return [];
    return stats.map((s) => {
      const p = products.find((x) => x._id.toString() === s._id.toString());
      if (!p) return null;
      return compactImages({ _id: p._id, product_name: p.product_name, price: p.price, salePrice: p.salePrice ?? null, category: p.category, subCategory: p.subCategory, stock: p.stock, image: p.image, slug: p.slug, avgRating: +s.avg.toFixed(1) });
    }).filter(Boolean);
  },

  getPriceRange: async ({ category, subCategory }) => {
    const filter = { isActive: true };
    if (category)    filter.category    = category;
    if (subCategory) filter.subCategory = subCategory;
    const stats = await Product.aggregate([
      { $match: filter },
      { $project: { effectivePrice: { $cond: [{ $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }, { $lt: ["$salePrice", "$price"] }] }, "$salePrice", "$price"] } } },
      { $match: { effectivePrice: { $gt: 0 } } },
      { $group: { _id: null, min: { $min: "$effectivePrice" }, max: { $max: "$effectivePrice" }, avg: { $avg: "$effectivePrice" } } },
    ]);
    return stats.length ? { min: Math.floor(stats[0].min), max: Math.ceil(stats[0].max), avg: Math.round(stats[0].avg) } : { min: 0, max: 0, avg: 0 };
  },

  getShippingSettings: async () => {
    const s = await ShippingSetting.findOne().lean();
    return s ? { fee: s.fee, freeOver: s.freeOver, enabled: s.enabled } : { fee: 0, freeOver: 0, enabled: true };
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
    const minSpend    = Math.min(...valid.map((c) => c.minAmount || 0));
    return { hasActiveCoupons: true, count: valid.length, maxDiscount, minSpend, message: `${valid.length} active discount(s) available, up to ${maxDiscount}% off. Minimum spend from $${minSpend}.` };
  },

  getUserOrders: async ({ userId }) => {
    const orders = await Order.find({ user: userId }).select("status").lean();
    const summary = { total: orders.length, pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      if (o.status === "pending" || o.status === "paid") summary.pending++;
      else if (o.status === "shipped")   summary.shipped++;
      else if (o.status === "delivered") summary.delivered++;
      else if (o.status === "cancelled") summary.cancelled++;
    }
    return summary;
  },

  getUserFavorites: async ({ userId }) => {
    const favs = await Favorite.find({ userId })
      .populate({ path: "productId", match: { isActive: true }, select: "product_name price salePrice image slug category subCategory stock" })
      .limit(10).lean();
    return favs.filter((f) => f.productId).map((f) => compactImages(f.productId));
  },

  getUserCart: async ({ userId }) => {
    const cart = await Cart.findOne({ user: userId })
      .populate({ path: "items.product", select: "product_name price salePrice image slug stock" }).lean();
    if (!cart?.items?.length) return { items: [], total: 0, appliedCoupon: null };
    const total = cart.items.reduce((sum, item) => {
      const price = item.product?.salePrice ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
    return {
      itemCount: cart.items.length,
      items: cart.items.map((item) => ({ quantity: item.quantity, product: compactImages(item.product) })),
      total: +total.toFixed(2),
      appliedCoupon: cart.appliedCoupon || null,
    };
  },
};