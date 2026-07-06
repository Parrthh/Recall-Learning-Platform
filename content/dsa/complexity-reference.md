## Theory

This page is the quick-lookup companion to **Big-O & Complexity Analysis**. Two tables: one for data-structure operations, one summarizing the typical complexity each pattern in this course produces. Individual pattern pages repeat their own row with the "why".

### Per-data-structure complexity

Time complexities are worst case unless noted; hash map rows show the expected (average) case first because that's what you should quote by default.

| Structure | Access | Search | Insert | Delete | Space |
|---|---|---|---|---|---|
| Array (static) | O(1) | O(n) | — | — | O(n) |
| Dynamic array | O(1) | O(n) | O(1) amortized (end); O(n) middle | O(n) | O(n) |
| Singly linked list | O(n) | O(n) | O(1) at head (with ref) | O(1) with prev ref, else O(n) | O(n) |
| Stack | O(n) | O(n) | O(1) push | O(1) pop | O(n) |
| Queue | O(n) | O(n) | O(1) enqueue | O(1) dequeue | O(n) |
| Hash map | — | O(1) avg / O(n) worst | O(1) avg / O(n) worst | O(1) avg / O(n) worst | O(n) |
| Binary search tree (balanced) | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| Binary search tree (unbalanced) | O(n) | O(n) | O(n) | O(n) | O(n) |
| Binary heap | O(1) peek min/max | O(n) | O(log n) | O(log n) pop | O(n) |
| Graph (adjacency list) | — | O(V + E) traverse | O(1) add edge | O(E) remove edge | O(V + E) |
| Trie | — | O(L) for word length L | O(L) | O(L) | O(total characters) |

### Per-pattern complexity (master table)

| Pattern | Typical time | Typical space | Why |
|---|---|---|---|
| Two pointers | O(n) | O(1) | Each pointer moves monotonically across the array once |
| Sliding window | O(n) | O(1)–O(k) | Window ends only advance; state tracks at most the window contents |
| Fast & slow pointers | O(n) | O(1) | Pointers traverse the list a constant number of times |
| Binary search | O(log n) | O(1) | Search space halves each step |
| Monotonic stack | O(n) | O(n) | Every element is pushed and popped at most once (amortized) |
| Heap / top-K | O(n log k) | O(k) | Each of n elements costs one O(log k) heap operation |
| BFS / DFS | O(V + E) | O(V) | Every vertex and edge is visited once; queue/stack holds vertices |
| Topological sort | O(V + E) | O(V) | Kahn's algorithm processes each node and edge once |
| Union-Find | O(α(n)) per op | O(n) | Path compression + union by rank flatten trees |
| Dijkstra (binary heap) | O((V + E) log V) | O(V) | Each edge relaxation is a heap operation |
| Backtracking | O(branchᵈᵉᵖᵗʰ), e.g. O(2ⁿ), O(n!) | O(depth) | Explores the full decision tree; recursion stack is the path |
| Dynamic programming | O(#states × work per state) | O(#states), often reducible | Each state computed once and memoized |
| Greedy | O(n log n) | O(1)–O(n) | Usually dominated by an initial sort |
| Bit manipulation | O(1) per op / O(n) scans | O(1) | Fixed-width integer operations are constant time |

## Common Pitfalls

- Quoting a hash map as flatly "O(1)" — say *average* O(1), worst O(n).
- Using the balanced-BST row for a plain BST an interviewer just made you build — it's only O(log n) if it's balanced (AVL/red-black) or the input is random.
- Forgetting that graph complexity has **two** variables: answers like "O(n)" are ambiguous — use V and E.
- Treating backtracking as polynomial because "we prune" — pruning improves constants and best cases, not the worst case, unless you can bound the tree.

## Related Topics

- Derivations behind every row: **Big-O & Complexity Analysis**.
- Each pattern page restates its row with worked reasoning — start with **Two Pointers**.
