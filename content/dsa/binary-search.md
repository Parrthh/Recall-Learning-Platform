## Theory

**Binary search** finds a target — or a boundary — in a **monotonic** search space by halving the space each step: O(log n) instead of O(n).

The underrated part: the search space doesn't have to be an array. It can be *the space of possible answers*. If a predicate `canDo(x)` is monotonic ("if x works, everything larger works"), you can binary-search the smallest working x — this is **binary search on the answer**, and it solves problems like "minimum eating speed", "smallest capacity to ship in D days", "split array to minimize largest sum".

Two mental models:

1. **Find an element**: classic `lo/hi/mid` with equality check.
2. **Find a boundary**: the array (or predicate) looks like `FFFFTTTT` — find the first `T`. Most real problems are boundary searches in disguise (first bad version, lower bound, insertion point).

## Pattern

**Boundary template** (first index where predicate is true) — learn this one; the classic "find equal element" is a special case:

```typescript
// Returns the smallest i in [0, n] such that pred(i) is true; n if none.
// O(log n) time, O(1) space.
function lowerBound(n: number, pred: (i: number) => boolean): number {
  let lo = 0;
  let hi = n; // hi is exclusive: the answer may be "none" → n
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (pred(mid)) hi = mid;      // mid might be the first T → keep it in range
    else lo = mid + 1;            // mid is F → answer is strictly right of mid
  }
  return lo; // lo === hi: the boundary
}

// Classic membership test, expressed via the boundary:
function search(sorted: number[], target: number): number {
  const i = lowerBound(sorted.length, (k) => sorted[k] >= target);
  return i < sorted.length && sorted[i] === target ? i : -1;
}
```

**Binary search on the answer**:

```typescript
// Minimum speed k such that piles can be eaten within h hours.
// O(n log(maxPile)) time, O(1) space.
function minEatingSpeed(piles: number[], h: number): number {
  const canFinish = (k: number) =>
    piles.reduce((hrs, p) => hrs + Math.ceil(p / k), 0) <= h;
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (canFinish(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

### Complexity of this pattern

**O(log n) time, O(1) space** for a direct search; **O(n log A)** for search-on-answer where each predicate check is O(n) and A is the answer range. The "why": the candidate range strictly halves every iteration, so it takes log₂ steps to reach size 1.

## Common Pitfalls

- **Infinite loops** from mismatched mid/bounds: with `hi = mid` use `mid = lo + ((hi - lo) >> 1)` (rounds down); if you ever write `lo = mid`, you need `mid` to round *up* or the loop can stall.
- Searching a space that isn't actually monotonic — verify the predicate is `FFFTTT`, not `FTFTFT` (rotated arrays need a smarter predicate).
- Off-by-one between inclusive `hi = n - 1` and exclusive `hi = n` conventions — pick the exclusive boundary template and stick with it.
- `(lo + hi) / 2` overflow in fixed-width languages; harmless in JS numbers but write the safe form out of habit.

## Related Topics

- Prerequisite: **Big-O & Complexity Analysis** (why halving ⇒ log).
- Sorted-input pair problems often prefer **Two Pointers**.
- Search-on-answer predicates often wrap greedy checks: **Greedy Algorithms**.
