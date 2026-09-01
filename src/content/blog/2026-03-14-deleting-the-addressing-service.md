---
title: 'I Spent a Year Building an Addressing Service, Then Deleted It'
description: 'Why a centralised cache addressing service was the right first answer, why it stopped being the right answer, and what consistent hashing plus Gossip actually costs you.'
date: 2026-03-14
lang: 'en'
---

The first meaningful thing I owned at work was a cache addressing service. Small-object video
caching needs someone to answer one question — *which node has this object?* — and for about a
year, that someone was a service I wrote and ran.

Then I designed the architecture that removed it. This post is about both halves, because I think
the second half only makes sense if you take the first half seriously.

## Why a central directory is the obvious first answer

Start from the constraint. You have a fleet of cache nodes holding a very large number of very
small objects (video frames, in our case). A client wants one of them. Somebody has to map key →
node.

A directory service is the boring, correct answer:

- **It is a fact, not a guess.** The directory records where an object *actually is*. No
  inference, no assumptions about placement.
- **Placement becomes free.** You can put an object anywhere — on the node with the coldest disk,
  on the node closest to the client, on three nodes if you feel like it. The directory just
  records the decision.
- **Membership changes are cheap.** Add a node, and nothing needs to move. Remove a node, and you
  delete its rows.
- **It is easy to reason about when it breaks.** One service, one set of dashboards, one on-call
  runbook.

So we built it: an in-memory index for the hot path, Redis behind it for durability and for
sharing state across replicas. It served a lot of QPS and it worked. I still think it was the
right call for that stage — we did not yet know our own access patterns well enough to bake a
placement policy into a hash function.

## Why it stopped being the right answer

Three things went wrong, and only one of them was about performance.

**Every read paid for two round trips.** Lookup, then fetch. At our object sizes the lookup was
not much cheaper than the fetch itself — you are asking the network twice to get one frame.
Percentage-wise, that is a large fraction of a request that produces no bytes.

**The directory became the availability ceiling for the whole cache.** This is the one that
actually mattered. A cache is supposed to be the resilient layer, the thing that keeps working
when the origin is unhappy. Instead we had built a cache whose availability was
`min(cache, directory)`. Every cache node could be perfectly healthy and we would still serve
nothing, because nobody could be told where to go. You do not want a hard dependency in front of
your fallback layer.

**Its cost scaled with objects, not with traffic.** The fleet grows, average object size stays
tiny, so the number of rows grows superlinearly against everything else. Sharding the index was
tractable but it meant an increasing share of the team's attention went to running a directory
rather than running a cache.

## What replaced it

Consistent hashing with virtual nodes, plus Gossip for topology discovery. Clients compute the
target themselves and go straight there.

```go
// The whole "addressing service", now a function.
func (r *Ring) Lookup(key string) Node {
    h := hash(key)
    // vnodes is sorted by hash; find the first vnode at or after h.
    i := sort.Search(len(r.vnodes), func(i int) bool {
        return r.vnodes[i].hash >= h
    })
    return r.vnodes[i%len(r.vnodes)].node
}
```

Virtual nodes are not optional. With one token per physical node, load skew across a fleet is bad
enough to be a capacity planning problem on its own, and every membership change moves a huge
contiguous slice of the keyspace. A few hundred vnodes per node gets you distribution that is
boring, and makes each scaling event move a small, spread-out fraction of keys.

Topology comes from Gossip: nodes exchange membership and health with peers, and clients keep a
local view of the ring. No control plane on the read path. If the Gossip layer is completely
broken, clients keep using the last ring they had, which is *usually* still right — degradation
instead of an outage.

The results are what you would predict: lookup latency stops existing as a line item, read and
write throughput go up, and the cache's availability is now its own availability.

## The parts nobody puts on the slide

Consistent hashing is often presented as strictly better. It is not. You trade a set of problems
you understand for a set of problems that are harder to see.

**You lose placement freedom.** The hash decides. If one key is thousands of times hotter than
its neighbours, the ring does not care — that node is now your problem. With a directory you just
move the object or replicate it. Hot-key handling has to be built as a separate mechanism,
usually a local copy on whoever asks, which means you have now reintroduced multiple copies
without a directory to track them.

**Clients disagree during a change.** Gossip converges eventually, and "eventually" is where the
bugs live. Two clients with slightly different rings write the same key to different nodes; both
are correct according to themselves. For an immutable-content cache this is survivable — worst
case you store the same bytes twice and one copy is dead weight until eviction. If your objects
were mutable this design would be much scarier, and I would think hard before doing it.

**A membership change is a coordinated cache miss.** Move 1/N of the keyspace and the objects on
the moved ranges are now "missing" from the perspective of anyone asking. That traffic goes to
the origin. Scaling up your cache fleet causes a load spike on the thing the cache exists to
protect, which is a genuinely funny failure mode the first time you see it. Ramp membership
changes, and let clients try the previous owner before falling through.

**Debugging gets worse.** Previously: query the directory, see where the object is. Now: rebuild
the client's *view of the ring at that moment*, recompute the hash, and hope the client's ring
matched. So log the ring version alongside the key. You will need it, and you will not think to
add it until the first time you need it.

## What I actually took away

Both designs were right. The directory was right when we did not understand our workload; the
ring was right once we did, and once availability coupling had become the dominant risk.

The thing I would tell myself two years ago is that **a dependency in front of your fallback
layer is a design smell**, even when that dependency is well built and highly available. The
cache existed to absorb failures. Anything that has to be up for the cache to be up is
subtracting from the entire reason the cache is there.

And deleting a service you built is fine. It ran for a year, it taught us the access patterns
that made the replacement designable, and it left. That is a reasonable life for a piece of
software.
