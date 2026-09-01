---
title: 'A Dropped Read Is a Retry. A Dropped Upload Is Gone.'
description: 'Notes from building edge storage redundancy for 12k+ QPS of video uploads: local writes, dual replicas, WAL retry, and why a dying disk is worse than a dead one.'
date: 2026-06-27
lang: 'en'
---

Most of my time goes on caches, where the failure mode is mild. Miss the cache, ask origin, add
some milliseconds. The data still exists; you were just slow about finding it.

Edge uploads are not like that. A user has recorded something, their phone has pushed the bytes to
whichever edge cluster was closest, and if we lose them there is nothing to fall back to. There is
no origin for data that has not arrived yet. That asymmetry changes almost every design decision.

## Accept locally, replicate afterwards

The safe-sounding design is to accept an upload only once it is durably in the central store. It is
also the wrong one at the edge. Edge clusters sit at the end of long, unreliable links — that is
the entire point of putting them there. If every upload has to survive a round trip to the centre
before we acknowledge it, then every hiccup on that link becomes a user-visible upload failure, on
the slowest network in the system.

So we write locally first, replicate after:

1. Write the object to local disk in the edge cluster.
2. Record the intent to replicate in a write-ahead log.
3. Acknowledge the upload.
4. Replicate asynchronously to a second replica, then onward to the centre.

Step 3 is a promise made on the strength of step 1 and step 2. It deserves to be said out loud,
because everything that follows is about making that promise true.

## Two replicas, because one disk is not a durability story

A single local copy means one disk failure equals data loss. Not "degraded" — loss. So every object
gets a second copy on a peer node in the same cluster, written asynchronously, before we consider it
settled.

Two is a deliberate choice rather than a compromise. Three replicas at the edge triples the write
amplification on hardware that is space-constrained and physically awkward to get to, and the
correlated-failure risk we actually face at the edge is not "two disks die independently" but
"something happened to the site", which a third local replica does not help with. Two local copies
plus an onward path to the centre covers the realistic cases.

Peers are discovered automatically. Static peer lists at the edge are a maintenance trap: nodes get
replaced, clusters get resized, and every hand-maintained list drifts until the day it is wrong
during an incident.

## The WAL is the honest part of the design

Async replication means there is always a window in which we have told the user "saved" and only
one copy exists. The write-ahead log is what makes that window recoverable instead of a lie.

Every accepted upload appends a durable intent record before the acknowledgement goes out. A
background worker walks the log and retries anything unfinished, with backoff. Records are cleared
only once the object is verified on its second replica. A node that reboots mid-flight reads its log
and picks up exactly where it stopped.

Two things I would emphasise to anyone building this:

**Retry has to be idempotent, and idempotent means key-addressed.** Replication that appends or
that generates a new identifier per attempt will cheerfully produce duplicates the first time the
network gives you a partial success. Content-addressed or key-addressed writes turn a duplicate
attempt into a no-op, which turns retry from a risk into a boring loop.

**The log needs a poison-record policy.** Some records will never succeed — a corrupt object, a peer
that has been decommissioned, a bug that only that record can find. Without a policy they sit at the
head of the queue forever and quietly stop replication for everything behind them. Cap the attempts,
move the record aside, alarm on the count. A retry loop with no escape hatch is a stall waiting for a
trigger.

## Disk health governance, or: the dying disk problem

We run multi-PiB of edge infrastructure. At that scale disks are not an exceptional event, they are
a background process. You do not design for "a disk might fail", you design for "several are failing
right now".

Dead disks are easy. They stop answering, health checks notice, the node routes around them.

The expensive case is the disk that is *dying*. It still accepts writes. It still reports itself as
present. It has quietly started taking two hundred milliseconds per operation, or it fails one write
in ten thousand, or its error counters have been climbing for a week. A dead disk removes itself
from the system. A dying disk stays in it and taxes everything that touches it — and because it is
still accepting writes, the placement logic keeps handing it more work.

So disk health is a first-class, continuously-evaluated input to placement, not a binary check:

- latency distributions per device, not averages — a device with a fine median and a terrible p99 is
  a device that is failing
- error and reallocation counters trended over days, because the interesting signal is the slope
- write success rate over a short window
- and a state machine with a **draining** state between healthy and dead

Draining is the state that matters. A draining disk keeps serving reads — the data on it is still
good and still wanted — but takes no new writes, and its objects get re-replicated elsewhere in the
background. Then, and only then, does it get pulled. Going straight from healthy to removed turns
every disk replacement into a re-replication burst, which is a self-inflicted incident on a
schedule.

## The rule I keep coming back to

For read paths, optimise the common case and let the rare case be slower. For write paths, decide
what you are promising, then make the rare case *correct* before you make the common case fast.

Uploads only get one chance. Every layer of that system — local-first writes, dual replicas, WAL
retry, health-aware placement — exists so that acknowledging early stays a real promise rather than
an optimistic one.
