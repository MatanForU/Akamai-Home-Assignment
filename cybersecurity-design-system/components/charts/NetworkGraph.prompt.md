Static node/edge diagram for service topology and traffic flow — highlight a suspicious edge or compromised node in critical red.

```jsx
<NetworkGraph
  nodes={[{id:"gw",label:"API Gateway",x:240,y:40,kind:"hub"},{id:"auth",label:"auth-svc",x:120,y:140},{id:"pay",label:"payments-svc",x:360,y:140,flagged:true}]}
  edges={[{from:"gw",to:"auth"},{from:"gw",to:"pay",flagged:true}]}
/>
```

Layout coordinates are supplied by the caller (no physics simulation) — keep it simple and legible, 5–12 nodes max.
