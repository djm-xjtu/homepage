---
title: 'Hello, world'
description: 'A placeholder first post — what this site is for, and what I plan to write about here.'
date: 2026-08-28
lang: 'en'
---

This is the first post on this site, and mostly it exists so the blog page isn't empty.

I spend my days on the storage side of a video platform — caches, edge storage, addressing —
and more recently on getting AI agents to do the parts of oncall that used to wake me up.
Those two things generate a steady supply of things worth writing down: designs that looked
obvious and weren't, failure modes that only show up at a few million QPS, and the slow
realisation that most of "agent engineering" is really just tool design.

So that's roughly what to expect here. Storage systems, distributed systems, and agents that
operate them.

## How to replace this post

Add a Markdown file under `src/content/blog/` with front matter like this:

```markdown
---
title: 'Your post title'
description: 'One sentence that shows up in the list.'
date: 2026-09-01
lang: 'en' # or 'zh' — Chinese posts get their own section
---

Your post body in Markdown.
```

To link out to something published elsewhere, add an `external` URL instead of a body — the
listing will show it with a `↗` and point straight at the original.

Then delete this file.
