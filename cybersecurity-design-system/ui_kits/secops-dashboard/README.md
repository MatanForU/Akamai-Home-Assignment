# SecOps Dashboard UI Kit

Interactive recreation of the primary product surface: an API security / SecOps analyst console. Click through the sidebar to switch screens; click an alert row to drill into detail; use the sun/moon icon in the topbar to toggle light/dark mode live.

**Screens**
- `Overview.jsx` — landing dashboard: KPI stat cards, request-volume line chart, posture gauge, findings donut, top-offenders list, recent alerts feed.
- `AlertsScreen.jsx` — full alerts table: tabs (open/resolved/all), search + severity filter, classic `DataTable` with severity badges, row selection, and expandable rows for raw request metadata.
- `AlertDetail.jsx` — drill-down: breadcrumb, severity header, raw request panel (mono), affected-service `NetworkGraph`, and a timeline `ListCard`.
- `ApiInventory.jsx` — asset catalog: filter bar, `AssetCard` grid with health status, and a traffic-by-hour `Heatmap`.

Composes primitives from `components/core`, `components/navigation`, `components/cards`, `components/tables`, and `components/charts` — no one-off styling lives in this kit; everything traces back to a token or a shared component.

Product/brand name ("Sentra") is a placeholder — swap the `productName` prop on `Sidebar` and the copy in `index.html` once a real name is set.
