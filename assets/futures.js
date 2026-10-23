const FUT = [
  { id: 'sp', ex: 'CME', name: 'S&P 500', ccy: 'USD', px: 6800, s: [['full', 'ES', 50, 0.25], ['micro', 'MES', 5, 0.25]] },
  { id: 'nq', ex: 'CME', name: 'Nasdaq 100', ccy: 'USD', px: 25000, s: [['full', 'NQ', 20, 0.25], ['micro', 'MNQ', 2, 0.25]] },
  { id: 'ym', ex: 'CBOT', name: 'Dow Jones', ccy: 'USD', px: 47000, s: [['full', 'YM', 5, 1], ['micro', 'MYM', 0.5, 1]] },
  { id: 'rty', ex: 'CME', name: 'Russell 2000', ccy: 'USD', px: 2500, s: [['full', 'RTY', 50, 0.1], ['micro', 'M2K', 5, 0.1]] },
  { id: 'gc', ex: 'COMEX', name: 'Gold', ccy: 'USD', px: 4000, s: [['full', 'GC', 100, 0.1], ['mini', 'QO', 50, 0.25], ['micro', 'MGC', 10, 0.1]] },
  { id: 'cl', ex: 'NYMEX', name: 'Crude oil', ccy: 'USD', px: 60, s: [['full', 'CL', 1000, 0.01], ['micro', 'MCL', 100, 0.01]] },
  { id: 'zc', ex: 'CBOT', name: 'Corn (cents/bu)', ccy: 'USD', px: 450, s: [['full', 'ZC', 50, 0.25], ['mini', 'XC', 10, 0.125]] },
  { id: 'zs', ex: 'CBOT', name: 'Soybeans (cents/bu)', ccy: 'USD', px: 1050, s: [['full', 'ZS', 50, 0.25], ['mini', 'XK', 10, 0.125]] },
  { id: 'dax', ex: 'Eurex', name: 'DAX', ccy: 'EUR', px: 24000, s: [['full', 'FDAX', 25, 0.5], ['mini', 'FDXM', 5, 1], ['micro', 'FDXS', 1, 1]] },
  { id: 'sx5', ex: 'Eurex', name: 'Euro Stoxx 50', ccy: 'EUR', px: 5600, s: [['full', 'FESX', 10, 1]] },
  { id: 'bund', ex: 'Eurex', name: 'Euro-Bund', ccy: 'EUR', px: 130, s: [['full', 'FGBL', 1000, 0.01]] }
];
const FT_KEYS = ['futures', 'd_futures', 'ft_t1', 'ft_t2', 'ft_mkt', 'ft_px', 'ft_n', 'ft_mv', 'ft_fx', 'ft_size', 'ft_pp', 'ft_tick', 'ft_tv', 'ft_not', 'ft_pct', 'ft_pl', 'ft_full', 'ft_mini', 'ft_micro', 'ft_cap', 'ft_risk', 'ft_stop', 'ft_tp', 'ft_max', 'ft_rsk', 'ft_gain', 'ft_rr', 'ft_lev', 'ft_ans1', 'ft_ans2', 'ft_edu', 'ft_disc', 'ft_zero'];
const FT_VALS = {
  it: ['Futures: valore del punto', 'Quanto muove 1 punto di un future (DAX, S&P, oro...) e quanti contratti scegliere in base al capitale.', 'Valore del punto', 'Quanti contratti', 'Mercato', 'Prezzo attuale (modificabile)', 'Numero di contratti', 'Movimento (punti)', 'Cambio: 1 {c} vale', 'Taglia', 'Valore di 1 punto', 'Tick (minimo movimento)', 'Valore di 1 tick', 'Valore totale del contratto', 'Movimento in %', 'Guadagno / perdita', 'Pieno', 'Mini', 'Micro', 'Capitale', 'Rischio massimo per operazione (%)', 'Stop loss (punti)', 'Take profit (punti)', 'Contratti massimi', 'Rischio reale', 'Guadagno se arriva al take profit', 'Rapporto guadagno/rischio', 'Valore contratti / capitale', 'Con {cap} e rischio {r}%, perdi al massimo {m} se scatta lo stop.', 'Scegli la taglia che ti dà almeno 1 contratto.', 'Il future ha tre taglie: PIENO (es. DAX 25 per punto), MINI (5 per punto) e MICRO (1 per punto). Stesso mercato, ma il micro muove 25 volte meno: ideale per capitali piccoli. 1 punto = movimento del prezzo; il tick è il movimento minimo. Mai rischiare più di una piccola parte del capitale per operazione.', 'Strumenti di calcolo e formazione: i valori dei contratti sono indicativi e vanno verificati sul sito della borsa (CME, CBOT, Eurex). Non conosciamo il margine richiesto dal tuo broker o dalla tua banca, che può cambiare in ogni momento: verificalo prima di operare. I futures sono strumenti a leva e puoi perdere più del capitale versato. Non è consulenza né sollecitazione all\'investimento.', 'non disponibile'],
  en: ['Futures: point value', 'How much 1 point of a future (DAX, S&P, gold...) moves and how many contracts to pick for your capital.', 'Point value', 'How many contracts', 'Market', 'Current price (editable)', 'Number of contracts', 'Move (points)', 'Exchange rate: 1 {c} is worth', 'Size', 'Value of 1 point', 'Tick (smallest move)', 'Value of 1 tick', 'Total contract value', 'Move in %', 'Profit / loss', 'Full', 'Mini', 'Micro', 'Capital', 'Max risk per trade (%)', 'Stop loss (points)', 'Take profit (points)', 'Max contracts', 'Real risk', 'Gain if take profit is hit', 'Reward/risk ratio', 'Contract value / capital', 'With {cap} and {r}% risk, you lose at most {m} if the stop is hit.', 'Pick the size that gives you at least 1 contract.', 'A future comes in sizes: FULL (e.g. DAX 25 per point), MINI (5 per point) and MICRO (1 per point). Same market, but micro moves 25 times less: ideal for small accounts. 1 point = price movement; the tick is the smallest move. Never risk more than a small part of your capital per trade.', 'Calculation and education tools: contract values are indicative and must be checked on the exchange website (CME, CBOT, Eurex). We do not know the margin required by your broker or bank, which can change at any time: check it before trading. Futures are leveraged and you can lose more than your deposit. Not investment advice.', 'n/a']
};
['es', 'de', 'pl', 'sv', 'nl', 'fi', 'fr', 'pt', 'da', 'cs', 'ro', 'el', 'hu'].forEach(l => FT_VALS[l] = FT_VALS.en);
Object.keys(FT_VALS).forEach(l => FT_KEYS.forEach((k, i) => { I18N[l][k] = FT_VALS[l][i]; }));

Modules.futures = {
  icon: '📊', render(root, tab = 'pp') {
    root.innerHTML = head('futures', 'd_futures') + tabs([['pp', 'ft_t1'], ['qty', 'ft_t2']], tab) + `<div class="card" id="box"></div>`;
    root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => Modules.futures.render(root, b.dataset.tab));
    const cur = State.get().cur, box = $('box');
    const dfx = c => c === cur ? 1 : (c === 'USD' && cur === 'EUR') ? 0.92 : (c === 'EUR' && cur === 'USD') ? 1.08 : 1;
    const sel = `<label>${t('ft_mkt')}</label><select class="f" id="G">${FUT.map(g => `<option value="${g.id}">${g.ex} · ${g.name}</option>`).join('')}</select>`;
    const g0 = FUT[0];
    box.innerHTML = sel + slider('P', t('ft_px'), g0.px, 0.01, 100000, 0.01) + slider('X', t('ft_fx', { c: g0.ccy }) + ' (' + cur + ')', dfx(g0.ccy), 0.01, 200, 0.01) +
      (tab === 'pp' ? slider('N', t('ft_n'), 1, 1, 50, 1) + slider('M', t('ft_mv'), 50, 1, 1000, 1)
        : slider('C', t('ft_cap'), 10000, 500, 1000000, 500) + slider('R', t('ft_risk'), 1, 0.1, 5, 0.1) + slider('S', t('ft_stop'), 30, 1, 1000, 1) + slider('T', t('ft_tp'), 60, 1, 2000, 1)) +
      `<div class="answer" id="ans"></div><div id="tb"></div><canvas id="ch"></canvas><div class="legend" id="lg"></div><div class="xbox"><small>${t('ft_edu')}</small></div><p class="sub">${t('ft_disc')}</p><p class="noprint"><button onclick="print()">${t('print')}</button></p>`;
    let last = g0.id;
    const draw = () => {
      const g = FUT.find(x => x.id === $('G').value);
      if (g.id !== last) { last = g.id; $('P').value = $('PR').value = g.px; $('X').value = $('XR').value = dfx(g.ccy); }
      const px = val('P'), fx = val('X'), lab = k => t('ft_' + k);
      const rows = g.s.map(([k, code, mult, tick]) => ({ k, code, mult, tick, pp: mult * fx, tv: mult * tick * fx, notl: px * mult * fx }));
      if (tab === 'pp') {
        const n = val('N'), m = val('M');
        $('ans').textContent = `${m} ${t('ft_mv').match(/\(.*\)/)?.[0] || ''} = ${num(m / px * 100, 2)}%`;
        $('tb').innerHTML = `<table><tr><th>${t('ft_size')}</th><th>${t('ft_pp')}</th><th>${t('ft_tv')}</th><th>${t('ft_not')}</th><th>${t('ft_pl')}</th></tr>${rows.map(r => `<tr><td>${lab(r.k)} <small>${r.code}</small></td><td>${fmt(r.pp)}</td><td>${fmt(r.tv)}<br><small>tick ${r.tick}</small></td><td>${fmt(r.notl)}</td><td><b class="ok">${fmt(r.pp * m * n)}</b></td></tr>`).join('')}</table>`;
        $('ch').style.display = ''; barChart($('ch'), rows.map(r => r.pp * m * n), rows.map(r => lab(r.k)), () => '#10b981'); $('lg').innerHTML = '';
      } else {
        const C = val('C'), R = val('R'), S = val('S'), T = val('T'), risk = C * R / 100;
        $('ans').textContent = t('ft_ans1', { cap: fmt(C), r: num(R, 1), m: fmt(risk) });
        const calc = rows.map(r => { const q = Math.floor(risk / (S * r.pp)); return Object.assign(r, { q, rsk: q * S * r.pp, gain: q * T * r.pp, lev: C > 0 ? q * r.notl / C : 0 }); });
        $('tb').innerHTML = `<table><tr><th>${t('ft_size')}</th><th>${t('ft_max')}</th><th>${t('ft_rsk')}</th><th>${t('ft_gain')}</th><th>${t('ft_lev')}</th></tr>${calc.map(r => r.q < 1 ? `<tr><td>${lab(r.k)} <small>${r.code}</small></td><td colspan="4">${t('ft_zero')}</td></tr>` : `<tr><td>${lab(r.k)} <small>${r.code}</small></td><td><b>${r.q}</b></td><td class="bad">${fmt(r.rsk)} (${num(r.rsk / C * 100, 2)}%)</td><td class="ok">${fmt(r.gain)}</td><td>${num(r.lev, 1)}x<br><small>1 : ${num(T / S, 2)}</small></td></tr>`).join('')}</table>` + (calc.every(r => r.q < 1) ? `<p class="answer">${t('ft_ans2')}</p>` : '');
        $('ch').style.display = ''; barChart($('ch'), calc.map(r => r.q), calc.map(r => lab(r.k)), () => '#06b6d4'); $('lg').innerHTML = '';
      }
    };
    $('G').addEventListener('change', () => draw());
    bind(tab === 'pp' ? ['P', 'X', 'N', 'M'] : ['P', 'X', 'C', 'R', 'S', 'T'], draw);
  }
};
