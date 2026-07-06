## Theory

A **graph** is vertices plus edges — directed or undirected, weighted or not. Interview graphs are usually given as an edge list, an adjacency matrix, or *implicitly* (a grid where neighbors are adjacent cells; words that differ by one letter). First move in any graph problem: **build an adjacency list** (`Map<node, node[]>`), the representation every traversal wants.

Core toolkit:

- **BFS** (queue): explores in rings; finds **shortest paths in unweighted graphs**.
- **DFS** (stack/recursion): explores deep; natural for connectivity, components, cycle detection, and anything needing post-order (topological sort).
- **Topological sort** (Kahn's algorithm): linearizes a DAG by repeatedly removing zero in-degree nodes; detects cycles when it can't finish.
- **Union-Find**: near-O(1) "are these connected?" under incremental edge additions.
- **Dijkstra**: shortest paths with non-negative weights (BFS where the queue becomes a min-heap). **Bellman-Ford** handles negative weights in O(V·E).

## Pattern

**BFS for shortest unweighted distance**:

```typescript
// O(V + E) time, O(V) space.
function shortestPath(adj: Map<number, number[]>, start: number, goal: number): number {
  const dist = new Map<number, number>([[start, 0]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) { // index-based O(1) dequeue
    const node = queue[head];
    if (node === goal) return dist.get(node)!;
    for (const next of adj.get(node) ?? []) {
      if (!dist.has(next)) {              // "visited" check at ENQUEUE time
        dist.set(next, dist.get(node)! + 1);
        queue.push(next);
      }
    }
  }
  return -1;
}
```

**Topological sort with cycle detection** (Kahn's):

```typescript
// O(V + E) time, O(V) space. Returns null if the graph has a cycle.
function topoSort(n: number, edges: [number, number][]): number[] | null {
  const adj = new Map<number, number[]>();
  const indegree = new Array<number>(n).fill(0);
  for (const [from, to] of edges) {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
    indegree[to]++;
  }
  const queue: number[] = [];
  for (let v = 0; v < n; v++) if (indegree[v] === 0) queue.push(v);
  const order: number[] = [];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    order.push(node);
    for (const next of adj.get(node) ?? []) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return order.length === n ? order : null; // leftover nodes ⇒ cycle
}
```

**Union-Find** with path compression + union by size:

```typescript
class UnionFind {
  private parent: number[];
  private size: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // path halving
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}
```

### Complexity of this pattern

BFS/DFS: **O(V + E) time, O(V) space** — each vertex enqueued once, each edge relaxed once. Topological sort: same. Union-Find: **O(α(n)) amortized per operation** (inverse Ackermann — effectively constant). Dijkstra with a binary heap: **O((V + E) log V)**.

## Common Pitfalls

- Marking nodes visited at **dequeue** time instead of enqueue time in BFS — nodes get enqueued multiple times and complexity degrades.
- Forgetting that grid problems *are* graph problems — rows×cols vertices, 4-directional edges; a separate `visited` structure (or in-place marking) is still required.
- Running Dijkstra with negative edge weights — its greedy settlement assumption breaks; use Bellman-Ford.
- Recursion-based DFS overflowing the stack on large inputs (10⁵+ nodes) — convert to an explicit stack.
- Treating an undirected edge as one directed edge when building the adjacency list.

## Related Topics

- Prerequisite: **Stacks & Queues** (BFS/DFS engines) and **Big-O & Complexity Analysis** (V+E accounting).
- DP on DAGs runs in topological order: **Dynamic Programming**.
