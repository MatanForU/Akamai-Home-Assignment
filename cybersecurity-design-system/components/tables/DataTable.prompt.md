The workhorse table — logs, alerts, events, API inventory. One component covers all classic-table needs via props rather than four variants:

```jsx
<DataTable
  selectable
  expandable
  columns={[
    {key:"method", label:"Method", mono:true},
    {key:"path", label:"Path", mono:true},
    {key:"status", label:"Status", render:(r)=><Badge tone={r.status>=400?"critical":"success"}>{r.status}</Badge>},
  ]}
  rows={[{id:1, method:"POST", path:"/v2/charge", status:403}]}
  renderExpanded={(r) => <pre>{JSON.stringify(r, null, 2)}</pre>}
/>
```

Put a `Badge` in a column's `render` for the "status badges & actions" variant; pass `expandable` + `renderExpanded` for drill-in rows; pass `selectable` to add checkboxes for bulk actions. Use `mono` on ID/IP/hash/status columns to keep the data-dense monospace rhythm.
