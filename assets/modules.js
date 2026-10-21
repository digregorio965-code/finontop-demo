const CATS = {
  casa: ['c_casa', 'c_utenze', 'c_spesa', 'c_auto', 'c_salute', 'c_svago', 'c_altro'],
  attivita: ['c_casa', 'c_utenze', 'c_forniture', 'c_personale', 'c_tasse', 'c_marketing', 'c_altro'],
  inv: ['c_comm', 'c_tasse', 'c_utenze', 'c_altro']
};
const head = (k, d) => `<h1>${t(k)}</h1><p class="sub">${t(d)}</p>`;
const tabs = (items, cur) => `<div class="tabs noprint">${items.map(([id, k]) => `<button data-tab="${id}" class="${id === cur ? 'on' : ''}">${t(k)}</button>`).join('')}</div>`;
const monthOf = d => d.slice(0, 7);

function daysUntil(x) {
  const today = todayISO(), nx = Core.nextOccurrence(x.date, x.rep, today);
  return { date: nx, days: Math.round((nx - new Date(today + 'T00:00:00')) / 86400000) };
}
const dueLabel = n => n < 0 ? `<span class="due">${n} ${t('days_left')}</span>` : n === 0 ? `<span class="due">${t('today')}</span>` : n <= 7 ? `<span class="soon">${n} ${t('days_left')}</span>` : `${n} ${t('days_left')}`;

const Modules = {
  home: {
    icon: '🏠', render(root) {
      const s = State.get(), m = todayISO().slice(0, 7);
      const spent = s.expenses.filter(e => monthOf(e.date) === m).reduce((a, e) => a + e.amt, 0);
      const nw = s.assets.reduce((a, x) => a + (x.kind === 'debt' ? -x.val : x.val), 0);
      const nxt = s.deadlines.map(x => ({ x, ...daysUntil(x) })).sort((a, b) => a.days - b.days).slice(0, 3);
      const tiles = ['spese', 'scadenze', 'prestiti', 'risparmio', 'patrimonio', 'invest'].map(id => `<a class="tile" href="#/${id}"><div class="ic">${Modules[id].icon}</div><h3>${t(id)}</h3><p>${t('d_' + id)}</p></a>`).join('');
      root.innerHTML = `<h1>${t('welcome')} 👋</h1><p class="sub"></p>
      <div class="card"><label>${t('pick_profile')}</label><select class="f" id="prof">${['casa', 'attivita', 'inv'].map(p => `<option value="${p}" ${s.profile === p ? 'selected' : ''}>${t('p_' + (p === 'inv' ? 'inv' : p))}</option>`).join('')}</select></div>
      <div class="res"><div>${t('this_month')} · ${t('spese')}<b>${fmt(spent)}</b></div><div>${t('net_worth')}<b class="${nw < 0 ? 'bad' : 'ok'}">${fmt(nw)}</b></div></div>
      ${nxt.length ? `<div class="card"><b>${t('due_next')}</b><table>${nxt.map(n => `<tr><td>${esc(n.x.title)}</td><td>${Core.iso(n.date)}</td><td>${dueLabel(n.days)}</td></tr>`).join('')}</table></div>` : ''}
      <div class="tiles">${tiles}</div>`;
      $('prof').onchange = e => { s.profile = e.target.value; State.save(); };
    }
  },

  spese: {
    icon: '🧾', render(root) {
      const s = State.get(); let month = todayISO().slice(0, 7);
      root.innerHTML = head('spese', 'd_spese') + `<div class="cols"><div class="card">
        <label>${t('desc')}</label><input type="text" id="xd" maxlength="80">
        <label>${t('amount')}</label><input type="number" id="xa" min="0" step="0.01" style="width:100%">
        <label>${t('category')}</label><select class="f" id="xc">${CATS[s.profile].map(c => `<option value="${c}">${t(c)}</option>`).join('')}</select>
        <label>${t('date')}</label><input type="date" id="xt" value="${todayISO()}"><p><button id="xadd">${t('add')}</button></p></div>
        <div class="card"><b>${t('by_cat')}</b><canvas id="pie"></canvas><div class="legend" id="lg"></div></div></div>
        <div class="card"><label>${t('month')}</label><input type="month" id="xm" value="${month}" style="max-width:200px">
        <div class="res"><div>${t('total')}<b id="xtot"></b></div></div><canvas id="bar"></canvas><div id="xl"></div>
        <p class="noprint"><button class="alt" id="xcsv">${t('csv')}</button> <button class="alt" onclick="print()">${t('print')}</button></p></div>`;
      const draw = () => {
        const rows = s.expenses.filter(e => monthOf(e.date) === month).sort((a, b) => b.date.localeCompare(a.date));
        $('xtot').textContent = fmt(rows.reduce((a, e) => a + e.amt, 0));
        const by = {}; rows.forEach(e => by[e.cat] = (by[e.cat] || 0) + e.amt);
        pieChart($('pie'), Object.keys(by).map(k => ({ label: t(k), value: by[k] })).sort((a, b) => b.value - a.value), $('lg'));
        const ms = [], [y, mo] = month.split('-').map(Number);
        for (let i = 5; i >= 0; i--) ms.push(Core.iso(new Date(y, mo - 1 - i, 1)).slice(0, 7));
        barChart($('bar'), ms.map(k => s.expenses.filter(e => monthOf(e.date) === k).reduce((a, e) => a + e.amt, 0)), ms.map(k => k.slice(2)));
        $('xl').innerHTML = rows.length ? `<table>${rows.map(e => `<tr><td>${esc(e.desc)}</td><td>${t(e.cat)}</td><td>${e.date}</td><td>${fmt(e.amt)}</td><td class="noprint"><button class="del" data-id="${e.id}">${t('del')}</button></td></tr>`).join('')}</table>` : `<p class="sub">${t('empty')}</p>`;
        $('xl').querySelectorAll('.del').forEach(b => b.onclick = () => { s.expenses = s.expenses.filter(e => e.id !== b.dataset.id); State.save(); draw(); });
      };
      $('xadd').onclick = () => {
        const a = parseFloat($('xa').value); if (!(a > 0) || !$('xt').value) return;
        s.expenses.push({ id: uid(), desc: $('xd').value.trim() || t($('xc').value), amt: a, cat: $('xc').value, date: $('xt').value });
        State.save(); $('xd').value = ''; $('xa').value = ''; month = monthOf($('xt').value); $('xm').value = month; draw();
      };
      $('xm').onchange = e => { if (e.target.value) { month = e.target.value; draw(); } };
      $('xcsv').onclick = () => download('spese.csv', toCSV([[t('date'), t('desc'), t('category'), t('amount')]].concat(s.expenses.map(e => [e.date, e.desc, t(e.cat), e.amt]))), 'text/csv');
      draw();
    }
  },

  scadenze: {
    icon: '🔔', render(root) {
      const s = State.get();
      root.innerHTML = head('scadenze', 'd_scadenze') + `<div class="cols"><div class="card">
        <label>${t('title')}</label><input type="text" id="sd" maxlength="80">
        <label>${t('amount')}</label><input type="number" id="sa" min="0" step="0.01" style="width:100%">
        <label>${t('date')}</label><input type="date" id="st" value="${todayISO()}">
        <label>${t('repeat')}</label><select class="f" id="sr"><option value="none">${t('r_none')}</option><option value="month">${t('r_month')}</option><option value="year">${t('r_year')}</option></select>
        <label>${t('alert_before')}</label><input type="number" id="sl" min="0" max="60" value="3" style="width:100%"><p><button id="sadd">${t('add')}</button></p></div>
        <div class="card"><div id="sl2"></div><p class="noprint"><button id="sics" class="alt">${t('ics')}</button> <button id="snot" class="alt">${t('notif_on')}</button></p><p class="sub">${t('notif_note')}</p></div></div>`;
      const draw = () => {
        const list = s.deadlines.map(x => ({ x, ...daysUntil(x) })).sort((a, b) => a.days - b.days);
        $('sl2').innerHTML = list.length ? `<table>${list.map(n => `<tr><td>${esc(n.x.title)}</td><td>${n.x.amt ? fmt(n.x.amt) : ''}</td><td>${Core.iso(n.date)}</td><td>${dueLabel(n.days)}</td><td><button class="del" data-id="${n.x.id}">${t('del')}</button></td></tr>`).join('')}</table>` : `<p class="sub">${t('empty')}</p>`;
        $('sl2').querySelectorAll('.del').forEach(b => b.onclick = () => { s.deadlines = s.deadlines.filter(x => x.id !== b.dataset.id); State.save(); draw(); });
      };
      $('sadd').onclick = () => {
        if (!$('sd').value.trim() || !$('st').value) return;
        s.deadlines.push({ id: uid(), title: $('sd').value.trim(), amt: parseFloat($('sa').value) || 0, date: $('st').value, rep: $('sr').value, alert: Math.max(0, parseInt($('sl').value) || 0) });
        State.save(); $('sd').value = ''; $('sa').value = ''; draw(); checkAlerts();
      };
      $('sics').onclick = () => s.deadlines.length && download('scadenze.ics', Core.ics(s.deadlines, APP_NAME), 'text/calendar');
      $('snot').onclick = async () => { if (!('Notification' in window) || (await Notification.requestPermission()) !== 'granted') alert(t('notif_denied')); else checkAlerts(); };
      draw();
    }
  },

  prestiti: {
    icon: '🏦', render(root) {
      const presets = { l_mutuo: [200000, 20, 3.5, 25], l_auto: [25000, 5000, 6, 5], l_ristr: [40000, 0, 5, 8], l_arredo: [15000, 0, 7, 5], l_altro: [10000, 0, 6, 5] };
      root.innerHTML = head('prestiti', 'd_prestiti') + `<div class="card"><label>${t('loan_type')}</label><select class="f" id="lt">${Object.keys(presets).map(k => `<option value="${k}">${t(k)}</option>`).join('')}</select>
        ${slider('P', t('price'), 200000, 0, 1000000, 500)}${slider('D', t('down'), 40000, 0, 500000, 500)}${slider('T', t('rate_y'), 3.5, 0, 15, 0.05)}${slider('Y', t('years'), 25, 1, 40, 1)}
        <div class="answer" id="ans"></div><div class="res" id="res"></div><canvas id="ch"></canvas><div class="legend"><span><i style="background:#0ea5e9"></i>${t('residual')}</span><span><i style="background:#f59e0b"></i>${t('interest')}</span></div>
        <p class="noprint"><button onclick="print()">${t('print')}</button></p><table id="tb"></table></div>`;
      const set = k => { const [p, dpc, r, y] = presets[k]; $('P').value = $('PR').value = p; $('D').value = $('DR').value = Math.round(p * dpc / 100); $('T').value = $('TR').value = r; $('Y').value = $('YR').value = y; };
      $('lt').onchange = e => { set(e.target.value); draw(); };
      const draw = () => {
        const fin = Math.max(val('P') - val('D'), 0), a = Core.amortization(fin, val('T'), val('Y'));
        $('ans').textContent = t('ans_loan', { p: fmt(a.pay), y: num(val('Y'), 1), i: fmt(a.interest) });
        $('res').innerHTML = `<div>${t('financed')}<b>${fmt(fin)}</b></div><div>${t('monthly')}<b>${fmt(a.pay)}</b></div><div>${t('int_tot')}<b class="bad">${fmt(a.interest)}</b></div><div>${t('repay')}<b>${fmt(a.total)}</b></div>`;
        const yr = a.rows.filter(r => r.k % 12 === 0);
        lineChart($('ch'), [[fin].concat(yr.map(r => r.bal)), [0].concat(yr.map(r => r.cum))], ['#0ea5e9', '#f59e0b'], [0].concat(yr.map(r => r.k / 12)));
        $('tb').innerHTML = `<tr><th>${t('n_rate')}</th><th>${t('capital')}</th><th>${t('interest')}</th><th>${t('residual')}</th></tr>` + [a.rows[0]].concat(yr.filter(r => r.k !== 1)).filter(Boolean).map(r => `<tr><td>${r.k}</td><td>${fmt(r.cap)}</td><td>${fmt(r.int)}</td><td>${fmt(r.bal)}</td></tr>`).join('');
      };
      bind(['P', 'D', 'T', 'Y'], draw);
    }
  },

  risparmio: {
    icon: '🌱', render(root, tab = 'compound') {
      root.innerHTML = head('risparmio', 'd_risparmio') + tabs([['compound', 'compound'], ['deposit', 'deposit']], tab) + `<div class="card" id="box"></div>`;
      root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => Modules.risparmio.render(root, b.dataset.tab));
      const box = $('box');
      if (tab === 'compound') {
        box.innerHTML = slider('P', t('init'), 5000, 0, 200000, 500) + slider('M', t('monthly_add'), 200, 0, 3000, 10) + slider('T', t('yield_y'), 5, 0, 15, 0.1) + slider('Y', t('years'), 20, 1, 50, 1) +
          `<div class="answer" id="ans"></div><div class="res" id="res"></div><canvas id="ch"></canvas><div class="legend"><span><i style="background:#16a34a"></i>${t('final')}</span><span><i style="background:#64748b"></i>${t('paid_in')}</span></div><p class="noprint"><button onclick="print()">${t('print')}</button></p>`;
        bind(['P', 'M', 'T', 'Y'], () => {
          const c = Core.compound(val('P'), val('M'), val('T'), val('Y'));
          $('ans').textContent = t('ans_comp', { y: num(val('Y'), 0), f: fmt(c.final), g: fmt(c.gain) });
          $('res').innerHTML = `<div>${t('final')}<b class="ok">${fmt(c.final)}</b></div><div>${t('paid_in')}<b>${fmt(c.invested)}</b></div><div>${t('gain')}<b class="ok">${fmt(c.gain)}</b></div>`;
          lineChart($('ch'), [c.vals, c.invs], ['#16a34a', '#64748b'], c.vals.map((_, i) => i));
        });
      } else {
        box.innerHTML = slider('P', t('init'), 10000, 0, 500000, 500) + slider('T', t('rate_y'), 3, 0, 8, 0.05) + slider('Y', t('months'), 12, 1, 120, 1) +
          `<div class="answer" id="ans"></div><div class="res" id="res"></div><p class="sub">${t('no_tax')}</p>`;
        bind(['P', 'T', 'Y'], () => {
          const d = Core.deposit(val('P'), val('T'), val('Y'), 0);
          $('ans').textContent = t('ans_comp', { y: num(val('Y') / 12, 1), f: fmt(d.final), g: fmt(d.gross) });
          $('res').innerHTML = `<div>${t('gross')}<b>${fmt(d.gross)}</b></div><div>${t('total_end')}<b>${fmt(d.final)}</b></div>`;
        });
      }
    }
  },

  patrimonio: {
    icon: '💼', render(root) {
      const s = State.get();
      root.innerHTML = head('patrimonio', 'd_patrimonio') + `<div class="cols"><div class="card">
        <label>${t('name')}</label><input type="text" id="an" maxlength="60"><label>${t('amount')}</label><input type="number" id="av" min="0" step="0.01" style="width:100%">
        <label>${t('kind')}</label><select class="f" id="ak"><option value="asset">${t('asset')}</option><option value="debt">${t('debt')}</option></select><p><button id="aadd">${t('add')}</button></p></div>
        <div class="card"><b>${t('assets')}</b><canvas id="pie"></canvas><div class="legend" id="lg"></div><b>${t('debts')}</b><canvas id="pie2"></canvas><div class="legend" id="lg2"></div></div></div><div class="card"><div class="res" id="res"></div><div id="al"></div></div>`;
      const draw = () => {
        const A = s.assets.filter(x => x.kind !== 'debt'), D = s.assets.filter(x => x.kind === 'debt');
        const ta = A.reduce((a, x) => a + x.val, 0), td = D.reduce((a, x) => a + x.val, 0);
        $('res').innerHTML = `<div>${t('assets')}<b class="ok">${fmt(ta)}</b></div><div>${t('debts')}<b class="bad">${fmt(td)}</b></div><div>${t('net_worth')}<b class="${ta - td < 0 ? 'bad' : 'ok'}">${fmt(ta - td)}</b></div>`;
        pieChart($('pie'), A.map(x => ({ label: x.name, value: x.val })).sort((a, b) => b.value - a.value), $('lg'));
        pieChart($('pie2'), D.map(x => ({ label: x.name, value: x.val })).sort((a, b) => b.value - a.value), $('lg2'));
        $('al').innerHTML = s.assets.length ? `<table>${s.assets.map(x => `<tr><td>${esc(x.name)}</td><td>${t(x.kind)}</td><td>${fmt(x.val)}</td><td><button class="del" data-id="${x.id}">${t('del')}</button></td></tr>`).join('')}</table>` : `<p class="sub">${t('empty')}</p>`;
        $('al').querySelectorAll('.del').forEach(b => b.onclick = () => { s.assets = s.assets.filter(x => x.id !== b.dataset.id); State.save(); draw(); });
      };
      $('aadd').onclick = () => {
        const v = parseFloat($('av').value); if (!(v > 0) || !$('an').value.trim()) return;
        s.assets.push({ id: uid(), name: $('an').value.trim(), val: v, kind: $('ak').value }); State.save(); $('an').value = ''; $('av').value = ''; draw();
      };
      draw();
    }
  },

  invest: {
    icon: '📈', adv: true, render(root, tab = 'size') {
      root.innerHTML = head('invest', 'd_invest') + tabs([['size', 'size'], ['bond', 'bond'], ['option', 'option'], ['cert', 'cert']], tab) + `<div class="card" id="box"></div><p class="disc">${t('disc')}</p>`;
      root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => Modules.invest.render(root, b.dataset.tab));
      const box = $('box');
      if (tab === 'size') {
        box.innerHTML = slider('C', t('capital_t'), 10000, 100, 1000000, 100) + slider('R', t('risk'), 1, 0.1, 10, 0.1) + slider('E', t('entry'), 50, 0.01, 1000, 0.01) + slider('S', t('stop'), 48, 0.01, 1000, 0.01) + slider('G', t('target'), 56, 0, 1000, 0.01) + `<div class="answer" id="ans"></div><div class="res" id="res"></div>`;
        bind(['C', 'R', 'E', 'S', 'G'], () => {
          const p = Core.positionSize(val('C'), val('R'), val('E'), val('S'), val('G'));
          if (!p) { $('ans').textContent = t('bad_stop'); $('res').innerHTML = ''; return; }
          $('ans').textContent = `${t('units')}: ${num(p.units, 4)} · ${t('pos_val')}: ${fmt(p.value)}`;
          $('res').innerHTML = `<div>${t('units')}<b>${num(p.units, 4)}</b></div><div>${t('pos_val')}<b>${fmt(p.value)}</b></div><div>${t('risk_amt')}<b class="bad">${fmt(p.riskAmount)}</b></div><div>${t('of_cap')}<b>${num(p.pctCapital, 1)}%</b></div>` + (p.rr ? `<div>${t('rr')}<b class="ok">1 : ${num(p.rr, 2)}</b></div>` : '');
        });
      } else if (tab === 'bond') {
        box.innerHTML = slider('P', t('bprice'), 98, 50, 150, 0.01) + slider('C', t('coupon'), 4, 0, 12, 0.05) + slider('Y', t('years'), 10, 1, 40, 1) +
          `<label>${t('freq')}</label><select class="f" id="F"><option value="1">1</option><option value="2">2</option><option value="4">4</option></select>` + `<p class="sub">${t('no_tax')}</p><div class="answer" id="ans"></div><div class="res" id="res"></div>`;
        $('F').onchange = () => $('P').dispatchEvent(new Event('input'));
        bind(['P', 'C', 'Y'], () => {
          const f = +$('F').value, g = Core.bondYield(val('P'), val('C'), val('Y'), f);
          $('ans').textContent = t('ans_bond', { p: num(val('P'), 2), g: num(g, 2) });
          $('res').innerHTML = `<div>${t('gross_y')}<b>${num(g, 2)}%</b></div><div>${t('coupon')}<b>${num(val('C'), 2)}%</b></div>`;
        });
      } else if (tab === 'option') {
        box.innerHTML = `<div class="tabs"><button id="ot" class="on" data-ty="call">${t('call')}</button><button id="op" data-ty="put">${t('put')}</button></div>` +
          slider('S', t('spot'), 100, 1, 1000, 0.5) + slider('K', t('strike'), 100, 1, 1000, 0.5) + slider('R', t('rate'), 5, 0, 15, 0.1) + slider('V', t('vol'), 20, 1, 150, 0.5) + slider('T', t('tte'), 1, 0.02, 5, 0.02) +
          `<div class="answer" id="ans"></div><div class="res" id="res"></div><b>${t('payoff')}</b><canvas id="ch"></canvas>`;
        let ty = 'call';
        const draw = () => {
          const o = Core.blackScholes(val('S'), val('K'), val('R'), val('V'), val('T'), ty);
          $('ans').textContent = `${t('opt_price')}: ${fmt(o.price)}`;
          $('res').innerHTML = `<div>${t('opt_price')}<b>${fmt(o.price)}</b></div><div>Delta<b>${num(o.delta, 3)}</b></div><div>Gamma<b>${num(o.gamma, 4)}</b></div><div>Vega<b>${num(o.vega, 3)}</b></div><div>Theta/day<b>${num(o.theta, 3)}</b></div>`;
          const K = val('K'), S0 = val('S'), xs = [], ys = [], lo = Math.min(K, S0) * 0.6, hi = Math.max(K, S0) * 1.4;
          for (let i = 0; i <= 80; i++) { const x = lo + i * (hi - lo) / 80; xs.push(x); ys.push((ty === 'call' ? Math.max(x - K, 0) : Math.max(K - x, 0)) - o.price); }
          payoffChart($('ch'), xs, ys, { mark: S0, markLabel: t('spot') + ' ' + num(S0, 2), xLabel: v => num(v, 0) });
        };
        box.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => { ty = b.dataset.ty; box.querySelectorAll('[data-ty]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
        bind(['S', 'K', 'R', 'V', 'T'], draw);
      } else {
        box.innerHTML = slider('N', t('nominal'), 1000, 100, 100000, 100) + slider('C', t('coupon_cert'), 5, 0, 20, 0.1) + slider('Y', t('years'), 3, 1, 10, 1) + slider('B', t('barrier'), 70, 20, 100, 1) + slider('F', t('perf'), -20, -80, 50, 1) +
          `<div class="answer" id="ans"></div><div class="res" id="res"></div><b>${t('scen')}</b><canvas id="ch"></canvas><p class="sub">${t('cert_note')}</p>`;
        bind(['N', 'C', 'Y', 'B', 'F'], () => {
          const r = Core.certificate(val('N'), val('C'), val('Y'), val('B'), val('F'));
          $('ans').textContent = `${t('pl')}: ${fmt(r.pl)}`;
          $('res').innerHTML = `<div>${t('redeem_v')}<b>${fmt(r.redeem)}</b></div><div>${t('coupons_v')}<b>${fmt(r.coupons)}</b></div><div>${t('total_v')}<b>${fmt(r.total)}</b></div><div>${t('pl')}<b class="${r.pl < 0 ? 'bad' : 'ok'}">${fmt(r.pl)}</b></div>`;
          const ps = []; for (let p = -80; p <= 50; p += 2) ps.push(p);
          payoffChart($('ch'), ps, ps.map(p => Core.certificate(val('N'), val('C'), val('Y'), val('B'), p).pl), { mark: val('F'), markLabel: t('perf') + ' ' + val('F') + '%', xLabel: v => v + '%' });
        });
      }
    }
  }
};



