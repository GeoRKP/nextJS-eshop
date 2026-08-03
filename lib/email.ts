// Plain server-only module (NOT "use server"): these helpers must not be
// callable over the wire — a public endpoint here would let anyone send
// branded emails (incl. spam to the admin) from our domain. Imported only
// by server actions and server modules.
import { resend, SENDER } from "./resend";
import {
  orderConfirmationEmail,
  passwordResetEmail,
  orderStatusEmail,
  lowStockAlertEmail,
  type OrderEmailData,
} from "./email-templates";

type SendArgs = { to: string | string[]; subject: string; html: string };

/**
 * Send via Resend and actually notice failures.
 *
 * The SDK does NOT throw on API errors — it resolves with `{ data: null, error }`.
 * A bare `await` in a try/catch therefore reported unverified domains, rate
 * limits and rejected recipients as success, so nothing was ever logged.
 *
 * Returns whether the message was accepted; callers stay best-effort.
 */
async function deliver(
  label: string,
  { to, subject, html }: SendArgs
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY not set — skipping ${label}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from: SENDER, to, subject, html });

    if (error) {
      console.error(`Resend rejected ${label}:`, {
        to,
        from: SENDER,
        name: error.name,
        message: error.message,
      });
      return false;
    }

    return true;
  } catch (error) {
    // Network/transport level — email failures must not break the order flow.
    console.error(`Failed to send ${label}:`, error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderEmailData
) {
  return deliver("order confirmation email", {
    to,
    subject: `Επιβεβαίωση Παραγγελίας — ${data.orderIdFormatted}`,
    html: orderConfirmationEmail(data),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  data: { name: string; resetUrl: string; expiresInMinutes: number }
) {
  return deliver("password reset email", {
    to,
    subject: "Επαναφορά Κωδικού",
    html: passwordResetEmail(data),
  });
}

export async function sendLowStockAlertEmail(data: {
  orderIdFormatted: string;
  items: { name: string; stock: number; threshold: number }[];
}) {
  return deliver("low-stock alert email", {
    to: process.env.ADMIN_EMAIL || "info@avl.gr",
    subject: `⚠ Χαμηλό απόθεμα — ${data.items.length} προϊόν(τα)`,
    html: lowStockAlertEmail(data),
  });
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
  return deliver("order status email", {
    to,
    subject: `Παραγγελία ${data.orderIdFormatted}`,
    html: orderStatusEmail(data),
  });
}
