Primary action control used across dashboards, forms, and toolbars — four variants for a clear hierarchy of emphasis.

```jsx
<Button variant="primary" size="md">Run scan</Button>
<Button variant="secondary" iconLeft={<Icon name="filter" size={14} />}>Filter</Button>
<Button variant="danger" size="sm">Revoke key</Button>
```

Variants: `primary` (teal fill, main CTA — one per view), `secondary` (bordered, default choice for toolbars), `ghost` (borderless, for dense toolbars/table rows), `danger` (destructive actions: revoke, delete, block). Sizes: `sm` (30px, inline table actions), `md` (36px, default), `lg` (44px, hero CTAs). Supports `loading` (spinner replaces left icon) and `disabled`.
