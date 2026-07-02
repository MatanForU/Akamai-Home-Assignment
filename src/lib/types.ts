export type Area = "Pet" | "Store" | "User";

export type IssueType =
  | "shadowApi"
  | "ghostEndpoint"
  | "undocumentedParam"
  | "staleParam"
  | "paramMismatch"
  | "matched";

export type Severity = "critical" | "high" | "medium" | "low";

export type RecommendedAction =
  | "investigate"
  | "update_spec"
  | "notify_dev"
  | "no_action";

export type DiffStatus = "extra" | "missing" | "mismatch" | "match";

export interface FieldDiff {
  field: string;
  status: DiffStatus;
  specType?: string;
  observedType?: string;
  note?: string;
}

export interface Issue {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  area: Area;
  issueType: IssueType;
  severity: Severity;
  traffic7d: number;
  // Minutes since the endpoint was last observed/checked. Bounded to the
  // 7-day retention window (max 60*24*7) — the platform never reports a
  // last-seen value older than the data it actually retains.
  lastSeenMinutesAgo: number;
  authMethod: string;
  errorRate: number;
  specSnippet: Record<string, unknown> | null;
  observedSnippet: Record<string, unknown> | null;
  fieldDiffs: FieldDiff[];
  rationale: string;
  recommendedAction: RecommendedAction;
  riskScore: number;
  sampleRequestBody?: Record<string, unknown>;
  sampleResponseBody?: Record<string, unknown>;
}
