/* ═══════════════════════════════════════════════════════════════════════
   PALETTE SWITCHER — design tool, not a site feature.
   ───────────────────────────────────────────────────────────────────────
   Dormant by default. It only wakes up if the URL carries `?palettes`, or
   if a palette was already picked in this browser. Real visitors never see
   it and it costs them one no-op script.

   Use:   http://localhost:8000/?palettes        (then browse normally —
                                                  the choice follows you)
   Stop:  click "reset" in the panel, or clear localStorage.

   To delete it later: remove this file and the one <script> tag from
   index.html, overcli/index.html and overgit/index.html. Nothing else
   references it.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  var KEY = 'codelions:palette';

  // Only the values that differ from theme.css's :root are listed.
  var PALETTES = [
    {
      id: 'indigo',
      name: 'Deep indigo',
      note: 'current — warm paper, deepened brand indigo',
      swatch: ['#f8f7f4', '#332ba0', '#b03c0a'],
      vars: {} // theme.css defaults
    },
    {
      id: 'violet',
      name: 'Violet',
      note: 'the original — brighter, more consumer',
      swatch: ['#f7f5f0', '#4f46c8', '#b03c0a'],
      vars: {
        '--paper': '#f7f5f0', '--paper-3': '#efebe2', '--paper-4': '#e9e4d9',
        '--line': '#e3ded3', '--line-strong': '#cfc8b9',
        '--accent': '#4f46c8', '--accent-hot': '#332ba0', '--accent-wash': '#eeecfb'
      }
    },
    {
      id: 'graphite',
      name: 'Graphite & blue',
      note: 'cool neutral paper, enterprise blue',
      swatch: ['#f7f8fa', '#1d4ed8', '#b45309'],
      vars: {
        '--paper': '#f7f8fa', '--paper-2': '#ffffff', '--paper-3': '#eceff3', '--paper-4': '#e3e7ed',
        '--ink': '#0e1116', '--ink-dim': '#4b525c', '--ink-muted': '#666e7b',
        '--line': '#e1e5eb', '--line-strong': '#c6ccd6',
        '--accent': '#1d4ed8', '--accent-hot': '#1739a8', '--accent-wash': '#e7edfd',
        '--signal': '#b45309', '--signal-bright': '#f59e42'
      }
    },
    {
      id: 'navy',
      name: 'Navy & bone',
      note: 'editorial, institutional, lowest chroma',
      swatch: ['#f7f5ef', '#1b3a5c', '#a0521a'],
      vars: {
        '--paper': '#f7f5ef', '--paper-3': '#edeae1', '--paper-4': '#e5e1d6',
        '--ink': '#12161c', '--ink-dim': '#4d545e', '--ink-muted': '#666d78',
        '--line': '#e0dbd0', '--line-strong': '#c9c3b6',
        '--accent': '#1b3a5c', '--accent-hot': '#12283f', '--accent-wash': '#e6ecf3',
        '--signal': '#a0521a', '--signal-bright': '#e08b3c'
      }
    },
    {
      id: 'forest',
      name: 'Forest & bone',
      note: 'warm paper, deep green — serious but not corporate',
      swatch: ['#f8f7f2', '#1f4436', '#a0521a'],
      vars: {
        '--paper': '#f8f7f2', '--paper-3': '#eeece4', '--paper-4': '#e5e2d8',
        '--line': '#e1ddd2', '--line-strong': '#c9c4b7',
        '--accent': '#1f4436', '--accent-hot': '#143025', '--accent-wash': '#e6efea',
        '--signal': '#a0521a', '--signal-bright': '#e08b3c'
      }
    }
  ];

  var active = localStorage.getItem(KEY);
  var asked = /[?&]palettes\b/.test(location.search);
  if (!asked && !active) return;

  function apply(id) {
    var p = PALETTES.filter(function (x) { return x.id === id; })[0] || PALETTES[0];
    var el = document.getElementById('palette-override');
    if (!el) {
      el = document.createElement('style');
      el.id = 'palette-override';
      document.head.appendChild(el);
    }
    var body = Object.keys(p.vars).map(function (k) { return k + ':' + p.vars[k]; }).join(';');
    el.textContent = body ? ':root{' + body + '}' : '';
    active = id;
    localStorage.setItem(KEY, id);
    render();
  }

  var panel;
  function render() {
    if (!panel) return;
    [].forEach.call(panel.querySelectorAll('[data-pal]'), function (b) {
      b.setAttribute('aria-current', b.dataset.pal === active ? 'true' : 'false');
    });
  }

  function build() {
    var css = document.createElement('style');
    css.textContent = [
      '#pal-panel{position:fixed;left:16px;bottom:16px;z-index:9999;width:262px;',
      'background:#fff;color:#14141a;border:1px solid #cbc6bb;border-radius:6px;',
      'box-shadow:0 24px 60px -20px rgba(20,20,26,.4);overflow:hidden;',
      "font-family:'JetBrains Mono','SF Mono',Menlo,monospace;font-size:11px}",
      '#pal-panel header{display:flex;align-items:center;gap:8px;padding:9px 11px;',
      'background:#14141a;color:#f0f0f5;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase}',
      '#pal-panel header button{margin-left:auto;background:none;border:0;color:#9a9aa8;',
      'cursor:pointer;font:inherit;padding:0 2px}',
      '#pal-panel header button:hover{color:#fff}',
      '#pal-panel [data-pal]{display:flex;gap:9px;align-items:flex-start;width:100%;text-align:left;',
      'padding:9px 11px;background:none;border:0;border-top:1px solid #e2ded6;cursor:pointer;font:inherit}',
      '#pal-panel [data-pal]:hover{background:#f8f7f4}',
      '#pal-panel [data-pal][aria-current="true"]{background:#eae8f8}',
      '#pal-panel .sw{display:flex;flex-shrink:0;margin-top:2px;border:1px solid #cbc6bb;border-radius:2px;overflow:hidden}',
      '#pal-panel .sw i{width:11px;height:16px;display:block}',
      '#pal-panel .nm{font-weight:700;letter-spacing:.02em}',
      '#pal-panel .nt{display:block;color:#67646f;font-size:10px;line-height:1.45;margin-top:2px}',
      '#pal-panel footer{padding:8px 11px;border-top:1px solid #e2ded6;color:#67646f;font-size:10px}',
      '#pal-panel footer button{background:none;border:0;color:#332ba0;cursor:pointer;font:inherit;padding:0;text-decoration:underline}'
    ].join('');
    document.head.appendChild(css);

    panel = document.createElement('aside');
    panel.id = 'pal-panel';
    panel.setAttribute('aria-label', 'Palette preview');

    var head = document.createElement('header');
    head.innerHTML = '<span>palette preview</span>';
    var hide = document.createElement('button');
    hide.type = 'button';
    hide.textContent = 'hide';
    hide.title = 'Hide until you add ?palettes again';
    hide.onclick = function () { panel.remove(); };
    head.appendChild(hide);
    panel.appendChild(head);

    PALETTES.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.pal = p.id;
      var sw = '<span class="sw">' + p.swatch.map(function (c) {
        return '<i style="background:' + c + '"></i>';
      }).join('') + '</span>';
      b.innerHTML = sw + '<span><span class="nm">' + p.name + '</span>' +
                    '<span class="nt">' + p.note + '</span></span>';
      b.onclick = function () { apply(p.id); };
      panel.appendChild(b);
    });

    var foot = document.createElement('footer');
    foot.innerHTML = 'Choice follows you across pages. ';
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'reset';
    reset.onclick = function () {
      localStorage.removeItem(KEY);
      var el = document.getElementById('palette-override');
      if (el) el.textContent = '';
      panel.remove();
    };
    foot.appendChild(reset);
    panel.appendChild(foot);

    document.body.appendChild(panel);
    render();
  }

  function start() { apply(active || 'indigo'); build(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
