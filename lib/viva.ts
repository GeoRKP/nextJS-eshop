/**
 * Viva.com (Viva Wallet) Smart Checkout API client.
 *
 * Docs:
 *  - OAuth2: https://developer.viva.com/integration-reference/oauth2-authentication/
 *  - Create payment order: https://developer.viva.com/tutorials/payments/create-a-payment-order/
 *  - Smart Checkout integration: https://developer.viva.com/smart-checkout/smart-checkout-integration/
 *  - Webhooks: https://developer.viva.com/webhooks-for-payments/
 */

type VivaEnv = "demo" | "production";

function vivaEnv(): VivaEnv {
  return process.env.VIVA_ENV === "production" ? "production" : "demo";
}

export function vivaAccountsBase(): string {
  return vivaEnv() === "production"
    ? "https://accounts.vivapayments.com"
    : "https://demo-accounts.vivapayments.com";
}

export function vivaApiBase(): string {
  return vivaEnv() === "production"
    ? "https://api.vivapayments.com"
    : "https://demo-api.vivapayments.com";
}

export function vivaCheckoutBase(): string {
  return vivaEnv() === "production"
    ? "https://www.vivapayments.com"
    : "https://demo.vivapayments.com";
}

/**
 * Build the Smart Checkout redirect URL for a given orderCode.
 * orderCode is treated as a string to preserve precision (it can exceed JS MAX_SAFE_INTEGER).
 */
export function vivaCheckoutUrl(orderCode: string, color?: string): string {
  const params = new URLSearchParams({ ref: orderCode });
  if (color) params.set("color", color);
  return `${vivaCheckoutBase()}/web/checkout?${params.toString()}`;
}

// ── OAuth2 token (cached in-memory, refreshed before expiry) ──

type TokenCache = {
  accessToken: string;
  expiresAt: number; // epoch ms
};

let cachedToken: TokenCache | null = null;

async function fetchAccessToken(): Promise<string> {
  const clientId = process.env.VIVA_CLIENT_ID;
  const clientSecret = process.env.VIVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Viva credentials. Set VIVA_CLIENT_ID and VIVA_CLIENT_SECRET."
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${vivaAccountsBase()}/connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Viva OAuth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  // Refresh 60s before actual expiry to avoid edge-of-token requests.
  const safetyMs = 60_000;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - safetyMs,
  };
  return data.access_token;
}

// Share one in-flight token request so concurrent callers after expiry don't
// stampede the OAuth endpoint.
let inflightToken: Promise<string> | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }
  if (!inflightToken) {
    inflightToken = fetchAccessToken().finally(() => {
      inflightToken = null;
    });
  }
  return inflightToken;
}

// ── Create payment order ──

export type VivaCustomer = {
  email?: string;
  fullName?: string;
  phone?: string;
  countryCode?: string;
  requestLang?: string;
};

export type CreatePaymentOrderInput = {
  /** Amount in **cents** (integer). e.g. €10.50 → 1050 */
  amount: number;
  /** Visible to the customer on the checkout page. */
  customerTrns: string;
  /** Free-text identifier we use to find the order on our side (we put the orderId here). */
  merchantTrns: string;
  customer?: VivaCustomer;
  /** Code of the Payment Source created in the Viva self-care portal. */
  sourceCode: string;
  /** Seconds the checkout link stays valid. Default 1800 (30m). */
  paymentTimeout?: number;
  /** Disable cash payments (Viva Spot). */
  disableCash?: boolean;
  /** Disable Viva Wallet payment method. */
  disableWallet?: boolean;
  /** Tags useful for reporting. */
  tags?: string[];
};

export type CreatePaymentOrderResponse = {
  /** Numeric in JSON, but exceeds Number.MAX_SAFE_INTEGER — we keep it as string. */
  orderCode: string;
};

export async function createPaymentOrder(
  input: CreatePaymentOrderInput
): Promise<CreatePaymentOrderResponse> {
  const token = await getAccessToken();

  const body = {
    amount: input.amount,
    customerTrns: input.customerTrns,
    merchantTrns: input.merchantTrns,
    customer: input.customer,
    // NOTE: the Viva field is `paymentTimeout` (lowercase "o"). The previous
    // `paymentTimeOut` spelling was silently ignored by the API.
    paymentTimeout: input.paymentTimeout ?? 1800,
    preauth: false,
    allowRecurring: false,
    maxInstallments: 0,
    paymentNotification: true,
    tipAmount: 0,
    disableExactAmount: false,
    disableCash: input.disableCash ?? true,
    disableWallet: input.disableWallet ?? false,
    sourceCode: input.sourceCode,
    tags: input.tags ?? [],
  };

  const res = await fetch(`${vivaApiBase()}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Viva create order failed (${res.status}): ${raw}`);
  }

  // Parse orderCode as string to avoid losing precision on the 16-digit number.
  // Case-insensitive: the create-order response field is PascalCase ("OrderCode")
  // while other v2 endpoints use camelCase — match either spelling.
  const orderCodeMatch = raw.match(/"orderCode"\s*:\s*(\d+)/i);
  if (!orderCodeMatch) {
    throw new Error(`Viva create order: orderCode missing in response: ${raw}`);
  }
  return { orderCode: orderCodeMatch[1] };
}

// ── Retrieve transaction (used to verify a payment server-side) ──

/**
 * Viva transaction StatusId values relevant to us.
 * Source: https://developer.viva.com/integration-reference/response-codes/
 */
export const VIVA_STATUS_FINAL = "F"; // captured/finalized — payment is real
export const VIVA_STATUS_AUTHORIZED = "A"; // authorized (pre-auth, not captured)
export const VIVA_STATUS_ERROR = "E"; // failed/error transaction

/**
 * Normalized transaction shape we use internally (camelCase). `amount` is in MAIN
 * currency units (euros), per Viva docs (e.g. 30.00, NOT 3000 cents).
 */
export type VivaTransaction = {
  email?: string;
  amount: number;
  orderCode: string;
  statusId: string;
  transactionId: string;
  merchantTrns?: string;
  customerTrns?: string;
  fullName?: string;
  cardNumber?: string;
  currencyCode?: string;
  insDate?: string;
};

/** Read the first defined value among several candidate keys (tolerates casing differences). */
function pick(
  obj: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

/**
 * Retrieve a transaction by its UUID. Used to verify the payment on return-URL and webhook.
 * Endpoint: GET /checkout/v2/transactions/{transactionId}
 *
 * Viva is inconsistent across endpoints: the modern checkout/v2 endpoint returns a FLAT
 * camelCase object ({ statusId, amount, orderCode, merchantTrns, ... }), while the legacy
 * /api/transactions endpoint returns { Transactions: [ { StatusId, Amount, ... } ] } in
 * PascalCase. We normalize BOTH shapes so verification works regardless of which is returned.
 */
export async function retrieveTransaction(
  transactionId: string
): Promise<VivaTransaction> {
  const token = await getAccessToken();
  const res = await fetch(
    `${vivaApiBase()}/checkout/v2/transactions/${encodeURIComponent(
      transactionId
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Viva retrieve transaction failed (${res.status}): ${text}`);
  }

  const body = (await res.json()) as Record<string, unknown>;

  // Unwrap a legacy { Transactions: [...] } array if present; otherwise the body IS the tx.
  const txArray = (body?.Transactions ?? body?.transactions) as
    | Record<string, unknown>[]
    | undefined;
  const node =
    Array.isArray(txArray) && txArray.length > 0 ? txArray[0] : body;

  if (!node || typeof node !== "object") {
    throw new Error(
      `Viva: unexpected transaction response for id ${transactionId}`
    );
  }

  const statusId = pick(node, "statusId", "StatusId");
  const amount = pick(node, "amount", "Amount");
  if (statusId === undefined || amount === undefined) {
    throw new Error(
      `Viva: transaction response missing statusId/amount for id ${transactionId}`
    );
  }

  return {
    email: pick(node, "email", "Email") as string | undefined,
    amount: Number(amount),
    orderCode: String(pick(node, "orderCode", "OrderCode") ?? ""),
    statusId: String(statusId),
    transactionId: String(
      pick(node, "transactionId", "TransactionId") ?? transactionId
    ),
    merchantTrns: pick(node, "merchantTrns", "MerchantTrns") as
      | string
      | undefined,
    customerTrns: pick(node, "customerTrns", "CustomerTrns") as
      | string
      | undefined,
    fullName: pick(node, "fullName", "FullName") as string | undefined,
    cardNumber: pick(node, "cardNumber", "CardNumber") as string | undefined,
    currencyCode: pick(node, "currencyCode", "CurrencyCode") as
      | string
      | undefined,
    insDate: pick(node, "insDate", "InsDate") as string | undefined,
  };
}
