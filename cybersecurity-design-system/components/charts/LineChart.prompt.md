Time-series chart with optional filled area — the default chart for "X over time" (requests/day, alerts/week, blocked attacks/hour).

```jsx
<LineChart data={[{label:"Mon",value:120},{label:"Tue",value:180},{label:"Wed",value:90}]} color="var(--chart-series-1)" />
```

Uses `--chart-*` tokens so it re-themes automatically in dark mode. Keep `area` on for hero/dashboard charts, off for dense multi-line comparisons.
