/* =====================================================================
   app.js — 路由、渲染與互動。一般情況不需要改這支，內容請改 data.js
   ===================================================================== */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* storage 在無痕模式／封鎖網站資料時會直接 throw，一律包起來 */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  /* ------------------------- 語言 ------------------------- */
  let LANG = store.get('lang') || SITE.defaultLang || 'zh';
  if (LANG !== 'zh' && LANG !== 'en') LANG = 'zh';

  /* t() 會自動處理 T('中文','English')，也接受單純的字串 */
  const t = (v) => {
    if (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || 'en' in v)) {
      return v[LANG] ?? v.zh ?? v.en ?? '';
    }
    return v ?? '';
  };
  const te = (v) => esc(t(v));

  function setLang(next) {
    LANG = next;
    store.set('lang', next);
    document.documentElement.lang = next === 'zh' ? 'zh-TW' : 'en';
    buildChrome();
    render();
  }

  /* ------------------------- SVG 圖示（不用 emoji） ------------------------- */
  const ICONS = {
    home:      '<svg viewBox="0 0 24 24"><path d="M12 3 2 12h3v9h6v-6h2v6h6v-9h3z"/></svg>',
    user:      '<svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5Z"/></svg>',
    code:      '<svg viewBox="0 0 24 24"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6z"/></svg>',
    post:      '<svg viewBox="0 0 24 24"><path d="M5 2h10l4 4v16H5zm9 1.5V7h3.5zM7 10h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/></svg>',
    camera:    '<svg viewBox="0 0 24 24"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>',
    video:     '<svg viewBox="0 0 24 24"><path d="M3 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm16 3.5 4-2.5v12l-4-2.5z"/></svg>',
    mail:      '<svg viewBox="0 0 24 24"><path d="M2 5h20v14H2zm2 2v.4l8 5 8-5V7z"/></svg>',
    download:  '<svg viewBox="0 0 24 24"><path d="M11 3h2v8h4l-5 6-5-6h4zM4 19h16v2H4z"/></svg>',
    github:    '<svg viewBox="0 0 24 24"><path d="M12 1a11 11 0 0 0-3.5 21.4c.6.1.8-.2.8-.6v-2c-3 .7-3.7-1.4-3.7-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7 0-.7 0-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5-1.2-5-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3 1.1a10.4 10.4 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5 5.5.4.3.8 1 .8 2.1v3.1c0 .4.2.7.8.6A11 11 0 0 0 12 1z"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.5 4.7 5.9V21h-4v-5.6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5.5-3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>',
    youtube:   '<svg viewBox="0 0 24 24"><path d="M23 12s0-3.6-.5-5.3a2.8 2.8 0 0 0-2-2C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3a2.8 2.8 0 0 0 2 2c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2C23 15.6 23 12 23 12zM9.8 15.4V8.6l5.9 3.4z"/></svg>',
    globe:     '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-5.4A8 8 0 0 1 18.9 11zM12 4.2c.8 1.2 1.6 3.4 1.8 6.8h-3.6c.2-3.4 1-5.6 1.8-6.8zM5.1 11a8 8 0 0 1 4.3-5.4A15 15 0 0 0 8.1 11zm0 2h3a15 15 0 0 0 1.3 5.4A8 8 0 0 1 5.1 13zm4.9 0h3.6c-.2 3.4-1 5.6-1.8 6.8-.8-1.2-1.6-3.4-1.8-6.8zm4.6 5.4a15 15 0 0 0 1.3-5.4h3a8 8 0 0 1-4.3 5.4z"/></svg>',
    education: '<svg viewBox="0 0 24 24"><path d="M12 3 1 9l11 6 9-4.9V17h2V9zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8z"/></svg>',
    work:      '<svg viewBox="0 0 24 24"><path d="M9 3h6a2 2 0 0 1 2 2v1h4a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h4V5a2 2 0 0 1 2-2zm0 3h6V5H9z"/></svg>',
    award:     '<svg viewBox="0 0 24 24"><path d="M12 2a6 6 0 1 1 0 12A6 6 0 0 1 12 2zm-4 13.3V22l4-2 4 2v-6.7a8 8 0 0 1-8 0z"/></svg>',
  };
  const icon = (name) => ICONS[name] || ICONS.globe;

  /* ------------------------- 極簡 Markdown ------------------------- */
  const CODE_MARK = (i) => `@@CODEBLOCK_${i}@@`;

  function md(src) {
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    const blocks = [];
    const text = String(src ?? '').replace(/```[a-z]*\n([\s\S]*?)```/g, (_, code) => {
      blocks.push(`<pre class="md-code"><code>${esc(code.replace(/\n$/, ''))}</code></pre>`);
      return CODE_MARK(blocks.length - 1);
    });

    const out = [];
    let list = null;
    const flush = () => { if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; } };

    text.split('\n').forEach((raw) => {
      const line = raw.trim();
      const block = line.match(/^@@CODEBLOCK_(\d+)@@$/);
      if (block) { flush(); out.push(blocks[+block[1]]); return; }
      if (!line) { flush(); return; }
      if (/^###\s+/.test(line)) { flush(); out.push(`<h4>${inline(line.slice(4))}</h4>`); return; }
      if (/^##\s+/.test(line))  { flush(); out.push(`<h3>${inline(line.slice(3))}</h3>`); return; }
      if (/^-\s+/.test(line))   { (list ||= []).push(`<li>${inline(line.slice(2))}</li>`); return; }
      flush();
      out.push(`<p>${inline(line)}</p>`);
    });
    flush();
    return out.join('');
  }

  /* ------------------------- 共用區塊 ------------------------- */
  const pageHeader = (title, subtitle) =>
    `<header class="page-header">
       <h1 class="pixel-title">${esc(title)}</h1>
       ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
     </header>`;

  const socialLinks = () => SITE.socials.map((s) => `
    <a class="social-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"
       aria-label="${esc(s.label)}">${icon(s.icon)}<span>${esc(s.label)}</span></a>`).join('');

  const resumeLink = () => SITE.resumeUrl
    ? `<a class="social-link" href="${esc(SITE.resumeUrl)}" download>${icon('download')}<span>${te(UI.downloadResume)}</span></a>`
    : '';

  const emptyState = () =>
    `<div class="empty-state"><strong>${te(UI.noData)}</strong>${te(UI.emptyHint)}</div>`;

  const navLabel = (id) => t((SITE.nav.find((n) => n.id === id) || {}).label) || id;

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(LANG === 'zh' ? 'zh-TW' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* labels：把原始值（例如 kind）對應成顯示文字，沒給就直接顯示原值 */
  const filterBar = (group, values, labels) => `
    <div class="filter-bar" data-filter-group="${group}">
      ${['all', ...values].map((c) => `
        <button class="pixel-btn${c === 'all' ? ' is-active' : ''}" data-filter="${esc(c)}">
          ${c === 'all' ? te(UI.all) : te(labels?.[c] ?? c)}
        </button>`).join('')}
    </div>`;

  /* ------------------------- 生涯拓撲圖 -------------------------
     走線一律用直角（Manhattan routing）：這既是像素風的必然，
     也是真實網路拓撲圖的畫法。節點用真的 <button> 疊在 SVG 上，
     這樣鍵盤與螢幕閱讀器才能操作，SVG 只負責畫線。
     ------------------------------------------------------------- */
  const PAD = 14;  // SVG 邊界留白（單位：viewBox 座標）
  const CELL = 10; // 每格網格的大小

  /* 視野依實際節點範圍計算，不用 cols/rows 硬框 ——
     這樣在 data.js 增減節點時，圖面會自己貼合，不會留下一片死空間。 */
  function topoBounds(nodes) {
    const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return {
      minX, minY,
      w: (maxX - minX) * CELL + PAD * 2,
      h: (maxY - minY) * CELL + PAD * 2,
    };
  }

  let BOUNDS = null;
  const nodePos = (n) => ({
    x: PAD + (n.x - BOUNDS.minX) * CELL,
    y: PAD + (n.y - BOUNDS.minY) * CELL,
  });

  function elbow(a, b) {
    const p = nodePos(a), q = nodePos(b);
    if (p.y === q.y || p.x === q.x) return `M${p.x} ${p.y} L${q.x} ${q.y}`;
    const mid = Math.round((p.x + q.x) / 2);
    return `M${p.x} ${p.y} H${mid} V${q.y} H${q.x}`;
  }

  function topologyMap(opts = {}) {
    const t = SITE.topology;
    if (!t || !t.nodes.length) return '';
    const byId = Object.fromEntries(t.nodes.map((n) => [n.id, n]));
    BOUNDS = topoBounds(t.nodes);
    const w = BOUNDS.w, h = BOUNDS.h;
    const cols = Math.round((w - PAD * 2) / CELL);
    const rows = Math.round((h - PAD * 2) / CELL);

    const wires = t.links.map(([a, b]) => {
      const na = byId[a], nb = byId[b];
      if (!na || !nb) return '';
      const live = na.state === 'active' || nb.state === 'active' ||
                   na.state === 'next'   || nb.state === 'next';
      return `<path class="wire${live ? ' is-live' : ''}" d="${elbow(na, nb)}" />`;
    }).join('');

    const nodes = t.nodes.map((n) => {
      const p = nodePos(n);
      return `<button class="topo-node is-${esc(n.state)} kind-${esc(n.kind)}"
                 type="button" data-node="${esc(n.id)}"
                 style="left:${(p.x / w) * 100}%; top:${(p.y / h) * 100}%"
                 aria-label="${te(n.title)}">
                <span class="topo-dot" aria-hidden="true"></span>
                <span class="topo-label">${esc(n.label)}</span>
              </button>`;
    }).join('');

    const live = t.nodes.filter((n) => n.state === 'active').length;

    return `
      <section class="topo" aria-labelledby="topoTitle">
        <div class="topo-bar">
          <h2 id="topoTitle">${te(UI.mapTitle)}</h2>
          <span class="topo-readout">
            node ${t.nodes.length} &middot; link ${t.links.length} &middot;
            <b>${live} active</b>
          </span>
        </div>

        <div class="topo-stage" data-topo style="aspect-ratio:${w} / ${h}">
          <svg class="topo-wires" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"
               aria-hidden="true" focusable="false">
            <g class="grid">
              ${Array.from({ length: cols + 1 }, (_, i) =>
                `<path d="M${PAD + i * CELL} 0 V${h}" />`).join('')}
              ${Array.from({ length: rows + 1 }, (_, i) =>
                `<path d="M0 ${PAD + i * CELL} H${w}" />`).join('')}
            </g>
            ${wires}
          </svg>
          ${nodes}
        </div>
        <p class="topo-hint">${te(UI.mapHint)}</p>

        ${opts.compact ? '' : `<div class="topo-detail" id="topoDetail" aria-live="polite"></div>`}

        <ol class="trace${opts.compact ? ' is-hidden' : ''}" aria-label="${te(UI.traceTitle)}">
          ${t.nodes.map((n, i) => `
            <li class="trace-hop is-${esc(n.state)}">
              <span class="hop-n">${String(i + 1).padStart(2, '0')}</span>
              <span class="hop-label">${esc(n.label)}</span>
              <span class="hop-period">${esc(n.period || '')}</span>
              <span class="hop-title">${te(n.title)}</span>
              <span class="hop-detail">${te(n.detail)}</span>
              ${n.href ? `<a class="hop-link" href="${esc(n.href)}">${te(UI.goTo)} &rarr;</a>` : ''}
            </li>`).join('')}
        </ol>
      </section>`;
  }

  function showNode(id) {
    const n = (SITE.topology.nodes || []).find((x) => x.id === id);
    if (!n) return;

    $$('[data-node]', main).forEach((b) =>
      b.classList.toggle('is-selected', b.dataset.node === id));

    // Me 頁沒有詳情卡，改成高亮並捲到對應的完整記錄
    const box = $('#topoDetail', main);
    if (!box) {
      const rec = $$('.record', main)[(SITE.topology.nodes || []).findIndex((x) => x.id === id)];
      if (rec) {
        $$('.record', main).forEach((r) => r.classList.toggle('is-focus', r === rec));
        rec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      return;
    }

    box.innerHTML = `
      <div class="pixel-card topo-card">
        <div class="topo-card-meta">
          <span class="tag-kind">${te(UI.nodeKind[n.kind] || n.kind)}</span>
          <span class="tag-state is-${esc(n.state)}">${te(UI.nodeState[n.state] || n.state)}</span>
          <span class="topo-period">${esc(n.period || '')}</span>
        </div>
        <h3>${te(n.title)}</h3>
        <p>${te(n.detail)}</p>
        ${n.href ? `<a class="pixel-btn" href="${esc(n.href)}">${te(UI.goTo)} &rarr;</a>` : ''}
      </div>`;
  }

  /* ------------------------- 各頁渲染 ------------------------- */
  const PAGES = {

    home() {
      const p = SITE.profile;
      const status = (p.status || []).map((s) =>
        `<div class="status-chip"><b>${esc(s.label)}</b>${te(s.value)}</div>`).join('');

      return `
        <section class="panel">
          <div class="panel-frame">
            <span class="reg reg-tl" aria-hidden="true"></span><span class="reg reg-tr" aria-hidden="true"></span>
            <span class="reg reg-bl" aria-hidden="true"></span><span class="reg reg-br" aria-hidden="true"></span>

            <div class="panel-strip">
              <span class="strip-label">${esc(p.name)}</span>
              <span class="strip-code">${te(p.jobTitle)}</span>
              <span class="strip-led"><i aria-hidden="true"></i>ONLINE</span>
            </div>

            <div class="panel-body">
              <div class="panel-screen">
                <img src="${esc(p.avatar)}" alt="${esc(p.name)}" width="150" height="150" />
              </div>
              <div class="panel-info">
                <h1>${esc(p.name)}${p.nameZh ? `<span class="name-zh">${esc(p.nameZh)}</span>` : ''}</h1>
                <p class="tagline">${te(p.tagline)}</p>
                <div class="profile-description"><p>${te(p.description)}</p></div>
                <div class="social-links">${socialLinks()}${resumeLink()}</div>
              </div>
            </div>
          </div>
        </section>
        <section class="status-strip">${status}</section>
        ${topologyMap()}
        <p class="start-prompt">${te(isMobile() ? UI.startPromptMobile : UI.startPromptDesktop)}</p>`;
    },

    me() {
      const blocks = SITE.overview.map((b) => `
        <article class="pixel-card overview-block">
          <h3>${te(b.title)}</h3>
          <ul>${b.items.map((i) => `<li>${te(i)}</li>`).join('')}</ul>
        </article>`).join('');

      const nodes = SITE.topology?.nodes || [];
      const kinds = [...new Set(nodes.map((n) => n.kind))];

      // 完整記錄：拓撲圖的每個節點都攤開，不必點也看得到全部
      const records = nodes.map((n, i) => `
        <article class="record is-${esc(n.state)}" data-cat="${esc(n.kind)}">
          <div class="record-rail" aria-hidden="true"><span></span></div>
          <div class="record-body">
            <div class="record-head">
              <span class="record-n">${String(i + 1).padStart(2, '0')}</span>
              <span class="record-label">${esc(n.label)}</span>
              <span class="record-period">${esc(n.period || '')}</span>
              <span class="tag-state is-${esc(n.state)}">${te(UI.nodeState[n.state] || n.state)}</span>
            </div>
            <h3>${te(n.title)}</h3>
            <p>${te(n.detail)}</p>
            ${n.href ? `<a class="pixel-btn" href="${esc(n.href)}">${te(UI.goTo)} &rarr;</a>` : ''}
          </div>
        </article>`).join('');

      return `${pageHeader(navLabel('me'), t(UI.subtitle.me))}
        <section class="overview stagger">${blocks}</section>
        ${filterBar('records', kinds, UI.nodeKind)}
        ${topologyMap({ compact: true })}
        <section class="records">${records}</section>`;
    },

    coding() {
      const head = pageHeader(navLabel('coding'), t(UI.subtitle.coding));
      if (!SITE.projects.length) return head + emptyState();

      const cards = SITE.projects.map((p) => `
        <article class="pixel-card project-card" data-tech="${esc((p.tech || []).join('|'))}">
          <h3>${te(p.title)}</h3>
          <p>${te(p.description)}</p>
          <div class="project-tech">
            ${(p.tech || []).map((x) => `<button class="tech-tag" data-tech-pick="${esc(x)}" type="button">${esc(x)}</button>`).join('')}
          </div>
          <div class="project-links">
            ${(p.links || []).map((l) => `<a class="pixel-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}
          </div>
        </article>`).join('');

      return `${head}
        ${filterBar('projects', [...new Set(SITE.projects.flatMap((p) => p.tech || []))])}
        <section class="projects-grid stagger">${cards}</section>`;
    },

    blog() {
      const head = pageHeader(navLabel('blog'), t(UI.subtitle.blog));
      const posts = (SITE.posts || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      if (!posts.length) return head + emptyState();

      const cards = posts.map((p) => {
        const external = !!p.externalUrl;
        const href = external ? p.externalUrl : `#/blog/${encodeURIComponent(p.slug)}`;
        return `
        <a class="pixel-card post-card" href="${esc(href)}"
           ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          <div class="post-meta">
            <time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time>
            ${(p.tags || []).map((x) => `<span class="tech-tag">${esc(x)}</span>`).join('')}
          </div>
          <h3>${te(p.title)}</h3>
          <p>${te(p.excerpt)}</p>
          <span class="post-more">${external ? te(UI.openLink) : te(UI.readMore)} &rarr;</span>
        </a>`;
      }).join('');

      return `${head}<section class="posts-list stagger">${cards}</section>`;
    },

    post(slug) {
      const p = (SITE.posts || []).find((x) => x.slug === slug);
      if (!p) {
        return `${pageHeader(navLabel('blog'), t(UI.postNotFound))}
          <div class="post-view"><a class="pixel-btn back-link" href="#/blog">${te(UI.backToList)}</a></div>`;
      }
      return `
        <article class="post-view">
          <a class="pixel-btn back-link" href="#/blog">${te(UI.backToList)}</a>
          <header class="post-head">
            <div class="post-meta">
              <time datetime="${esc(p.date)}">${esc(fmtDate(p.date))}</time>
              ${(p.tags || []).map((x) => `<span class="tech-tag">${esc(x)}</span>`).join('')}
            </div>
            <h1 class="pixel-title post-title">${te(p.title)}</h1>
          </header>
          <div class="post-body">${md(t(p.body))}</div>
        </article>`;
    },

    photos() {
      const head = pageHeader(navLabel('photos'), t(UI.subtitle.photos));
      if (!SITE.photos.length) return head + emptyState();

      const cards = SITE.photos.map((p, i) => `
        <button class="pixel-card photo-card" data-cat="${esc(p.category)}" data-photo="${i}" type="button">
          <div class="photo-thumb"><img src="${esc(p.src)}" alt="${te(p.title)}" loading="lazy" width="640" height="480" /></div>
          <div class="photo-meta">
            <h3>${te(p.title)}</h3>
            <div class="meta-row"><span>${esc(p.location || '')}</span><span>${esc(p.date || '')}</span></div>
          </div>
        </button>`).join('');

      return `${head}
        ${filterBar('photos', [...new Set(SITE.photos.map((p) => p.category).filter(Boolean))])}
        <section class="photos-grid stagger">${cards}</section>`;
    },

    videos() {
      const head = pageHeader(navLabel('videos'), t(UI.subtitle.videos));
      if (!SITE.videos.length) return head + emptyState();
      const cards = SITE.videos.map((v, i) => `
        <button class="pixel-card video-card" data-video="${i}" type="button">
          <div class="video-thumb"><img src="${esc(v.thumb || (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : ''))}" alt="${te(v.title)}" loading="lazy" width="640" height="360" /></div>
          <div class="video-meta"><h3>${te(v.title)}</h3><p>${te(v.description)}</p></div>
        </button>`).join('');
      return `${head}<section class="videos-grid stagger">${cards}</section>`;
    },

    contact() {
      return `${pageHeader(navLabel('contact'), t(UI.subtitle.contact))}
        <section class="pixel-card contact-card">
          <p>${te(SITE.contact.body)}</p>
          <div class="contact-list social-links">${socialLinks()}${resumeLink()}</div>
        </section>`;
    },
  };

  /* ------------------------- 路由 ------------------------- */
  const navIds = SITE.nav.map((n) => n.id);
  const main = $('#main');

  function route() {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [id, param] = raw.split('/');
    return { id: navIds.includes(id) ? id : navIds[0], param: param || '' };
  }

  function go(id) { location.hash = `#/${id}`; }

  /* ------------------------- 每頁 meta（SEO / 分享預覽） ------------------------- */
  function updateMeta({ id, param }) {
    const p = SITE.profile;
    let title = `${p.name} — ${navLabel(id)}`;
    let desc = t(p.tagline);

    if (id === 'blog' && param) {
      const post = (SITE.posts || []).find((x) => x.slug === param);
      if (post) { title = `${t(post.title)} — ${p.name}`; desc = t(post.excerpt); }
    } else if (id === 'home') {
      title = `${p.name}${p.nameZh ? ` · ${p.nameZh}` : ''} — ${t(p.jobTitle)}`;
      desc = t(p.description).slice(0, 160);
    }

    document.title = title;
    const base = String(SITE.siteUrl).replace(/\/+$/, '') + '/';
    // og:url 帶片段，分享出去才會直接開到那一頁；
    // canonical 一律用不帶片段的網址 —— 所有路由本來就是同一份文件，
    // 而且搜尋引擎會忽略帶片段的 canonical。
    const shareUrl = base + (location.hash || '#/home');
    const set = (sel, attr, val) => { const n = $(sel); if (n) n.setAttribute(attr, val); };
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', desc);
    set('meta[property="og:url"]', 'content', shareUrl);
    set('link[rel="canonical"]', 'href', base);
  }

  /* ------------------------- 渲染 ------------------------- */
  function render() {
    const r = route();
    const renderer = (r.id === 'blog' && r.param) ? () => PAGES.post(r.param) : PAGES[r.id];
    main.className = `view ${r.id}`;
    main.innerHTML = renderer ? renderer() : emptyState();

    if (!reduceMotion) {
      $$('.stagger > *', main).forEach((n, i) => {
        n.style.animationDelay = `${Math.min(i * 45, 400)}ms`;
      });
    }

    // 首頁一載入就先選中現在進行中的節點，畫面不會是空的
    if (r.id === 'home' && SITE.topology) {
      const first = (SITE.topology.nodes || []).find((n) => n.state === 'active')
                 || (SITE.topology.nodes || [])[0];
      if (first) showNode(first.id);
    }

    syncNav(r.id);
    updateMeta(r);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    main.focus({ preventScroll: true });
  }

  /* ------------------------- 導覽列與語言鈕 ------------------------- */
  const dock = $('#dock');
  const prevBtn = $('#navPrev'), nextBtn = $('#navNext'), langBtn = $('#langToggle');

  function buildChrome() {
    dock.innerHTML = SITE.nav.map((n) => `
      <a class="dock-item" href="#/${n.id}" data-nav="${n.id}">
        ${icon(n.icon)}<span>${te(n.label)}</span>
      </a>`).join('');
    langBtn.textContent = t(UI.langLabel);
    langBtn.setAttribute('aria-label', t(UI.langAria));
  }

  function syncNav(id) {
    $$('[data-nav]', dock).forEach((a) => {
      if (a.dataset.nav === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    const i = navIds.indexOf(id);
    const prev = i > 0 ? SITE.nav[i - 1] : null;
    const next = i < SITE.nav.length - 1 ? SITE.nav[i + 1] : null;

    prevBtn.hidden = !prev;
    nextBtn.hidden = !next;
    if (prev) { $('.arrow-label', prevBtn).textContent = t(prev.label); prevBtn.onclick = () => go(prev.id); }
    if (next) { $('.arrow-label', nextBtn).textContent = t(next.label); nextBtn.onclick = () => go(next.id); }
  }

  langBtn.addEventListener('click', () => setLang(LANG === 'zh' ? 'en' : 'zh'));

  /* ------------------------- 篩選 ------------------------- */
  function applyFilter(group, val) {
    const bar = $(`.filter-bar[data-filter-group="${group}"]`, main);
    if (!bar) return;
    $$('[data-filter]', bar).forEach((b) => b.classList.toggle('is-active', b.dataset.filter === val));

    if (group === 'projects') {
      $$('.project-card', main).forEach((n) => {
        n.hidden = !(val === 'all' || (n.dataset.tech || '').split('|').includes(val));
      });
    } else if (group === 'records') {
      const nodes = SITE.topology?.nodes || [];
      $$('.record', main).forEach((n) => {
        n.hidden = !(val === 'all' || n.dataset.cat === val);
      });
      // 圖上不符合的節點淡出，但保留連線以免拓撲斷掉
      $$('[data-node]', main).forEach((b) => {
        const nd = nodes.find((x) => x.id === b.dataset.node);
        b.classList.toggle('is-dim', !(val === 'all' || (nd && nd.kind === val)));
      });
    } else {
      $$('.photo-card', main).forEach((n) => { n.hidden = !(val === 'all' || n.dataset.cat === val); });
    }
  }

  /* ------------------------- main 的點擊事件 ------------------------- */
  main.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (btn) return applyFilter(btn.closest('.filter-bar').dataset.filterGroup, btn.dataset.filter);

    // 點專案卡上的技術標籤 = 直接套用該篩選
    const pick = e.target.closest('[data-tech-pick]');
    if (pick) {
      applyFilter('projects', pick.dataset.techPick);
      const bar = $('.filter-bar', main);
      if (bar) bar.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      return;
    }

    const node = e.target.closest('[data-node]');
    if (node) return showNode(node.dataset.node);

    const photo = e.target.closest('[data-photo]');
    if (photo) {
      const p = SITE.photos[+photo.dataset.photo];
      return openModal(`
        <img src="${esc(p.src)}" alt="${te(p.title)}" width="640" height="480" />
        <h3>${te(p.title)}</h3>
        <div class="meta-row">
          <span>${esc(p.location || '')}</span><span>${esc(p.date || '')}</span><span>${esc(p.category || '')}</span>
        </div>`);
    }

    const video = e.target.closest('[data-video]');
    if (video) {
      const v = SITE.videos[+video.dataset.video];
      const media = v.youtubeId
        ? `<iframe src="https://www.youtube.com/embed/${esc(v.youtubeId)}" title="${te(v.title)}"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
             allowfullscreen loading="lazy"></iframe>`
        : `<img src="${esc(v.thumb)}" alt="${te(v.title)}" width="640" height="360" />`;
      return openModal(`${media}
        <h3>${te(v.title)}</h3>
        <p>${te(v.description)}</p>
        ${v.url && v.url !== '#' ? `<a class="pixel-btn" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${te(UI.openLink)}</a>` : ''}`);
    }
  });

  /* ------------------------- 燈箱（含焦點鎖定） ------------------------- */
  const modal = $('#modal'), modalBody = $('.modal-body', modal), modalFrame = $('.modal-frame', modal);
  let lastFocused = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

  function openModal(html) {
    lastFocused = document.activeElement;
    modalBody.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });

  /* Tab 不會跑到燈箱後面的頁面 */
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, modalFrame).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ------------------------- 快捷鍵 ------------------------- */
  const SHORTCUTS = [
    ['←  →', T('上一頁 / 下一頁', 'Previous / next page')],
    ['L',   T('切換中英文', 'Switch language')],
    ['Esc', T('關閉視窗', 'Close dialog')],
    ['?',   T('顯示這份說明', 'Show this help')],
  ];

  function showShortcuts() {
    openModal(`<h3>${te(UI.shortcuts)}</h3>
      <dl class="shortcut-list">
        ${SHORTCUTS.map(([k, d]) => `<div><dt><kbd>${esc(k)}</kbd></dt><dd>${te(d)}</dd></div>`).join('')}
      </dl>`);
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;

    if (e.key === 'Escape') return closeModal();
    if (e.key === '?') { e.preventDefault(); return modal.hidden ? showShortcuts() : closeModal(); }
    if (!modal.hidden) return;

    if (e.key === 'l' || e.key === 'L') return setLang(LANG === 'zh' ? 'en' : 'zh');

    const i = navIds.indexOf(route().id);
    if (e.key === 'ArrowLeft' && i > 0) go(navIds[i - 1]);
    if (e.key === 'ArrowRight' && i < navIds.length - 1) go(navIds[i + 1]);
  });

  /* ------------------------- 彩蛋：Konami code ------------------------- */
  (() => {
    const CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown',
                  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      pos = (key === CODE[pos]) ? pos + 1 : (key === CODE[0] ? 1 : 0);
      if (pos < CODE.length) return;
      pos = 0;
      document.body.classList.toggle('konami');
      const on = document.body.classList.contains('konami');
      const toast = el('div', 'toast');
      toast.textContent = on ? 'CHEAT MODE ON' : 'CHEAT MODE OFF';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    });
  })();

  /* ------------------------- 點擊特效：封包爆發 -------------------------
     刻意不做放射狀粒子。封包沿直角路徑跑，跟拓撲圖的走線規則一致；
     外圈是方形的 ping 環，不是圓的。 */
  (() => {
    if (reduceMotion) return;
    const fx = $('#fx');
    if (!fx) return;

    let last = 0;
    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const now = performance.now();
      if (now - last < 90) return;            // 連點時不要堆爆
      last = now;

      const burst = el('div', 'burst');
      burst.style.left = `${e.clientX}px`;
      burst.style.top  = `${e.clientY}px`;

      burst.appendChild(el('span', 'ping'));

      // 四個沿軸線直走，四個走 L 形轉一次直角
      const AXES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      AXES.forEach(([ax, ay], i) => {
        const p = el('i', 'pkt');
        const d = 34 + Math.random() * 30;
        p.style.setProperty('--dx', `${ax * d}px`);
        p.style.setProperty('--dy', `${ay * d}px`);
        p.style.animationDelay = `${i * 18}ms`;
        burst.appendChild(p);
      });

      for (let i = 0; i < 4; i++) {
        const p = el('i', 'pkt is-elbow');
        const sx = i < 2 ? 1 : -1;
        const sy = i % 2 ? 1 : -1;
        p.style.setProperty('--dx', `${sx * (22 + Math.random() * 24)}px`);
        p.style.setProperty('--dy', `${sy * (20 + Math.random() * 22)}px`);
        p.style.animationDelay = `${40 + i * 22}ms`;
        if (i === 0) p.classList.add('is-live');   // 一顆走訊號綠，其餘藍圖墨
        burst.appendChild(p);
      }

      fx.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
    }, { passive: true });
  })();

  /* ------------------------- 開機動畫 ------------------------- */
  function boot() {
    const box = $('#boot');
    if (!box) return;
    const dismiss = () => { box.classList.add('is-done'); setTimeout(() => box.remove(), 450); };

    const seen = (() => { try { return sessionStorage.getItem('booted'); } catch (_) { return null; } })();
    const lines = SITE.bootLines || [];
    if (reduceMotion || !lines.length || seen) { box.remove(); return; }

    // 保險：不管發生什麼事，2.5 秒後一定讓開機畫面消失，不會擋住整個網站
    const failsafe = setTimeout(dismiss, 2500);
    box.addEventListener('click', () => { clearTimeout(failsafe); dismiss(); });

    const log = $('.boot-log', box);
    let i = 0;
    const tick = () => {
      log.textContent += (i ? '\n' : '') + lines[i];
      if (++i < lines.length) return setTimeout(tick, 260);
      setTimeout(() => { clearTimeout(failsafe); dismiss(); }, 420);
    };
    tick();
    try { sessionStorage.setItem('booted', '1'); } catch (_) {}
  }

  /* ------------------------- 結構化資料（給 Google 認識你） ------------------------- */
  function injectJsonLd() {
    const p = SITE.profile;
    const node = document.createElement('script');
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: p.name,
      alternateName: p.nameZh || undefined,
      jobTitle: t(p.jobTitle),
      description: t(p.description),
      url: SITE.siteUrl,
      sameAs: SITE.socials.filter((s) => /^https?:/.test(s.url)).map((s) => s.url),
    });
    document.head.appendChild(node);
  }

  /* ------------------------- 啟動 ------------------------- */
  document.documentElement.lang = LANG === 'zh' ? 'zh-TW' : 'en';
  buildChrome();
  window.addEventListener('hashchange', render);
  if (!location.hash) location.replace(`#/${navIds[0]}`);
  render();
  injectJsonLd();
  boot();
})();
