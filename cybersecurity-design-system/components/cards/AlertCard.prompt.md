Incident/alert summary card — the atomic unit of the Alerts feed. Severity dot + pill drive the color, mono meta line carries the technical detail (endpoint, IP, rule ID).

```jsx
<AlertCard severity="critical" title="Unauthenticated access to /v2/refund" meta="203.0.113.4 · rule: auth-missing-001" timestamp="4m ago" actions={<Button size="sm" variant="secondary">Investigate</Button>} />
```
