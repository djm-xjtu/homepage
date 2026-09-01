---
title: 'Most of Agent Engineering Is Tool Design'
description: 'What I learned building a supervisor-based on-call agent that does root cause analysis and self-recovery for five products: the model was never the bottleneck, the tools were.'
date: 2026-08-21
lang: 'en'
---

I got into this because I was on call. Being paged for the fifth time about a failure mode I had
already diagnosed four times is a strong motivator, and the diagnosis itself was rarely clever — pull
the metrics, check the recent config changes, look at the pod states, compare against last week,
notice the obvious thing. Mechanical work, at an hour when I was least equipped to do mechanical
work.

That agent now does automated root cause analysis and self-recovery for five products on our video
platform. Almost none of the effort went into prompting. It went into tools.

## One agent with every tool does not work

The first version was a single agent with access to everything: metrics, logs, Kubernetes, the
configuration centre, object storage, Redis, deployment history. Reasonable-looking. It failed in a
specific and repeatable way.

Given forty tools, the model does not pick the right one — it picks a *plausible* one. Asked about
elevated latency, it would reach for the log search tool, get back a wall of unremarkable lines,
conclude that logs looked fine, and move on having learned nothing. It was not wrong that logs are
relevant to latency. It was wrong that logs were the *next* thing to look at, and nothing in the
tool list told it otherwise.

Tool descriptions are the only thing distinguishing forty options, and they are read without the
context that a human on-call engineer carries about which signal is worth checking first. More tools
made this worse, monotonically. Every tool added is another way to be plausibly wrong.

## Supervisor plus specialists

So the architecture became a supervisor with specialised sub-agents underneath.

The supervisor does one job: read the alert and decide which specialist owns this. Metrics
anomalies, configuration changes, infrastructure state, storage-layer behaviour — each is a
sub-agent with **its own tools and its own prompt**.

```
alert → supervisor → { metrics agent | config agent | infra agent | storage agent } → findings
                            ↓
                     synthesis → RCA → (gated) recovery action
```

The gain is mostly the narrowing. A sub-agent with five tools and a prompt about one domain barely
has room to make the category of mistake that broke version one. Its prompt can be specific in a way
a general prompt cannot — a metrics agent's instructions can say *check the derivative before the
absolute value, and always compare against the same hour last week*, because that agent will never be
asked about anything else.

It also makes failures debuggable. When the answer is wrong, it is wrong inside one sub-agent with a
short trace, not somewhere in a forty-tool transcript.

## What makes an MCP tool good

I have built a lot of MCP tools now — over our private cloud, Kubernetes, the configuration centre,
the metrics stack, Grafana, object storage, Redis, plus platform-specific ones. The Grafana set ended
up published to our internal marketplace and picked up by teams I have never met, which taught me
more about what generalises than my own usage did.

The patterns that hold up:

**Return conclusions, not dumps.** The instinct is to expose the underlying API faithfully and let
the model figure it out. This is the single biggest mistake. A tool that returns 8,000 tokens of raw
time series has spent most of the context window to communicate one fact. `query_metric` should
return *"p99 up 3.2× versus the same window last week, step change at 14:03"*. Do the aggregation in
the tool. The tool is allowed to be opinionated — that is the value it adds.

**Name for intent, not for endpoint.** `get_service_health` gets reached for correctly.
`query_metrics_v2` does not, because the model has to infer intent from a name that describes a
transport. Every tool name is a hint about when to use it, and it is the hint the model sees most
often.

**Say what the tool is not for.** Descriptions that only describe capability invite misuse. The most
effective line in several of my descriptions is a negative one: *use this for pod-level state, not
for cluster capacity*. Cheap to write, removes a whole class of wrong turn.

**Make partial failure explicit.** A tool that silently returns data for three of five clusters
produces confident, wrong conclusions. Return the gap as data: `covered: [...], missing: [...]`. The
model handles acknowledged uncertainty far better than it handles unknown incompleteness.

**Budget the context.** Every tool should have a bounded, predictable response size. One chatty tool
can consume the room the agent needed for the rest of the investigation, and the symptom looks like
the model "forgetting" earlier findings rather than like a tool problem.

That last cluster of points is why I say the model was never the bottleneck. The same model, on the
same incident, with tools that return conclusions instead of data, is a different product.

## Self-recovery, carefully

RCA is read-only, so it is easy to be brave. Recovery writes, so it is not.

The rule we settled on: **the agent may only take actions that are reversible, bounded, and would not
require a human's judgement if a human were doing them.** Concretely, that means an allowlist —
restart a specific workload, flip a specific known feature gate, drain a node, adjust a rate limit
within a preset range. Everything outside the allowlist becomes a recommendation with the evidence
attached, and a human clicks it.

Two details that turned out to matter more than the allowlist itself:

- **Every action writes its own reversal.** Before flipping a gate, record the previous value and the
  command that restores it. Recovery that cannot be undone by the next responder is not recovery, it
  is a second incident with unclear provenance.
- **Rate-limit the agent.** An agent that restarts something, sees no improvement, and restarts it
  again is doing what its instructions imply. Cap actions per incident and require escalation beyond
  the cap. This one is obvious in hindsight and was not obvious in advance.

## Where it stands

The honest summary: it handles the boring 70% well, and the boring 70% was most of the pages. It
correlates a config change with a metric step change faster than I do, because it never has to
remember which dashboard that lives on. It does not solve the genuinely novel incident, and I have
stopped expecting it to — those are the ones worth waking a person for.

The framing that has been most useful to me is that this is not really "AI work". It is building an
operator that happens to have a language model in the decision loop, and the difficulty lives where
it always lived: in the interfaces, in what the system tells you about itself, and in being careful
about what you let it change.
