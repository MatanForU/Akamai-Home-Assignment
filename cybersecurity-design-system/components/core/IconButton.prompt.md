Square icon-only button for toolbars, table row actions, and topbar utilities.

```jsx
<IconButton icon={<Icon name="bell" size={16} />} aria-label="Notifications" />
<IconButton icon={<Icon name="more-vertical" size={16} />} variant="ghost" aria-label="More actions" />
```

Always pass `aria-label` — there's no visible text. Use `active` to indicate a toggled-on state (e.g. an open panel).
