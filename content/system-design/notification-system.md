## Requirements Gathering Checklist

- **Channels**: push (APNs/FCM), email, SMS, in-app? Each has different providers, latency, and cost.
- **Triggers**: who sends? (Other services via API/events.) One-off vs bulk/campaign sends?
- **Guarantees**: can we drop a notification? (Marketing: maybe. OTP/security: never.) Ordering needed? At-least-once implies dedupe.
- **User controls**: preferences/opt-outs per channel, quiet hours, rate caps ("max 2/day"), digest bundling?
- **Scale**: notifications/day, peak factor (a viral event or a campaign blast is the peak), fan-out size (one user vs 10M).

## Back-of-Envelope Estimation

Assume 10M users, average 10 notifications/user/day = 10⁸/day ≈ **~1,200/sec average**, campaign spikes to 50k+/sec enqueued (drained at provider-limited rates). Payloads ~1 KB → ~100 GB/day of transient message traffic; provider API rate limits (e.g., SMS at hundreds/sec per account) — the queue absorbs the difference.

## Suggested Architecture

```
producer services ──► Notification API ──► validation / preference & opt-out check
                                             │
                                             ▼
                                     Kafka topic (or SQS), partitioned by user_id
                                             │
                        ┌──────────────┬─────┴────────┬──────────────┐
                        ▼              ▼              ▼              ▼
                  push workers    email workers   SMS workers   in-app writer
                   (FCM/APNs)      (SES/etc.)     (Twilio)      (DB + websocket)
                        │              │              │
                        └──── retries w/ backoff, DLQ, delivery-status events ────► analytics
```

Key decisions to narrate:

1. **Queue between API and workers** — the system's spine. Producers get fast acks; per-channel workers scale independently and respect provider rate limits; spikes become queue depth, not outages.
2. **Idempotency**: producers send a `notification_id`; workers dedupe on it (at-least-once delivery *will* redeliver). Store recent IDs in Redis with TTL.
3. **Preference service** checked *before* enqueue (cheap rejection) — opt-outs, quiet hours, per-user rate caps (a Redis counter per user/day).
4. **Template service**: producers send `template_id + variables`, not rendered content — consistent branding, localization, and smaller messages.
5. **Reliability tiers**: OTP/security notifications go on a dedicated high-priority queue with aggressive retries; marketing goes on a bulk queue that can lag. Never let a campaign blast delay password-reset emails.
6. **Delivery tracking**: workers emit status events (sent/delivered/bounced/failed) to an analytics stream; failures beyond N retries land in a DLQ for inspection.

## Trade-off Discussion

- **Push vs pull for in-app**: websockets give instant delivery but hold millions of connections; polling is simpler and fine for non-urgent badges. Hybrid: websocket when app is open, push otherwise.
- **At-least-once + dedupe vs best-effort**: dedupe infrastructure is real work; marketing sends can skip it, transactional sends cannot.
- **One queue vs per-channel queues**: per-channel (and per-priority) isolates slow providers — SMS provider degradation shouldn't back up push.
- **Fan-out on write for campaigns**: materializing 10M messages at send time is a huge burst; a "campaign expander" that streams the audience into the queue at a controlled rate protects everything downstream.

## Related Topics

- Prerequisites: **Message Queues & Async Processing**, **Scalability Basics**.
- Rate caps and provider limits are **Rate Limiting** in disguise; user prefs live in **Databases**.
