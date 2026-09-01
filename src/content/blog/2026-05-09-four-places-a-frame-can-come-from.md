---
title: 'Four Places a Video Frame Can Come From'
description: 'Multi-level cache routing across local cache, peer cache, an RDMA tier and origin fallback — and why every layer you add makes the worst case worse.'
date: 2026-05-09
lang: 'en'
---

When a request for a video frame reaches one of our cache nodes, there are four places the bytes
can come from, in increasing order of regret:

1. **Local cache** on the node that received the request.
2. **A remote peer** — the node that owns the key on the hash ring.
3. **The RDMA tier** — a shared, larger pool reachable with much less CPU per byte than a normal
   network hop.
4. **Origin.** The thing we exist to protect.

That list looks like a straightforward waterfall, and for a while I thought of it as one. It is
more useful to think of it as a latency budget you are spending on a bet.

## The arithmetic that makes people add layers

The pitch for another cache layer is always the same. Layer *k+1* is cheaper than origin, so if it
catches a fraction of layer *k*'s misses, you have won.

That is true on average and it is why hit rate is the number everyone quotes. Ours sits above 82%
on the local layer, and each layer below removes another chunk of what escapes.

The part the arithmetic hides: **you only reach layer 4 by first failing at 1, 2 and 3.** The
requests that end up at origin — the ones that were already the slowest and already the most
likely to be someone's bad experience — now carry the accumulated cost of three failed lookups
before origin even hears about them.

So adding a layer improves the mean and degrades the tail. If you are being graded on p99 and
someone proposes a new cache tier, the honest answer is "it depends how often it misses".

## Budgets, not waterfalls

The fix is not to have fewer layers. It is to stop letting each layer decide independently how long
it is willing to wait.

A request arrives with a deadline. Every hop gets a slice of the remaining budget, not a fixed
timeout of its own:

```go
func (h *Handler) Get(ctx context.Context, key string) ([]byte, error) {
    if b, ok := h.local.Get(key); ok {
        return b, nil
    }
    // Only consult the peer if there is enough budget left to also
    // fall through to origin afterwards.
    if budget(ctx) > peerBudget+originBudget {
        pctx, cancel := context.WithTimeout(ctx, peerBudget)
        defer cancel()
        if b, err := h.peer.Get(pctx, key); err == nil {
            h.writeBackAsync(key, b)
            return b, nil
        }
    }
    return h.origin.Get(ctx, key)
}
```

The condition in the middle is the whole idea. A layer is allowed to try only if failing at it
still leaves room to succeed somewhere else. Without that check, a slow-but-not-dead peer turns
into timeouts at the top of the stack, and you have converted a cache miss into an error, which is
a strictly worse outcome.

This also means a cache layer must be *skippable under pressure*. Not disabled — skipped, per
request, based on how much budget is left.

## Write-back is asynchronous, and that is a decision

When layer *k+1* answers, the bytes should end up in layer *k* so the next request is cheaper. The
obvious implementation writes it inline before responding. Do not do that: you have made the miss
path pay for the benefit of a future request that may never arrive.

So write-back is asynchronous — hand the client its bytes, queue the fill. Which introduces the
things async always introduces:

- **The queue needs a bound and a drop policy.** During a miss storm the fill queue grows exactly
  when the node is least able to service it. Dropping fills is the correct behaviour; the cost of a
  dropped fill is one future miss, and the cost of an unbounded queue is the node.
- **Duplicate fills are guaranteed.** A thousand concurrent requests for a newly popular key all
  miss, all fetch, all queue a fill. Collapse them — single-flight per key on both the fetch and
  the fill. This is the single highest-value 20 lines in the whole path.
- **The cache is now eventually consistent with itself.** Fine for immutable content. If you are
  caching something mutable, an async fill is a correctness bug with a delay fuse on it.

## Eviction should know about capacity, not just recency

Classic LRU answers "who was used least recently". At multi-tier scale the more pressing question
is "how close is this node to falling over".

Eviction that is aware of capacity — how full the tier is, how fast it is filling, how much
headroom is left before writes start contending with reads — behaves differently from pure LRU in
one important way: it starts evicting *early and gently* instead of *late and violently*. Running a
tier at 99% and evicting exactly as much as you admit produces a node where every write waits for
an eviction. Evicting on a gradient as you approach the limit costs you a slightly lower hit rate
and buys you a node that does not have a cliff in it.

Cliffs are the thing to design against. A slightly worse average is an easy trade for the absence
of a cliff.

## Feature gates, because you will be wrong

Everything above is a set of guesses about a workload that changes. Which tier helps, how much
budget each hop deserves, whether the RDMA tier is worth consulting for a given key class — these
are not properties you derive once and encode. They are parameters.

So every one of them is behind a runtime gate. Not "we might turn this feature on someday" gates —
operational controls, changeable without a deploy:

- turn a tier off for a key class
- shift the budget split between hops
- change the eviction gradient
- disable write-back entirely

The reason is unglamorous. At three in the morning, with a tier misbehaving in a way nobody
predicted, the useful question is not "what is the root cause" but "which of these four things can
I stop doing right now". A deploy is ten minutes you do not have, and a rollback is a change to
code you are not sure about. A gate is a decision someone can make while still reading the
dashboard.

The layers give you the hit rate. The gates are what let you keep it.
