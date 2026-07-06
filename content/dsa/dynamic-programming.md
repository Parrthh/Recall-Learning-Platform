## Theory

**Dynamic programming (DP)** applies when a problem has:

1. **Optimal substructure** — the answer for the whole is composed from answers to subproblems.
2. **Overlapping subproblems** — the same subproblems recur, so caching pays off.

DP is "brute-force recursion + memory". The reliable derivation path in an interview:

1. Write the **brute-force recursion** (what choice do I make at each step?).
2. Identify the **state** — the minimal parameters the recursion actually depends on.
3. **Memoize** (top-down), or reorder into a **table** (bottom-up).
4. Optimize space if the table only reads a few previous rows.

Complexity falls out mechanically: **(number of states) × (work per state)**.

## Pattern

**1D DP** — climbing stairs (each step: hop 1 or 2):

```typescript
// states: n; work per state: O(1) → O(n) time, O(1) space after rolling.
function climbStairs(n: number): number {
  let prev = 1, curr = 1; // ways(0), ways(1)
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
```

**2D DP / LCS family** — longest common subsequence:

```typescript
// states: (i, j) prefixes; O(n·m) time, O(m) space with a rolled row.
function lcs(a: string, b: string): number {
  const dp = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = 0; // dp[i-1][j-1]
    for (let j = 1; j <= b.length; j++) {
      const above = dp[j]; // dp[i-1][j]
      dp[j] = a[i - 1] === b[j - 1] ? diagonal + 1 : Math.max(above, dp[j - 1]);
      diagonal = above;
    }
  }
  return dp[b.length];
}
```

**0/1 Knapsack** — the "take it or leave it" template:

```typescript
// O(n·W) time, O(W) space. Iterate capacity DOWNWARD so each item is used once.
function knapsack(weights: number[], values: number[], capacity: number): number {
  const dp = new Array<number>(capacity + 1).fill(0); // dp[c] = best value with capacity c
  for (let i = 0; i < weights.length; i++) {
    for (let c = capacity; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
```

Recognizing the sub-family matters more than memorizing solutions: *choices over prefixes* (house robber), *two sequences* (LCS/edit distance), *capacity budget* (knapsack/coin change), *intervals* (burst balloons), *subsets over bitmasks*.

### Complexity of this pattern

**Time = #states × work per state**; **space = #states**, frequently reducible by one dimension when transitions only read the previous row (rolling array). E.g. LCS: n·m states × O(1) work = O(n·m) time, O(min(n, m)) space.

## Common Pitfalls

- Memoizing on the wrong key — if the recursion's behavior depends on a parameter, it must be in the state (and vice versa: drop parameters that are derivable).
- Iterating knapsack capacity **upward** for 0/1 knapsack — that silently turns it into *unbounded* knapsack (item reused).
- Wrong base cases — empty-prefix rows/columns usually hold the identity (0, or Infinity for min-problems); Infinity bases need care in `Math.min`.
- Reconstructing "the actual answer" (not just its value) without storing parent choices.
- Reaching for DP when greedy provably works (interval scheduling) — check for an exchange argument first.

## Related Topics

- Prerequisite: **Big-O & Complexity Analysis** (counting states) and **Backtracking** (DP memoizes the same decision tree).
- Greedy is DP with a provable "always best" local choice: **Greedy Algorithms**.
