## Theory

Once data lives on more than one node, you must decide what a "read" is allowed to return while replicas disagree. That decision is the consistency model.

### CAP theorem

During a **network partition** (nodes can't talk to each other), a distributed system must choose between:

- **Consistency (C)**: every read sees the latest write — some requests must be refused/delayed.
- **Availability (A)**: every request gets a response — some responses may be stale.

(**P** — partition tolerance — isn't optional; networks *will* partition.) So real systems are **CP** (refuse service to stay correct: etcd, ZooKeeper, single-leader DBs on failover) or **AP** (keep answering, reconcile later: Dynamo-style stores, DNS).

Nuance interviewers reward: CAP only binds **during partitions**. In normal operation the real trade-off is **latency vs consistency** (PACELC: *if Partition, A or C; Else, Latency or Consistency*).

### The consistency spectrum

- **Strong / linearizable**: reads reflect all completed writes, system-wide. Costs coordination (quorums, consensus) → higher latency.
- **Read-your-writes / session**: *you* see your own writes; others may lag. Often exactly what a product needs.
- **Monotonic reads**: you never see data go backwards in time.
- **Eventual**: replicas converge if writes stop. Cheapest, weakest — fine for like counts, dangerous for account balances.

### Quorums

With N replicas, writes acknowledged by W nodes and reads consulting R nodes: **R + W > N** gives read-what-was-written overlap (e.g., N=3, W=2, R=2). Tuning W and R trades write latency vs read latency vs durability.

### Choosing per feature, not per system

A single product mixes models: payment ledger → strong; shopping cart → session; product view counter → eventual. Saying "this feature needs strong consistency, that one tolerates eventual" is the mark of a real answer.

## Common Pitfalls

- "We'll use an AP database" for money movement — reconciling double-spent balances "eventually" is a lawsuit, not an architecture.
- Claiming a system is "CA" — that's saying partitions won't happen; on a network, they do.
- Treating CAP as a permanent property instead of a during-partition behavior (and ignoring the latency cost of C in the happy path).
- Assuming leader-follower replication gives strong consistency — reads from lagging followers are eventual unless you route them to the leader.
- Confusing consistency (what reads return) with durability (whether committed data survives crashes).

## Related Topics

- Prerequisite: **Databases: SQL vs NoSQL, Replication & Sharding** (replication creates the problem).
- Queues shift work to "eventually" on purpose: **Message Queues & Async Processing**.
