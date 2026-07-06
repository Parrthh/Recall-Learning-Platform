## Theory

A **sliding window** is a contiguous range `[left, right]` over an array or string, plus some **state** describing what's inside it (a sum, a frequency map, a max). Instead of recomputing that state for every candidate range (O(n²) ranges × O(n) work each), you *slide* the window: extend on the right, shrink on the left, and update the state incrementally in O(1)–O(log n) per step.

Use it when the problem says: *longest / shortest / count of contiguous subarrays or substrings satisfying a condition* — and the condition is **monotonic**: growing the window can only make it "more violating," shrinking only "less violating." That monotonicity is what lets you never look back.

Two flavors:

- **Fixed-size window**: window length k is given; slide one step at a time, add the entering element, remove the leaving one.
- **Variable-size window**: grow the right end each step; while the window violates the constraint, shrink from the left.

## Pattern

**Fixed size** — max sum of any k consecutive elements:

```typescript
// O(n) time, O(1) space
function maxWindowSum(nums: number[], k: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;
  for (let right = k; right < nums.length; right++) {
    sum += nums[right] - nums[right - k]; // enter right, leave left
    best = Math.max(best, sum);
  }
  return best;
}
```

**Variable size** — longest substring without repeating characters:

```typescript
// O(n) time, O(min(n, alphabet)) space
function longestUnique(s: string): number {
  const counts = new Map<string, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    counts.set(c, (counts.get(c) ?? 0) + 1);
    while ((counts.get(c) ?? 0) > 1) { // violation: c repeated
      const l = s[left++];
      counts.set(l, (counts.get(l) ?? 0) - 1);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

The template to memorize: **for each `right`, admit `s[right]`; while invalid, evict from `left`; then record the answer.**

### Complexity of this pattern

**O(n) time** — `right` advances n times and `left` advances at most n times total (it never moves backward), so the inner `while` is amortized O(1). **Space** is whatever the window state costs: O(1) for a sum, O(k) or O(alphabet) for a frequency map.

## Common Pitfalls

- Using a window when the condition isn't monotonic (e.g., subarray sum equals k *with negative numbers*) — shrinking no longer reliably reduces the sum; use prefix sums + hash map instead.
- Recording the answer *before* restoring validity (or after, when the problem wants the longest *invalid-then-fixed* window) — be deliberate about where `best` is updated relative to the shrink loop.
- Forgetting to decrement/remove state when `left` advances — the map must exactly describe the current window.
- Off-by-one in window length: it's `right - left + 1`.

## Related Topics

- Prerequisite: **Two Pointers** — a window is two pointers plus state.
- Frequency-map state: **Arrays, Strings & Hashing**.
- Windows needing max/min in O(1): monotonic deque, see **Stacks & Queues**.
