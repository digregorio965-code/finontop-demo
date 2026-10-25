const KEY = 'app:v1';
const State = (() => {
  const def = { lang: 'it', cur: 'EUR', profile: 'casa', country: 'IT', theme: 'light', expenses: [], deadlines: [], assets: [], notified: {} };
  let s;
  try { s = Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { s = Object.assign({}, def); }
  const PK = ['expenses', 'deadlines', 'assets', 'veh', 'vcost', 'port', 'notes'], PS = ['casa', 'attivita', 'inv'];
  const live = k => Array.isArray(s[k]) ? s[k] : [];
  const flush = () => {
    if (!s.bag) { s.bag = {}; PS.forEach(p => { s.bag[p] = {}; PK.forEach(k => s.bag[p][k] = p === s.profile ? live(k) : []); }); return; }
    if (s.all) { PS.forEach(p => PK.forEach(k => s.bag[p][k] = [])); PK.forEach(k => live(k).forEach(x => { const p = PS.includes(x._p) ? x._p : s.profile; s.bag[p][k].push(x); })); }
    else PK.forEach(k => s.bag[s.profile][k] = live(k));
  };
  const load = () => {
    PK.forEach(k => { s[k] = s.all ? [].concat(...PS.map(p => (s.bag[p][k] || []).map(x => { x._p = p; return x; }))) : (s.bag[s.profile][k] || []); });
  };
  const save = () => { try { flush(); localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { alert('Storage error'); } };
  if (!PS.includes(s.profile)) s.profile = 'casa';
  flush(); load();
  return { get: () => s, save, prof: { flush, load, set: p => { flush(); s.profile = p; load(); save(); }, all: v => { flush(); s.all = v; load(); save(); } } };
})();

// Strumenti mostrati per profilo. Solo visualizzazione: i piani (plans.js) e i dati non cambiano.
const PROFILE_TOOLS = {
  casa: ['home', 'spese', 'scadenze', 'patrimonio', 'appunti', 'report', 'prestiti', 'risparmio', 'veicoli'],
  attivita: ['home', 'spese', 'scadenze', 'patrimonio', 'appunti', 'report', 'prestiti', 'veicoli', 'flotta', 'cassa', 'fido', 'pareggio'],
  inv: ['home', 'spese', 'scadenze', 'patrimonio', 'appunti', 'report', 'risparmio', 'invest', 'futures', 'portafoglio']
};
const toolShown = id => { const s = State.get(); return !!(s.all || s.navAll || (PROFILE_TOOLS[s.profile] || PROFILE_TOOLS.casa).includes(id)); };
Object.assign(I18N.it, { nav_all: 'Mostra tutti gli strumenti', nav_less: 'Mostra solo quelli del profilo', start_t: 'Inizia da qui', start_d: 'Detta o scrivi la tua prima spesa: l’app la mette al posto giusto.', start_b: 'Apri Appunti e voce' });
Object.assign(I18N.en, { nav_all: 'Show all tools', nav_less: 'Show only this profile’s tools', start_t: 'Start here', start_d: 'Dictate or type your first expense: the app files it in the right place.', start_b: 'Open Notes & voice' });

const t = (k, vars) => {
  let v = (I18N[State.get().lang] || I18N.it)[k] || I18N.it[k] || k;
  if (vars) Object.keys(vars).forEach(x => v = v.replace('{' + x + '}', vars[x]));
  return v;
};
const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = v => new Intl.NumberFormat(State.get().lang, { style: 'currency', currency: State.get().cur, maximumFractionDigits: 2 }).format(isFinite(v) ? v : 0);
const num = (v, d = 2) => new Intl.NumberFormat(State.get().lang, { maximumFractionDigits: d }).format(isFinite(v) ? v : 0);
const $ = id => document.getElementById(id);
const todayISO = () => Core.iso(new Date());
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Campo numerico + cursore sincronizzati.
function slider(id, label, val, min, max, step) {
  return `<label for="${id}">${label}</label><div class="row"><input type="number" id="${id}" value="${val}" min="${min}" step="${step}"><input type="range" id="${id}R" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${esc(label)}"></div>`;
}
function splitCard(card) {
  if (!card || card.classList.contains('split')) return;
  const inn = document.createElement('div'), out = document.createElement('div'), aft = document.createElement('div');
  inn.className = 'in'; out.className = 'out'; aft.className = 'after';
  [...card.children].forEach(ch => (ch.matches('.answer,.res,canvas,.legend,b') ? out : ch.matches('table,.noprint,p.sub') ? aft : inn).appendChild(ch));
  card.classList.add('split');
  const grid = document.createElement('div'); grid.className = 'grid2'; grid.append(inn, out);
  card.append(grid, aft);
}
function bind(ids, render) {
  splitCard($(ids[0]).closest('.card'));
  ids.forEach(id => {
    const n = $(id), r = $(id + 'R');
    n.addEventListener('input', () => { r.value = n.value; render(); });
    r.addEventListener('input', () => { n.value = r.value; render(); });
  });
  render();
}
const val = id => { const v = parseFloat($(id).value); return isFinite(v) ? v : 0; };

const COLORS = ['#0ea5e9', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#ec4899', '#64748b', '#84cc16', '#f97316'];

function setup(canvas, h) {
  if (innerWidth < 900 && canvas.closest('.out')) h = Math.min(h, 170); else if (canvas.closest('.out')) h = Math.min(h, 250);
  const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth || 600;
  canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.height = h + 'px';
  const c = canvas.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, h);
  return { c, w, h };
}

function lineChart(canvas, series, colors, labels) {
  const { c, w, h } = setup(canvas, 280), L = 70, B = 28, T = 10, R = 12;
  const all = series.flat(), max = Math.max(...all, 1), min = Math.min(...all, 0), n = series[0].length;
  const X = i => L + i * (w - L - R) / Math.max(n - 1, 1), Y = v => T + (1 - (v - min) / (max - min || 1)) * (h - T - B);
  c.font = '12px system-ui'; c.fillStyle = '#64748b'; c.strokeStyle = '#e2e8f0'; c.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const v = min + (max - min) * g / 4, y = Y(v);
    c.beginPath(); c.moveTo(L, y); c.lineTo(w - R, y); c.stroke();
    c.textAlign = 'right'; c.fillText(new Intl.NumberFormat(State.get().lang, { notation: 'compact', maximumFractionDigits: 1 }).format(v), L - 6, y + 4);
  }
  c.textAlign = 'center';
  const stepL = Math.ceil(n / 8);
  for (let i = 0; i < n; i += stepL) c.fillText(labels ? labels[i] : i, X(i), h - 8);
  series.forEach((s, k) => {
    c.beginPath(); c.lineWidth = 3; c.strokeStyle = colors[k]; c.lineJoin = 'round';
    s.forEach((v, i) => i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v))); c.stroke();
  });
}

function barChart(canvas, values, labels, colorFn) {
  const { c, w, h } = setup(canvas, 260), L = 70, B = 28, T = 10, R = 8;
  const max = Math.max(...values.map(Math.abs), 1), zeroY = values.some(v => v < 0) ? T + (h - T - B) / 2 : h - B;
  const scale = (zeroY - T) / max, bw = (w - L - R) / values.length;
  c.font = '12px system-ui'; c.fillStyle = '#64748b'; c.strokeStyle = '#cbd5e1';
  c.beginPath(); c.moveTo(L, zeroY); c.lineTo(w - R, zeroY); c.stroke();
  values.forEach((v, i) => {
    c.fillStyle = colorFn ? colorFn(v) : '#0ea5e9';
    const x = L + i * bw + bw * 0.15, bh = Math.abs(v) * scale;
    c.fillRect(x, v >= 0 ? zeroY - bh : zeroY, bw * 0.7, bh);
    c.fillStyle = '#64748b'; c.textAlign = 'center'; c.fillText(labels[i], x + bw * 0.35, h - 8);
  });
  c.textAlign = 'right'; c.fillStyle = '#64748b';
  c.fillText(new Intl.NumberFormat(State.get().lang, { notation: 'compact' }).format(max), L - 6, T + 8);
  if (values.some(v => v < 0)) c.fillText(new Intl.NumberFormat(State.get().lang, { notation: 'compact' }).format(-max), L - 6, h - B);
}

function pieChart(canvas, items, legendEl) {
  const { c, w, h } = setup(canvas, 260), tot = items.reduce((s, x) => s + x.value, 0);
  if (!tot) { c.fillStyle = '#64748b'; c.textAlign = 'center'; c.fillText(t('empty'), w / 2, h / 2); legendEl.innerHTML = ''; return; }
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10; let a = -Math.PI / 2;
  items.forEach((x, i) => {
    const sw = x.value / tot * Math.PI * 2;
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a, a + sw); c.closePath(); c.fillStyle = COLORS[i % COLORS.length]; c.fill();
    c.strokeStyle = cssv('--card'); c.lineWidth = 2; c.stroke(); a += sw;
  });
  c.beginPath(); c.arc(cx, cy, r * 0.5, 0, 7); c.fillStyle = '#fff'; c.fill();
  c.fillStyle = '#0f172a'; c.textAlign = 'center'; c.font = 'bold 16px system-ui'; c.fillText(fmt(tot), cx, cy + 5);
  legendEl.innerHTML = items.map((x, i) => `<span><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(x.label)} ${num(x.value / tot * 100, 0)}% · ${fmt(x.value)}</span>`).join('');
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.append(a); a.click(); a.remove();
}
const csvCell = v => /^[=+\-@]/.test(String(v)) ? "'" + v : v;
const toCSV = rows => '\ufeff' + rows.map(r => r.map(v => '"' + String(csvCell(v)).replace(/"/g, '""') + '"').join(';')).join('\r\n');

const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || ({ '--card': '#ffffff', '--bg': '#f4f7fb', '--ink': '#0f172a', '--mut': '#64748b', '--line': '#e2e8f0', '--brand': '#0ea5e9', '--navy': '#0b1f3a' }[n] || '#888888');



// Grafico stile broker: area verde/rossa, linea dello zero, prezzo attuale, breakeven e tooltip al passaggio del mouse.
function payoffChart(canvas, xs, ys, opt) {
  const draw = hx => {
    const { c, w, h } = setup(canvas, 340), L = 62, B = 30, T = 14, R = 14;
    const min = Math.min(...ys, 0), max = Math.max(...ys, 0), pad = (max - min) * 0.08 || 1, lo = min - pad, hi = max + pad;
    const X = i => L + i * (w - L - R) / (xs.length - 1), Y = v => T + (hi - v) / (hi - lo) * (h - T - B), z = Y(0);
    const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, cssv('--card')); bg.addColorStop(1, cssv('--bg'));
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.font = '12px system-ui'; c.strokeStyle = cssv('--line'); c.fillStyle = cssv('--mut'); c.lineWidth = 1; c.setLineDash([2, 4]);
    for (let g = 0; g <= 5; g++) { const v = lo + (hi - lo) * g / 5, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(w - R, y); c.stroke(); c.textAlign = 'right'; c.fillText(num(v, Math.abs(hi - lo) < 20 ? 1 : 0), L - 6, y + 4); }
    c.setLineDash([]); c.textAlign = 'center';
    const st = Math.ceil(xs.length / 8); for (let i = 0; i < xs.length; i += st) c.fillText(opt.xLabel ? opt.xLabel(xs[i]) : xs[i], X(i), h - 9);
    [['#22c55e', v => v >= 0], ['#ef4444', v => v < 0]].forEach(([col, ok]) => {
      c.save(); c.beginPath(); c.rect(L, ok(1) ? T : z, w - L - R, ok(1) ? z - T : h - B - z); c.clip();
      const gr = c.createLinearGradient(0, T, 0, h - B); gr.addColorStop(0, col + (ok(1) ? '66' : '00')); gr.addColorStop(1, col + (ok(1) ? '00' : '66'));
      c.beginPath(); c.moveTo(X(0), z); ys.forEach((v, i) => c.lineTo(X(i), Y(v))); c.lineTo(X(xs.length - 1), z); c.closePath(); c.fillStyle = gr; c.fill();
      c.beginPath(); ys.forEach((v, i) => i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v))); c.strokeStyle = col; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke(); c.restore();
    });
    c.strokeStyle = cssv('--mut'); c.lineWidth = 1; c.beginPath(); c.moveTo(L, z); c.lineTo(w - R, z); c.stroke();
    if (opt.mark != null) {
      const mi = xs.reduce((b, x, i) => Math.abs(x - opt.mark) < Math.abs(xs[b] - opt.mark) ? i : b, 0);
      c.strokeStyle = cssv('--brand'); c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X(mi), T); c.lineTo(X(mi), h - B); c.stroke(); c.setLineDash([]);
      c.fillStyle = cssv('--brand'); c.textAlign = 'left'; c.fillText(opt.markLabel || '', Math.min(X(mi) + 5, w - 80), T + 12);
    }
    for (let i = 1; i < ys.length; i++) if (ys[i - 1] < 0 !== ys[i] < 0) {
      const x = xs[i - 1] + (xs[i] - xs[i - 1]) * (0 - ys[i - 1]) / (ys[i] - ys[i - 1]), px = L + ((i - 1) + (0 - ys[i - 1]) / (ys[i] - ys[i - 1])) * (w - L - R) / (xs.length - 1);
      c.fillStyle = '#f59e0b'; c.beginPath(); c.arc(px, z, 5, 0, 7); c.fill(); c.textAlign = 'center'; c.fillText('BE ' + num(x, 1), px, z - 10);
    }
    if (hx != null) {
      const i = Math.max(0, Math.min(xs.length - 1, Math.round((hx - L) / ((w - L - R) / (xs.length - 1)))));
      c.strokeStyle = cssv('--ink'); c.globalAlpha = .4; c.beginPath(); c.moveTo(X(i), T); c.lineTo(X(i), h - B); c.stroke(); c.globalAlpha = 1;
      c.fillStyle = ys[i] >= 0 ? '#22c55e' : '#ef4444'; c.beginPath(); c.arc(X(i), Y(ys[i]), 5, 0, 7); c.fill();
      const txt = (opt.xLabel ? opt.xLabel(xs[i]) : num(xs[i], 1)) + '  →  ' + fmt(ys[i]), tw = c.measureText(txt).width + 16, tx = Math.min(Math.max(X(i) - tw / 2, L), w - R - tw);
      c.fillStyle = cssv('--navy'); c.fillRect(tx, T + 20, tw, 24); c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(txt, tx + 8, T + 36);
    }
  };
  canvas.onmousemove = e => draw(e.clientX - canvas.getBoundingClientRect().left);
  canvas.onmouseleave = () => draw();
  draw();
}

