Centered modal with scrim, used for confirmations (revoke key, delete rule) and small forms (new scan, invite analyst).

```jsx
<Dialog open title="Revoke API key?" description="payments-prod-key-04 will stop working immediately." actions={<><Button variant="secondary">Cancel</Button><Button variant="danger">Revoke</Button></>} />
```
