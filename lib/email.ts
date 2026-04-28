"use server";

import { resend, SENDER } from "./resend";
import {
  orderConfirmationEmail,
  passwordResetEmail,
  orderStatusEmail,
  type OrderEmailData,
} from "./email-templates";

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderEmailData
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }
  try {
    await resend.emails.send({
      from: SENDER,
      to,
      subject: `Επιβεβαίωση Παραγγελίας — ${data.orderIdFormatted}`,
      html: orderConfirmationEmail(data),
    });
  } catch (error) {
    // Email failures should not break the order flow
    console.error("Failed to send order confirmation email:", error);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  data: { name: string; resetUrl: string; expiresInMinutes: number }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping password reset email");
    return;
  }
  try {
    await resend.emails.send({
      from: SENDER,
      to,
      subject: "Επαναφορά Κωδικού",
      html: passwordResetEmail(data),
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

export async function sendOrderStatusEmail(
  to: string,
  data: {
    customerName: string;
    orderId: string;
    orderIdFormatted: string;
    status: string;
    note?: string | null;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping order status email");
    return;
  }
  try {
    await resend.emails.send({
      from: SENDER,
      to,
      subject: `Παραγγελία ${data.orderIdFormatted}`,
      html: orderStatusEmail(data),
    });
  } catch (error) {
    console.error("Failed to send order status email:", error);
  }
}
