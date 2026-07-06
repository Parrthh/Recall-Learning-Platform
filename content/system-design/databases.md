## Theory

The database is the bottleneck in most designs, so most scaling conversations end here.

### SQL vs NoSQL

- **Relational (Postgres, MySQL)**: strong schemas, ACID transactions, joins, mature tooling. Default choice unless you have a specific reason otherwise — "we might need scale someday" is not that reason.
- **Key-value / wide-column (DynamoDB, Cassandra)**: partition-key access patterns, massive horizontal write scale, tunable consistency. You give up joins and ad-hoc queries; you must know your access patterns up front.
- **Document (MongoDB)**: flexible nested documents; good for heterogeneous entities.
- **Search (Elasticsearch)** and **graph (Neptune)** engines complement, not replace, the primary store.

### Indexing

An index is a sorted structure (usually a **B-tree**) that turns full-table scans into O(log n) lookups, paid for with extra space and slower writes (every index updates on every write). Rules that cover most interview follow-ups:

- Index the columns in your `WHERE`, `JOIN`, and `ORDER BY` clauses.
- **Composite indexes** serve leftmost prefixes: an index on `(user_id, created_at)` serves `WHERE user_id = ?` and `WHERE user_id = ? AND created_at > ?`, but *not* `WHERE created_at > ?` alone.
- Every additional index taxes writes — don't index speculatively.

### Replication

Copy the same data to multiple nodes.

- **Leader-follower (primary-replica)**: writes go to the leader, replicas serve reads. Scales reads, provides failover. **Replication lag** means a read from a replica can miss your own just-committed write — the "read-your-writes" problem (fix: read from leader after writing, or session pinning).
- **Multi-leader / leaderless (Dynamo-style)**: write anywhere; conflicts must be resolved (last-write-wins, vector clocks, CRDTs). Higher availability, harder semantics.

### Sharding (partitioning)

When one node can't hold the data or absorb the writes, split rows across shards by a **shard key**:

- **Hash sharding**: uniform distribution, no range queries across shards.
- **Range sharding**: efficient range scans, risk of hot shards (e.g., time-ordered keys pile onto the newest shard).
- Use **consistent hashing** or a directory service so adding a shard doesn't reshuffle everything.

Sharding costs you: cross-shard joins and transactions, rebalancing pain, and a shard key you effectively can't change. It's the last resort *after* caching, read replicas, and vertical headroom.

## Common Pitfalls

- Choosing NoSQL "for scale" at 100 GB and 500 writes/sec — Postgres with replicas handles far more than people assume.
- Picking a low-cardinality or hot shard key (country, or timestamp for append-heavy loads) — one shard melts while others idle.
- Serving read-your-writes flows from lagging replicas (user updates profile, refresh shows old data).
- Unbounded `OFFSET` pagination on big tables — use keyset (cursor) pagination.
- Forgetting that adding an index is not free — write-heavy tables with ten indexes are a self-inflicted wound.

## Related Topics

- Prerequisite: **Scalability Basics**; caching absorbs reads before they reach here: **Caching**.
- What replication lag does to guarantees: **Consistency Models & CAP**.
