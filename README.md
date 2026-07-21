# bias.my.id — Personal Portfolio

Static portfolio for **Bias Arthony**, Backend Engineer. Terminal / precision-engineering
aesthetic. No frameworks, no build step — pure HTML, CSS, and vanilla JS.

**Live:** https://bias.my.id

## Stack

- HTML5 · CSS3 (custom properties, no Tailwind) · Vanilla JS
- Fonts: Inter + JetBrains Mono (Google Fonts)
- Contact: `mailto:` button
- Hosting: GitHub Pages / Cloudflare Pages

## Structure

```
index.html          # markup + SEO meta + JSON-LD
style.css           # theming via CSS variables, light/dark
script.js           # theme toggle, typing effect, scroll reveal, form
robots.txt          # + sitemap.xml
CNAME               # custom domain (bias.my.id)
assets/
  icons/favicon.svg
  img/og.png        # 1200×630 social card
  fonts/
```

## Run locally

Just open `index.html`. Or serve it:

```bash
python3 -m http.server 8787   # → http://localhost:8787
```

## Before going live

1. **CV** — drop your resume at `assets/Bias-Arthony-CV.pdf`.
2. **LinkedIn** — set the footer link (currently `#`).

## Deploy

Push to `main`. GitHub Pages serves it as-is, or connect the repo in Cloudflare Pages
(no build command, output = repo root). Domain is set via `CNAME`.
