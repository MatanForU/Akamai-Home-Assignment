Grid heatmap — activity by hour/day, risk matrix (impact × likelihood), request volume by region. Intensity ramps through the low→critical severity hues rather than an arbitrary color scale, so it reads consistently with the rest of the product.

```jsx
<Heatmap rows={["Mon","Tue","Wed"]} cols={["00","06","12","18"]} values={[[2,8,4,1],[1,3,9,6],[0,2,5,3]]} />
```
