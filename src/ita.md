# Ita

Iterator helpers, based on [`tc39/proposal-iterator-helpers`](https://github.com/tc39/proposal-iterator-helpers).

```ts
const filtered = Ita.from([0, 1, 2, 3, 4, 5, 6, 8, 10])
    .drop(1)
    .filter(i => i % 2 === 0)
    .take(3)
    .toArray() // [2, 4, 6]
```
