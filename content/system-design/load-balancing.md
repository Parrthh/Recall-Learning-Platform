## Theory

A **load balancer (LB)** sits in front of a pool of servers and spreads incoming requests across them. It's what turns "more machines" into "more capacity", and it doubles as the health-checking gatekeeper that routes around dead instances.

### Where it operates

- **L4 (transport)**: routes by IP/port, TCP/UDP-level. Very fast, no visibility into the request.
- **L7 (application)**: terminates HTTP, can route by path/host/header (`/api/*` → API pool), do TLS termination, compression, and per-route policies. Slightly more overhead, much more flexibility. Most cloud LBs you'll name in interviews (ALB, Nginx, HAProxy) are L7.

### Algorithms

| Algorithm | How it picks | When it shines |
|---|---|---|
| Round robin | Next server in rotation | Homogeneous servers, uniform requests |
| Weighted round robin | Rotation biased by capacity | Mixed instance sizes; canary deploys |
| Least connections | Fewest active connections | Long-lived or highly variable requests |
| Least response time | Fastest recent responses | Latency-sensitive pools |
| IP hash | Hash of client IP | Cheap stickiness without cookies |
| Consistent hashing | Hash ring over servers | Cache pools — minimizes remapping when nodes join/leave |

### Health checks & high availability

The LB probes each backend (e.g., `GET /healthz` every few seconds) and ejects failures. The LB itself must not become the single point of failure: run a redundant pair (active-passive with a floating IP, or DNS-level failover), or use a managed LB where the provider handles this.

**Sticky sessions** (pinning a client to one server) exist for stateful apps but fight horizontal scaling — the better fix is making servers stateless and sharing session state.

## Common Pitfalls

- Placing a load balancer in a design and *never mentioning health checks* — routing to dead servers is the failure mode LBs exist to prevent.
- Forgetting the LB is itself a SPOF — one box in the diagram labeled "LB" invites the follow-up "what happens when it dies?"
- Using sticky sessions to paper over stateful servers, then being unable to answer "what happens when that server dies?"
- Using round robin for wildly variable request costs — a few heavy requests pile onto one unlucky server; least-connections handles this.
- Confusing load balancing with rate limiting or API gateways — related boxes, different jobs.

## Related Topics

- Prerequisite: **Scalability Basics** (stateless services make LBs effective).
- Consistent hashing reappears in **Caching** and database **sharding**.
- The L7 box often merges with an **API Gateway** in microservice designs.
