# overcodelions.github.io

Umbrella marketing site for the [Codelions](https://github.com/overcodelions) open-source desktop tools. Served at **https://overcodelions.com/**.

## Structure

```
.
├── theme.css         shared design system — the brand lives here
├── index.html        landing — "two tools, one philosophy"
├── styles.css        landing-only styles (hero plate, mock windows, layouts)
├── overcli/          product page for overcli
├── overgit/          product page for overgit
├── assets/           shared assets (icon used in landing nav + footer)
└── CNAME             custom domain pinned to overcodelions.com
```

## Design system

`theme.css` owns every shared surface across all three pages: colour, type,
buttons, cards, section headers, nav, footer, the story modal. Change the
brand there once and all three pages move together.

The look is **"Instrument"** — warm bone paper, hairline rules, square
corners, and a strict three-face split: **Fraunces** for display, **Inter**
for body, **JetBrains Mono** for every label, button, and data readout. The
products themselves appear as dark slabs dropped into that page.

### The `.terminal` seam

Each product page still carries its own `styles.css` with ~2–3k lines of
hand-built app-mock chrome (fake windows, diff cards, flow diagrams). Rather
than rewrite it, product pages load:

```html
<link rel="stylesheet" href="styles.css" />   <!-- mock chrome, first -->
<link rel="stylesheet" href="../theme.css" /> <!-- design system, last -->
```

`theme.css` wins for anything shared, and re-points the legacy surface tokens
(`--bg`, `--ink`, `--line`, …) at paper values. Any element wrapped in
`.terminal` flips those tokens back to the dark app palette, so the mock CSS
keeps working untouched. That is why `.hero-right` and the showcase
`section.colosseum` blocks carry `class="… terminal"`.

Two consequences worth knowing:

- **Don't reuse a class name the mocks already own.** The design-system card
  is `.cell`, not `.card`, because `.card` is a chat message inside the app
  mock and must stay dark.
- **Anything not wrapped in `.terminal` renders on paper.** That is the safe
  default — a rule nobody restyled degrades to light rather than going
  dark-on-light.

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
