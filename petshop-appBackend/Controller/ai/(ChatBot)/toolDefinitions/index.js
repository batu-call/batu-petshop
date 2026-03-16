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
      description: "Returns order count summary: {total, pending, shipped, delivered, cancelled}. Use for 'my orders', 'order history', 'how many orders'. Does NOT return order details — user must visit /my-orders for details.",
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
      description: "User's saved favorites.",
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
];