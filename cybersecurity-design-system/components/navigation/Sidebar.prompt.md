Primary left navigation for the app shell — fixed 248px width, subtle right hairline, section list with active state.

```jsx
<Sidebar productName="Sentra" items={[{value:"overview",label:"Overview",icon:<Icon name="layout-dashboard" size={16}/>},{value:"alerts",label:"Alerts",badge:4}]} activeValue="overview" />
```
