## Theory

A **message queue** decouples producers from consumers: the producer enqueues a message and moves on; consumers process it later, at their own pace. This buys you:

- **Latency**: the user's request returns after the fast part (enqueue), not the slow part (send email, transcode video).
- **Load leveling**: spikes fill the queue instead of crashing workers; consumers drain at steady throughput.
- **Decoupling & fan-out**: producers don't know who consumes; new consumers subscribe without touching producers.
- **Resilience**: if a consumer dies mid-task, the message redelivers (visibility timeout / unacked redelivery).

### Two families

- **Task queues (SQS, RabbitMQ)**: a message is a job; one consumer processes it, then it's deleted. Competing consumers scale horizontally.
- **Logs (Kafka, Kinesis)**: an append-only, partitioned, replayable stream. Consumers track their own offsets; multiple independent consumer groups read the same events; history is retained. Choose a log when you need fan-out to many systems, replay, or event sourcing.

### Delivery semantics — the interview core

- **At-most-once**: fire and forget; loss possible. Rarely acceptable.
- **At-least-once**: the practical default — redelivery on failure means **duplicates happen**, so consumers must be **idempotent** (dedupe by message/business key, or make the operation naturally idempotent like `SET status = 'sent'`).
- **Exactly-once**: achievable only within narrow boundaries (Kafka transactions into Kafka; or effectively via at-least-once + idempotent consumer). Say "at-least-once with idempotent consumers" and you sound like you've operated one.

### Operational must-mentions

- **Dead-letter queue (DLQ)**: after N failed attempts, park the message for inspection instead of poisoning the queue with infinite retries.
- **Ordering**: only guaranteed within a partition (Kafka) or FIFO group (SQS FIFO) — global ordering costs throughput; partition by the entity that needs order (e.g., per-user).
- **Backpressure**: monitor queue depth/consumer lag; autoscale consumers on it.

## Common Pitfalls

- Async-ing something the user must see synchronously (payment authorization result) — then inventing a polling/notification layer to un-async it.
- Assuming exactly-once delivery from the broker and skipping idempotency — the first redelivery double-charges someone.
- No DLQ: one malformed "poison" message retries forever and blocks the queue.
- Requiring global ordering when per-entity ordering suffices (and destroys parallelism to get it).
- Unbounded retry with no backoff — a failing downstream gets hammered harder the more it fails.

## Related Topics

- Prerequisite: **Scalability Basics**; queues are how the "async processing" box in every case study actually works.
- Eventual consistency is the price of async: **Consistency Models & CAP**.
- See it applied end-to-end: **Design a Notification System** and **Design a URL Shortener**.
