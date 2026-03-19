const SUB_ENUM = ["Food","Bed","Toy","Litter","Accessory","Leash","Cage","Tank","Filter","Decoration","Habitat","Lighting","Saddle","Care"];
const CAT_ENUM = ["Dog","Cat","Bird","Fish","Reptile","Rabbit","Horse"];

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Search products by keyword in product_name and description. Always pass query + subCategory together. If results=[], say 'We don't carry [X]' then call browseProducts. Hamster→Rabbit. Use brand name as query for brand questions.",
      parameters: {
        type: "object",
        properties: {
          query:       { type: "string" },
          category:    { type: "string", enum: CAT_ENUM },
          subCategory: { type: "string", enum: SUB_ENUM },
          onSale:      { type: "boolean" },
          limit:       { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browseProducts",
      description: "Browse products sorted by price_high, price_low, popular, newest, featured. Fallback when searchProducts returns empty.",
      parameters: {
        type: "object",
        properties: {
          sortBy:      { type: "string", enum: ["price_high","price_low","popular","newest","featured"] },
          category:    { type: "string", enum: CAT_ENUM },
          subCategory: { type: "string", enum: SUB_ENUM },
          limit:       { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filterProducts",
      description: "Filter by price range, category, subCategory, sale, min rating, sort.",
      parameters: {
        type: "object",
        properties: {
          category:    { type: "string", enum: CAT_ENUM },
          subCategory: { type: "string", enum: SUB_ENUM },
          minPrice:    { type: "number" },
          maxPrice:    { type: "number" },
          onSale:      { type: "boolean" },
          minRating:   { type: "number" },
          sortBy:      { type: "string", enum: ["default","price-asc","price-desc","rating","name-asc","name-desc","popular","newest"] },
          limit:       { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getHotDeals",
      description: "Products currently on sale (salePrice set).",
      parameters: { type: "object", properties: { limit: { type: "number" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "getShippingSettings",
      description: "Shipping fee and free shipping threshold.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getSimilarProducts",
      description: "Similar products by subCategory then category.",
      parameters: {
        type: "object",
        properties: {
          productId:   { type: "string" },
          category:    { type: "string", enum: CAT_ENUM },
          subCategory: { type: "string", enum: SUB_ENUM },
          limit:       { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTopRatedProducts",
      description: "Highest-rated products. Use for 'best rated', 'top reviewed', 'recommended'.",
      parameters: {
        type: "object",
        properties: {
          category:    { type: "string", enum: CAT_ENUM },
          subCategory: { type: "string", enum: SUB_ENUM },
          limit:       { type: "number" },
          minRating:   { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPriceRange",
      description: "Min/max/avg price for a category/subCategory.",
      parameters: {
        type: "object",
        properties: {
          category:    { type: "string", enum: CAT_ENUM },
          subCategory: { type: "string", enum: SUB_ENUM },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkDiscountAvailability",
      description: "Active coupons: count, max%, min spend. Never reveal codes.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserOrders",
      description: "Returns order count summary: {total, pending, shipped, delivered, cancelled}. Use for 'my orders', 'order history', 'how many orders'. Does NOT return order details.",
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
      name: "getUserFavorites",
      description: "User's saved favorites. Use for 'my favorites', 'saved items', 'wishlist'.",
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
      description: "User's cart items, total, applied coupon.",
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
      description: "Get full details of a specific order including items, status, tracking, shipping address. Use when user asks about a specific order or mentions an order ID.",
      parameters: {
        type: "object",
        properties: {
          userId:  { type: "string" },
          orderId: { type: "string" },
        },
        required: ["userId", "orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "requestCancellation",
      description: "Request cancellation for a pending or paid order. Use when user wants to cancel an order. Only works for pending/paid orders.",
      parameters: {
        type: "object",
        properties: {
          userId:  { type: "string" },
          orderId: { type: "string" },
          reason:  { type: "string" },
        },
        required: ["userId", "orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductDetail",
      description: "Get full details of a single product including description, features, stock, rating. Use when user asks about a specific product.",
      parameters: {
        type: "object",
        properties: {
          slug:      { type: "string" },
          productId: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductReviews",
      description: "Get customer reviews and rating summary for a product. Use when user asks 'is this good', 'what do people say', 'reviews for X'.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          limit:     { type: "number" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPersonalizedRecommendations",
      description: "Get personalized product recommendations based on user's purchase history and favorites. Use for 'recommend me something', 'what should I buy', 'suggestions for me'.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          limit:  { type: "number" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addToCart",
      description: "Add a product to user's cart. Use when user says 'add to cart', 'I want to buy X', 'put X in my cart'. Requires userId and productId.",
      parameters: {
        type: "object",
        properties: {
          userId:    { type: "string" },
          productId: { type: "string" },
          quantity:  { type: "number" },
        },
        required: ["userId", "productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addToFavorites",
      description: "Add a product to user's favorites. Use when user says 'save this', 'add to favorites', 'I like this'. Requires userId and productId.",
      parameters: {
        type: "object",
        properties: {
          userId:    { type: "string" },
          productId: { type: "string" },
        },
        required: ["userId", "productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createSupportTicket",
      description: "Create a support ticket for user issues. Use when: item arrived damaged, package missing, wants to return, payment problem, order issue. Always collect a description before calling.",
      parameters: {
        type: "object",
        properties: {
          userId:    { type: "string" },
          userName:  { type: "string" },
          userEmail: { type: "string" },
          subject:   { type: "string" },
          message:   { type: "string" },
          orderId:   { type: "string" },
          category:  { type: "string", enum: ["damaged","missing","return","order","payment","product","other"] },
        },
        required: ["message", "category"],
      },
    },
  },
];