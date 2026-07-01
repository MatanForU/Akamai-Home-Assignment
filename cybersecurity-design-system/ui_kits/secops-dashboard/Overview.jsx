const { StatCard, AlertCard, ChartCard, ListCard, Sparkline, LineChart, DonutChart, GaugeChart, Icon, Button } = window.DS;

function Overview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Open critical alerts" value="7" delta="-12% vs last week" deltaTone="success" sparkline={<Sparkline values={[9, 8, 10, 7, 9, 7, 7]} />} />
        <StatCard label="Unprotected endpoints" value="23" delta="+3 this week" deltaTone="danger" sparkline={<Sparkline values={[18, 19, 20, 21, 22, 20, 23]} color="var(--sev-critical-500)" />} />
        <StatCard label="Requests scanned" value="4.2" unit="M / day" delta="+6% vs last week" deltaTone="success" sparkline={<Sparkline values={[3.6, 3.8, 3.9, 4.0, 4.1, 4.0, 4.2]} />} />
        <StatCard label="Posture score" value="72" unit="/ 100" delta="+4 pts" deltaTone="success" sparkline={<Sparkline values={[64, 66, 68, 69, 70, 71, 72]} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "stretch" }}>
        <ChartCard
          title="Blocked attacks"
          subtitle="Last 7 days"
          chart={<LineChart width={520} height={180} data={[{ label: "Mon", value: 120 }, { label: "Tue", value: 180 }, { label: "Wed", value: 90 }, { label: "Thu", value: 210 }, { label: "Fri", value: 160 }, { label: "Sat", value: 80 }, { label: "Sun", value: 70 }]} />}
        />
        <ChartCard title="Security posture" subtitle="Composite score across all scopes" chart={<div style={{ display: "flex", justifyContent: "center" }}><GaugeChart value={72} label="Posture score" /></div>} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard
          title="Findings by category"
          chart={<DonutChart centerValue="284" data={[{ label: "Injection", value: 120, color: "var(--sev-critical)" }, { label: "Broken auth", value: 80, color: "var(--sev-high)" }, { label: "Misconfig", value: 84, color: "var(--sev-info)" }]} />}
        />
        <ListCard
          title="Top offending IPs"
          items={[
            { label: "203.0.113.4", value: "1,204 reqs", icon: <Icon name="alert-triangle" size={14} color="var(--sev-critical)" /> },
            { label: "198.51.100.9", value: "842 reqs", icon: <Icon name="alert-triangle" size={14} color="var(--sev-high)" /> },
            { label: "192.0.2.15", value: "390 reqs", icon: <Icon name="activity" size={14} color="var(--fg-tertiary)" /> },
          ]}
        />
      </div>

      <div>
        <div style={{ font: "var(--text-h4)", color: "var(--fg-primary)", marginBottom: 10 }}>Recent alerts</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AlertCard severity="critical" title="Unauthenticated access to /v2/refund" meta="203.0.113.4 · rule: auth-missing-001" timestamp="4m ago" actions={<Button size="sm" variant="secondary">Investigate</Button>} />
          <AlertCard severity="high" title="Excessive data exposure on /v2/users/:id" meta="checkout-web · rule: pii-exposure-014" timestamp="26m ago" actions={<Button size="sm" variant="secondary">Investigate</Button>} />
        </div>
      </div>
    </div>
  );
}
