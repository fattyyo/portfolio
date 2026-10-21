/* =====================================================================
   app.js — 渲染與互動。一般情況不需要改這支，內容請改 data.js
   ===================================================================== */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* storage 在無痕模式／封鎖網站資料時會直接 throw，一律包起來 */
  const store = {
    get(k, s = localStorage) { try { return s.getItem(k); } catch (_) { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, v); } catch (_) {} },
  };
  const session = (() => { try { return sessionStorage; } catch (_) { return null; } })();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------- 語言 ------------------------- */
  const browserLang = () => (/^zh/i.test(navigator.language || '') ? 'zh' : 'en');
  let LANG = store.get('lang') || (SITE.defaultLang === 'auto' ? browserLang() : SITE.defaultLang) || 'en';
  if (LANG !== 'zh' && LANG !== 'en') LANG = 'en';

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
    render();
  }

  /* ------------------------- 距離（haversine） ------------------------- */
  function km(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const fmtKm = (d) => (d < 10 ? '0' : Math.round(d / (d > 1000 ? 10 : 1)) * (d > 1000 ? 10 : 1)).toLocaleString('en-US') + ' km';

  /* =====================================================================
     渲染
     ===================================================================== */
  function render() {
    const P = SITE.profile;
    document.documentElement.lang = LANG === 'zh' ? 'zh-TW' : 'en';
    document.title = `${P.name}${LANG === 'zh' ? `（${P.nameZh}）` : ''} — ${t(P.jobTitle)}`;

    $$('[data-ui]').forEach((n) => { n.textContent = t(UI[n.dataset.ui]); });
    const toggle = $('#langToggle');
    toggle.textContent = t(UI.langLabel);
    toggle.setAttribute('aria-label', t(UI.langAria));

    $('#menu').innerHTML = ['work', 'path', 'about', 'contact']
      .map((id) => `<a href="#${id}" data-sec="${id}">${te(UI.nav[id])}</a>`).join('');

    renderHero();
    renderStatement();
    renderPath();
    renderWork();
    renderStats();
    renderAbout();
    renderContact();
    observeReveals();
    tickClock();
    onScroll();
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    const P = SITE.profile;
    $('#heroKicker').innerHTML = `${te(P.open)}`;
    $('#heroKicker').classList.add('fade-up');
    $('#heroKicker').style.setProperty('--d', '.2s');

    let i = 0;
    const word = (w, italic) => `<span class="word">${[...w].map((c) =>
      `<span class="char" style="--i:${i++}">${italic ? `<em>${esc(c)}</em>` : esc(c)}</span>`).join('')}</span>`;
    const [first, ...rest] = P.name.split(' ');
    $('#heroName').innerHTML =
      `<span class="sr-only">${esc(P.name)}</span>` +
      `<span aria-hidden="true" style="display:contents">${word(first)}${word(rest.join(' '), true)}</span>`;
    $('#heroAlt').innerHTML = `<span lang="zh-TW">${esc(P.nameZh)}</span><span>${esc(P.legalName)}</span>`;

    $('#heroRole').innerHTML = te(P.role);
    $('#heroRole').className = 'hero-role fade-up';
    $('#heroRole').style.setProperty('--d', '.75s');

    $('#heroMeta').innerHTML = `
      <div class="fade-up" style="--d:.85s"><dt>${LANG === 'zh' ? '現在' : 'Now'}</dt><dd>${te(P.now)}</dd></div>
      <div class="fade-up" style="--d:.95s"><dt>${LANG === 'zh' ? '所在地' : 'Based in'}</dt><dd>${esc(P.city)}</dd></div>
      <div class="fade-up live" style="--d:1.05s"><dt>${te(UI.localTime)}</dt><dd data-clock="long"></dd></div>`;
  }

  /* ---------- Statement：逐字被捲動「點亮」 ---------- */
  function renderStatement() {
    const raw = t(SITE.statement);
    /* 中文逐字切，英文以空白切；*...* 包起來的是強調 */
    const parts = raw.split(/(\*[^*]+\*)/g).filter(Boolean);
    const tokens = [];
    parts.forEach((p) => {
      const em = p.startsWith('*');
      const s = em ? p.slice(1, -1) : p;
      const units = LANG === 'zh'
        ? s.match(/[A-Za-z0-9.%+-\-/]+|\s+|./gu) || []
        : s.split(/(\s+)/);
      units.forEach((u) => tokens.push({ u, em }));
    });
    $('#statementText').innerHTML = tokens.map(({ u, em }) =>
      /^\s+$/.test(u) ? ' ' : `<span class="w${em ? ' em' : ''}">${esc(u)}</span>`).join('');
  }

  /* ---------- Path：Rate vs. Range ---------- */
  let pathGeo = null;
  function renderPath() {
    const { stops } = SITE.path;
    $('#pathTitle').textContent = t(SITE.path.title);
    $('#pathLede').textContent = t(SITE.path.lede);
    $('#pathReadLabel').textContent = t(UI.pathRead);
    stops.forEach((s) => { s.km = km(stops[0], s); });

    $('#pathCards').innerHTML = stops.map((s, i) => `
      <li class="path-card" data-i="${i}">
        <div class="pc-top mono"><span>${esc(s.place)} · <span class="pc-km">${fmtKm(s.km)}</span></span><span>${te(s.period)}</span></div>
        ${s.current ? `<span class="pc-now mono">${te(UI.pathNow)}</span>` : ''}
        <h3>${te(s.title)}</h3>
        <p>${te(s.detail)}</p>
        <div class="path-progress" aria-hidden="true">${stops.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
      </li>`).join('');
    drawPathChart();
  }

  function drawPathChart() {
    const svg = $('#pathChart');
    const { stops } = SITE.path;
    const r = svg.getBoundingClientRect();
    const W = Math.max(280, r.width), H = Math.max(200, r.height);
    const narrow = W < 520;
    const pad = { l: narrow ? 8 : 52, r: narrow ? 20 : 24, t: narrow ? 28 : 20, b: narrow ? 26 : 44 };
    const maxLog = Math.log10(20000);
    const toYear = (y) => +y;
    const y0 = 2020, y1 = 2027;
    const X = (d) => pad.l + (Math.log10(Math.max(1, d)) / maxLog) * (W - pad.l - pad.r);
    const Y = (yr) => pad.t + ((yr - y0) / (y1 - y0)) * (H - pad.t - pad.b);
    /* 用起始年月決定 y，讓同一年的點不會疊在一起 */
    const startYear = (s) => {
      const m = String(t(s.period)).match(/(\d{4})[.\s]*(\d{2})?/) || [];
      const mm = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const en = String(s.period.en || '').match(/^(\w{3})\s+(\d{4})/);
      if (en) return +en[2] + (mm[en[1]] || 0) / 12;
      return toYear(m[1] || s.year) + ((+m[2] || 1) - 1) / 12;
    };
    const pts = stops.map((s) => ({ x: X(s.km), y: Y(startYear(s)), s }));

    let g = '<g class="grid">';
    for (let e = 0; e <= 4; e++) {
      const x = X(10 ** e);
      g += `<line class="${e % 2 ? '' : 'major'}" x1="${x}" x2="${x}" y1="${pad.t}" y2="${H - pad.b}"/>`;
      if (!narrow || e % 2 === 0) g += `<text x="${x}" y="${H - pad.b + 20}" text-anchor="${e === 0 ? 'start' : narrow && e === 4 ? 'end' : 'middle'}">${e === 0 ? '0' : (10 ** e).toLocaleString('en-US')}</text>`;
    }
    for (let yr = y0; yr <= y1; yr++) {
      const y = Y(yr);
      g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/>`;
      if (!narrow) g += `<text x="${pad.l - 12}" y="${y + 4}" text-anchor="end">${yr}</text>`;
    }
    g += '</g>';
    if (!narrow) g += `<text class="axis-label" x="${W - pad.r}" y="${H - 4}" text-anchor="end">${te(UI.pathAxisX)}</text>`;

    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    let stopsSvg = '';
    pts.forEach((p, i) => {
      /* 標籤放在沒有線段經過的那一側 */
      const nb = [pts[i - 1], pts[i + 1]].filter(Boolean);
      const hasAbove = nb.some((q) => q.y < p.y - 1), hasBelow = nb.some((q) => q.y > p.y + 1);
      const roomRight = W - pad.r - p.x > 60;
      let tx = 0, ty = -16, anchor = 'middle';
      if (!hasAbove) ty = -16;
      else if (!hasBelow) ty = 26;
      else if (nb.every((q) => q.x > p.x)) { tx = -14; ty = 4; anchor = 'end'; }
      else { tx = roomRight ? 12 : -12; ty = -12; anchor = roomRight ? 'start' : 'end'; }
      if (anchor === 'middle' && p.x < pad.l + 30) { anchor = 'start'; tx = -6; }
      if (anchor === 'middle' && p.x > W - pad.r - 40) { anchor = 'end'; tx = 6; }
      if (narrow && i === pts.length - 1) { anchor = 'end'; tx = -12; ty = -12; }
      stopsSvg += `<g class="stop" data-i="${i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
        <circle class="halo" r="6"/><circle class="dot" r="5.5"/>
        <text x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(p.s.place.toUpperCase())}</text></g>`;
    });

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('aria-label', stops.map((s) => `${s.place} ${fmtKm(s.km)}, ${t(s.period)}`).join('; '));
    svg.innerHTML = `${g}<path class="trace-bg" d="${d}"/><path class="trace" id="trace" d="${d}"/>${stopsSvg}`;

    /* 每一段的累積長度，用來決定「畫到哪裡就點亮哪一站」 */
    const tr = $('#trace');
    const total = tr.getTotalLength();
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    tr.style.strokeDasharray = total;
    pathGeo = { total, cum: cum.map((c) => c / cum[cum.length - 1]), tr, active: -1, kms: stops.map((s) => s.km) };
    updatePath();
  }

  function updatePath() {
    if (!pathGeo) return;
    const sec = $('#path');
    const r = sec.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    const p = clamp(-r.top / span, 0, 1);
    const drawn = clamp((p - 0.04) / 0.82, 0, 1);
    pathGeo.tr.style.strokeDashoffset = pathGeo.total * (1 - drawn);
    const { cum, kms } = pathGeo;
    /* 線頭所在的那一段 j，以及離線頭最近的那一站 active（卡片跟著它換） */
    let j = 0;
    cum.forEach((c, i) => { if (i < cum.length - 1 && drawn >= c) j = i; });
    const active = drawn - cum[j] < (cum[j + 1] - cum[j]) / 2 ? j : j + 1;

    /* 大數字：沿著目前這段線，在對數尺度上內插距離 */
    const u = clamp((drawn - cum[j]) / (cum[j + 1] - cum[j] || 1), 0, 1);
    const L = (d) => Math.log10(Math.max(1, d));
    const dNow = 10 ** lerp(L(kms[j]), L(kms[j + 1]), u);
    $('#pathKm').textContent = (dNow < 10 ? 0 : Math.round(dNow / 10) * 10).toLocaleString('en-US');
    $$('#pathChart .stop').forEach((g, i) => {
      g.classList.toggle('reached', drawn >= cum[i] - 0.001);
      g.classList.toggle('active', i === active && drawn >= cum[i] - 0.001);
    });
    if (active === pathGeo.active) return;
    pathGeo.active = active;
    $$('#pathCards .path-card').forEach((c, i) => {
      c.classList.toggle('active', i === active);
      c.classList.toggle('past', i < active);
      c.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
  }

  /* ---------- Work ---------- */
  function renderWork() {
    $('#workTitle').textContent = t(UI.workTitle);
    $('#workCount').textContent = `(${String(SITE.work.length).padStart(2, '0')})`;
    $('#workList').innerHTML = SITE.work.map((w, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `
      <li class="work-item reveal" style="--d:${i * 0.06}s" data-art="${esc(w.art)}">
        <button class="work-row" type="button" aria-expanded="false" aria-controls="wd-${esc(w.id)}" data-cursor="open">
          <span class="work-idx mono">${n}</span>
          <span class="work-title">${te(w.title)}</span>
          <span class="work-kind">${te(w.kind)}</span>
          <span class="work-year mono">${esc(w.year)}</span>
          <span class="work-plus" aria-hidden="true"></span>
        </button>
        <div class="work-detail" id="wd-${esc(w.id)}" role="region" aria-label="${te(w.title)}">
          <div><div class="work-detail-inner">
            <figure class="work-art-inline" aria-hidden="true">${ART[w.art] ? ART[w.art]() : ''}</figure>
            <div class="work-copy">
              <p class="work-summary">${te(w.summary)}</p>
              ${w.points.length ? `<ul class="work-points">${w.points.map((p) => `<li>${te(p)}</li>`).join('')}</ul>` : ''}
              <div class="work-tags mono">${w.tags.map((x) => `<span>${te(x)}</span>`).join('')}</div>
              ${w.links.length ? `<div class="work-links">${w.links.map((l) =>
                `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${te(l.label)} <span class="arr" aria-hidden="true">↗</span></a>`).join('')}</div>` : ''}
            </div>
          </div></div>
        </div>
      </li>`;
    }).join('');

    $('#workPreview').innerHTML = SITE.work.map((w) => (ART[w.art] ? ART[w.art]().replace('<svg', `<svg data-art="${esc(w.art)}"`) : '')).join('');

    $$('#workList .work-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.work-item');
        const open = !item.classList.contains('open');
        item.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.dataset.cursor = open ? 'close' : 'open';
        setCursorLabel(btn);
        if (open) { restartDraw(item); $('#workPreview').classList.remove('on'); }
      });
    });
  }

  function restartDraw(root) {
    $$('.draw', root).forEach((p) => { p.style.animation = 'none'; void p.getBBox(); p.style.animation = ''; });
  }

  /* ---------- 作品生成圖（viewBox 400×300） ---------- */
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
  const grid = (sx = 40, sy = 30) => {
    let s = '';
    for (let x = sx; x < 400; x += sx) s += `<line class="a-grid" x1="${x}" y1="0" x2="${x}" y2="300"/>`;
    for (let y = sy; y < 300; y += sy) s += `<line class="a-grid" x1="0" y1="${y}" x2="400" y2="${y}"/>`;
    return s;
  };
  const svgWrap = (inner) => `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  const ART = {
    /* RvR：三條韌體曲線，其中一條掉了 35% */
    rvr() {
      const curve = (k, dip) => {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const x = 40 + i * 8.5;
          let v = 1 / (1 + Math.exp((i - 26) / 4.2)) * 0.92 + 0.04;
          if (dip) v *= 1 - 0.35 * Math.exp(-((i - 16) ** 2) / 60);
          pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${(250 - v * 190 * k).toFixed(1)}`);
        }
        return pts.join(' ');
      };
      return svgWrap(`${grid()}
        <path class="a-faint draw" style="--len:600" d="${curve(1)}"/>
        <path class="a-faint draw" style="--len:600;--dl:.15s" d="${curve(0.94)}"/>
        <path class="a-sig draw" style="--len:600;--dl:.3s" d="${curve(0.97, true)}"/>
        <line class="a-line" x1="40" y1="250" x2="380" y2="250"/><line class="a-line" x1="40" y1="40" x2="40" y2="250"/>
        <line x1="176" y1="78" x2="176" y2="122" stroke="var(--signal)" stroke-dasharray="3 3"/>
        <text x="184" y="104" class="t-sig">−35%</text>
        <text x="40" y="272">RANGE →</text><text x="40" y="30">THROUGHPUT</text>
        <text x="300" y="30">FW A / B / C</text>`);
    },
    /* Bot：24 小時錶盤，簡報時間點亮 */
    bot() {
      let s = '';
      const cx = 200, cy = 150;
      for (let h = 0; h < 96; h++) {
        const a = (h / 96) * Math.PI * 2 - Math.PI / 2;
        const major = h % 4 === 0;
        const r1 = major ? 96 : 102, r2 = 110;
        s += `<line x1="${cx + Math.cos(a) * r1}" y1="${cy + Math.sin(a) * r1}" x2="${cx + Math.cos(a) * r2}" y2="${cy + Math.sin(a) * r2}" stroke="rgba(238,236,229,${major ? .5 : .18})"/>`;
      }
      const mark = (hr, label) => {
        const a = (hr / 24) * Math.PI * 2 - Math.PI / 2;
        return `<circle class="a-fill" cx="${cx + Math.cos(a) * 128}" cy="${cy + Math.sin(a) * 128}" r="4"/>
          <text class="t-sig" x="${cx + Math.cos(a) * 146}" y="${cy + Math.sin(a) * 146 + 4}" text-anchor="middle">${label}</text>`;
      };
      return svgWrap(`${grid()}
        <circle class="a-faint" cx="${cx}" cy="${cy}" r="128"/>
        ${s}
        <circle class="a-sig draw" style="--len:820" cx="${cx}" cy="${cy}" r="128" transform="rotate(-90 ${cx} ${cy})"/>
        ${mark(8, '08:00')}${mark(21, '21:00')}
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" style="font-size:22px;fill:var(--paper)">24/7</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle">UPTIME</text>
        <text x="20" y="30">CRON · DAILY BRIEF</text><text x="380" y="286" text-anchor="end">1.8s → 0.9s</text>`);
    },
    /* Tomasulo：亂序的管線甘特圖 */
    tomasulo() {
      const ins = [['LD', 0, 2, 3], ['MUL', 1, 6, 10], ['ADD', 2, 4, 6], ['SUB', 3, 5, 7], ['DIV', 4, 11, 15], ['ADD', 5, 7, 8]];
      const cw = 20, x0 = 70, y0 = 54, rh = 34;
      let s = '';
      ins.forEach(([op, issue, ex, wb], i) => {
        const y = y0 + i * rh;
        s += `<text x="20" y="${y + 15}">${op} F${i * 2}</text>`;
        s += `<rect class="a-box" x="${x0 + issue * cw}" y="${y}" width="${cw - 3}" height="20"/>`;
        s += `<rect class="${i === 2 || i === 3 ? 'a-boxon' : 'a-box'}" x="${x0 + (issue + 1) * cw}" y="${y}" width="${(ex - issue - 1) * cw + cw - 3}" height="20"/>`;
        s += `<rect class="a-fill" x="${x0 + (wb) * cw}" y="${y}" width="${cw - 3}" height="20" opacity="${i === 2 || i === 3 ? 1 : .35}"/>`;
      });
      for (let c = 0; c <= 15; c += 5) s += `<text x="${x0 + c * cw}" y="40">${c}</text>`;
      return svgWrap(`${grid(20, 34)}${s}
        <line class="a-sig draw" style="--len:120" x1="${x0 + 7 * cw}" y1="${y0 + 6 * rh + 8}" x2="${x0 + 11 * cw}" y2="${y0 + 6 * rh + 8}"/>
        <text x="20" y="286">ISSUE · EXEC · WB</text><text x="380" y="286" text-anchor="end" class="t-sig">OUT OF ORDER</text>`);
    },
    /* Vision：追蹤框與軌跡 */
    vision() {
      const R = rng(7);
      let s = '';
      for (let i = 0; i < 70; i++) s += `<circle cx="${(R() * 400).toFixed(1)}" cy="${(R() * 300).toFixed(1)}" r="${(R() * 2.4 + .6).toFixed(1)}" fill="rgba(238,236,229,${(R() * .35 + .08).toFixed(2)})"/>`;
      const bx = 228, by = 112, bw = 92, bh = 92;
      const c = 16;
      const br = `M${bx} ${by + c}V${by}H${bx + c} M${bx + bw - c} ${by}H${bx + bw}V${by + c} M${bx + bw} ${by + bh - c}V${by + bh}H${bx + bw - c} M${bx + c} ${by + bh}H${bx}V${by + bh - c}`;
      return svgWrap(`${grid()}${s}
        <path class="a-faint draw" style="--len:520;stroke-dasharray:4 6" d="M40 250 C 110 240, 120 160, 180 170 S 250 170, 274 158"/>
        <circle cx="274" cy="158" r="26" fill="none" stroke="rgba(238,236,229,.5)"/>
        <circle class="a-fill" cx="274" cy="158" r="5"/>
        <path class="a-sig" d="${br}"/>
        <text x="${bx}" y="${by - 10}" class="t-sig">TARGET LOCK</text>
        <text x="20" y="30">VOICE: FOLLOW</text><text x="380" y="286" text-anchor="end">WATCHDOG OK</text>`);
    },
    /* COVID：23 個地區的小走勢圖 */
    covid() {
      const R = rng(23);
      let s = '';
      for (let k = 0; k < 23; k++) {
        const col = k % 6, row = Math.floor(k / 6);
        const ox = 22 + col * 62, oy = 44 + row * 60;
        const ph = R() * 3, amp = R() * 0.5 + 0.5;
        let d = '';
        for (let i = 0; i <= 24; i++) {
          const v = (Math.sin(i / 3 + ph) * 0.3 + Math.exp(-((i - 8 - R() * 2) ** 2) / 10) * amp + Math.exp(-((i - 19) ** 2) / 6) * amp * 0.8);
          d += `${i ? 'L' : 'M'}${(ox + i * 2.1).toFixed(1)} ${(oy + 36 - clamp(v, 0, 1.4) * 24).toFixed(1)}`;
        }
        s += `<path class="${k === 9 ? 'a-sig' : 'a-faint'} draw" style="--len:140;--dl:${(k * 0.03).toFixed(2)}s" d="${d}"/>`;
        s += `<line class="a-grid" x1="${ox}" y1="${oy + 37}" x2="${ox + 52}" y2="${oy + 37}" style="stroke:rgba(238,236,229,.2)"/>`;
      }
      return svgWrap(`${s}<text x="22" y="30">23 REGIONS · 3 YEARS · DAILY</text><text x="380" y="286" text-anchor="end" class="t-sig">0 NULL ROWS</text>`);
    },
  };

  /* ---------- Stats ---------- */
  function renderStats() {
    $('#statsList').innerHTML = SITE.stats.map((s, i) => `
      <li class="reveal" style="--d:${i * 0.08}s">
        <span class="stat-num" data-count="${s.value}">0<sup>${esc(s.suffix)}</sup></span>
        <span class="stat-label">${te(s.label)}</span>
      </li>`).join('');
  }

  function countUp(node) {
    const target = +node.dataset.count;
    const sup = node.querySelector('sup').outerHTML;
    if (reduceMotion) { node.innerHTML = target + sup; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (now) => {
      const k = clamp((now - t0) / dur, 0, 1);
      node.innerHTML = Math.round(target * (1 - (1 - k) ** 4)) + sup;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- About ---------- */
  function renderAbout() {
    const A = SITE.about;
    $('#aboutTitle').textContent = t(UI.aboutTitle);
    $('#aboutBody').textContent = t(A.body);
    $('#aboutBody').className = 'about-body reveal';
    $('#stackTitle').textContent = t(UI.stackTitle);
    $('#offTitle').textContent = t(UI.offTitle);
    $('#stackList').innerHTML = A.stack.map((s) => `<div><dt>${te(s.label)}</dt><dd>${te(s.items)}</dd></div>`).join('');
    $('#offList').innerHTML = A.off.map((o) => `<div><dt>${te(o.k)}</dt><dd>${o.url
      ? `<a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${te(o.v)} ↗</a>` : te(o.v)}</dd></div>`).join('');
    $('.about-cols').classList.add('reveal');
    $('.about-cols').style.setProperty('--d', '.15s');
  }

  /* ---------- Contact ---------- */
  function renderContact() {
    const C = SITE.contact;
    $('#contactKicker').textContent = t(C.kicker);
    const [user, host] = SITE.email.split('@');
    const mail = $('#mailLink');
    mail.href = `mailto:${SITE.email}`;
    mail.innerHTML = `${esc(user)}<em>@</em>${esc(host)}`;
    mail.dataset.cursor = 'mail';
    $('#contactBody').textContent = t(C.body);
    const links = [
      `<a class="btn primary" href="mailto:${esc(SITE.email)}">${LANG === 'zh' ? '寫信給我' : 'Email me'} <span class="arr" aria-hidden="true">↗</span></a>`,
      `<button class="btn" type="button" id="copyMail">${te(UI.copy)}</button>`,
      ...SITE.socials.map((s) => `<a class="btn" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${te(s.label)} <span class="arr" aria-hidden="true">↗</span></a>`),
    ];
    if (SITE.resumeUrl) links.push(`<a class="btn" href="${esc(SITE.resumeUrl)}" target="_blank" rel="noopener">${te(UI.resume)} <span class="arr" aria-hidden="true">↓</span></a>`);
    $('#contactActions').innerHTML = links.join('');
    $('#copyMail').addEventListener('click', copyMail);

    const phrase = LANG === 'zh' ? ['一起做點東西', 'Let’s build something'] : ['Let’s build something', 'Say hello'];
    const seq = Array.from({ length: 4 }, (_, i) => `<span>${esc(phrase[i % 2])}<i></i></span>`).join('');
    $('#marquee').innerHTML = seq + seq;
    $('#colophon').textContent = `© ${new Date().getFullYear()} ${SITE.profile.legalName}`;
  }

  async function copyMail() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      toast(`${t(UI.copied)} — ${SITE.email}`);
    } catch (_) {
      location.href = `mailto:${SITE.email}`;
    }
  }

  let toastTimer;
  function toast(msg) {
    const n = $('#toast');
    n.textContent = msg;
    n.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => n.classList.remove('on'), 2200);
  }

  /* =====================================================================
     時鐘
     ===================================================================== */
  let clockFmt = null, clockShort = null;
  function tickClock() {
    const tz = SITE.profile.timezone;
    try {
      clockFmt = clockFmt || new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' });
      clockShort = clockShort || new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (_) { return; }
    const now = new Date();
    const long = clockFmt.format(now);
    $$('[data-clock="long"]').forEach((n) => { n.textContent = long; });
    $('#clockTop').textContent = `CHAMPAIGN ${clockShort.format(now)}`;
    $('#clockBottom').textContent = `Champaign, IL ${long}`;
  }

  /* =====================================================================
     Hero 訊號場：點陣上兩個發射源（固定的 AP + 游標）互相干涉
     ===================================================================== */
  function initField() {
    const cv = $('#field');
    const ctx = cv.getContext('2d');
    const hero = $('.hero');
    let W = 0, H = 0, dpr = 1, pts = [], step = 22, running = true, visible = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
    const ap = { x: 0, y: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = W < 700 ? 18 : 22;
      pts = [];
      for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) pts.push(x, y);
      ap.x = W * (W < 700 ? 0.7 : 0.74); ap.y = H * 0.3;
      if (!mouse.inside) { mouse.x = mouse.tx = W * 0.3; mouse.y = mouse.ty = H * 0.42; }
    }

    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; mouse.inside = true;
    });
    hero.addEventListener('pointerleave', () => { mouse.inside = false; });

    const k = 0.045;   // 波數
    function frame(now) {
      if (!running) return;
      const time = reduceMotion ? 0 : now * 0.0022;
      if (!mouse.inside && !reduceMotion) {   // 沒有游標（或手機）時讓第二個源自己繞
        mouse.tx = W * (0.32 + Math.sin(now * 0.00021) * 0.18);
        mouse.ty = H * (0.42 + Math.cos(now * 0.00027) * 0.16);
      }
      mouse.x = lerp(mouse.x, mouse.tx, 0.08); mouse.y = lerp(mouse.y, mouse.ty, 0.08);
      ctx.clearRect(0, 0, W, H);

      const hot = [];
      ctx.fillStyle = 'rgba(238,236,229,1)';
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        const d1 = Math.hypot(x - ap.x, y - ap.y), d2 = Math.hypot(x - mouse.x, y - mouse.y);
        const v = Math.cos(d1 * k - time) / (1 + d1 * 0.004) + Math.cos(d2 * k - time * 1.15) / (1 + d2 * 0.006);
        const a = clamp(v * 0.5, -1, 1);
        if (a > 0.62) { hot.push(x, y, a); continue; }
        const s = 0.6 + Math.abs(a) * 1.5;
        ctx.globalAlpha = 0.08 + Math.max(0, a) * 0.62;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      ctx.fillStyle = '#d7ff4a';
      for (let i = 0; i < hot.length; i += 3) {
        const s = 1.6 + (hot[i + 2] - 0.62) * 6;
        ctx.globalAlpha = 0.35 + (hot[i + 2] - 0.62) * 1.6;
        ctx.fillRect(hot[i] - s / 2, hot[i + 1] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;

      /* AP 標記 + 游標處的估計 RSSI（自由空間路徑損耗，純粹好玩） */
      ctx.strokeStyle = 'rgba(238,236,229,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ap.x, ap.y, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '11px "Geist Mono", monospace'; ctx.fillStyle = 'rgba(238,236,229,.6)';
      ctx.fillText('AP · 5 GHz', ap.x + 12, ap.y + 4);
      if (finePointer && mouse.inside) {
        const meters = Math.hypot(mouse.x - ap.x, mouse.y - ap.y) / 40 + 0.5;
        const rssi = Math.round(-20 - (20 * Math.log10(meters) + 20 * Math.log10(5180) - 27.55));
        const label = `${rssi} dBm · ${meters.toFixed(1)} m`;
        const lw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(13,13,12,.85)';
        ctx.fillRect(mouse.x + 12, mouse.y - 29, lw + 12, 22);
        ctx.fillStyle = '#d7ff4a';
        ctx.fillText(label, mouse.x + 18, mouse.y - 14);
        ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(215,255,74,.35)';
        ctx.beginPath(); ctx.moveTo(ap.x, ap.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.setLineDash([]);
      }
      if (!reduceMotion) requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      const should = visible && !document.hidden;
      if (should && !running) { running = true; requestAnimationFrame(frame); }
      running = should;
    });
    io.observe(hero);
    document.addEventListener('visibilitychange', () => {
      const should = visible && !document.hidden;
      if (should && !running) { running = true; requestAnimationFrame(frame); }
      running = should;
    });
    window.addEventListener('resize', () => { resize(); if (reduceMotion) requestAnimationFrame(frame); });
    if (reduceMotion) hero.addEventListener('pointermove', () => requestAnimationFrame(frame));
    resize();
    requestAnimationFrame(frame);
  }

  /* =====================================================================
     游標、磁吸、預覽
     ===================================================================== */
  const cursor = { x: -100, y: -100, rx: -100, ry: -100, px: -100, py: -100 };
  function setCursorLabel(target) {
    const c = $('#cursor');
    const kind = target && target.dataset.cursor;
    const labels = { open: t(UI.open), close: t(UI.close), mail: LANG === 'zh' ? '寫信' : 'Write' };
    c.classList.toggle('is-label', !!kind);
    c.classList.toggle('is-link', !kind && !!target);
    $('.cursor-ring em', c).textContent = kind ? labels[kind] || '' : '';
  }

  function initCursor() {
    if (!finePointer) return;
    document.documentElement.classList.add('has-cursor');
    const c = $('#cursor'), dot = $('.cursor-dot', c), ring = $('.cursor-ring', c);
    const prev = $('#workPreview');
    let hoverArt = null;

    window.addEventListener('pointermove', (e) => { cursor.x = e.clientX; cursor.y = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => c.classList.remove('is-hidden'));
    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      setCursorLabel(target);
      c.classList.toggle('on-light', !!e.target.closest('.contact'));
      const item = e.target.closest('.work-item');
      const art = item && !item.classList.contains('open') && e.target.closest('.work-row') ? item.dataset.art : null;
      if (art !== hoverArt) {
        hoverArt = art;
        prev.classList.toggle('on', !!art);
        $$('svg', prev).forEach((s) => {
          const on = s.dataset.art === art;
          if (on && !s.classList.contains('on')) restartDraw(s);
          s.classList.toggle('on', on);
        });
      }
    });

    const loop = () => {
      cursor.rx = lerp(cursor.rx, cursor.x, 0.18); cursor.ry = lerp(cursor.ry, cursor.y, 0.18);
      cursor.px = lerp(cursor.px, cursor.x, 0.1); cursor.py = lerp(cursor.py, cursor.y, 0.1);
      dot.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
      ring.style.transform = `translate3d(${cursor.rx}px, ${cursor.ry}px, 0)`;
      const tilt = clamp((cursor.x - cursor.px) * 0.15, -8, 8);
      prev.style.transform = `translate3d(${cursor.px + 40}px, ${cursor.py}px, 0) translate(0, -50%) rotate(${tilt}deg)`;
      requestAnimationFrame(loop);
    };
    loop();

    /* 磁吸按鈕 */
    document.addEventListener('pointermove', (e) => {
      const b = e.target.closest('.btn, .lang');
      $$('.btn.mag, .lang.mag').forEach((n) => { if (n !== b) { n.style.transform = ''; n.classList.remove('mag'); } });
      if (!b || reduceMotion) return;
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.22, dy = (e.clientY - r.top - r.height / 2) * 0.32;
      b.style.transform = `translate(${dx}px, ${dy}px)`;
      b.classList.add('mag');
    }, { passive: true });
  }

  /* =====================================================================
     捲動：進場、Statement、Path、頁首、目前段落
     ===================================================================== */
  let revealIO;
  function observeReveals() {
    revealIO = revealIO || new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(countUp);
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    $$('.reveal:not(.in), .line-reveal:not(.in)').forEach((n) => {
      if (reduceMotion) { n.classList.add('in'); $$('[data-count]', n).forEach(countUp); } else revealIO.observe(n);
    });
  }

  let lastY = 0, ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;

      /* 頁首：往下捲藏起來，往上捲出現 */
      $('#masthead').classList.toggle('is-hidden', y > vh * 0.6 && y > lastY + 2);
      if (y < lastY - 2 || y < vh * 0.6) $('#masthead').classList.remove('is-hidden');
      lastY = y;

      /* Hero：名字往上漂、慢慢淡出 */
      if (!reduceMotion && y < vh * 1.2) {
        const hi = $('.hero-inner');
        hi.style.transform = `translate3d(0, ${y * 0.32}px, 0)`;
        hi.style.opacity = String(clamp(1 - y / (vh * 0.9), 0, 1));
      }

      /* Statement 逐字點亮 */
      const st = $('#statementText');
      const r = st.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
      const words = st.children;
      const n = Math.round(p * words.length);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', reduceMotion || i < n);

      updatePath();

      /* 目前段落 */
      let cur = '';
      ['work', 'path', 'about', 'contact'].forEach((id) => {
        const s = document.getElementById(id);
        if (s && s.getBoundingClientRect().top < vh * 0.4) cur = id;
      });
      $$('#menu a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.sec === cur)));
    });
  }

  /* =====================================================================
     開場
     ===================================================================== */
  function boot() {
    const loader = $('#loader');
    const seen = session && store.get('booted', session);
    const finish = () => {
      loader.classList.add('is-done');
      document.documentElement.classList.add('is-ready');
      if (session) store.set('booted', '1', session);
    };
    if (seen || reduceMotion) { loader.style.transition = 'none'; finish(); return; }
    const num = $('#loaderNum'), bar = $('#loaderBar');
    const t0 = performance.now(), dur = 1500;
    const step = (now) => {
      const k = clamp((now - t0) / dur, 0, 1);
      const e = 1 - (1 - k) ** 3;
      num.textContent = Math.round(-90 + e * 60);
      bar.style.transform = `scaleX(${e})`;
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(finish, 180);
    };
    requestAnimationFrame(step);
  }

  /* =====================================================================
     結構化資料（JSON-LD）
     ===================================================================== */
  function injectJsonLd() {
    const P = SITE.profile;
    const data = {
      '@context': 'https://schema.org', '@type': 'Person',
      name: P.name, alternateName: [P.nameZh, P.legalName],
      jobTitle: P.jobTitle.en, url: SITE.siteUrl + '/', email: `mailto:${SITE.email}`,
      alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'Yuan Ze University' }],
      affiliation: { '@type': 'CollegeOrUniversity', name: 'University of Illinois Urbana-Champaign' },
      sameAs: SITE.socials.map((s) => s.url),
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* =====================================================================
     啟動
     ===================================================================== */
  render();
  injectJsonLd();
  initField();
  initCursor();
  boot();
  setInterval(tickClock, 1000);

  $('#langToggle').addEventListener('click', () => setLang(LANG === 'zh' ? 'en' : 'zh'));
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'l' || e.key === 'L') setLang(LANG === 'zh' ? 'en' : 'zh');
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { drawPathChart(); onScroll(); }, 120); });
  /* 字體載入後量測會變，重畫一次圖 */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPathChart);
})();
