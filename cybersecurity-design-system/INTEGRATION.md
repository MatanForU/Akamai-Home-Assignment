# Integrating into MatanForU/Akamai-Home-Assignment

This repo is Vite + React 19 + TypeScript + Tailwind v4 + `lucide-react` — good news, the design system already aligns closely (it also uses Lucide icons and plain CSS custom properties, no conflicting UI library).

## 1. Bring in the tokens
Copy `tokens/` and `styles.css` into `src/` (e.g. `src/design-system/`). Then import the one entry file once, near the top of `src/main.tsx` (before your existing `index.css`, or after — whichever should win on overlapping resets):

```ts
import "./design-system/styles.css";
```

This defines all the `--bg-*`, `--fg-*`, `--accent-*`, `--sev-*`, `--chart-*`, spacing, radius, and shadow custom properties globally, plus `[data-theme="dark"]` overrides. Toggle dark mode the same way the UI kit does: `document.documentElement.setAttribute("data-theme", "dark" | "light")`.

Tailwind's own reset/utilities keep working untouched — these are just custom properties + a couple of `@font-face`/`@import` rules, nothing that collides with Tailwind's layer.

## 2. Bring in the components
Copy `components/` into `src/design-system/components/`. Every component is plain React using **inline styles + `var(--token)`** — no CSS-in-JS library, no Tailwind classes — so they work regardless of whether Tailwind is present. You can:
- Use them as-is (rename `.jsx` → `.tsx` and add light prop types from the sibling `.d.ts` files if you want strict typing), or
- Treat them as reference and re-implement with Tailwind utility classes bound to the same custom properties (e.g. `bg-[var(--bg-surface)]`) if you'd rather stay Tailwind-native throughout.

## 3. Icons
This repo already has `lucide-react` installed — swap `components/core/Icon.jsx`'s CDN `mask-image` approach for real `lucide-react` imports if you prefer a bundled, offline-safe icon (recommended for production):

```tsx
import { ShieldCheck } from "lucide-react";
<ShieldCheck size={16} color="var(--accent-primary)" />
```

## 4. Reference, don't copy blindly
Your repo already has its own `App.tsx`, `Overview.tsx`, `Investigation.tsx`, `Badges.tsx`, `MatchScoreRing.tsx` — real product screens. Use `ui_kits/secops-dashboard/` as **visual/interaction reference** (layout, density, chart choices, table variants), not a literal replacement. Bring over the color/type/spacing tokens first — that alone will re-skin your existing screens consistently — then adopt individual components (`AlertCard`, `DataTable`, `StatCard`, the chart set) into your real screens where they fit, rather than dropping the whole UI kit in wholesale.

## What's NOT needed
- No new npm dependencies are required — everything here is React + inline styles + CSS custom properties.
- Google Fonts are loaded via `@import` in `styles.css`; swap for self-hosted fonts later if you want this fully offline.
