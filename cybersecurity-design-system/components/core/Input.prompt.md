Text field with optional label, leading icon, and inline error. Set `mono` for fields holding IDs, tokens, IPs, or hashes.

```jsx
<Input label="API key name" placeholder="e.g. payments-prod" />
<Input label="Search logs" icon={<Icon name="search" size={14} />} />
<Input label="Client ID" mono value="cl_9f21..." />
```
