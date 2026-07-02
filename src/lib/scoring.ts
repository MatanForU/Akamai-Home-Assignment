import type { Area, IssueType, RecommendedAction, Severity } from "./types";
import { Radar, Ghost, FileQuestion, Archive, GitCompare, CheckCircle2, type LucideIcon } from "lucide-react";

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
  shadowApi: 40,
  paramMismatch: 25,
  undocumentedParam: 20,
  staleParam: 8,
  ghostEndpoint: 5,
  matched: 0,
};

const AREA_WEIGHT: Record<Area, number> = {
  Pet: 20,
  Store: 28,
  User: 24,
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
    case "shadowApi":
      return severity === "critical" || severity === "high" ? "investigate" : "notify_dev";
    case "paramMismatch":
      return severity === "critical" || severity === "high" ? "investigate" : "notify_dev";
    case "undocumentedParam":
      return severity === "critical" ? "investigate" : severity === "high" ? "notify_dev" : "update_spec";
    case "staleParam":
      return severity === "critical" || severity === "high" ? "notify_dev" : "update_spec";
    case "ghostEndpoint":
      return severity === "low" ? "no_action" : "update_spec";
    case "matched":
      return "no_action";
  }
}

const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
  shadowApi: "active in production but missing from the specification",
  paramMismatch: "sending a parameter type that does not match the spec",
  undocumentedParam: "accepting parameters that are not documented in the spec",
  staleParam: "documented in the spec but never used in observed traffic",
  ghostEndpoint: "documented in the spec but not seen in production traffic in the last 7 days",
  matched: "matching the specification exactly, with no discrepancies detected",
};

export function buildRationale(
  issueType: IssueType,
  area: Area,
  traffic7d: number,
  severity: Severity,
): string {
  const base = `This endpoint is ${ISSUE_TYPE_LABEL[issueType]}.`;
  const areaNote =
    area === "Store"
      ? "Because it belongs to Store, undocumented behavior here can expose order or payment logic and bypass validation the spec was meant to enforce."
      : area === "User"
        ? "Because it belongs to User, undocumented behavior here can expose account or identity data outside the spec's intended contract."
        : "It belongs to Pet, a moderately sensitive area, so drift here is worth tracking but is less likely to be an immediate security exposure.";
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
          ? " Combined, this is medium priority, worth scheduling but not urgent."
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
  shadowApi: "Shadow API",
  paramMismatch: "Parameter mismatch",
  undocumentedParam: "Undocumented parameter",
  staleParam: "Stale parameter",
  ghostEndpoint: "Ghost endpoint",
  matched: "Matched",
};

// One icon per issue type, chosen for what the issue actually represents:
// Radar = detected in traffic but off the documented map (shadow API)
// Ghost = documented but no longer "alive" in traffic (ghost endpoint)
// FileQuestion = a parameter the docs never mentioned (undocumented param)
// Archive = a parameter the spec keeps but traffic no longer uses (stale param)
// GitCompare = spec and traffic disagree on shape (parameter mismatch)
export const ISSUE_TYPE_ICONS: Record<IssueType, LucideIcon> = {
  shadowApi: Radar,
  paramMismatch: GitCompare,
  undocumentedParam: FileQuestion,
  staleParam: Archive,
  ghostEndpoint: Ghost,
  matched: CheckCircle2,
};

export const ACTION_LABELS: Record<RecommendedAction, string> = {
  investigate: "Investigate",
  update_spec: "Update spec",
  notify_dev: "Notify developer",
  no_action: "No action needed",
};

export const ACTION_DOT: Record<RecommendedAction, string> = {
  investigate: "bg-red-500",
  notify_dev: "bg-indigo-500",
  update_spec: "bg-emerald-500",
  no_action: "bg-slate-400",
};

export function formatRelativeTime(minutesAgo: number): string {
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  if (minutesAgo < 60 * 24) return `${Math.round(minutesAgo / 60)}h ago`;
  return `${Math.round(minutesAgo / (60 * 24))}d ago`;
}

// Compact display for large numbers (e.g. 74600 -> "74.6K"). Below 1,000
// falls back to a plain, comma-formatted number. Shared by every screen that
// displays raw traffic counts.
export function formatCompactNumber(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return n.toLocaleString();
}
