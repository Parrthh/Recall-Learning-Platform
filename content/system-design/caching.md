## Theory

A **cache** keeps a copy of expensive-to-fetch data somewhere faster/closer, trading freshness and memory for latency and load reduction. Caching is usually the single highest-leverage box you can add to a read-heavy design.

### The caching layers (client → database)

1. **Client/browser**: HTTP caching via `Cache-Control`, `ETag` — zero server cost on a hit.
2. **CDN**: static assets and cacheable API responses served from edge locations.
3. **Application cache**: Redis/Memcached between app servers and the DB — the layer you'll discuss most in interviews.
4. **Database-internal**: buffer pools, query caches — free but not under your control.

### Read strategies

- **Cache-aside (lazy loading)** — the default. App checks cache; on miss, reads DB and populates the cache with a TTL. Simple, tolerates cache failure; first request after expiry pays the miss.
- **Read-through** — the cache itself loads from the DB on miss (cache library owns the loading logic).

### Write strategies

- **Write-through**: write cache + DB synchronously. Reads are always warm; writes pay double latency.
- **Write-behind**: write cache, flush to DB asynchronously. Fast writes; risks loss on cache crash.
- **Write-around**: write DB only, let reads repopulate. Avoids polluting the cache with write-once data.

### Invalidation — the hard part

- **TTL** everywhere as the backstop: staleness is bounded, memory reclaims itself.
- **Explicit invalidation** (delete the key on write) for must-be-fresh data. Prefer *delete* over *update-in-place* — deleting avoids writing stale data in race conditions.
- **Versioned keys** (`user:42:v7`) sidestep invalidation races entirely at the cost of garbage keys.

### Eviction & failure modes

Eviction: **LRU** is the default answer (Redis `allkeys-lru`); LFU for skewed, stable popularity. Know the three classic stampede-shaped failures:

- **Cache stampede / thundering herd**: a hot key expires and thousands of requests hit the DB simultaneously. Fixes: per-key locking ("single flight"), jittered TTLs, background refresh of hot keys.
- **Cache penetration**: requests for keys that don't exist anywhere bypass the cache repeatedly — cache negative results briefly or use a Bloom filter.
- **Hot key**: one celebrity key overwhelms a single cache node — replicate the key or shard it with a suffix.

## Common Pitfalls

- Saying "add Redis" without stating **what's cached, keyed by what, with what TTL and invalidation** — the four questions every interviewer follows up with.
- Caching before knowing the read/write ratio — caching a write-heavy, read-rarely dataset is negative-value.
- Update-in-place invalidation racing a concurrent read: reader fetches old DB value, writer updates cache, reader overwrites with stale data. Delete-on-write + cache-aside avoids the worst of it.
- Ignoring cache-cluster failure: if the cache dies, does the DB survive the full read load? (Circuit breakers, request coalescing.)
- Identical TTLs on keys populated together → synchronized mass expiry. Add jitter.

## Related Topics

- Prerequisite: **Scalability Basics**.
- Distributing a cache across nodes uses consistent hashing: **Load Balancing**.
- What happens when the cache can't save you: **Databases: SQL vs NoSQL, Replication & Sharding**.
