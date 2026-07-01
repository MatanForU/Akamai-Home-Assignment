Vertical bar chart for distributions — findings by severity, alerts by category, requests by status code.

```jsx
<BarChart data={[{label:"Critical",value:4,color:"var(--sev-critical)"},{label:"High",value:12,color:"var(--sev-high)"}]} />
```

Pass a `color` per datum to encode severity directly in the bar color.
