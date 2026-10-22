// Motore di calcolo puro (nessun accesso al DOM), usato dall'app e dai test.
const Core = (() => {
  function amortization(P, annualRate, years) {
    const m = Math.round(years * 12), i = annualRate / 1200;
    const pay = i ? P * i / (1 - Math.pow(1 + i, -m)) : P / m;
    let bal = P, cum = 0; const rows = [];
    for (let k = 1; k <= m; k++) {
      const int = bal * i, cap = pay - int;
      bal = Math.max(bal - cap, 0); cum += int;
      rows.push({ k, pay, int, cap, bal, cum });
    }
    return { pay, rows, total: pay * m, interest: pay * m - P };
  }

  function prepay(P, annualRate, years, extra) {
    const base = amortization(P, annualRate, years), i = annualRate / 1200;
    let bal = P, cum = 0, k = 0; const rows = [];
    while (bal > 0.005 && k < 1200) {
      k++; const int = bal * i, cap = Math.min(base.pay + extra - int, bal);
      if (cap <= 0) break;
      bal -= cap; cum += int; rows.push({ k, bal: Math.max(bal, 0), cum });
    }
    return { months: k, interest: cum, rows, savedInterest: base.interest - cum, savedMonths: base.rows.length - k };
  }

  function compound(P, monthly, annualRate, years) {
    const i = annualRate / 1200; let v = P, inv = P;
    const vals = [P], invs = [P];
    for (let k = 1; k <= Math.round(years * 12); k++) {
      v = v * (1 + i) + monthly; inv += monthly;
      if (k % 12 === 0) { vals.push(v); invs.push(inv); }
    }
    return { final: v, invested: inv, gain: v - inv, vals, invs };
  }

  // Conto deposito vincolato: interesse semplice pro-rata, imposta sugli interessi.
  function deposit(P, annualRate, months, taxPct) {
    const gross = P * annualRate / 100 * months / 12;
    const tax = gross * taxPct / 100;
    return { gross, tax, net: gross - tax, final: P + gross - tax };
  }

  // Prezzo per 100 di nominale. yieldPct e couponPct sono annui; freq = cedole all'anno.
  function bondPrice(yieldPct, couponPct, years, freq = 1, redemption = 100) {
    const n = Math.round(years * freq), y = yieldPct / 100 / freq, c = couponPct / freq;
    let p = 0;
    for (let k = 1; k <= n; k++) p += c / Math.pow(1 + y, k);
    return p + redemption / Math.pow(1 + y, n);
  }

  function bondYield(price, couponPct, years, freq = 1, redemption = 100) {
    let lo = -50, hi = 100;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (bondPrice(mid, couponPct, years, freq, redemption) > price) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // Rendimento netto: tassa sulla cedola e sul guadagno in conto capitale.
  function bondNet(price, couponPct, years, freq, taxPct) {
    const t = taxPct / 100, gain = 100 - price;
    const redemption = gain > 0 ? price + gain * (1 - t) : 100;
    return bondYield(price, couponPct * (1 - t), years, freq, redemption);
  }

  function erf(x) {
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const N = x => 0.5 * (1 + erf(x / Math.SQRT2));
  const pdf = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);

  function blackScholes(S, K, ratePct, volPct, years, type) {
    const r = ratePct / 100, v = volPct / 100, T = years, call = type === 'call';
    const d1 = (Math.log(S / K) + (r + v * v / 2) * T) / (v * Math.sqrt(T)), d2 = d1 - v * Math.sqrt(T);
    const price = call ? S * N(d1) - K * Math.exp(-r * T) * N(d2) : K * Math.exp(-r * T) * N(-d2) - S * N(-d1);
    return {
      price, d1, d2,
      delta: call ? N(d1) : N(d1) - 1,
      gamma: pdf(d1) / (S * v * Math.sqrt(T)),
      vega: S * pdf(d1) * Math.sqrt(T) / 100,
      theta: ((-S * pdf(d1) * v / (2 * Math.sqrt(T))) - (call ? 1 : -1) * r * K * Math.exp(-r * T) * N(call ? d2 : -d2)) / 365
    };
  }

  function positionSize(capital, riskPct, entry, stop, target) {
    const riskAmount = capital * riskPct / 100, perUnit = Math.abs(entry - stop);
    if (!(perUnit > 0) || !(capital > 0)) return null;
    const units = riskAmount / perUnit;
    const out = { riskAmount, perUnit, units, value: units * entry, pctCapital: units * entry / capital * 100 };
    if (target) out.rr = Math.abs(target - entry) / perUnit;
    return out;
  }

  // Certificato semplificato: cedole sempre pagate, barriera valutata a scadenza.
  function certificate(nominal, couponPct, years, barrierPct, finalPerfPct) {
    const coupons = nominal * couponPct / 100 * years;
    const level = 100 + finalPerfPct;
    const redeem = level >= barrierPct ? nominal : nominal * level / 100;
    return { coupons, redeem, total: redeem + coupons, pl: redeem + coupons - nominal };
  }

  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  function nextOccurrence(date, rep, today) {
    const d = new Date(date + 'T00:00:00'), t = new Date(today + 'T00:00:00');
    if (rep === 'none') return d;
    const day = d.getDate();
    let guard = 0;
    while (d < t && guard++ < 2000) {
      if (rep === 'month') { d.setDate(1); d.setMonth(d.getMonth() + 1); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); }
      else { d.setDate(1); d.setFullYear(d.getFullYear() + 1); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); }
    }
    return d;
  }

  function ics(deadlines, appName) {
    const esc = s => String(s).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + appName + '//IT'];
    deadlines.forEach(x => {
      const d = x.date.replace(/-/g, '');
      lines.push('BEGIN:VEVENT', 'UID:' + x.id + '@' + appName.toLowerCase(), 'DTSTAMP:' + d + 'T000000Z', 'DTSTART;VALUE=DATE:' + d,
        'SUMMARY:' + esc(x.title + (x.amt ? ' (' + x.amt + ')' : '')));
      if (x.rep === 'month') lines.push('RRULE:FREQ=MONTHLY');
      if (x.rep === 'year') lines.push('RRULE:FREQ=YEARLY');
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(x.title), 'TRIGGER:-P' + (x.alert || 0) + 'D', 'END:VALARM', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  return { amortization, prepay, compound, deposit, bondPrice, bondYield, bondNet, blackScholes, positionSize, certificate, nextOccurrence, iso, ics };
})();
if (typeof module !== 'undefined') module.exports = Core;
