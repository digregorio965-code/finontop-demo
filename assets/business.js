// Strumenti Business: previsione di cassa, fido e carte, punto di pareggio.
const monthLabel = (iso, long) => new Intl.DateTimeFormat(State.get().lang, long ? { month: 'long', year: 'numeric' } : { month: 'short' }).format(new Date(iso + '-01T00:00:00'));
const bizFoot = () => `<p class="sub">${t('biz_disc')}</p><p class="noprint"><button onclick="print()">${t('print')}</button></p>`;

Modules.cassa = {
  icon: '📈', render(root) {
    const s = State.get();
    const start0 = Math.round(s.assets.filter(a => a.kind !== 'debt').reduce((a, x) => a + x.val, 0));
    root.innerHTML = head('cassa', 'd_cassa') + bizHelp('cassa') + `<div class="card">` +
      slider('S', t('cs_start'), start0, -20000, Math.max(50000, Math.ceil(start0 * 2 / 10000) * 10000), 100) + slider('M', t('cs_months'), 6, 3, 24, 1) +
      slider('I', t('cs_in'), 0, 0, 20000, 50) + slider('O', t('cs_out'), 0, 0, 20000, 50) +
      `<div class="answer" id="ans"></div><div class="res" id="res"></div><canvas id="ch"></canvas><div id="tb"></div><p class="sub">${t('cs_hint')}</p>${bizFoot()}</div>`;
    bind(['S', 'M', 'I', 'O'], () => {
      const M = Math.max(1, Math.round(val('M'))), today = todayISO(), cy = +today.slice(0, 4), cm = +today.slice(5, 7);
      const keys = [], inc = [], exp = [];
      for (let i = 0; i < M; i++) { keys.push(Core.iso(new Date(cy, cm - 1 + i, 1)).slice(0, 7)); inc.push(val('I')); exp.push(val('O')); }
      s.deadlines.filter(x => x.kind && x.amt > 0).forEach(x => {
        const step = x.rep === 'year' ? 12 : 1, base = x.date0 || x.date;
        for (let k = x.n || 0, g = 0; g < 400; k++, g++) {
          const d = x.rep === 'none' ? x.date : addMonthsISO(base, k * step);
          const idx = Math.max(0, (+d.slice(0, 4) - cy) * 12 + (+d.slice(5, 7) - cm));
          if (idx >= M) break;
          (x.kind === 'in' ? inc : exp)[idx] += x.amt;
          if (x.rep === 'none') break;
        }
      });
      let bal = val('S'); const bals = inc.map((v, i) => (bal += v - exp[i]));
      const low = Math.min(...bals), neg = bals.findIndex(v => v < 0);
      $('ans').textContent = neg >= 0 ? t('cs_neg', { m: monthLabel(keys[neg], true) }) : t('cs_ok');
      $('res').innerHTML = `<div>${t('cs_inc')}<b class="ok">${fmt(inc.reduce((a, b) => a + b, 0))}</b></div><div>${t('cs_exp')}<b class="bad">${fmt(exp.reduce((a, b) => a + b, 0))}</b></div><div>${t('cs_min')}<b class="${low < 0 ? 'bad' : 'ok'}">${fmt(low)}</b></div>`;
      barChart($('ch'), bals, keys.map(k => monthLabel(k)), v => v < 0 ? '#ef4444' : '#16a34a');
      $('tb').innerHTML = `<table><tr><th></th><th>${t('cs_inc')}</th><th>${t('cs_exp')}</th><th>${t('cs_bal')}</th></tr>${keys.map((k, i) => `<tr><td>${monthLabel(k, true)}</td><td>${fmt(inc[i])}</td><td>${fmt(exp[i])}</td><td class="${bals[i] < 0 ? 'bad' : 'ok'}">${fmt(bals[i])}</td></tr>`).join('')}</table>`;
    });
  }
};

Modules.fido = {
  icon: '💳', render(root, tab = 'fido') {
    root.innerHTML = head('fido', 'd_fido') + bizHelp('fido') + tabs([['fido', 'fd_t1'], ['card', 'fd_t2']], tab) + `<div class="card" id="box"></div>`;
    root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => Modules.fido.render(root, b.dataset.tab));
    const box = $('box');
    if (tab === 'fido') {
      box.innerHTML = slider('U', t('fd_used'), 5000, 0, 100000, 100) + slider('G', t('fd_gr'), 10000, 0, 100000, 500) + slider('T', t('fd_tan'), 12, 0, 25, 0.1) + slider('D', t('fd_days'), 90, 1, 365, 1) + slider('C', t('fd_cdf'), 0.5, 0, 2, 0.01) + slider('F', t('fd_fix'), 0, 0, 200, 1) +
        `<div class="res" id="res"></div><div class="answer" id="lg"></div>${bizFoot()}`;
      bind(['U', 'G', 'T', 'D', 'C', 'F'], () => {
        const i = val('U') * val('T') / 100 * val('D') / 365, c = val('G') * val('C') / 100 * (val('D') / 90), f = val('F'), tot = i + c + f;
        const eff = val('U') > 0 ? tot / val('U') * 365 / val('D') * 100 : 0;
        $('res').innerHTML = `<div>${t('fd_int')}<b>${fmt(i)}</b></div><div>${t('fd_cdfv')}<b>${fmt(c)}</b></div><div>${t('fd_tot')}<b class="bad">${fmt(tot)}</b></div><div>${t('fd_eff')}<b>${num(eff, 2)}%</b></div>`; $('lg').innerHTML = `<span>${t('xs_extra', { a: fmt(tot), p: num(val('U') > 0 ? tot / val('U') * 100 : 0, 2) })}</span>`;
        
      });
    } else {
      box.innerHTML = slider('A', t('cr_amt'), 2000, 100, 50000, 50) + slider('T', t('fd_tan'), 18, 0, 30, 0.1) + slider('R', t('cr_rate'), 100, 10, 5000, 5) +
        `<div class="answer" id="ans"></div><div class="res" id="res"></div><canvas id="ch"></canvas>${bizFoot()}`;
      bind(['A', 'T', 'R'], () => {
        const r = val('T') / 1200, A = val('A'), R = val('R'), pts = [A];
        if (R <= A * r) { $('ans').textContent = t('cr_never'); $('res').innerHTML = ''; $('ch').style.display = 'none'; return; }
        let bal = A, paid = 0, k = 0;
        while (bal > 0.005 && k < 1200) { const i = bal * r, p = Math.min(R, bal + i); bal = bal + i - p; paid += p; k++; pts.push(Math.max(bal, 0)); }
        $('ch').style.display = ''; $('ans').textContent = '';
        $('res').innerHTML = `<div>${t('cr_mo')}<b>${k}</b></div><div>${t('cr_int')}<b class="bad">${fmt(paid - A)}</b></div><div>${t('cr_tot')}<b>${fmt(paid)}</b></div>`;
        $('ans').textContent = t('xs_extra', { a: fmt(paid - A), p: num((paid - A) / A * 100, 1) });
        $('ch').style.display = 'none';
      });
    }
  }
};

Modules.pareggio = {
  icon: '⚖️', render(root, tab = 'simple') {
    root.innerHTML = head('pareggio', 'd_pareggio') + bizHelp('pareggio') + tabs([['simple', 'mx_t1'], ['multi', 'mx_t2'], ['unit', 'mx_t3']], tab) + `<div class="card" id="box"></div>`;
    root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => Modules.pareggio.render(root, b.dataset.tab));
    const box = $('box'), s = State.get();
    if (tab === 'simple') {
      box.innerHTML = slider('F', t('be_fix'), 3000, 0, 50000, 50) + slider('R', t('mx_rev'), 8000, 0, 200000, 100) + slider('V', t('mx_var'), 40, 0, 95, 1) +
        `<div class="answer" id="ans"></div><div class="res" id="res"></div>${bizFoot()}`;
      bind(['F', 'R', 'V'], () => {
        const F = val('F'), R = val('R'), m = 1 - val('V') / 100, be = F / m, gap = R - be;
        $('ans').textContent = gap >= 0 ? t('mx_ok', { b: fmt(be), g: fmt(gap), p: num(R > 0 ? gap / R * 100 : 0, 0) }) : t('mx_ko', { b: fmt(be), g: fmt(-gap) });
        $('res').innerHTML = `<div>${t('be_rev')}<b>${fmt(be)}</b></div><div>${t('mx_profit')}<b class="${R * m - F < 0 ? 'bad' : 'ok'}">${fmt(R * m - F)}</b></div>`;
      });
    } else if (tab === 'multi') {
      s.pg = Array.isArray(s.pg) ? s.pg : [];
      box.innerHTML = `<b>${t('mx_add')}</b><label>${t('mx_name')}</label><input type="text" id="pn" maxlength="40"><div class="cols"><div><label>${t('be_price')}</label><input type="number" id="pp" min="0" step="0.01"></div><div><label>${t('be_var')}</label><input type="number" id="pc" min="0" step="0.01"></div><div><label>${t('mx_units')}</label><input type="number" id="pu" min="0" step="1"></div></div><p class="noprint"><button id="pa">${t('mx_addb')}</button></p><div id="pl"></div>` +
        slider('F', t('be_fix'), 3000, 0, 50000, 50) + `<div class="answer" id="ans"></div><div class="res" id="res"></div>${bizFoot()}`;
      const draw = () => {
        const L = s.pg, rev = L.reduce((a, x) => a + x.p * x.u, 0), con = L.reduce((a, x) => a + (x.p - x.c) * x.u, 0), F = val('F');
        $('pl').innerHTML = L.length ? `<table><tr><th></th><th>${t('be_unit')}</th><th>${t('mx_units')}</th><th class="noprint"></th></tr>${L.map(x => `<tr><td>${esc(x.n)}</td><td>${fmt(x.p - x.c)} (${num(x.p > 0 ? (x.p - x.c) / x.p * 100 : 0, 0)}%)</td><td>${num(x.u, 0)}</td><td class="noprint"><button data-d="${x.id}">✕</button></td></tr>`).join('')}</table>` : '';
        $('pl').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { s.pg = s.pg.filter(x => x.id !== b.dataset.d); State.save(); draw(); });
        if (rev <= 0 || con <= 0) { $('ans').textContent = t('mx_need'); $('res').innerHTML = ''; return; }
        const m = con / rev, be = F / m, f = be / rev;
        $('ans').textContent = t('mx_multi', { b: fmt(be), p: num(f * 100, 0) });
        $('res').innerHTML = `<div>${t('mx_cur')}<b>${fmt(rev)}</b></div><div>${t('be_rev')}<b>${fmt(be)}</b></div><div>${t('mx_profit')}<b class="${con - F < 0 ? 'bad' : 'ok'}">${fmt(con - F)}</b></div>`;
      };
      $('pa').onclick = () => { const n = $('pn').value.trim(), p = parseFloat($('pp').value), c = parseFloat($('pc').value) || 0, u = parseFloat($('pu').value); if (!n || !(p > 0) || !(u > 0)) return; s.pg.push({ id: uid(), n, p, c, u }); State.save(); ['pn', 'pp', 'pc', 'pu'].forEach(k => $(k).value = ''); draw(); };
      bind(['F'], draw);
    } else {
      box.innerHTML = slider('F', t('be_fix'), 3000, 0, 50000, 50) + slider('P', t('be_price'), 50, 1, 5000, 0.5) + slider('V', t('be_var'), 20, 0, 5000, 0.5) +
        `<div class="answer" id="ans"></div><div class="res" id="res"></div>${bizFoot()}`;
      bind(['F', 'P', 'V'], () => {
        const F = val('F'), P = val('P'), V = val('V'), m = P - V;
        if (m <= 0) { $('ans').textContent = t('be_bad'); $('res').innerHTML = ''; return; }
        const u = Math.ceil(F / m);
        $('res').innerHTML = `<div>${t('be_unit')}<b>${fmt(m)}</b></div><div>${t('be_units')}<b>${num(u, 0)}</b></div><div>${t('be_rev')}<b>${fmt(u * P)}</b></div>`;
        $('ans').textContent = t('xs_be', { u: num(u, 0), r: fmt(u * P) });
      });
    }
  }
};
Modules.flotta = {
  icon: '🚐', render(root) {
    const s = State.get(), FD = ['ins', 'tax', 'rev', 'svc'], today = todayISO();
    const st = d => { if (!d) return ''; const n = Math.round((new Date(d + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5); return n < 0 ? '🔴' : n <= 30 ? '🟠' : '🟢'; };
    const draw = () => {
      s.veh = Veh.list();
      const late = s.veh.reduce((a, v) => a + FD.filter(k => st(v[k]) === '🔴').length, 0), soon = s.veh.reduce((a, v) => a + FD.filter(k => st(v[k]) === '🟠').length, 0);
      root.innerHTML = head('flotta', 'd_flotta') + bizHelp('flotta') + `<div class="card"><div class="cols"><div><label>${t('vk')}</label><select class="f" id="fk">${Object.keys(VKIND).map(k => `<option value="${k}">${VKIND[k]} ${t('vk_' + k)}</option>`).join('')}</select></div><div><label>${t('v_name')}</label><input type="text" id="fn" maxlength="50"></div><div><label>${t('v_plate')}</label><input type="text" id="fp" maxlength="12"></div></div><p class="noprint"><button id="fadd">${t('fl_add')}</button></p></div>
      <div class="card"><div class="answer">🔴 ${late} ${t('fl_late')} · 🟠 ${soon} ${t('fl_soon')}</div>${s.veh.length ? `<div style="overflow-x:auto"><table><tr><th>${t('fl_vehicle')}</th>${FD.map(k => `<th>${t('fl_' + k)}</th>`).join('')}<th class="noprint"></th></tr>${s.veh.map(v => `<tr><td>${VKIND[v.kind] || '🚗'} ${esc(v.name)}${v.plate ? '<br><small>' + esc(v.plate) + '</small>' : ''}</td>${FD.map(k => `<td>${st(v[k])}<br><input type="date" class="fd" data-v="${v.id}" data-k="${k}" value="${esc(v[k] || '')}"></td>`).join('')}<td class="noprint"><button data-del="${v.id}">✕</button></td></tr>`).join('')}</table></div>` : `<p>${t('fl_empty')}</p>`}${bizFoot()}</div>`;
      root.querySelectorAll('.fd').forEach(i => i.onchange = () => { const v = s.veh.find(x => x.id === i.dataset.v); if (v) { v[i.dataset.k] = i.value; State.save(); draw(); } });
      root.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { s.veh = s.veh.filter(v => v.id !== b.dataset.del); s.vcost = Veh.costs().filter(c => c.vid !== b.dataset.del); State.save(); draw(); });
      $('fadd').onclick = () => { const name = $('fn').value.trim(); if (!name) return; s.veh.push({ id: uid(), kind: $('fk').value, name, plate: $('fp').value.trim(), type: 'own', start: todayISO(), months: 0, fee: 0, down: 0, redeem: 0 }); State.save(); draw(); };
    };
    draw();
  }
};