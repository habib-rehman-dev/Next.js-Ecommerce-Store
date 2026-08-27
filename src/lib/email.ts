import "server-only";
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendWelcomeEmail(email: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Our Store" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Our Store! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to Our Store!</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hi there,
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thanks for subscribing to our newsletter! You'll now receive exclusive offers,
            early access to new collections, and <strong>10% off your first order</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourstore.com" 
               style="background-color: #000; color: #fff; padding: 12px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Start Shopping
            </a>
          </div>
          <p style="color: #555; font-size: 16px;">
            Use code: <strong style="color: #000;">WELCOME10</strong> at checkout!
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">
            You can unsubscribe anytime by clicking the link in future emails.
          </p>
        </div>
      `,
      text: `
        Welcome to Our Store!
        
        Thanks for subscribing! You'll receive exclusive offers and 10% off your first order.
        
        Use code: WELCOME10 at checkout!
        
        Start shopping: https://yourstore.com
      `,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}