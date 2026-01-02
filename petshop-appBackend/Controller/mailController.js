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
    from: "Website <onboarding@resend.dev>",
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
    from: "Website <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};