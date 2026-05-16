/* ─── Overcli marketing site — behavior ───
 * Hero streaming demo, Colosseum typewriter, ⌘P palette, clock, reveal.
 */

(() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // HERO STREAMING DEMO
  // Three lanes stream the same prompt's response at different paces.
  // Loops forever. Text is inert — no hidden state leaves the page.
  // ═══════════════════════════════════════════════════════════════════

  const prompt = "add a rate limiter to /api/login";

  // Per-backend script — each runs on the SAME chat pane in turn.
  // `k` = keyword/accent, diff-add/rem for colour. `tool` wraps a tool
  // card; `tool-label` is its small uppercase tag.
  // Each backend's turn is a sequence of cards — response cards and tool
  // cards interleaved, the way the real app renders them.
  const backends = {
    claude: {
      pill: 'Claude CLI',
      label: 'opus 4 7',
      modelTag: 'opus 4 7 <em>[1m]</em>',
      modelFull: 'claude-opus-4-7[1m]',
      script: [
        { wait: 300,  type: 'response', body: 'Planning the change:\n  1 · add a token-bucket middleware\n  2 · key by <span class="k">ip + username</span>\n  3 · wire into <span class="k">/api/login</span>\n  4 · add unit tests' },
        { wait: 900,  type: 'tool', kind: 'read', target: 'src/routes/login.ts' },
        { wait: 700,  type: 'tool', kind: 'edit', target: 'src/middleware/rateLimit.ts',
          stats: { add: 22, rem: 0 },
          diff: '<span class="diff-meta">@@ new file @@</span><span class="diff-add">+ import { bucket } from "./bucket";</span><span class="diff-add">+ export const loginLimiter = bucket({</span><span class="diff-add">+   cap: 10,</span><span class="diff-add">+   per: "60s",</span><span class="diff-add">+   key: (req) => `${req.ip}:${req.body.username}`,</span><span class="diff-add">+ });</span>' },
        { wait: 700,  type: 'tool', kind: 'edit', target: 'src/routes/login.ts',
          stats: { add: 2, rem: 1 },
          diff: '<span class="diff-add">+ import { loginLimiter } from "../middleware/rateLimit";</span><span class="diff-rem">- router.post("/api/login", login);</span><span class="diff-add">+ router.post("/api/login", loginLimiter, login);</span>' },
        { wait: 900,  type: 'response', body: 'All three tests pass. Ready for review.' }
      ]
    },
    codex: {
      pill: 'Codex CLI',
      label: 'gpt-5',
      modelTag: 'gpt-5 <em>high</em>',
      modelFull: 'codex-gpt-5-high',
      script: [
        { wait: 260,  type: 'tool', kind: 'exec',
          cmd: 'rg "/api/login" -l src/',
          out: 'src/routes/login.ts\nsrc/routes/auth.ts' },
        { wait: 600,  type: 'tool', kind: 'exec',
          cmd: 'rg "rate" -l src/',
          out: '<span class="c">no matches</span>' },
        { wait: 500,  type: 'response', body: 'Nothing existing. Adding a small in-process limiter before the login handler.' },
        { wait: 700,  type: 'tool', kind: 'apply_patch', target: 'src/middleware/rateLimit.ts',
          stats: { add: 18, rem: 0 },
          diff: '<span class="diff-add">+ function limiter(req, res, next) {</span><span class="diff-add">+   const n = hit(req.ip);</span><span class="diff-add">+   if (n > 10) return res.status(429).end();</span><span class="diff-add">+   next();</span><span class="diff-add">+ }</span>' },
        { wait: 700,  type: 'tool', kind: 'apply_patch', target: 'src/routes/login.ts',
          stats: { add: 1, rem: 1 },
          diff: '<span class="diff-rem">- router.post("/api/login", login);</span><span class="diff-add">+ router.post("/api/login", limiter, login);</span>' },
        { wait: 700,  type: 'tool', kind: 'exec',
          cmd: 'npm test',
          out: '<span class="pass">PASS</span>  14 tests · 3.2s' },
        { wait: 700,  type: 'response', body: '14 / 14 green. Shipping.' }
      ]
    },
    gemini: {
      pill: 'Gemini CLI',
      label: 'gemini 2.5',
      modelTag: '2.5-pro <em>thinking</em>',
      modelFull: 'gemini-2.5-pro',
      script: [
        { wait: 300,  type: 'response', body: '<span class="c">thinking through options…</span>\n  <strong>A</strong> · <span class="k">express-rate-limit</span> — adds a dep\n  <strong>B</strong> · token bucket in-house — zero deps\n  <strong>C</strong> · redis sliding window — needs redis\n\nGoing with <strong>B</strong>.' },
        { wait: 900,  type: 'tool', kind: 'edit', target: 'src/middleware/rateLimit.ts',
          stats: { add: 14, rem: 1 },
          diff: '<span class="diff-add">+ const hits = new Map();</span><span class="diff-add">+ function hit(ip) {</span><span class="diff-add">+   hits.set(ip, (hits.get(ip) || 0) + 1);</span><span class="diff-add">+   return hits.get(ip);</span><span class="diff-add">+ }</span><span class="diff-rem">- // TODO: rate limit</span>' },
        { wait: 700,  type: 'response', body: 'Added a 60s cleanup interval so the map does not leak.' }
      ]
    },
    ollama: {
      pill: 'Ollama CLI',
      label: 'llama3 · local',
      modelTag: 'llama3-8b <em>local</em>',
      modelFull: 'ollama-llama3-8b',
      script: [
        { wait: 260,  type: 'response', body: '<span class="c">running locally · 0 API calls</span>\n\nSimplest viable approach: a redis counter keyed by IP with a 60 s TTL.' },
        { wait: 900,  type: 'tool', kind: 'edit', target: 'src/middleware/rateLimit.ts',
          stats: { add: 11, rem: 2 },
          diff: '<span class="diff-add">+ const key = `login:${ip}`;</span><span class="diff-add">+ const n = await redis.incr(key);</span><span class="diff-add">+ if (n === 1) redis.expire(key, 60);</span><span class="diff-add">+ if (n > 10) return res.status(429);</span><span class="diff-rem">- // no limiter</span>' },
        { wait: 700,  type: 'response', body: 'Done. No new dependencies.' }
      ]
    }
  };

  const rotation = ['claude', 'codex', 'gemini', 'ollama'];

  const pane        = document.querySelector('[data-chat-pane]');
  const cardsEl     = document.querySelector('[data-chat-cards]');
  const pillEl      = document.querySelector('[data-cli-pill]');
  const modelEl     = document.querySelector('[data-chat-model]');
  const modelFullEl = document.querySelector('[data-chat-model-full]');
  const writingEl   = document.querySelector('[data-chat-writing]');

  function setActive(key) {
    if (!pane) return;
    pane.dataset.active = key;
    const b = backends[key];
    if (pillEl)  pillEl.textContent = b.pill;
    if (modelEl) modelEl.innerHTML = b.modelTag;
    if (modelFullEl) modelFullEl.textContent = b.modelFull;
  }

  function renderCard(card, backendLabel) {
    const el = document.createElement('article');
    el.className = 'card ' + (card.type === 'response' ? 'card-response' : 'card-tool');
    if (card.type === 'response') {
      el.innerHTML = `
        <div class="card-head">
          <span class="card-label">${backendLabel}</span>
          <span class="card-actions">copy · copy raw</span>
        </div>
        <div class="card-body">${card.body}</div>`;
    } else if (card.kind === 'exec') {
      el.innerHTML = `
        <div class="card-tool-head">
          <span class="card-tool-tag">exec</span>
          <span class="card-tool-target">$ ${escapeHtml(card.cmd)}</span>
        </div>
        <div class="card-exec"><span class="stdout">${card.out || ''}</span></div>`;
    } else {
      const stats = card.stats
        ? `<span class="card-tool-stats"><span class="add">+${card.stats.add}</span> <span class="rem">−${card.stats.rem}</span></span>`
        : '';
      el.innerHTML = `
        <div class="card-tool-head">
          <span class="card-tool-tag">${card.kind.replace('_', ' ')}</span>
          <span class="card-tool-target">${card.target}</span>
          ${stats}
        </div>
        ${card.diff ? `<div class="card-diff">${card.diff}</div>` : ''}`;
    }
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  async function playTurn(key) {
    const b = backends[key];
    cardsEl.innerHTML = '';
    if (writingEl) writingEl.style.opacity = '1';
    for (let i = 0; i < b.script.length; i++) {
      const card = b.script[i];
      await new Promise(r => setTimeout(r, card.wait));
      const isLast = i === b.script.length - 1;
      if (isLast && writingEl) writingEl.style.opacity = '0';
      cardsEl.appendChild(renderCard(card, b.label));
      const scroll = cardsEl.parentElement;
      if (scroll) scroll.scrollTop = scroll.scrollHeight;
    }
    if (writingEl) writingEl.style.opacity = '0';
  }

  let loopAbort = null;
  function startLoop(fromIndex = 0) {
    loopAbort = { aborted: false };
    const token = loopAbort;
    (async () => {
      let i = fromIndex;
      while (!token.aborted) {
        const key = rotation[i];
        setActive(key);
        await playTurn(key);
        if (token.aborted) return;
        await new Promise(r => setTimeout(r, 3200));
        i = (i + 1) % rotation.length;
      }
    })();
  }

  // If a hand-captured screenshot is present at assets/hero.png, swap
  // out the animated window for it — static is better than a fake.
  const heroRight = document.querySelector('.hero-right');
  const heroProbe = new Image();
  heroProbe.onload = () => {
    if (!heroRight) return;
    const animated = heroRight.querySelector('.app-window');
    if (animated) animated.remove();
    const shot = document.createElement('img');
    shot.src = 'assets/hero.png';
    shot.alt = 'Overcli application window';
    shot.className = 'hero-screenshot';
    heroRight.insertBefore(shot, heroRight.firstChild);
  };
  heroProbe.onerror = () => { /* keep animated fallback */ };
  heroProbe.src = 'assets/hero.png';

  if (pane) startLoop(0);


  // ═══════════════════════════════════════════════════════════════════
  // COLOSSEUM TYPERS
  // Bigger, slower versions of the same idea for the dedicated section.
  // Each column finishes at a different "time" shown in the timer chip.
  // ═══════════════════════════════════════════════════════════════════

  const coloScripts = {
    claude: [
      { t: 200, s: '<span class="c">// planning</span>\n' },
      { t: 600, s: 'extract bucket into a shared module\n' },
      { t: 300, s: 'key: <span class="k">ip + username</span>\n' },
      { t: 300, s: 'window: <span class="k">60s</span> &nbsp;cap: <span class="k">10</span>\n\n' },
      { t: 380, s: '<span class="c">// applying patch</span>\n' },
      { t: 260, s: '<span class="diff-add">+ middleware/rateLimit.ts   +34</span>\n' },
      { t: 260, s: '<span class="diff-add">+ routes/login.ts           + 4</span>\n' },
      { t: 260, s: '<span class="diff-add">+ __tests__/rateLimit.spec.ts</span>\n' },
      { t: 420, s: '<span class="c">// tests</span>\n' },
      { t: 300, s: '<span class="diff-add">✓</span> limits by ip\n' },
      { t: 300, s: '<span class="diff-add">✓</span> resets after window\n' },
      { t: 300, s: '<span class="diff-add">✓</span> isolates per username\n' },
      { t: 200, s: '<span class="caret">▍</span>' }
    ],
    codex: [
      { t: 400, s: '<span class="c">exec</span>  rg "/api/login" -l\n' },
      { t: 340, s: '<span class="c">exec</span>  rg "rate" -l\n' },
      { t: 260, s: '<span class="k">2 files matched</span>\n\n' },
      { t: 340, s: '<span class="c">apply_patch</span>\n' },
      { t: 220, s: '<span class="diff-add">+ import { limiter } from "./rateLimit";</span>\n' },
      { t: 220, s: '<span class="diff-add">+ router.post("/api/login", limiter,</span>\n' },
      { t: 220, s: '<span class="diff-add">+   login);</span>\n' },
      { t: 220, s: '<span class="diff-rem">- router.post("/api/login", login);</span>\n' },
      { t: 380, s: '<span class="c">exec</span>  npm test\n' },
      { t: 360, s: '<span class="diff-add">PASS</span> 14 tests\n' },
      { t: 200, s: '<span class="caret">▍</span>' }
    ],
    gemini: [
      { t: 500, s: '<span class="c">// considering</span>\n' },
      { t: 400, s: 'Option A: express-rate-limit (+dep)\n' },
      { t: 300, s: 'Option B: token bucket (in-house)\n' },
      { t: 300, s: 'Option C: Redis sliding window\n\n' },
      { t: 400, s: '<span class="c">// picking B for 0-dep simplicity</span>\n' },
      { t: 400, s: '<span class="diff-add">+ const hits = new Map();</span>\n' },
      { t: 260, s: '<span class="diff-add">+ function hit(key) {</span>\n' },
      { t: 260, s: '<span class="diff-add">+   const now = Date.now();</span>\n' },
      { t: 260, s: '<span class="diff-add">+   // ...</span>\n' },
      { t: 260, s: '<span class="diff-add">+ }</span>\n' },
      { t: 360, s: 'adding a cleanup interval every 60s\n' },
      { t: 200, s: '<span class="caret">▍</span>' }
    ],
    ollama: [
      { t: 120, s: '<span class="c">[local · llama3-8b]</span>\n' },
      { t: 140, s: 'inspecting <span class="k">login.ts</span>\n' },
      { t: 120, s: 'simplest: redis counter w/ TTL\n\n' },
      { t: 90,  s: '<span class="diff-add">+ const key = `login:${ip}`;</span>\n' },
      { t: 90,  s: '<span class="diff-add">+ const count = await redis.incr(key);</span>\n' },
      { t: 90,  s: '<span class="diff-add">+ if (count === 1) redis.expire(key, 60);</span>\n' },
      { t: 90,  s: '<span class="diff-add">+ if (count > 10) return res.status(429);</span>\n' },
      { t: 120, s: '<span class="diff-rem">- // no limiter</span>\n\n' },
      { t: 140, s: 'done. 0 API calls.\n' },
      { t: 100, s: '<span class="caret">▍</span>' }
    ]
  };

  const coloTotals = { claude: 8.2, codex: 5.6, gemini: 11.4, ollama: 2.1 };

  function playColumn(key) {
    const el    = document.querySelector(`[data-col="${key}"]`);
    const timer = document.querySelector(`[data-timer="${key}"]`);
    if (!el) return;

    const script = coloScripts[key];
    const total  = coloTotals[key];

    async function run() {
      while (true) {
        el.innerHTML = '';
        if (timer) timer.textContent = '0.0s';
        const start = performance.now();
        const tick = setInterval(() => {
          const elapsed = Math.min(total, (performance.now() - start) / 1000);
          if (timer) timer.textContent = elapsed.toFixed(1) + 's';
        }, 100);

        for (const step of script) {
          await new Promise(r => setTimeout(r, step.t));
          el.insertAdjacentHTML('beforeend', step.s);
        }
        clearInterval(tick);
        if (timer) timer.textContent = total.toFixed(1) + 's';
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    run();
  }

  // Start the colosseum typers only when visible — saves cpu and
  // makes the section feel "live" when the user scrolls to it.
  const coloSection = document.getElementById('colosseum');
  if (coloSection) {
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          playColumn('claude');
          playColumn('codex');
          playColumn('gemini');
          playColumn('ollama');
          io.disconnect();
        }
      });
    }, { threshold: 0.25 });
    io.observe(coloSection);
  }


  // ═══════════════════════════════════════════════════════════════════
  // ⌘P PALETTE — fuzzy file finder demo
  // ═══════════════════════════════════════════════════════════════════

  const paletteFiles = [
    ['App.tsx', 'src/renderer'],
    ['store.ts', 'src/renderer'],
    ['theme.ts', 'src/renderer'],
    ['hooks.ts', 'src/renderer'],
    ['Sidebar.tsx', 'src/renderer/components'],
    ['ChatView.tsx', 'src/renderer/components'],
    ['ToolCard.tsx', 'src/renderer/components'],
    ['DiffView.tsx', 'src/renderer/components'],
    ['FileEditor.tsx', 'src/renderer/components'],
    ['Colosseum.tsx', 'src/renderer/components'],
    ['UsageDashboard.tsx', 'src/renderer/components'],
    ['HealthBadge.tsx', 'src/renderer/components'],
    ['index.ts', 'src/main'],
    ['runner.ts', 'src/main'],
    ['history.ts', 'src/main'],
    ['store.ts', 'src/main'],
    ['git.ts', 'src/main'],
    ['stats.ts', 'src/main'],
    ['health.ts', 'src/main'],
    ['claude.ts', 'src/main/parsers'],
    ['codex.ts', 'src/main/parsers'],
    ['gemini.ts', 'src/main/parsers'],
    ['types.ts', 'src/shared'],
    ['package.json', ''],
    ['README.md', ''],
    ['vite.config.ts', ''],
    ['tsconfig.json', ''],
    ['tailwind.config.mjs', ''],
  ];

  function fuzzyScore(query, str) {
    if (!query) return { score: 0, matches: [] };
    const q = query.toLowerCase();
    const s = str.toLowerCase();
    let qi = 0;
    const matches = [];
    let prev = -2;
    let score = 0;
    for (let i = 0; i < s.length && qi < q.length; i++) {
      if (s[i] === q[qi]) {
        score += (i === prev + 1) ? 5 : 1;
        if (i === 0) score += 3;
        matches.push(i);
        prev = i;
        qi++;
      }
    }
    return qi === q.length ? { score, matches } : null;
  }

  function renderMatches(query) {
    const results = [];
    for (const [name, dir] of paletteFiles) {
      const path = dir ? `${dir}/${name}` : name;
      const r = fuzzyScore(query, path);
      if (r !== null) results.push({ name, dir, path, ...r });
    }
    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, 8);

    const ul = document.getElementById('palette-results');
    if (!top.length) {
      ul.innerHTML = '<li class="empty">no matches — try "tool" or "color" or "diff"</li>';
      return;
    }

    ul.innerHTML = top.map((r, idx) => {
      let html = '';
      const name = r.name;
      const dir = r.dir;
      const fullStart = dir ? dir.length + 1 : 0;
      for (let i = 0; i < name.length; i++) {
        const abs = fullStart + i;
        html += r.matches.includes(abs)
          ? `<span class="hit">${name[i]}</span>`
          : name[i];
      }
      return `<li${idx === 0 ? ' class="hi"' : ''}>
        <span>${html}</span>
        <span class="dir">${dir}</span>
      </li>`;
    }).join('');
  }

  const overlay = document.getElementById('palette');
  const input   = document.getElementById('palette-input');
  const closeBtn = document.getElementById('palette-close');
  const triggerBtn = document.getElementById('try-palette');

  function openPalette() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    renderMatches('');
    setTimeout(() => input.focus(), 60);
  }
  function closePalette() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    input.blur();
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openPalette);
  if (closeBtn)   closeBtn.addEventListener('click', closePalette);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });
  }
  if (input) {
    input.addEventListener('input', () => renderMatches(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePalette();
    });
  }
  document.addEventListener('keydown', (e) => {
    const isMeta = e.metaKey || e.ctrlKey;
    if (isMeta && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      overlay.classList.contains('open') ? closePalette() : openPalette();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closePalette();
    }
  });


  // ═══════════════════════════════════════════════════════════════════
  // FOOTER CLOCK — tmux-style HH:MM in the status line
  // ═══════════════════════════════════════════════════════════════════

  const clock = document.getElementById('sl-clock');
  function tickClock() {
    if (!clock) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    clock.textContent = `${hh}:${mm}`;
  }
  tickClock();
  setInterval(tickClock, 30000);


  // ═══════════════════════════════════════════════════════════════════
  // SCROLL REVEAL
  // ═══════════════════════════════════════════════════════════════════

  const revealTargets = document.querySelectorAll(
    '.features .section-head, .feature, .story-body, .download .section-head, .dl-table, .dl-note'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(el => revealIO.observe(el));

})();
