Severity/status pill — the primary way this product communicates risk level, alert status, and API health at a glance.

```jsx
<Badge tone="critical">Critical</Badge>
<Badge tone="success" dot={false}>Resolved</Badge>
```

Tones map 1:1 to the severity color scale (critical/high/medium/low/info) plus `success` and `neutral` for general status. Used inline in table cells, on AlertCard headers, and next to asset names.
