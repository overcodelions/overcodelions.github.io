# overcodelions.github.io

Umbrella marketing site for the [Codelions](https://github.com/overcodelions) open-source desktop tools. Served at **https://overcodelions.com/**.

## Structure

```
.
├── theme.css         design tokens, base type, the release ribbon
├── family.css        layout for the home page and the three product pages
├── family.js         runs the live app windows (see below)
├── index.html        home — "Over your tools. Not instead of them."
├── overcli/          overcli page, plus features.html (all 42 features)
├── overgit/          overgit page
├── overdb/           overdb page
├── assets/           shared assets (the codelions icon)
└── CNAME             custom domain pinned to overcodelions.com
```

## Design system

The look is **"Instrument"**: cool paper, hairline rules, softened corners,
and three faces — **Bricolage Grotesque** for display, **Geist** for body,
**Geist Mono** for eyebrows, code and data. The products appear as dark app
windows on that paper. Every page sits on one 1184px column.

Pages load `theme.css` first (tokens, base type, the ribbon) and
`family.css` second. Everything in `family.css` is prefixed `fx-` so it can't
collide with the older rules `features.html` still uses (it keeps
`overcli/styles.css` and `overcli/app.js`). Each product sets one colour of
its own through `--fx-c` (`.fx-overcli`, `.fx-overgit`, `.fx-overdb`).

The stylesheet and script links carry a content stamp (`family.css?v=…`).
Change the stamp when you change either file, so returning visitors don't
keep a cached copy.

## The live app windows

Each product page draws its app and plays a short story per step. Three
parts, all in the page itself:

- a `<template id="tpl-…">` holding the window's markup, which reads values
  through `{{holes}}`, `<sc-if value="{{…}}">` and `<sc-for list="{{…}}" as="x">`;
- a component class registered as `window.DC['overcli']` (etc.) whose
  `renderVals()` returns those values for the current tab and step, and whose
  `componentDidMount()` starts the clock;
- a host element, `<div data-dc="overcli" data-template="tpl-overcli">`.

`family.js` renders the template, patches the DOM in place (so CSS
animations already running are not restarted every tick), wires `onClick`
holes, starts the clock once the window is on screen, and does nothing on
its own for visitors who ask for reduced motion. Anything marked
`data-fit="<design width>"` is scaled down to fit narrow screens, like a
screenshot, and never scaled up.

Every label in the windows is taken from the app's own UI; check new ones
against the product repo before shipping.

## Product repos

- **overcli** → https://github.com/overcodelions/overcli
- **overgit** → https://github.com/overcodelions/overgit
- **overdb** → https://github.com/overcodelions/overdb

## Run locally

No build step — just serve the directory:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

GitHub Pages, deployed from `master` branch root. Custom domain pinned via the `CNAME` file. See **Settings → Pages** on this repo to confirm.
