import type { Area, IssueType, RecommendedAction, Severity } from "./types";

// Transparent, additive scoring model. Every issue's severity is explainable
// as a sum of four named factors instead of a single opaque number, so an
// analyst can see *why* something ranked where it did and challenge it.
export interface RiskBreakdown {
  issueTypeScore: number;
  areaScore: number;
  trafficScore: number;
  recencyScore: number;
  total: number;
  severity: Severity;
}

const ISSUE_TYPE_WEIGHT: Record<IssueType, number> = {
  shadow_api: 40,
  param_mismatch: 25,
  param_undocumented: 20,
  param_unused: 8,
  spec_only: 5,
};

const AREA_WEIGHT: Record<Area, number> = {
  Payments: 30,
  Users: 24,
  Orders: 12,
  Catalog: 6,
};

function trafficScore(traffic7d: number): number {
  if (traffic7d >= 10000) return 20;
  if (traffic7d >= 1000) return 14;
  if (traffic7d >= 100) return 8;
  if (traffic7d >= 10) return 4;
  return 1;
}

function recencyScore(minutesAgo: number): number {
  if (minutesAgo <= 60) return 10;
  if (minutesAgo <= 60 * 24) return 7;
  if (minutesAgo <= 60 * 24 * 3) return 4;
  return 1;
}

export function computeRisk(
  issueType: IssueType,
  area: Area,
  traffic7d: number,
  lastSeenMinutesAgo: number,
): RiskBreakdown {
  const issueTypeScore = ISSUE_TYPE_WEIGHT[issueType];
  const areaScore = AREA_WEIGHT[area];
  const tScore = trafficScore(traffic7d);
  const rScore = recencyScore(lastSeenMinutesAgo);
  const total = issueTypeScore + areaScore + tScore + rScore;

  let severity: Severity;
  if (total >= 70) severity = "critical";
  else if (total >= 50) severity = "high";
  else if (total >= 30) severity = "medium";
  else severity = "low";

  return { issueTypeScore, areaScore, trafficScore: tScore, recencyScore: rScore, total, severity };
}

export function recommendAction(issueType: IssueType, severity: Severity): RecommendedAction {
  switch (issueType) {
    case "shadow_api":
      return severity === "critical" || severity === "high" ? "investigate" : "notify_dev";
    case "param_mismatch":
      return severity === "critical" || severity === "high" ? "investigate" : "notify_dev";
    case "param_undocumented":
      return severity === "critical" ? "investigate" : severity === "high" ? "notify_dev" : "update_spec";
    case "param_unused":
      return severity === "critical" || severity === "high" ? "notify_dev" : "update_spec";
    case "spec_only":
      return severity === "low" ? "no_action" : "update_spec";
  }
}

const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
  shadow_api: "active in production but missing from the specification",
  param_mismatch: "sending a parameter type that does not match the spec",
  param_undocumented: "accepting parameters that are not documented in the spec",
  param_unused: "documented in the spec but never used in observed traffic",
  spec_only: "documented in the spec but not seen in production traffic in the last 7 days",
};

export function buildRationale(
  issueType: IssueType,
  area: Area,
  traffic7d: number,
  severity: Severity,
): string {
  const base = `This endpoint is ${ISSUE_TYPE_LABEL[issueType]}.`;
  const areaNote =
    area === "Payments"
      ? "Because it belongs to Payments, undocumented behavior here can expose transaction logic or bypass validation that the spec was meant to enforce."
      : area === "Users"
        ? "Because it belongs to Users, undocumented behavior here can expose account or identity data outside the spec's intended contract."
        : area === "Orders"
          ? "It belongs to Orders, a moderately sensitive area, so the gap is worth tracking but is less likely to be an immediate exposure."
          : "It belongs to Catalog, a low-sensitivity area, so this is more likely routine drift than a security concern.";
  const trafficNote =
    traffic7d >= 1000
      ? ` It has seen ${traffic7d.toLocaleString()} requests in the last 7 days, so any gap here affects real, ongoing traffic.`
      : traffic7d >= 100
        ? ` It has moderate traffic (${traffic7d.toLocaleString()} requests/7d).`
        : ` It has low traffic (${traffic7d.toLocaleString()} requests/7d), which limits the blast radius for now.`;
  const severityNote =
    severity === "critical"
      ? " Combined, this is flagged as critical and warrants prompt investigation."
      : severity === "high"
        ? " Combined, this ranks as high priority."
        : severity === "medium"
          ? " Combined, this is medium priority — worth scheduling, not urgent."
          : " Combined, this is low priority and likely routine.";
  return base + " " + areaNote + trafficNote + severityNote;
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0,
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  shadow_api: "Shadow API",
  param_mismatch: "Parameter mismatch",
  param_undocumented: "Undocumented parameter",
  param_unused: "Unused spec parameter",
  spec_only: "Spec-only endpoint",
};

export const ACTION_LABELS: Record<RecommendedAction, string> = {
  investigate: "Investigate",
  update_spec: "Update spec",
  notify_dev: "Notify developer",
  no_action: "No action needed",
};

export function formatRelativeTime(minutesAgo: number): string {
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  if (minutesAgo < 60 * 24) return `${Math.round(minutesAgo / 60)}h ago`;
  return `${Math.round(minutesAgo / (60 * 24))}d ago`;
}
