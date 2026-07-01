const { Topbar, Input, Select, Button, AssetCard, Heatmap, Icon } = window.DS;

function ApiInventory() {
  const assets = [
    { name: "payments-api", type: "Internal API", status: "warning", endpointCount: 18, lastScanned: "2h ago" },
    { name: "checkout-web", type: "Public web app", status: "healthy", endpointCount: 6, lastScanned: "10m ago" },
    { name: "auth-svc", type: "Internal API", status: "healthy", endpointCount: 9, lastScanned: "1h ago" },
    { name: "billing-api", type: "Partner API", status: "critical", endpointCount: 12, lastScanned: "5h ago" },
    { name: "mobile-gateway", type: "Internal API", status: "healthy", endpointCount: 24, lastScanned: "30m ago" },
    { name: "reporting-svc", type: "Internal API", status: "warning", endpointCount: 4, lastScanned: "1d ago" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Input label="Search assets" placeholder="name or type..." icon={<Icon name="search" size={14} />} />
          <Select label="Status" value="all" options={[{ value: "all", label: "All statuses" }, { value: "critical", label: "Critical" }]} />
        </div>
        <Button size="md" variant="primary" iconLeft={<Icon name="radar" size={14} />}>Discover new APIs</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {assets.map((a) => (
          <AssetCard key={a.name} icon={<Icon name="server" size={16} />} {...a} />
        ))}
      </div>

      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 20 }}>
        <div style={{ font: "var(--text-h4)", color: "var(--fg-primary)", marginBottom: 12 }}>Traffic activity, by hour</div>
        <Heatmap rows={["payments-api", "checkout-web", "auth-svc", "billing-api"]} cols={["00", "04", "08", "12", "16", "20"]} values={[[2, 4, 12, 20, 18, 6], [1, 2, 8, 14, 22, 10], [4, 6, 9, 11, 8, 5], [0, 1, 3, 5, 15, 4]]} />
      </div>
    </div>
  );
}
