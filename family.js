/* ═══════════════════════════════════════════════════════════════════════
   CODELIONS FAMILY — live product windows
   ───────────────────────────────────────────────────────────────────────
   Each product page draws its app as a small state machine: a component
   class whose renderVals() returns the values for the current tab and
   step, and a <template> whose markup reads them through {{holes}},
   <sc-if value> and <sc-for list as>. This file is the whole runtime for
   that: it renders the template, patches the live DOM in place (so CSS
   animations already running — the plan river's flowing dashes — are not
   restarted every tick), and wires onClick holes to the component.

   It also scales anything marked data-fit="<design width>" down to the
   width it is given, so a window drawn at desktop size reads as a
   screenshot on a phone instead of reflowing into nonsense.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class DCLogic {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    setState(patch) {
      Object.assign(this.state, patch);
      if (this._render) this._render();
    }
  }
  window.DCLogic = DCLogic;

  // ── template rendering ─────────────────────────────────────────────────

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    let v = scope;
    for (const key of path.split('.')) {
      if (v == null) return undefined;
      v = v[key];
    }
    return v;
  }

  function single(text, scope) {
    const m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(text || '');
    return m ? lookup(m[1], scope) : text;
  }

  function fill(text, scope) {
    return text.replace(HOLE, (_, path) => {
      const v = lookup(path, scope);
      return v == null || v === false ? '' : String(v);
    });
  }

  function truthy(v) {
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }

  /// Builds fresh nodes for `src` (a template node) into `out`.
  function build(src, scope, out, handlers) {
    if (src.nodeType === Node.TEXT_NODE) {
      out.appendChild(document.createTextNode(fill(src.data, scope)));
      return;
    }
    if (src.nodeType !== Node.ELEMENT_NODE) return;
    const tag = src.localName;
    if (tag === 'sc-if') {
      if (truthy(single(src.getAttribute('value'), scope))) {
        for (const c of src.childNodes) build(c, scope, out, handlers);
      }
      return;
    }
    if (tag === 'sc-for') {
      const list = single(src.getAttribute('list'), scope) || [];
      const as = src.getAttribute('as') || 'item';
      for (const item of list) {
        const inner = Object.create(scope);
        inner[as] = item;
        for (const c of src.childNodes) build(c, inner, out, handlers);
      }
      return;
    }
    const el = src.namespaceURI === 'http://www.w3.org/2000/svg'
      ? document.createElementNS(src.namespaceURI, tag)
      : document.createElement(tag);
    for (const attr of src.attributes) {
      const name = attr.name;
      if (name.startsWith('hint-placeholder')) continue;
      if (name.toLowerCase() === 'onclick') {
        const fn = single(attr.value, scope);
        if (typeof fn === 'function') {
          const id = String(handlers.length);
          handlers.push(fn);
          el.setAttribute('data-dc-click', id);
        }
        continue;
      }
      el.setAttribute(name, fill(attr.value, scope));
    }
    for (const c of src.childNodes) build(c, scope, el, handlers);
    out.appendChild(el);
  }

  // ── in-place patching ──────────────────────────────────────────────────

  function sameKind(a, b) {
    return a.nodeType === b.nodeType && (a.nodeType !== 1 || a.localName === b.localName);
  }

  function patch(live, next) {
    if (live.nodeType === Node.TEXT_NODE) {
      if (live.data !== next.data) live.data = next.data;
      return;
    }
    for (const attr of [...live.attributes]) {
      if (!next.hasAttribute(attr.name)) live.removeAttribute(attr.name);
    }
    for (const attr of next.attributes) {
      if (live.getAttribute(attr.name) !== attr.value) live.setAttribute(attr.name, attr.value);
    }
    patchChildren(live, next);
  }

  function patchChildren(liveParent, nextParent) {
    const live = [...liveParent.childNodes];
    const next = [...nextParent.childNodes];
    next.forEach((n, i) => {
      const l = live[i];
      if (!l) liveParent.appendChild(n);
      else if (sameKind(l, n)) patch(l, n);
      else liveParent.replaceChild(n, l);
    });
    for (let i = next.length; i < live.length; i++) liveParent.removeChild(live[i]);
  }

  // ── mounting ───────────────────────────────────────────────────────────

  function mount(host) {
    const name = host.getAttribute('data-dc');
    const tpl = document.getElementById(host.getAttribute('data-template'));
    const Cls = (window.DC || {})[name];
    if (!tpl || !Cls) return;
    const comp = new Cls({});
    let handlers = [];
    comp._render = () => {
      const scope = comp.renderVals();
      const frag = document.createElement('div');
      handlers = [];
      for (const c of tpl.content.childNodes) build(c, scope, frag, handlers);
      patchChildren(host, frag);
      fitAll(host);
      // On a narrow screen the steps scroll sideways; keep the one playing
      // in view as the story moves on. Scrolls the row only, never the page.
      const active = host.querySelector('.fx-steps [aria-selected="true"]');
      if (active && active !== host._active) {
        host._active = active;
        const row = active.parentElement;
        if (row.scrollWidth > row.clientWidth) {
          row.scrollTo({ left: active.offsetLeft - row.offsetLeft - 8, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
    };
    host.addEventListener('click', (e) => {
      const el = e.target.closest('[data-dc-click]');
      if (!el || !host.contains(el)) return;
      const fn = handlers[Number(el.getAttribute('data-dc-click'))];
      if (fn) fn(e);
    });
    comp._render();
    // A visitor who asked for less motion gets the first frame of each tab
    // and the tabs to click; nothing advances on its own.
    if (!reduceMotion && comp.componentDidMount) {
      // Start the clock only once the window is on screen, so the story is
      // at its beginning when someone scrolls to it.
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          comp.componentDidMount();
        }
      }, { threshold: 0.2 });
      io.observe(host);
    }
  }

  // ── fitting fixed-size drawings to narrow screens ──────────────────────

  function fit(el) {
    const design = Number(el.getAttribute('data-fit'));
    const inner = el.firstElementChild;
    if (!design || !inner) return;
    const avail = el.clientWidth;
    // Only ever shrinks: given more room than it was drawn for, the drawing
    // simply fills it.
    if (avail >= design) {
      inner.style.width = '';
      inner.style.transform = '';
      el.style.height = '';
      return;
    }
    const scale = avail / design;
    inner.style.width = design + 'px';
    inner.style.transformOrigin = '0 0';
    inner.style.transform = `scale(${scale})`;
    el.style.height = inner.offsetHeight * scale + 'px';
  }

  function fitAll(root) {
    root.querySelectorAll('[data-fit]').forEach(fit);
    if (root.hasAttribute && root.hasAttribute('data-fit')) fit(root);
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-dc]').forEach(mount);
    fitAll(document);
    const ro = new ResizeObserver(() => fitAll(document));
    ro.observe(document.body);
  });
})();
