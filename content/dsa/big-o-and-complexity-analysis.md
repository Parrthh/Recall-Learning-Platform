## Theory

**Big-O notation** describes how an algorithm's running time or memory grows as the input size `n` grows. It deliberately ignores constant factors and lower-order terms: `3n² + 10n + 4` is simply **O(n²)**, because for large `n` the quadratic term dominates.

You'll encounter three related symbols in interviews:

- **O (Big-O)** — an upper bound ("no worse than"). This is what interviewers almost always mean.
- **Ω (Omega)** — a lower bound ("no better than").
- **Θ (Theta)** — a tight bound (both upper and lower).

### Best, worst, and average case

These are *different inputs*, not different notations. Quicksort is O(n log n) on average but O(n²) in the worst case (already-sorted input with a naive pivot). Always state which case you're analyzing; interviewers usually want worst case unless the average is the interesting story (hash maps, quicksort).

### Deriving complexity from code

1. **Sequential statements** add: O(a) + O(b) = O(a + b), keep the dominant term.
2. **Loops** multiply by their trip count:

```typescript
for (let i = 0; i < n; i++) {        // n iterations
  for (let j = 0; j < n; j++) {      // × n iterations
    doConstantWork();                 // O(1)
  }
}
// Total: O(n²)
```

3. **Loops that shrink the problem** by a constant factor are logarithmic:

```typescript
let i = n;
while (i > 1) {
  i = Math.floor(i / 2); // halves every step → runs log₂(n) times
}
// Total: O(log n)
```

4. **Recursion** — write the recurrence, then solve it:

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  // T(n) = 2·T(n/2) + O(n)  → O(n log n) by the master theorem
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}
```

Common recurrences worth memorizing:

| Recurrence | Solution | Example |
|---|---|---|
| T(n) = T(n/2) + O(1) | O(log n) | binary search |
| T(n) = T(n−1) + O(1) | O(n) | linear recursion |
| T(n) = 2·T(n/2) + O(n) | O(n log n) | merge sort |
| T(n) = 2·T(n−1) + O(1) | O(2ⁿ) | naive Fibonacci |

### Amortized analysis

Some operations are occasionally expensive but cheap *on average over a sequence*. A dynamic array doubles its capacity when full: a single push may cost O(n) to copy, but n pushes cost O(n) total, so each push is **amortized O(1)**. The same idea explains why hash map inserts and monotonic stack algorithms are linear overall.

### Space complexity

Count extra memory beyond the input: allocations, recursion depth (each stack frame counts), and auxiliary structures. An in-place two-pointer scan is O(1) space; merge sort's merge buffer is O(n); a recursive DFS on a tree is O(h) for tree height h.

## Common Pitfalls

- **Dropping the wrong term**: O(n + m) does not collapse to O(n) when m is an independent input (e.g., two different arrays or a graph's nodes + edges).
- **Hidden costs in library calls**: `arr.slice()`, string concatenation, and spreading (`[...arr]`) are O(n) each. A "single loop" containing `slice` is O(n²).
- **Assuming hash map operations are always O(1)**: they are *expected* O(1); adversarial collisions degrade to O(n). Say "average O(1)" in interviews.
- **Forgetting recursion stack space**: naive recursive solutions are rarely O(1) space.
- **Confusing O and Θ**: saying "binary search is O(n²)" is technically true (upper bounds are not tight) but useless. Give the tightest bound you can.

## Related Topics

- Per-structure and per-pattern complexity tables: see **Complexity Reference**.
- Hash-based O(1) lookups in practice: see **Arrays, Strings & Hashing**.
