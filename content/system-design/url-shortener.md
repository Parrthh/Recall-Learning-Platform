## Requirements Gathering Checklist

Ask before designing — these answers change the architecture:

- **Functional**: shorten URL → short code; redirect short code → original URL. Custom aliases? Expiration? Click analytics? Auth/user accounts?
- **Scale**: how many new URLs/day? Read:write ratio? (Shorteners are extremely read-heavy — assume 100:1 unless told otherwise.)
- **Constraints**: how short must codes be? Are links permanent? Latency target for redirects (this is the product — aim <50 ms)?
- **Non-functional**: availability over consistency for redirects? (Yes — a stale redirect beats no redirect.)

## Back-of-Envelope Estimation

Assume 100M new URLs/month, 100:1 read:write.

- Writes: 100M / month ≈ **~40 writes/sec** (10⁸ / 2.6×10⁶ sec). Trivial.
- Reads: 100× → **~4,000 redirects/sec**, peak maybe 3× → 12k/sec. This is a *caching* problem.
- Storage: 100M/month × ~500 bytes/row × 5 years ≈ **3 TB**. One well-indexed Postgres or a key-value store handles this; sharding is optional insurance.
- Code space: 62 characters (a–z, A–Z, 0–9), length 7 → 62⁷ ≈ **3.5 trillion** codes — decades of headroom.

## Suggested Architecture

```
client → CDN/edge (optional) → LB → stateless API servers
                                      ├── Redis (code → URL, LRU, ~hot 20%)
                                      └── DB (codes table, unique index on code)
              write path: ID allocator → base62 encode → insert
```

1. **Code generation — the interesting decision.**
   - *Counter + base62*: a monotonically increasing ID (DB sequence, or blocks of IDs handed to each app server — the "range allocator" — to avoid a single-point counter). Encode the ID in base62. Simple, no collisions, but codes are guessable/sequential (mitigate by adding a random offset or bijective scramble).
   - *Random 7-char string / hash prefix*: generate, insert with unique constraint, retry on the (rare) collision. Non-guessable, needs no coordination — a fine default answer.
   - Custom aliases: same table, uniqueness enforced by the same constraint.
2. **Redirect path**: `GET /{code}` → Redis hit (majority) → 301/302 to target. Cache-aside with TTL; negative-cache unknown codes briefly to blunt scanning.
3. **301 vs 302**: 301 (permanent) lets browsers cache and skips your server — cheaper, but kills click analytics and makes links un-editable. Use **302** if analytics/updates matter. Interviewers love this question.
4. **Analytics** (if required): don't write a DB row per click on the redirect path — enqueue a click event (Kafka/SQS) and aggregate asynchronously.
5. **Expiration**: TTL column + lazy deletion on read, plus a background sweeper.

## Trade-off Discussion

- **Counter vs random codes**: coordination + guessability vs collision retries. Both are right; justify the choice.
- **SQL vs KV store**: at 40 writes/sec, Postgres is comfortably enough (and gives you custom aliases + analytics joins cheaply); DynamoDB buys effortless scale if requirements 10×.
- **Consistency**: redirects tolerate replica lag (AP-leaning); creating a link should read-your-write (show the user their working link) — route post-create reads to the leader or return the mapping directly.
- **Cache failure**: 12k reads/sec falling through to the DB — keep a DB that can survive it, or add request coalescing.

## Related Topics

- Prerequisites: **Caching**, **Databases**, **Load Balancing**.
- The async click-analytics pipe is **Message Queues & Async Processing**.
