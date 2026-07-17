/**
 * BOX NOW Partner API client (parcel-locker / courier last-mile delivery, GR/CY).
 *
 * BOX NOW is a SHIPPING provider, not a payment provider — it runs alongside the
 * existing payment methods (Viva/Stripe/PayPal/COD).
 *
 * Docs (HTML pages are bot-protected/403; the BG portal mirror renders the same spec):
 *  - Partner API:   https://boxnow.gr/en/docs/api/partner-api/
 *  - Authenticate:  https://boxnow.gr/en/docs/api/partner-api/authenticate-yourself
 *  - Request a delivery: https://boxnow.gr/en/docs/api/partner-api/request-a-delivery
 *  - Mirror (readable): https://t.boxnow.bg/en/diy/eshops/api
 *
 * Credentials are issued by BOX NOW onboarding (ict@boxnow.gr) — they are NOT self-service.
 *
 * NOTE: hostnames below default to the documented GR pattern but the exact base URL is
 * provided per-account in the onboarding email — override via BOXNOW_API_BASE /
 * BOXNOW_LOCATION_API_BASE when you receive them.
 */

type BoxNowEnv = "stage" | "production";

function boxnowEnv(): BoxNowEnv {
  return process.env.BOXNOW_ENV === "production" ? "production" : "stage";
}

export function boxnowApiBase(): string {
  if (process.env.BOXNOW_API_BASE) return process.env.BOXNOW_API_BASE.replace(/\/$/, "");
  return boxnowEnv() === "production"
    ? "https://api-production.boxnow.gr"
    : "https://api-stage.boxnow.gr";
}

export function boxnowLocationApiBase(): string {
  if (process.env.BOXNOW_LOCATION_API_BASE)
    return process.env.BOXNOW_LOCATION_API_BASE.replace(/\/$/, "");
  return boxnowEnv() === "production"
    ? "https://locationapi-production.boxnow.gr"
    : "https://locationapi-stage.boxnow.gr";
}

function partnerIdHeader(): Record<string, string> {
  // Only needed when the account is linked to multiple partners (otherwise "Ambiguous partner").
  const id = process.env.BOXNOW_PARTNER_ID;
  return id ? { "X-PartnerID": id } : {};
}

// ── OAuth2 token (client_credentials, cached in-memory, refreshed before expiry) ──

type TokenCache = {
  accessToken: string;
  expiresAt: number; // epoch ms
};

let cachedToken: TokenCache | null = null;

async function fetchAccessToken(): Promise<string> {
  const clientId = process.env.BOXNOW_CLIENT_ID;
  const clientSecret = process.env.BOXNOW_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Box Now credentials. Set BOXNOW_CLIENT_ID and BOXNOW_CLIENT_SECRET."
    );
  }

  const res = await fetch(`${boxnowApiBase()}/api/v1/auth-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Box Now auth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new Error("Box Now auth: missing access_token in response");
  }

  const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 3600;
  const safetyMs = 60_000; // refresh 60s early
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresInSec * 1000 - safetyMs,
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

async function authedFetch(
  path: string,
  init: RequestInit & { rawBase?: string } = {}
): Promise<Response> {
  const token = await getAccessToken();
  const base = init.rawBase ?? boxnowApiBase();
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...partnerIdHeader(),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

// ── Destinations (lockers) ──

export type BoxNowLocker = {
  id: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  note?: string;
};

type RawLocker = Record<string, unknown>;

function normalizeLocker(raw: RawLocker): BoxNowLocker {
  const num = (v: unknown) => (v === undefined || v === null ? undefined : Number(v));
  return {
    id: String(raw.id ?? raw.boxnowLockerId ?? raw.locationId ?? ""),
    name: String(raw.name ?? raw.title ?? raw.id ?? ""),
    addressLine1: raw.addressLine1 as string | undefined,
    addressLine2: raw.addressLine2 as string | undefined,
    postalCode: (raw.postalCode ?? raw.zipCode) as string | undefined,
    city: raw.city as string | undefined,
    country: raw.country as string | undefined,
    lat: num(raw.lat ?? raw.latitude),
    lng: num(raw.lng ?? raw.longitude),
    note: raw.note as string | undefined,
  };
}

/**
 * List APM lockers BOX NOW can deliver to. Optionally filter near a point.
 * Endpoint: GET /api/v1/destinations (params: latlng, radius, requiredSize, locationType).
 */
export async function listDestinations(params?: {
  latlng?: string; // "lat,lng"
  radius?: number; // meters
  requiredSize?: number; // 1/2/3
}): Promise<BoxNowLocker[]> {
  const qs = new URLSearchParams();
  if (params?.latlng) qs.set("latlng", params.latlng);
  if (params?.radius) qs.set("radius", String(params.radius));
  if (params?.requiredSize) qs.set("requiredSize", String(params.requiredSize));
  qs.set("locationType", "apm");

  const res = await authedFetch(`/api/v1/destinations?${qs.toString()}`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Box Now destinations failed (${res.status}): ${text}`);
  }
  const body = (await res.json()) as unknown;
  // Tolerate { data: [...] } or a bare array.
  const arr = Array.isArray(body)
    ? body
    : ((body as { data?: RawLocker[] })?.data ?? []);
  return (arr as RawLocker[]).map(normalizeLocker).filter((l) => l.id);
}

// ── Create delivery request (voucher) ──

export type BoxNowContact = {
  contactName: string;
  contactNumber: string; // full international format, e.g. +30...
  contactEmail: string;
};

export type BoxNowItem = {
  id: string; // our own unique reference (order id + index)
  name: string;
  value?: string; // decimal string
  weight?: number; // pass 0 if unknown
  /** Locker compartment size 1/2/3 (small/medium/large). Required by the API
   *  when the origin is an Any-APM warehouse — omitting it yields P406. */
  compartmentSize?: number;
};

function defaultCompartmentSize(): number {
  const n = Number(process.env.BOXNOW_COMPARTMENT_SIZE);
  return n === 1 || n === 2 || n === 3 ? n : 2;
}

export type CreateDeliveryRequestInput = {
  orderNumber: string; // must be unique (our order id); duplicate => P410
  invoiceValue: string; // decimal string e.g. "25.50"
  /** "0.00" for prepaid; the cash amount for COD (requires COD eligibility). */
  amountToBeCollected?: string;
  /** Box Now payment mode. "prepaid" for prepaid orders. */
  paymentMode?: string;
  allowReturn?: boolean;
  destinationLockerId: string;
  recipient: BoxNowContact;
  items: BoxNowItem[];
};

export type CreateDeliveryRequestResult = {
  referenceNumber: string;
  parcelIds: string[];
};

function senderContact(): BoxNowContact {
  return {
    contactName: process.env.BOXNOW_SENDER_NAME || process.env.NEXT_PUBLIC_APP_NAME || "Shop",
    contactNumber: process.env.BOXNOW_SENDER_PHONE || "",
    contactEmail: process.env.BOXNOW_SENDER_EMAIL || process.env.SENDER_EMAIL || "",
  };
}

export async function createDeliveryRequest(
  input: CreateDeliveryRequestInput
): Promise<CreateDeliveryRequestResult> {
  const originLocationId = process.env.BOXNOW_ORIGIN_LOCATION_ID;
  if (!originLocationId) {
    throw new Error(
      "Box Now origin is not configured. Set BOXNOW_ORIGIN_LOCATION_ID (from GET /api/v1/origins)."
    );
  }

  const sender = senderContact();

  const body = {
    orderNumber: input.orderNumber,
    invoiceValue: input.invoiceValue,
    paymentMode: input.paymentMode ?? "prepaid",
    amountToBeCollected: input.amountToBeCollected ?? "0.00",
    allowReturn: input.allowReturn ?? true,
    origin: {
      contactName: sender.contactName,
      contactNumber: sender.contactNumber,
      contactEmail: sender.contactEmail,
      locationId: originLocationId,
    },
    destination: {
      contactName: input.recipient.contactName,
      contactNumber: input.recipient.contactNumber,
      contactEmail: input.recipient.contactEmail,
      locationId: input.destinationLockerId,
    },
    items: input.items.map((it) => ({
      id: it.id,
      name: it.name,
      value: it.value ?? "0",
      weight: it.weight ?? 0,
      compartmentSize: it.compartmentSize ?? defaultCompartmentSize(),
    })),
  };

  const res = await authedFetch(`/api/v1/delivery-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Box Now create delivery failed (${res.status}): ${raw}`);
  }

  // Response shape (confirmed against stage): { id: "92024", parcels: [{ id: "..." }] }
  let parsed: {
    id?: string | number;
    referenceNumber?: string;
    parcels?: { id?: string }[];
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Box Now create delivery: invalid JSON response: ${raw}`);
  }

  return {
    referenceNumber: String(parsed.referenceNumber ?? parsed.id ?? input.orderNumber),
    parcelIds: (parsed.parcels ?? [])
      .map((p) => p?.id)
      .filter((id): id is string => Boolean(id)),
  };
}

// ── Label (voucher PDF) ──

/** Fetch the printable label PDF for one parcel.
 *  (The delivery-request-level label endpoint 404s on stage — labels are per parcel.) */
export async function getParcelLabelPdf(parcelId: string): Promise<ArrayBuffer> {
  const res = await authedFetch(
    `/api/v1/parcels/${encodeURIComponent(parcelId)}/label.pdf`,
    { method: "GET", headers: { Accept: "application/pdf" } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Box Now label failed (${res.status}): ${text}`);
  }
  return res.arrayBuffer();
}

// ── Cancel / track ──

export async function cancelParcel(parcelId: string): Promise<void> {
  const res = await authedFetch(
    `/api/v1/parcels/${encodeURIComponent(parcelId)}:cancel`,
    { method: "POST" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Box Now cancel parcel failed (${res.status}): ${text}`);
  }
}

export type BoxNowParcelStatus = {
  id: string;
  status: string;
};

/** List parcels for a delivery request (polling fallback for status if webhooks are unavailable). */
export async function listParcels(orderNumber?: string): Promise<BoxNowParcelStatus[]> {
  const qs = orderNumber ? `?orderNumber=${encodeURIComponent(orderNumber)}` : "";
  const res = await authedFetch(`/api/v1/parcels${qs}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Box Now list parcels failed (${res.status}): ${text}`);
  }
  const body = (await res.json()) as unknown;
  const arr = Array.isArray(body)
    ? body
    : ((body as { data?: Record<string, unknown>[] })?.data ?? []);
  return (arr as Record<string, unknown>[]).map((p) => ({
    id: String(p.id ?? ""),
    status: String(p.status ?? ""),
  }));
}
