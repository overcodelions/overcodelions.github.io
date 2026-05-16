# overcodelions.github.io

Umbrella marketing site for the [Codelions](https://github.com/overcodelions) open-source desktop tools. Served at **https://overcodelions.com/**.

## Structure

```
.
├── index.html        landing — "two tools, one philosophy"
├── overcli/          product page for overcli
├── overgit/          product page for overgit
├── styles.css        landing styles (product pages have their own copies)
├── assets/           shared assets (icon used in landing nav + footer)
└── CNAME             custom domain pinned to overcodelions.com
```

Each product page (`overcli/`, `overgit/`) is self-contained — its own `index.html`, `styles.css`, `app.js`, and `assets/` — so the two evolve independently without one rebuild breaking the other.

## Product repos

- **overcli** → https://github.com/overcodelions/overcli
- **overgit** → https://github.com/overcodelions/overgit

## Run locally

No build step — just serve the directory:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

GitHub Pages, deployed from `master` branch root. Custom domain pinned via the `CNAME` file. See **Settings → Pages** on this repo to confirm.
