# Sentra Design System
*A design system for an API security / endpoint protection / SecOps analyst product.*

> "Sentra" is a placeholder product name used throughout this system for concreteness — swap it wherever it appears once a real name is set.

## Context
This system was created from scratch (no existing codebase, Figma, or brand attached) via a design-questions session with the requester. Confirmed direction:
- **Product**: API security + endpoint protection + SecOps platform, used day-to-day by security analysts.
- **Vibe**: sharp, modern, high-contrast, almost editorial — but still approachable, not cold or intimidating.
- **Modes**: light and dark are equal priority, both fully designed (not a dark-mode afterthought).
- **Type**: sans (Inter) for UI/editorial + monospace (IBM Plex Mono) for data — IDs, hashes, logs, request paths, stat numerals.
- **Density**: airy, executive-summary style — clear hierarchy and whitespace even though the product is data-rich.
- **Color**: dark, near-black neutrals with a teal/mint primary and cyan secondary (cool, technical, not the generic blue-purple SaaS gradient).
- **Coverage requested**: full chart/graph suite, several table variants (classic, card-based, expandable), and a range of card types (stat, alert, asset, chart, list) — see below.

## Index
- `styles.css` — root stylesheet; import this one file. It pulls in Google Fonts + everything under `tokens/`.
- `tokens/` — `colors.css` (light + `[data-theme="dark"]` semantic aliases over an OKLCH base palette), `typography.css`, `spacing.css`, `elevation.css` (radius/shadow/motion).
- `guidelines/` — foundation specimen cards (colors, severity scale, type scale, spacing, elevation) shown in the Design System tab.
- `components/core/` — Button, IconButton, Badge (severity/status pill), Input, Select, Checkbox, Radio, Switch, Avatar, Icon.
- `components/navigation/` — Tabs, Sidebar, Topbar, Breadcrumb, Pagination.
- `components/feedback/` — Toast, Tooltip, Dialog, EmptyState.
- `components/cards/` — StatCard, AlertCard, AssetCard, ChartCard, ListCard.
- `components/tables/` — DataTable (classic — supports selection, inline badges/actions, expandable rows), CardTable (card-per-row, mobile-friendly).
- `components/charts/` — LineChart, BarChart, DonutChart, GaugeChart, Sparkline, Heatmap, NetworkGraph.
- `ui_kits/secops-dashboard/` — a full click-through recreation of the product: Overview, Alerts (list + filter + expandable rows), Alert Detail (drill-down), API Inventory. Includes a live light/dark toggle.
- `SKILL.md` — portable skill definition for using this system in Claude Code or another agent runtime.

## Content fundamentals
Voice is **precise but not cold** — a security analyst's tool should read like a calm, competent colleague, not a klaxon.
- **Second person, direct**: "Investigate", "Mark resolved", "Revoke key" — imperative verbs on actions; no "please" or exclamation points.
- **Specific over vague**: "Unauthenticated access to /v2/refund" rather than "Suspicious activity detected." Always name the endpoint, rule, or asset.
- **No fear-mongering**: even critical alerts are stated factually ("Excessive data exposure on /v2/users/:id") rather than dramatized ("DANGER! Your data is at risk!").
- **Numbers over adjectives**: "23 unprotected endpoints", "+4 pts" — let the data carry the weight; avoid "a lot of", "many", "severe."
- **No emoji, ever.** This is a professional analyst tool; emoji would undercut trust.
- **Casing**: sentence case everywhere (buttons, headers, table columns) — never Title Case, never ALL CAPS except for overline labels and severity pills (small, tracked-out, functioning as a tag, not a shout).
- **Timestamps read as relative + human**: "4m ago", "26m ago", "2h ago" — not raw ISO strings in the UI (reserve full timestamps/IDs for the mono detail panels).

## Visual foundations
- **Color**: near-black/near-white neutrals with a very low, cool chroma (never fully desaturated gray — always a faint blue undertone, oklch hue ≈240). Primary accent is a teal/mint (`--accent-primary`, hue ≈165); secondary is cyan (hue ≈220) — same lightness/chroma family, so they read as one brand system, not clashing colors. Severity scale (critical→info) sweeps warm-to-cool at matched lightness/chroma so it reads as one deliberate ramp, not five unrelated colors.
- **Light and dark are both first-class.** Dark mode is not `#000` — background steps from `oklch(6% ... )` canvas up through raised surfaces; light mode mirrors the same structure inverted. Toggle via `[data-theme="dark"]` on `<html>`.
- **Type**: Inter for all UI copy and headings — editorial-weight headlines (`--text-h1`/`--text-display`) but restrained, no display/serif face. IBM Plex Mono for anything a system emits: IDs, IPs, hashes, HTTP methods/paths, log lines, and — deliberately — big stat numerals (`--text-mono-stat`), which is what gives dashboards their "instrumentation" feel rather than generic SaaS.
- **Spacing**: 4px base scale (`--space-1`…`--space-13`). Airy by default — cards get 16–20px internal padding, sections separated by 20–24px, not tight enterprise-table density.
- **Radius**: small and consistent — `--radius-sm` (6px) for controls/table cells, `--radius-lg` (14px) for cards. Sharp enough to feel technical, never pill-shaped except badges/switches.
- **Borders over heavy shadows**: every surface (card, table, input) gets a 1px hairline border (`--border-default`) first; shadow is a secondary, subtle cue (`--shadow-sm`/`--shadow-md`), never a glow. No colored left-border accent stripes on cards — severity is communicated via a small dot + pill, not a border treatment.
- **No gradients, no glassmorphism, no blur.** Flat surfaces, hairline borders. The one exception is the modal scrim (`--scrim`), a plain translucent black.
- **Motion**: fast and functional — `--duration-fast` (120ms) for hover/press, `--duration-base` (180ms) for toggles/expand, `--ease-standard`/`--ease-out` cubics. No bounce, no springy overshoot — this is an instrument panel, not a marketing site.
- **Hover/press states**: hover = subtle background tint (`--accent-primary-bg` at low opacity) or border-color shift; press = no scale/shrink, just a slightly deeper tint. Disabled = 40–50% opacity, cursor not-allowed.
- **Charts**: all chart components read their colors from `--chart-*` tokens so they re-theme automatically; severity-coded charts (bar, heatmap) pull directly from the severity scale so a chart and a table badge for the same category always match exactly.
- **Imagery**: none — this is an instrumentation-heavy product; no photography or illustration. If a marketing surface is added later, keep any imagery cool-toned and technical (screens, terminals, network diagrams), never stock-photo "people at laptops."

## Iconography
Uses **Lucide** (thin-stroke, MIT-licensed line icons), the closest well-established match to the "sharp, modern, technical" brief — no icon font, no emoji, no hand-drawn SVG. Consumed via `components/core/Icon.jsx`, which mask-tints the CDN SVG to any token color so it re-themes correctly in dark mode. Security-relevant vocabulary in use: `shield-check`, `shield-alert`, `lock`, `key`, `server`, `bug`, `activity`, `radar`, `alert-triangle`, `search`, `filter`, `bell`, `settings`, `layout-dashboard`. No product logo exists yet (greenfield brand) — the sidebar currently pairs the `shield-check` icon with a text wordmark as a stand-in; drop a real mark into `assets/` and swap it into `Sidebar`'s `logo` prop when one is designed.

## Caveats / open questions
- No real brand name, logo, or wordmark was provided — "Sentra" and the shield-check mark are placeholders throughout. Swap freely.
- Fonts are loaded from Google Fonts CDN (`@import` in `styles.css`) rather than self-hosted binaries, since no font files were provided — fine for prototyping, consider self-hosting for production.
- Icons load from the `lucide-static` CDN at runtime rather than being vendored locally — swap for local SVGs if the product needs to work fully offline.
- Only one UI kit (`secops-dashboard`) was built. If there's a second surface (marketing site, admin console, mobile app), flag it and we'll build a matching kit.
