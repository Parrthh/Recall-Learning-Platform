## Theory

**Scaling** is what you do when one machine (or one instance) can't handle the load. Two directions:

- **Vertical scaling (scale up)**: a bigger machine — more CPU, RAM, faster disks. Zero application changes, but there's a hardware ceiling, cost grows super-linearly at the high end, and the machine remains a single point of failure.
- **Horizontal scaling (scale out)**: more machines behind a load balancer. Near-unlimited headroom and fault tolerance, but it forces architectural discipline: **statelessness**, shared data stores, and coordination.

The pivotal concept for interviews is the **stateless service**. If any instance can serve any request (session data lives in a shared store like Redis or in a signed cookie, files live in object storage, not on local disk), then scaling out is just "add instances". The moment an instance holds unique state, you need sticky sessions, and you've reintroduced a miniature single point of failure.

### The standard evolution story

A useful narrative to structure "design X" answers:

1. Single server (app + DB together).
2. Split app server and database.
3. Add a load balancer + multiple stateless app servers.
4. Add caching (and a CDN for static assets).
5. Scale the database: read replicas → then sharding when writes saturate.
6. Split into services / add async queues as team and traffic grow.

### Back-of-envelope numbers

Interviewers expect rough capacity math. Useful anchors: ~86,400 seconds/day (round to 10⁵); a single Postgres node comfortably serves thousands of simple queries/sec; one modern app server handles hundreds to a few thousand requests/sec; 1M daily active users each making 10 requests/day ≈ 115 requests/sec average, with peaks 3–10×.

## Common Pitfalls

- Jumping straight to microservices and sharded databases for a system doing 50 requests/sec — over-engineering is a red flag in interviews and in real life.
- Scaling the app tier while the database is the bottleneck (it usually is). State the bottleneck before proposing the fix.
- Ignoring that horizontal scaling *changes correctness*: two instances processing the same job need idempotency or locking.
- Treating average load as the design target — design for peak, with headroom.

## Related Topics

- Distributing traffic across instances: **Load Balancing**.
- Taking read pressure off the database: **Caching** and **Databases: SQL vs NoSQL, Replication & Sharding**.
