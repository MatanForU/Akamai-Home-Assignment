const { Breadcrumb, Badge, Button, NetworkGraph, ListCard, Icon } = window.DS;

function AlertDetail({ alert, onBack }) {
  const a = alert || { severity: "critical", rule: "auth-missing-001", path: "POST /v2/refund", source: "203.0.113.4", asset: "payments-api", time: "4m ago" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Button size="sm" variant="ghost" onClick={onBack} iconLeft={<Icon name="arrow-left" size={14} />}>Back to alerts</Button>
      </div>
      <Breadcrumb items={["Alerts", a.asset, a.path]} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Badge tone={a.severity}>{a.severity}</Badge>
            <span style={{ font: "var(--text-mono-sm)", color: "var(--fg-tertiary)" }}>{a.time}</span>
          </div>
          <div style={{ font: "var(--text-h2)", color: "var(--fg-primary)" }}>Unauthenticated access to {a.path}</div>
          <div style={{ font: "var(--text-mono-sm)", color: "var(--fg-secondary)", marginTop: 4 }}>rule: {a.rule} · source: {a.source} · asset: {a.asset}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button size="md" variant="secondary">Escalate</Button>
          <Button size="md" variant="primary">Mark resolved</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 20 }}>
          <div style={{ font: "var(--text-h4)", color: "var(--fg-primary)", marginBottom: 12 }}>Affected service path</div>
          <NetworkGraph
            width={440}
            height={200}
            nodes={[
              { id: "gw", label: "API Gateway", x: 220, y: 30, kind: "hub" },
              { id: "auth", label: "auth-svc", x: 100, y: 140 },
              { id: "pay", label: "payments-api", x: 340, y: 140, flagged: true },
            ]}
            edges={[{ from: "gw", to: "auth" }, { from: "gw", to: "pay", flagged: true }]}
          />
          <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--bg-code)", borderRadius: "var(--radius-sm)", font: "var(--text-mono-sm)", color: "var(--fg-secondary)", display: "flex", flexDirection: "column", gap: 3 }}>
            <span>POST /v2/refund HTTP/1.1</span>
            <span>Host: api.payments.internal</span>
            <span>Authorization: <span style={{ color: "var(--sev-critical)" }}>(missing)</span></span>
            <span>X-Forwarded-For: {a.source}</span>
          </div>
        </div>
        <ListCard
          title="Timeline"
          viewAllLabel={null}
          items={[
            { label: "Finding detected", value: a.time },
            { label: "Assigned to on-call", value: "3m ago" },
            { label: "Rule auth-missing-001 fired", value: "4m ago" },
          ]}
        />
      </div>
    </div>
  );
}
