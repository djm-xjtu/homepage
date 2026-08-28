# homepage

Personal website of Jiaming Deng — <https://djm-xjtu.github.io/homepage/>

Built with [Astro](https://astro.build). Static, no database, deployed to GitHub Pages by
GitHub Actions on every push to `main`.

## Everyday edits

Almost everything you'll want to change lives in **one file**: `src/data/site.ts`.

| What you want to change | Where |
| --- | --- |
| Name, page title, tagline, SEO description | `site` in `src/data/site.ts` |
| Home page intro paragraphs | `intro` |
| "Fun facts about me" bullets | `funFacts` (empty the array to hide the section) |
| GitHub / LinkedIn / other links | `links` |
| Email address | `email` |
| Work experience (home + `/work/`) | `work` — newest first, home page shows the first 4 |
| Education | `education` |
| Technical skills table | `skills` |
| CV PDF | replace `public/files/cv.pdf` |
| Colours, fonts, spacing | `src/styles/global.css` (design tokens at the top) |

## Writing a post

Create `src/content/blog/my-post.md`:

```markdown
---
title: 'Post title'
description: 'One sentence, shown in the listing.'
date: 2026-09-01
lang: 'en' # 'zh' puts it under a separate 中文文章 section
draft: false # true hides it everywhere
---

Body in Markdown.
```

The URL becomes `/homepage/blog/my-post/` (the filename is the slug).

**Cross-posting.** To point at something published elsewhere, add `external: 'https://…'` to the
front matter and leave the body empty. The listing shows it with a `↗` and links straight out.

The blog index groups posts by year automatically. The home page shows the three most recent.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321/homepage/
npm run build    # output in dist/
npm run preview  # serve the built site
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub
Pages. Repository **Settings → Pages → Source** must be set to **GitHub Actions**.

### Moving to a custom domain

1. Add a `public/CNAME` file containing the bare domain, e.g. `jiamingdeng.com`.
2. In `astro.config.mjs`, set `site` to the new domain and **remove** the `base` option.
3. Point a `CNAME` DNS record at `djm-xjtu.github.io`.
4. Set the domain under Settings → Pages and tick "Enforce HTTPS".

### Renaming the repository

The site lives under a subpath, so `base` in `astro.config.mjs` must match the repository name.
Rename the repo, update `base`, and update `site.url` in `src/data/site.ts`.
