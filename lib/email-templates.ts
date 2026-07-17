/**
 * Branded HTML email templates for AVL.
 * Uses inline CSS for maximum email client compatibility.
 * Industrial-editorial graphite + signal yellow aesthetic.
 */

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AVL";
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Brand colors (AVL graphite + signal yellow)
const COLORS = {
  bg: "#ffffff",
  foreground: "#0c1e42",
  muted: "#6b6c7d",
  accent: "#f4c430",
  accentDark: "#d4a820",
  border: "#e4e5ea",
  success: "#279d5a",
  destructive: "#dc2626",
  headerBg: "#0c1e42",
  headerText: "#ffffff",
  footerBg: "#f6f5f4",
};

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLORS.bg};border:1px solid ${COLORS.border};">
          <!-- Yellow signal bar -->
          <tr>
            <td style="background-color:${COLORS.accent};height:3px;line-height:3px;font-size:0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="background-color:${COLORS.headerBg};padding:28px 40px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:${COLORS.headerText};letter-spacing:4px;text-transform:uppercase;">▲ ${APP_NAME}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${COLORS.footerBg};padding:24px 40px;border-top:1px solid ${COLORS.border};">
              <p style="margin:0;font-size:12px;color:${COLORS.muted};text-align:center;line-height:1.6;">
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br/>
                <a href="${SERVER_URL}/privacy" style="color:${COLORS.muted};text-decoration:underline;">Privacy Policy</a>
                &nbsp;&middot;&nbsp;
                <a href="${SERVER_URL}/terms" style="color:${COLORS.muted};text-decoration:underline;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
    <tr>
      <td style="background-color:${COLORS.accent};text-align:center;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:700;color:${COLORS.foreground};text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${COLORS.border};margin:24px 0;" />`;
}

// ─── Order Confirmation ─────────────────────────────────────────

export interface OrderEmailData {
  orderId: string;
  orderIdFormatted: string;
  customerName: string;
  items: Array<{
    name: string;
    qty: number;
    price: string;
  }>;
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
  discountAmount?: string;
  couponCode?: string | null;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}

export function orderConfirmationEmail(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};font-size:14px;color:${COLORS.foreground};">
        ${item.name}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};font-size:14px;color:${COLORS.muted};text-align:center;white-space:nowrap;">
        x${item.qty}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};font-size:14px;color:${COLORS.foreground};text-align:right;font-weight:600;white-space:nowrap;">
        ${item.price}
      </td>
    </tr>`
    )
    .join("");

  const discountRow =
    data.discountAmount && Number(data.discountAmount) > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:${COLORS.success};">Discount${data.couponCode ? ` (${data.couponCode})` : ""}</td>
          <td style="padding:6px 0;font-size:13px;color:${COLORS.success};text-align:right;font-weight:600;">-${data.discountAmount}</td>
        </tr>`
      : "";

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${COLORS.foreground};letter-spacing:0.5px;">Επιβεβαίωση Παραγγελίας</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.muted};line-height:1.6;">
      ${data.customerName}, η παραγγελία σας έχει ληφθεί και βρίσκεται σε επεξεργασία.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:${COLORS.footerBg};padding:10px 20px;font-size:13px;color:${COLORS.muted};letter-spacing:1px;">
          ▲ ORDER <strong style="color:${COLORS.foreground};font-size:14px;">${data.orderIdFormatted}</strong>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;border-bottom:2px solid ${COLORS.foreground};font-size:11px;font-weight:700;color:${COLORS.muted};letter-spacing:1.5px;text-transform:uppercase;">Προϊόν</td>
        <td style="padding:8px 0;border-bottom:2px solid ${COLORS.foreground};font-size:11px;font-weight:700;color:${COLORS.muted};letter-spacing:1.5px;text-transform:uppercase;text-align:center;">Ποσ.</td>
        <td style="padding:8px 0;border-bottom:2px solid ${COLORS.foreground};font-size:11px;font-weight:700;color:${COLORS.muted};letter-spacing:1.5px;text-transform:uppercase;text-align:right;">Τιμή</td>
      </tr>
      ${itemRows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${COLORS.muted};">Μερικό Σύνολο</td>
        <td style="padding:6px 0;font-size:13px;color:${COLORS.foreground};text-align:right;font-weight:600;">${data.itemsPrice}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${COLORS.muted};">Μεταφορικά</td>
        <td style="padding:6px 0;font-size:13px;color:${COLORS.foreground};text-align:right;font-weight:600;">${Number(data.shippingPrice) === 0 ? "ΔΩΡΕΑΝ" : data.shippingPrice}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${COLORS.muted};">ΦΠΑ 24% (περιλαμβάνεται)</td>
        <td style="padding:6px 0;font-size:13px;color:${COLORS.foreground};text-align:right;font-weight:600;">${data.taxPrice}</td>
      </tr>
      ${discountRow}
      <tr>
        <td colspan="2" style="padding:0;"><hr style="border:none;border-top:1px solid ${COLORS.border};margin:12px 0;" /></td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:16px;font-weight:700;color:${COLORS.foreground};letter-spacing:0.5px;">Σύνολο</td>
        <td style="padding:8px 0;font-size:18px;font-weight:800;color:${COLORS.foreground};text-align:right;">${data.totalPrice}</td>
      </tr>
    </table>

    ${divider()}

    <h3 style="margin:0 0 12px;font-size:11px;font-weight:700;color:${COLORS.muted};letter-spacing:2px;text-transform:uppercase;">Διεύθυνση Αποστολής</h3>
    <p style="margin:0 0 4px;font-size:14px;color:${COLORS.foreground};font-weight:600;">${data.shippingAddress.fullName}</p>
    <p style="margin:0;font-size:13px;color:${COLORS.muted};line-height:1.6;">
      ${data.shippingAddress.address}<br/>
      ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br/>
      ${data.shippingAddress.country}
    </p>

    ${divider()}

    <h3 style="margin:0 0 8px;font-size:11px;font-weight:700;color:${COLORS.muted};letter-spacing:2px;text-transform:uppercase;">Μέθοδος Πληρωμής</h3>
    <p style="margin:0;font-size:14px;color:${COLORS.foreground};">${data.paymentMethod === "CashOnDelivery" ? "Αντικαταβολή" : data.paymentMethod}</p>

    ${primaryButton("Προβολή Παραγγελίας", `${SERVER_URL}/order/${data.orderId}`)}

    <p style="margin:0;font-size:12px;color:${COLORS.muted};text-align:center;line-height:1.5;">
      Για ερωτήσεις σχετικά με την παραγγελία σας, απαντήστε σε αυτό το email.
    </p>
  `;

  return baseLayout(content);
}

// ─── Password Reset ─────────────────────────────────────────────

export function passwordResetEmail(data: {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${COLORS.foreground};letter-spacing:0.5px;">Επαναφορά Κωδικού</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.muted};line-height:1.6;">
      Γεια σας ${data.name}, λάβαμε αίτημα για επαναφορά του κωδικού σας. Πατήστε το παρακάτω κουμπί για να ορίσετε νέο.
    </p>

    ${primaryButton("Επαναφορά Κωδικού", data.resetUrl)}

    <p style="margin:0 0 12px;font-size:13px;color:${COLORS.muted};text-align:center;line-height:1.5;">
      Ο σύνδεσμος λήγει σε <strong>${data.expiresInMinutes} λεπτά</strong>.
    </p>

    ${divider()}

    <p style="margin:0;font-size:12px;color:${COLORS.muted};line-height:1.6;">
      Εάν δεν ζητήσατε επαναφορά κωδικού, μπορείτε να αγνοήσετε αυτό το email. Ο κωδικός σας θα παραμείνει αμετάβλητος.
    </p>

    <p style="margin:16px 0 0;font-size:11px;color:${COLORS.muted};word-break:break-all;">
      Εάν το κουμπί δεν λειτουργεί, αντιγράψτε αυτόν τον σύνδεσμο:<br/>
      <a href="${data.resetUrl}" style="color:${COLORS.foreground};text-decoration:underline;">${data.resetUrl}</a>
    </p>
  `;

  return baseLayout(content);
}

// ─── Order Status Update ────────────────────────────────────────

export function orderStatusEmail(data: {
  customerName: string;
  orderId: string;
  orderIdFormatted: string;
  status: string;
  note?: string | null;
}): string {
  const statusLabels: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Επιβεβαιωμένη", color: COLORS.success },
    processing: { label: "Σε Επεξεργασία", color: "#e6a817" },
    shipped: { label: "Στάλθηκε", color: "#2563eb" },
    delivered: { label: "Παραδόθηκε", color: COLORS.success },
    cancelled: { label: "Ακυρώθηκε", color: COLORS.destructive },
  };

  const s = statusLabels[data.status] || {
    label: data.status,
    color: COLORS.muted,
  };

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${COLORS.foreground};letter-spacing:0.5px;">Ενημέρωση Παραγγελίας</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.muted};line-height:1.6;">
      ${data.customerName}, η κατάσταση της παραγγελίας σας έχει ενημερωθεί.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;width:100%;">
      <tr>
        <td style="background-color:${COLORS.footerBg};padding:16px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;color:${COLORS.muted};letter-spacing:1.5px;text-transform:uppercase;">Παραγγελία</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:${COLORS.foreground};">${data.orderIdFormatted}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0 0 4px;font-size:11px;color:${COLORS.muted};letter-spacing:1.5px;text-transform:uppercase;">Κατάσταση</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:${s.color};">${s.label}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${data.note ? `<p style="margin:0 0 24px;font-size:13px;color:${COLORS.muted};line-height:1.6;font-style:italic;">"${data.note}"</p>` : ""}

    ${primaryButton("Προβολή Παραγγελίας", `${SERVER_URL}/order/${data.orderId}`)}
  `;

  return baseLayout(content);
}
