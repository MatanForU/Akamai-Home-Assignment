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
  // ── Pet ─────────────────────────────────────────────────────────────────
  {
    id: "iss-1",
    method: "POST",
    path: "/pet",
    area: "Pet",
    issueType: "paramMismatch",
    traffic7d: 38400,
    lastSeenMinutesAgo: 3,
    authMethod: "OAuth2 petstore_auth (write:pets)",
    errorRate: 2.1,
    specSnippet: { body: { name: "string", photoUrls: "array", status: "string" } },
    observedSnippet: { body: { name: "string", photoUrls: "array", status: "integer" } },
    fieldDiffs: [
      { field: "name", status: "match", specType: "string", observedType: "string" },
      { field: "photoUrls", status: "match", specType: "array", observedType: "array" },
      { field: "status", status: "mismatch", specType: "string", observedType: "integer", note: "Spec expects 'available'|'pending'|'sold' enum string; traffic sends numeric status code." },
    ],
    sampleRequestBody: { name: "doggie", photoUrls: ["https://cdn.example.com/dog1.jpg"], status: 1 },
    sampleResponseBody: { id: 10, name: "doggie", status: "available" },
  },
  {
    id: "iss-2",
    method: "PUT",
    path: "/pet",
    area: "Pet",
    issueType: "undocumentedParam",
    traffic7d: 12700,
    lastSeenMinutesAgo: 18,
    authMethod: "OAuth2 petstore_auth (write:pets)",
    errorRate: 0.8,
    specSnippet: { body: { id: "integer", name: "string", status: "string" } },
    observedSnippet: { body: { id: "integer", name: "string", status: "string", internalTag: "string", updatedBy: "string" } },
    fieldDiffs: [
      { field: "id", status: "match", specType: "integer", observedType: "integer" },
      { field: "name", status: "match", specType: "string", observedType: "string" },
      { field: "status", status: "match", specType: "string", observedType: "string" },
      { field: "internalTag", status: "extra", observedType: "string" },
      { field: "updatedBy", status: "extra", observedType: "string" },
    ],
    sampleRequestBody: { id: 10, name: "doggie", status: "available", internalTag: "featured", updatedBy: "admin_7" },
    sampleResponseBody: { id: 10, name: "doggie", status: "available" },
  },
  {
    id: "iss-3",
    method: "GET",
    path: "/pet/findByStatus",
    area: "Pet",
    issueType: "staleParam",
    traffic7d: 67200,
    lastSeenMinutesAgo: 5,
    authMethod: "OAuth2 petstore_auth (read:pets)",
    errorRate: 0.1,
    specSnippet: { query: { status: "string" } },
    observedSnippet: { query: {} },
    fieldDiffs: [
      { field: "status", status: "missing", specType: "string", note: "Required query param 'status' is absent in most observed traffic; clients appear to omit it." },
    ],
  },
  {
    id: "iss-4",
    method: "GET",
    path: "/pet/findByTags",
    area: "Pet",
    issueType: "shadowApi",
    traffic7d: 4310,
    lastSeenMinutesAgo: 55,
    authMethod: "OAuth2 petstore_auth (read:pets)",
    errorRate: 0.3,
    specSnippet: null,
    observedSnippet: { method: "GET", path: "/pet/findByTags", query: { tags: "array", breed: "string" } },
    fieldDiffs: [
      { field: "breed", status: "extra", observedType: "string" },
    ],
    sampleResponseBody: { pets: [{ id: 5, name: "Max", status: "available" }] },
  },
  {
    id: "iss-5",
    method: "DELETE",
    path: "/pet/{petId}",
    area: "Pet",
    issueType: "undocumentedParam",
    traffic7d: 2890,
    lastSeenMinutesAgo: 40,
    authMethod: "OAuth2 petstore_auth (write:pets)",
    errorRate: 0.5,
    specSnippet: { header: { api_key: "string" }, path: { petId: "integer" } },
    observedSnippet: { header: { api_key: "string", "X-Reason": "string" }, path: { petId: "integer" } },
    fieldDiffs: [
      { field: "api_key", status: "match", specType: "string", observedType: "string" },
      { field: "petId", status: "match", specType: "integer", observedType: "integer" },
      { field: "X-Reason", status: "extra", observedType: "string" },
    ],
    sampleRequestBody: { petId: 198, "X-Reason": "adoption_completed" },
    sampleResponseBody: { message: "Pet deleted" },
  },
  {
    id: "iss-6",
    method: "POST",
    path: "/pet/{petId}/uploadImage",
    area: "Pet",
    issueType: "paramMismatch",
    traffic7d: 8950,
    lastSeenMinutesAgo: 22,
    authMethod: "OAuth2 petstore_auth (write:pets)",
    errorRate: 3.7,
    specSnippet: { body: { file: "binary" }, query: { additionalMetadata: "string" } },
    observedSnippet: { body: { file: "string (base64)" }, query: { additionalMetadata: "string" } },
    fieldDiffs: [
      { field: "file", status: "mismatch", specType: "binary (octet-stream)", observedType: "string (base64)", note: "Spec requires multipart binary upload; clients send base64-encoded string in JSON body." },
      { field: "additionalMetadata", status: "match", specType: "string", observedType: "string" },
    ],
    sampleRequestBody: { file: "data:image/jpeg;base64,/9j/4AAQ...", additionalMetadata: "profile photo" },
    sampleResponseBody: { code: 200, message: "uploaded" },
  },
  // ── Store ────────────────────────────────────────────────────────────────
  {
    id: "iss-7",
    method: "POST",
    path: "/store/order",
    area: "Store",
    issueType: "paramMismatch",
    traffic7d: 51800,
    lastSeenMinutesAgo: 2,
    authMethod: "None (public)",
    errorRate: 4.9,
    specSnippet: { body: { petId: "integer", quantity: "integer", shipDate: "string (date-time)", status: "string" } },
    observedSnippet: { body: { petId: "integer", quantity: "string", shipDate: "string (date-time)", status: "string" } },
    fieldDiffs: [
      { field: "petId", status: "match", specType: "integer", observedType: "integer" },
      { field: "quantity", status: "mismatch", specType: "integer (int32)", observedType: "string", note: "Spec expects int32; traffic sends quantity as a string ('\"2\"' instead of 2)." },
      { field: "shipDate", status: "match", specType: "string (date-time)", observedType: "string (date-time)" },
      { field: "status", status: "match", specType: "string", observedType: "string" },
    ],
    sampleRequestBody: { petId: 198772, quantity: "2", shipDate: "2026-07-10T09:00:00Z", status: "placed" },
    sampleResponseBody: { id: 7, status: "placed" },
  },
  {
    id: "iss-8",
    method: "GET",
    path: "/store/inventory",
    area: "Store",
    issueType: "shadowApi",
    traffic7d: 890,
    lastSeenMinutesAgo: 130,
    authMethod: "API key (api_key header)",
    errorRate: 0.0,
    specSnippet: null,
    observedSnippet: { method: "GET", path: "/store/inventory", query: { format: "string" } },
    fieldDiffs: [
      { field: "format", status: "extra", observedType: "string" },
    ],
    sampleResponseBody: { available: 12, pending: 3, sold: 8 },
  },
  {
    id: "iss-9",
    method: "GET",
    path: "/store/order/{orderId}",
    area: "Store",
    issueType: "staleParam",
    traffic7d: 23100,
    lastSeenMinutesAgo: 9,
    authMethod: "None (public)",
    errorRate: 0.2,
    specSnippet: { path: { orderId: "integer" }, response: { id: "integer", petId: "integer", quantity: "integer", status: "string", complete: "boolean" } },
    observedSnippet: { path: { orderId: "integer" }, response: { id: "integer", petId: "integer", quantity: "integer", status: "string" } },
    fieldDiffs: [
      { field: "complete", status: "missing", specType: "boolean", note: "The 'complete' field defined in the spec is never present in observed responses." },
    ],
    sampleResponseBody: { id: 7, petId: 198772, quantity: 2, status: "approved" },
  },
  {
    id: "iss-10",
    method: "DELETE",
    path: "/store/order/{orderId}",
    area: "Store",
    issueType: "ghostEndpoint",
    traffic7d: 0,
    lastSeenMinutesAgo: 60 * 24 * 11,
    authMethod: "None (public)",
    errorRate: 0,
    specSnippet: { method: "DELETE", path: "/store/order/{orderId}" },
    observedSnippet: null,
    fieldDiffs: [],
  },
  // ── User ─────────────────────────────────────────────────────────────────
  {
    id: "iss-11",
    method: "GET",
    path: "/user/login",
    area: "User",
    issueType: "undocumentedParam",
    traffic7d: 74600,
    lastSeenMinutesAgo: 1,
    authMethod: "None (public)",
    errorRate: 5.8,
    specSnippet: { query: { username: "string", password: "string" } },
    observedSnippet: { query: { username: "string", password: "string", deviceId: "string", mfaToken: "string" } },
    fieldDiffs: [
      { field: "username", status: "match", specType: "string", observedType: "string" },
      { field: "password", status: "match", specType: "string", observedType: "string" },
      { field: "deviceId", status: "extra", observedType: "string" },
      { field: "mfaToken", status: "extra", observedType: "string" },
    ],
    sampleRequestBody: { username: "theUser", password: "••••••••", deviceId: "dev_a92e1c", mfaToken: "382910" },
    sampleResponseBody: { token: "•••redacted•••" },
  },
  {
    id: "iss-12",
    method: "PUT",
    path: "/user/{username}",
    area: "User",
    issueType: "paramMismatch",
    traffic7d: 9340,
    lastSeenMinutesAgo: 25,
    authMethod: "None (logged-in user)",
    errorRate: 1.4,
    specSnippet: { body: { id: "integer", username: "string", firstName: "string", lastName: "string", email: "string", userStatus: "integer" } },
    observedSnippet: { body: { id: "string", username: "string", firstName: "string", lastName: "string", email: "string", userStatus: "integer" } },
    fieldDiffs: [
      { field: "id", status: "mismatch", specType: "integer (int64)", observedType: "string", note: "Spec defines id as int64; clients send it as a string UUID." },
      { field: "username", status: "match", specType: "string", observedType: "string" },
      { field: "firstName", status: "match", specType: "string", observedType: "string" },
      { field: "lastName", status: "match", specType: "string", observedType: "string" },
      { field: "email", status: "match", specType: "string", observedType: "string" },
      { field: "userStatus", status: "match", specType: "integer", observedType: "integer" },
    ],
    sampleRequestBody: { id: "usr_f7a3c1", username: "theUser", firstName: "John", lastName: "James", email: "john@email.com", userStatus: 1 },
    sampleResponseBody: { message: "user updated" },
  },
  {
    id: "iss-13",
    method: "POST",
    path: "/user/createWithList",
    area: "User",
    issueType: "shadowApi",
    traffic7d: 620,
    lastSeenMinutesAgo: 200,
    authMethod: "None (public)",
    errorRate: 0.0,
    specSnippet: null,
    observedSnippet: { method: "POST", path: "/user/createWithList", body: { users: "array", sendWelcomeEmail: "boolean" } },
    fieldDiffs: [
      { field: "sendWelcomeEmail", status: "extra", observedType: "boolean" },
    ],
    sampleRequestBody: { users: [{ username: "alice", email: "alice@example.com" }], sendWelcomeEmail: true },
    sampleResponseBody: { message: "ok" },
  },
  {
    id: "iss-14",
    method: "DELETE",
    path: "/user/{username}",
    area: "User",
    issueType: "ghostEndpoint",
    traffic7d: 0,
    lastSeenMinutesAgo: 60 * 24 * 16,
    authMethod: "None (logged-in user)",
    errorRate: 0,
    specSnippet: { method: "DELETE", path: "/user/{username}" },
    observedSnippet: null,
    fieldDiffs: [],
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

export const AREAS: Area[] = ["Pet", "Store", "User"];

export const SPEC_META = {
  name: "petstore-openapi-3.0.json",
  uploadedAt: "2026-07-01",
  windowLabel: "Last 7 days",
  totalSpecEndpoints: 19,
  totalObservedEndpoints: 22,
  matchedEndpoints: 13,
};

export function matchScorePct(): number {
  return Math.round((SPEC_META.matchedEndpoints / SPEC_META.totalSpecEndpoints) * 100);
}
