export type Area = "Payments" | "Users" | "Orders" | "Catalog";

export type IssueType =
  | "shadow_api"
  | "spec_only"
  | "param_undocumented"
  | "param_unused"
  | "param_mismatch";

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
