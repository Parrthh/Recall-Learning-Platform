## Theory

The **two pointers** technique walks two indices through a sequence in a coordinated way, so that each pointer only ever moves forward (or the pointers only ever move toward each other). Because total pointer movement is bounded by the array length, a nested-loop O(n²) comparison collapses into a single O(n) pass.

Use it when:

- The array is **sorted** (or can be sorted) and you're looking for a pair/triple with some property — sortedness tells you *which* pointer to move.
- You're comparing elements from **both ends** (palindromes, container problems).
- You need **in-place compaction** (dedup, move zeroes) with a read pointer and a write pointer.

## Pattern

**Converging pointers** (from both ends, sorted input):

```typescript
// Does a sorted array contain a pair summing to target? — O(n) time, O(1) space.
function hasPairWithSum(sorted: number[], target: number): boolean {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo < hi) {
    const sum = sorted[lo] + sorted[hi];
    if (sum === target) return true;
    if (sum < target) lo++;   // sum too small → only moving lo up can help
    else hi--;                // sum too big  → only moving hi down can help
  }
  return false;
}
```

The invariant that makes this correct: when `sum < target`, no pair `(lo, x)` with `x < hi` can work either (they'd be even smaller), so `lo` can be safely abandoned. Every step permanently discards one candidate — that's why it's linear.

**Read/write pointers** (in-place compaction):

```typescript
// Remove duplicates from a sorted array in place; returns new length.
function dedup(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  let write = 1; // everything before `write` is the deduped prefix
  for (let read = 1; read < sorted.length; read++) {
    if (sorted[read] !== sorted[write - 1]) {
      sorted[write++] = sorted[read];
    }
  }
  return write;
}
```

### Complexity of this pattern

**O(n) time, O(1) space** — each pointer moves at most n steps total and never moves backward, and no auxiliary structure is needed. If you must sort first, the sort's O(n log n) dominates.

## Common Pitfalls

- Applying converging pointers to an **unsorted** array — the "which pointer to move" argument collapses. Sort first or use a hash map.
- Off-by-one in the loop condition: `lo < hi` vs `lo <= hi` — decide whether pointers may refer to the same element (pair sum: no; palindrome check: doesn't matter).
- Moving the wrong pointer on ties or duplicates (classic in 3-sum: skip equal neighbors to avoid duplicate triples).
- Forgetting the write pointer's invariant and overwriting unread elements in compaction problems.

## Related Topics

- Prerequisite: **Arrays, Strings & Hashing** (the unsorted-input alternative).
- A window is two pointers that maintain state between them: **Sliding Window**.
- Runner pointers in linked lists: **Fast & Slow Pointers**.
