import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL,    
      pass: process.env.SMTP_PASSWORD,
    },
  });

 
  await transporter.sendMail({
    from: `"Your App Name" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject,
    text: message,
  });
};

export default sendEmail;
