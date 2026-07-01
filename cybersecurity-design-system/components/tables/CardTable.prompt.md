Card-per-row list — the same data as DataTable but stacked as cards, for narrow viewports or when rows need more visual weight (e.g. an alert queue on a smaller panel).

```jsx
<CardTable
  rows={[{id:1, title:"payments-api", ip:"10.2.4.18", status:"critical"}]}
  renderMeta={(r) => `${r.ip}`}
  renderTrailing={(r) => <Badge tone={r.status}>{r.status}</Badge>}
/>
```
