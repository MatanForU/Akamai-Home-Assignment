import { computeRisk, recommendAction, buildRationale } from "./scoring";
import type { Issue, IssueType, Area } from "./types";

interface RawIssue {
  id: string;
  method: Issue["method"];
  path: string;
  area: Area;
  issueType: IssueType;
  traffic7d: number;
  lastSeenMinutesAgo: number;
  authMethod: string;
  errorRate: number;
  specSnippet: Record<string, unknown> | null;
  observedSnippet: Record<string, unknown> | null;
  fieldDiffs: Issue["fieldDiffs"];
  sampleRequestBody?: Record<string, unknown>;
  sampleResponseBody?: Record<string, unknown>;
}

const raw: RawIssue[] = [
  {
    id: "iss-1",
    method: "POST",
    path: "/payments/refund",
    area: "Payments",
    issueType: "shadowApi",
    traffic7d: 24901,
    lastSeenMinutesAgo: 12,
    authMethod: "Bearer JWT (service account)",
    errorRate: 0.4,
    specSnippet: null,
    observedSnippet: {
      method: "POST",
      path: "/payments/refund",
      body: { amount: "number", orderId: "string", refundReason: "string", adminOverride: "boolean" },
    },
    fieldDiffs: [
      { field: "amount", status: "extra", observedType: "number" },
      { field: "orderId", status: "extra", observedType: "string" },
      { field: "refundReason", status: "extra", observedType: "string" },
      { field: "adminOverride", status: "extra", observedType: "boolean" },
    ],
    sampleRequestBody: { amount: 129.99, orderId: "ord_88213", refundReason: "customer_request", adminOverride: false },
    sampleResponseBody: { status: "refunded", refundId: "rf_5521" },
  },
  {
    id: "iss-2",
    method: "POST",
    path: "/users/{id}/impersonate",
    area: "Users",
    issueType: "shadowApi",
    traffic7d: 318,
    lastSeenMinutesAgo: 45,
    authMethod: "Bearer JWT (admin scope)",
    errorRate: 1.2,
    specSnippet: null,
    observedSnippet: { method: "POST", path: "/users/{id}/impersonate", body: { reason: "string" } },
    fieldDiffs: [{ field: "reason", status: "extra", observedType: "string" }],
    sampleRequestBody: { reason: "support_ticket_4471" },
    sampleResponseBody: { sessionToken: "•••redacted•••", expiresIn: 3600 },
  },
  {
    id: "iss-3",
    method: "PUT",
    path: "/users/{id}/profile",
    area: "Users",
    issueType: "undocumentedParam",
    traffic7d: 8120,
    lastSeenMinutesAgo: 30,
    authMethod: "Bearer JWT",
    errorRate: 0.1,
    specSnippet: { body: { name: "string", email: "string" } },
    observedSnippet: { body: { name: "string", email: "string", phoneNumber: "string", marketingOptIn: "boolean" } },
    fieldDiffs: [
      { field: "name", status: "match", specType: "string", observedType: "string" },
      { field: "email", status: "match", specType: "string", observedType: "string" },
      { field: "phoneNumber", status: "extra", observedType: "string" },
      { field: "marketingOptIn", status: "extra", observedType: "boolean" },
    ],
    sampleRequestBody: { name: "Dana Cohen", email: "dana@example.com", phoneNumber: "+1-555-0142", marketingOptIn: true },
    sampleResponseBody: { status: "updated" },
  },
  {
    id: "iss-4",
    method: "POST",
    path: "/payments/charge",
    area: "Payments",
    issueType: "paramMismatch",
    traffic7d: 41200,
    lastSeenMinutesAgo: 4,
    authMethod: "Bearer JWT (service account)",
    errorRate: 2.8,
    specSnippet: { body: { amount: "integer", currency: "string", cardToken: "string" } },
    observedSnippet: { body: { amount: "string", currency: "string", cardToken: "string" } },
    fieldDiffs: [
      { field: "amount", status: "mismatch", specType: "integer", observedType: "string", note: "Spec expects cents as integer; traffic sends a formatted string." },
      { field: "currency", status: "match", specType: "string", observedType: "string" },
      { field: "cardToken", status: "match", specType: "string", observedType: "string" },
    ],
    sampleRequestBody: { amount: "129.99", currency: "USD", cardToken: "tok_4242" },
    sampleResponseBody: { status: "charged", chargeId: "ch_9981" },
  },
  {
    id: "iss-5",
    method: "GET",
    path: "/orders/{id}/invoice",
    area: "Orders",
    issueType: "shadowApi",
    traffic7d: 1204,
    lastSeenMinutesAgo: 95,
    authMethod: "Bearer JWT",
    errorRate: 0.6,
    specSnippet: null,
    observedSnippet: { method: "GET", path: "/orders/{id}/invoice" },
    fieldDiffs: [],
    sampleResponseBody: { invoiceUrl: "https://files.example.com/inv_2291.pdf" },
  },
  {
    id: "iss-6",
    method: "GET",
    path: "/catalog/items/{id}/related",
    area: "Catalog",
    issueType: "shadowApi",
    traffic7d: 56,
    lastSeenMinutesAgo: 6200,
    authMethod: "None (public)",
    errorRate: 0.0,
    specSnippet: null,
    observedSnippet: { method: "GET", path: "/catalog/items/{id}/related" },
    fieldDiffs: [],
    sampleResponseBody: { items: ["sku_1021", "sku_1090"] },
  },
  {
    id: "iss-7",
    method: "DELETE",
    path: "/users/{id}",
    area: "Users",
    issueType: "ghostEndpoint",
    traffic7d: 0,
    lastSeenMinutesAgo: 60 * 24 * 9,
    authMethod: "Bearer JWT (admin scope)",
    errorRate: 0,
    specSnippet: { method: "DELETE", path: "/users/{id}" },
    observedSnippet: null,
    fieldDiffs: [],
  },
  {
    id: "iss-8",
    method: "POST",
    path: "/orders",
    area: "Orders",
    issueType: "undocumentedParam",
    traffic7d: 15870,
    lastSeenMinutesAgo: 8,
    authMethod: "Bearer JWT",
    errorRate: 0.3,
    specSnippet: { body: { items: "array", shippingAddress: "object" } },
    observedSnippet: { body: { items: "array", shippingAddress: "object", giftMessage: "string", couponCode: "string" } },
    fieldDiffs: [
      { field: "items", status: "match", specType: "array", observedType: "array" },
      { field: "shippingAddress", status: "match", specType: "object", observedType: "object" },
      { field: "giftMessage", status: "extra", observedType: "string" },
      { field: "couponCode", status: "extra", observedType: "string" },
    ],
    sampleRequestBody: { items: [{ sku: "sku_2210", qty: 2 }], shippingAddress: { city: "Tel Aviv" }, giftMessage: "Happy birthday!", couponCode: "WELCOME10" },
    sampleResponseBody: { orderId: "ord_99213", status: "created" },
  },
  {
    id: "iss-9",
    method: "GET",
    path: "/catalog/items",
    area: "Catalog",
    issueType: "staleParam",
    traffic7d: 92300,
    lastSeenMinutesAgo: 2,
    authMethod: "None (public)",
    errorRate: 0.05,
    specSnippet: { query: { category: "string", sortBy: "string", legacyFilter: "string" } },
    observedSnippet: { query: { category: "string", sortBy: "string" } },
    fieldDiffs: [
      { field: "category", status: "match", specType: "string", observedType: "string" },
      { field: "sortBy", status: "match", specType: "string", observedType: "string" },
      { field: "legacyFilter", status: "missing", specType: "string" },
    ],
  },
  {
    id: "iss-10",
    method: "POST",
    path: "/payments/methods",
    area: "Payments",
    issueType: "paramMismatch",
    traffic7d: 3760,
    lastSeenMinutesAgo: 20,
    authMethod: "Bearer JWT",
    errorRate: 4.1,
    specSnippet: { body: { cardNumber: "string", expiry: "string" } },
    observedSnippet: { body: { cardNumber: "string", expiry: "object" } },
    fieldDiffs: [
      { field: "cardNumber", status: "match", specType: "string", observedType: "string" },
      { field: "expiry", status: "mismatch", specType: "string", observedType: "object", note: "Traffic sends { month, year } object; spec expects a single 'MM/YY' string." },
    ],
    sampleRequestBody: { cardNumber: "•••• 4242", expiry: { month: 8, year: 2027 } },
    sampleResponseBody: { status: "error", code: "VALIDATION_FAILED" },
  },
  {
    id: "iss-11",
    method: "GET",
    path: "/orders/{id}/tracking",
    area: "Orders",
    issueType: "staleParam",
    traffic7d: 410,
    lastSeenMinutesAgo: 1500,
    authMethod: "Bearer JWT",
    errorRate: 0.2,
    specSnippet: { query: { carrier: "string" } },
    observedSnippet: { query: {} },
    fieldDiffs: [{ field: "carrier", status: "missing", specType: "string" }],
  },
  {
    id: "iss-12",
    method: "GET",
    path: "/catalog/items/{id}/legacy-pricing",
    area: "Catalog",
    issueType: "ghostEndpoint",
    traffic7d: 0,
    lastSeenMinutesAgo: 60 * 24 * 14,
    authMethod: "None (public)",
    errorRate: 0,
    specSnippet: { method: "GET", path: "/catalog/items/{id}/legacy-pricing" },
    observedSnippet: null,
    fieldDiffs: [],
  },
  {
    id: "iss-13",
    method: "POST",
    path: "/users/login",
    area: "Users",
    issueType: "paramMismatch",
    traffic7d: 58400,
    lastSeenMinutesAgo: 1,
    authMethod: "None (public)",
    errorRate: 6.3,
    specSnippet: { body: { email: "string", password: "string" } },
    observedSnippet: { body: { email: "string", password: "string", deviceFingerprint: "string" } },
    fieldDiffs: [
      { field: "email", status: "match", specType: "string", observedType: "string" },
      { field: "password", status: "match", specType: "string", observedType: "string" },
      { field: "deviceFingerprint", status: "extra", observedType: "string" },
    ],
    sampleRequestBody: { email: "dana@example.com", password: "••••••••", deviceFingerprint: "fp_a92e1c" },
    sampleResponseBody: { token: "•••redacted•••" },
  },
  {
    id: "iss-14",
    method: "GET",
    path: "/orders/{id}/cancel-reasons",
    area: "Orders",
    issueType: "shadowApi",
    traffic7d: 9,
    lastSeenMinutesAgo: 4000,
    authMethod: "Bearer JWT",
    errorRate: 0,
    specSnippet: null,
    observedSnippet: { method: "GET", path: "/orders/{id}/cancel-reasons" },
    fieldDiffs: [],
    sampleResponseBody: { reasons: ["out_of_stock", "customer_changed_mind"] },
  },
];

export const issues: Issue[] = raw.map((r) => {
  const risk = computeRisk(r.issueType, r.area, r.traffic7d, r.lastSeenMinutesAgo);
  const recommendedAction = recommendAction(r.issueType, risk.severity);
  const rationale = buildRationale(r.issueType, r.area, r.traffic7d, risk.severity);
  return {
    ...r,
    severity: risk.severity,
    recommendedAction,
    rationale,
    riskScore: risk.total,
  };
});

export const AREAS: Area[] = ["Payments", "Users", "Orders", "Catalog"];

export const SPEC_META = {
  name: "petstore-orders-platform-v3.yaml",
  uploadedAt: "2026-06-23",
  windowLabel: "Last 7 days",
  totalSpecEndpoints: 132,
  totalObservedEndpoints: 145,
  matchedEndpoints: 119,
};

export function matchScorePct(): number {
  return Math.round((SPEC_META.matchedEndpoints / SPEC_META.totalSpecEndpoints) * 100);
}
