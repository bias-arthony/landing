# bias.my.id

Personal portfolio for **Bias Arthony** — Backend Engineer. A terminal /
precision-engineering aesthetic, built as a fully static site: pure HTML, CSS,
and vanilla JS. No frameworks, no build step.

**Live:** https://bias.my.id

## Features

- **Interactive hero terminal** — type real commands (`curl`, `whoami`, `help`,
  `clear`); `curl https://bias.my.id/api/profile` prints live JSON.
- **`/api/profile`** — a static JSON endpoint served with the right
  `Content-Type` (works from a real `curl`, not just the browser).
- **Experience as a git log**, projects as terminal files, tech stack as a
  system profile.
- **Dark / light mode** (persisted), scroll reveal, typing animation.
- **SEO-complete** — meta, canonical, OpenGraph + Twitter card, JSON-LD Person,
  `robots.txt`, `sitemap.xml`, OG image, single `<h1>`.

## Tech

HTML5 · CSS3 (custom properties) · Vanilla JS · Inter + JetBrains Mono ·
hosted on Cloudflare.

## Structure

```
index.html         markup + SEO meta + JSON-LD
style.css          theming via CSS variables (light/dark)
script.js          theme toggle, typing terminal, scroll reveal, form
api/profile        static JSON profile endpoint
_headers           Content-Type + CORS for /api/profile (Cloudflare)
.assetsignore      keeps .git / config files off the deployed site
robots.txt · sitemap.xml · CNAME
assets/            icons, images, fonts, CV
```

## Run locally

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

Or just open `index.html`.

## Deploy

Hosted on **Cloudflare Pages** — connected to this repo, no build command,
output directory `/`. Every push to `main` auto-deploys. Custom domain set via
`CNAME`.
