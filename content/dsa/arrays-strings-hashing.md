## Theory

Arrays, strings, and hash maps are the substrate almost every other pattern builds on. Interview problems rarely say "use a hash map" — they say "find duplicates", "count frequencies", "have you seen this before?", and the hash map is the answer.

- **Arrays** give O(1) access by index and great cache locality. Insertion or deletion anywhere but the end is O(n) because elements must shift.
- **Strings** are immutable in JavaScript/TypeScript: every `s + t` allocates a new string. Repeated concatenation in a loop is O(n²) — collect parts in an array and `join` once.
- **Hash maps** (`Map`) and **hash sets** (`Set`) give average O(1) insert/lookup/delete. They trade space for time — the classic way to turn an O(n²) "compare all pairs" scan into an O(n) single pass.

## Pattern

The core move: **trade O(n) space for O(1) lookups**. One pass builds knowledge, the same (or a second) pass queries it.

```typescript
// "Two Sum": find indices of two numbers adding to target — O(n) time, O(n) space.
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const j = seen.get(complement);
    if (j !== undefined) return [j, i]; // partner was seen earlier
    seen.set(nums[i], i);
  }
  return null;
}
```

Frequency counting is the other workhorse:

```typescript
// Are two strings anagrams? — O(n) time, O(k) space for alphabet size k.
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const c = counts.get(ch);
    if (!c) return false; // missing or already used up
    counts.set(ch, c - 1);
  }
  return true;
}
```

**Canonical-key trick**: to group things that are "the same under some transformation" (anagrams, rotations), map each item to a canonical key (sorted string, normalized rotation) and bucket by key in a map.

### Complexity of this pattern

Single-pass hash-map algorithms are **O(n) time, O(n) space** — the map absorbs what would otherwise be a nested loop. Frequency counters over a fixed alphabet are O(1) space in practice (at most 26/128/256 keys).

## Common Pitfalls

- Using a plain object `{}` as a map with numeric keys — keys coerce to strings and prototype properties can collide. Prefer `Map`/`Set`.
- Mutating an array while iterating it by index — deletions shift subsequent elements and skip items.
- String building with `+=` in a loop (O(n²)); use `parts.push(...); parts.join("")`.
- Forgetting that `Map.get` returns `undefined` for missing keys — distinguish "absent" from "value is 0" with `has` or `?? 0`.

## Related Topics

- Complexity derivations: **Big-O & Complexity Analysis**.
- When the array is *sorted*, hashing is often beatable with O(1) space: **Two Pointers**.
- Substring problems with running state: **Sliding Window**.
