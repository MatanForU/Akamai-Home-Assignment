const { Tabs, Input, Select, Button, Badge, DataTable, Pagination, Icon } = window.DS;

function AlertsScreen({ onOpenAlert }) {
  const [tab, setTab] = React.useState("open");
  const rows = [
    { id: 1, severity: "critical", rule: "auth-missing-001", path: "POST /v2/refund", source: "203.0.113.4", asset: "payments-api", time: "4m ago" },
    { id: 2, severity: "high", rule: "pii-exposure-014", path: "GET /v2/users/:id", source: "checkout-web", asset: "checkout-web", time: "26m ago" },
    { id: 3, severity: "medium", rule: "rate-limit-missing", path: "POST /v2/login", source: "198.51.100.9", asset: "auth-svc", time: "1h ago" },
    { id: 4, severity: "low", rule: "verbose-error", path: "GET /v2/invoice/:id", source: "192.0.2.15", asset: "billing-api", time: "3h ago" },
  ];
  const sevTone = { critical: "critical", high: "high", medium: "medium", low: "low" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Tabs items={[{ value: "open", label: "Open", count: 12 }, { value: "resolved", label: "Resolved" }, { value: "all", label: "All" }]} value={tab} onChange={setTab} />
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Input label="Search" placeholder="path, IP, rule..." icon={<Icon name="search" size={14} />} />
          <Select label="Severity" value="all" options={[{ value: "all", label: "All severities" }, { value: "critical", label: "Critical" }, { value: "high", label: "High" }]} />
        </div>
        <Button size="md" variant="primary" iconLeft={<Icon name="settings" size={14} />}>New rule</Button>
      </div>

      <DataTable
        expandable
        selectable
        columns={[
          { key: "severity", label: "Severity", render: (r) => <Badge tone={sevTone[r.severity]}>{r.severity}</Badge> },
          { key: "path", label: "Endpoint", mono: true },
          { key: "source", label: "Source IP", mono: true },
          { key: "asset", label: "Asset" },
          { key: "time", label: "Detected", align: "right", mono: true },
        ]}
        rows={rows}
        onRowClick={(r) => onOpenAlert && onOpenAlert(r)}
        renderExpanded={(r) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, font: "var(--text-mono-sm)", color: "var(--fg-secondary)" }}>
            <span>rule_id: {r.rule}</span>
            <span>request_id: req_{r.id}8f21a0c9e4b1</span>
            <span>user_agent: curl/8.4.0</span>
          </div>
        )}
      />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Pagination page={1} pageCount={6} />
      </div>
    </div>
  );
}
