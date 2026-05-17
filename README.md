# HeXTalent — Landing Page

Static landing page for **HeXTalent**, the parent company behind CiHR Talent, Careers in HR, Sunny Stories, and Sunny Cleans.

## Stack

- Static HTML / CSS / vanilla JS — no build step
- Google Fonts: Fraunces (display serif) + Inter (body sans)
- Deployed via Vercel

## Local preview

Open `index.html` in a browser, or run any tiny static server:

```bash
# Python
python3 -m http.server 4000

# Node (npx)
npx serve .
```

Then visit `http://localhost:4000`.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel → **Add New Project** → import the repo.
3. Framework Preset: **Other**. Build Command: *(none)*. Output Directory: *(leave blank — root)*.
4. Deploy.
5. Connect `hextalent.com.au` under **Settings → Domains**.

## File map

```
index.html         # Page markup
styles.css         # All styling
script.js          # Scroll reveals + topbar scroll state
vercel.json        # Cache headers + security headers
assets/
  hex-mark.svg     # HeX glyph (currentColor)
  hextalent-full.svg  # Full wordmark
  favicon.svg      # Favicon
```

## Editing content

All page copy lives in `index.html`. Each project card is an `<article class="card" data-accent="...">` — the `data-accent` value (`cihr-talent`, `careers-in-hr`, `sunny-stories`, `sunny-cleans`) drives the per-card accent colour defined in `:root` of `styles.css`.

## Adding a new project

1. Duplicate one of the `<article class="card">` blocks in `index.html`.
2. Set a new `data-accent` slug.
3. Add the matching CSS colour in `:root` (`--c-yourslug`) and the four `.card[data-accent="yourslug"]` selectors in `styles.css`.
