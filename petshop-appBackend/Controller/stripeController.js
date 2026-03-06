import Stripe from "stripe";

let stripe;

const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
  }
  return stripe;
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, metadata = {} } = req.body;

    const {
      userId,
      items,
      shippingAddress,
      shippingFee,
      couponCode,
      discountPercent,
    } = metadata;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
     metadata: {
  userId: userId || "",
  shippingFee: String(shippingFee || 0),
  couponCode: couponCode || "",
  discountPercent: String(discountPercent || 0),
  itemCount: String(items?.length || 0),
}
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ message: "Payment creation failed" });
  }
};

export const createRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID required" });
    }

    const refund = await getStripe().refunds.create({
      payment_intent: paymentIntentId,
      ...(amount ? { amount: Math.round(amount * 100) } : {}),
    });

    res.json({ success: true, refund });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ message: "Refund failed", error: error.message });
  }
};

export { getStripe };