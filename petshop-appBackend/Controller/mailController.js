import { Resend } from "resend";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";

export const sendMail = catchAsyncError(async (req, res) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  await resend.emails.send({
    from: "Batu <onboarding@resend.dev>",
    to: process.env.CONTACT_RECEIVER_MAIL,
    subject,
    html: `
      <h3>New Contact Form Message</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b> ${message}</p>
    `,
  });

  res.status(200).json({
    success: true,
    message: "Mail sent successfully!",
  });
});

export const sendAutoMail = async ({ to, subject, html }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Batu <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmationMail = async ({
  order,
  customerName,
  customerEmail,
}) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0;">
        <span style="font-weight: 600; color: #333;">${item.name}</span>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 700; color: #5a9677;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const shippingFee = order.shippingFee || 0;
  const subtotal = order.totalAmount - shippingFee;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #97cba9 0%, #7ab89a 100%); padding: 40px 30px; text-align: center;">
          <div style="font-size: 60px; margin-bottom: 12px;">✅</div>
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 900;">Order Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Thank you for your purchase</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 30px;">
          <p style="color: #555; font-size: 15px; margin: 0 0 8px;">Hi <strong>${customerName}</strong>,</p>
          <p style="color: #555; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
            Your order has been received and is being processed. We will notify you when it has been shipped.
          </p>

          <!-- Order ID Badge -->
          <div style="background: #f8fffe; border: 2px solid #97cba9; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #666; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Order ID</td>
                <td style="text-align: right; color: #5a9677; font-size: 18px; font-weight: 900; font-family: monospace;">#${orderId}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background: #fafafa; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="color: #999; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Shipping To</p>
            <p style="color: #333; font-weight: 700; margin: 0 0 4px; font-size: 15px;">${order.shippingAddress.fullName}</p>
            <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}${order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
            </p>
          </div>

          <!-- Order Items -->
          <h3 style="color: #333; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase;">Product</th>
                <th style="padding: 10px 8px; text-align: center; font-size: 12px; color: #999; text-transform: uppercase;">Qty</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #999; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="border-top: 2px solid #f0f0f0; padding-top: 16px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #666; font-size: 14px; padding: 4px 0;">Subtotal</td>
                <td style="text-align: right; color: #333; font-weight: 600; font-size: 14px; padding: 4px 0;">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #666; font-size: 14px; padding: 4px 0;">Shipping</td>
                <td style="text-align: right; color: #333; font-weight: 600; font-size: 14px; padding: 4px 0;">${shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 0;"><div style="border-top: 2px solid #97cba9; margin: 8px 0;"></div></td>
              </tr>
              <tr>
                <td style="color: #333; font-size: 16px; font-weight: 900; padding: 4px 0;">Total</td>
                <td style="text-align: right; color: #5a9677; font-size: 20px; font-weight: 900; padding: 4px 0;">$${order.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.FRONTEND_URL}/my-orders"
               style="background: linear-gradient(135deg, #97cba9, #7ab89a); color: white; text-decoration: none; padding: 14px 36px; border-radius: 25px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(151,203,169,0.4);">
              📦 View My Orders
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Petshop. All rights reserved.<br>
            If you have any questions, reply to this email.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  await sendAutoMail({
    to: customerEmail,
    subject: `Order Confirmed! #${orderId} 🎉`,
    html,
  });
};

export const sendShippedMail = async ({
  order,
  customerName,
  customerEmail,
}) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const tracking = order.tracking || {};

  const trackingSection = tracking.trackingNumber
    ? `
    <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 12px; padding: 20px 24px; margin: 24px 0;">
      <p style="color: #1d4ed8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">
        🚚 ${tracking.cargoCompany} Tracking Number
      </p>
      <p style="color: #1e3a8a; font-size: 22px; font-weight: 900; font-family: monospace; margin: 0 0 12px; letter-spacing: 2px;">
        ${tracking.trackingNumber}
      </p>
      ${
        tracking.estimatedDelivery
          ? `
        <p style="color: #3b82f6; font-size: 13px; margin: 0 0 16px;">
          📅 Estimated Delivery: <strong>${new Date(
            tracking.estimatedDelivery
          ).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</strong>
        </p>
      `
          : ""
      }
      ${
        tracking.trackingUrl
          ? `
        <a href="${tracking.trackingUrl}"
           style="background: #3b82f6; color: white; text-decoration: none; padding: 10px 24px; border-radius: 20px; font-weight: 700; font-size: 13px; display: inline-block;">
          Track on ${tracking.cargoCompany} →
        </a>
      `
          : ""
      }
    </div>
  `
    : `
    <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin: 24px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0;">Tracking information will be available soon.</p>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
          <div style="font-size: 60px; margin-bottom: 12px;">🚚</div>
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 900;">Your Order is On Its Way!</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Order #${orderId} has been shipped</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 30px;">
          <p style="color: #555; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
            Hi <strong>${customerName}</strong>,<br><br>
            Great news! Your order has been handed over to the courier and is on its way to you.
          </p>

          ${trackingSection}

          <!-- CTA -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL}/my-orders"
               style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; padding: 14px 36px; border-radius: 25px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(59,130,246,0.4);">
              📦 View My Orders
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Petshop. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  await sendAutoMail({
    to: customerEmail,
    subject: `Your Order Has Been Shipped! 🚚 #${orderId}`,
    html,
  });
};

export const sendCancellationMail = async ({ order, customerName, customerEmail }) => {
  await transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to: customerEmail,
    subject: `Order #${order._id.toString().slice(-6).toUpperCase()} Cancelled`,
    html: `
      <h2>Your order has been cancelled</h2>
      <p>Hi ${customerName},</p>
      <p>Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been cancelled.</p>
      ${order.paymentResult?.id ? `<p>A refund of <strong>$${order.totalAmount.toFixed(2)}</strong> has been initiated and will appear in your account within 5-10 business days.</p>` : ""}
      <p>If you have any questions, please contact us.</p>
    `,
  });
};
