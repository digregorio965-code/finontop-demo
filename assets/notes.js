const NT_KEYS = ['appunti', 'd_appunti', 'nt_voice', 'nt_say', 'nt_mic', 'nt_go', 'nt_nomic', 'nt_ex', 'nt_new', 'nt_title', 'nt_text', 'nt_save', 'nt_search', 'nt_empty', 'nt_did_exp', 'nt_did_dl', 'nt_did_in', 'nt_did_note', 'nt_undo', 'nt_listen'];
const NT_VALS = {
  it: ['Appunti e voce', 'Blocco note e assistente vocale: detta e l\'app smista in Spese, Scadenze o Appunti.', 'Assistente vocale', 'Scrivi o detta una frase', 'Parla', 'Registra', 'Il microfono non è disponibile su questo browser: scrivi la frase.', 'Esempi: "spesa 25 euro benzina" · "scadenza assicurazione 300 euro il 15/12" · "incasso 500 euro domani" · "appunto chiamare il commercialista"', 'Nuovo appunto', 'Titolo', 'Testo', 'Salva', 'Cerca negli appunti', 'Nessun appunto.', 'Registrata in Spese: {x}', 'Registrata in Scadenze: {x}', 'Registrata come entrata in Scadenze: {x}', 'Salvato negli Appunti: {x}', 'Annulla', 'Ti ascolto...'],
  en: ['Notes & voice', 'Notepad and voice assistant: speak and the app sorts it into Expenses, Deadlines or Notes.', 'Voice assistant', 'Type or speak a sentence', 'Speak', 'Save', 'The microphone is not available in this browser: type the sentence.', 'Examples: "expense 25 euro fuel" · "deadline insurance 300 euro on 15/12" · "income 500 euro tomorrow" · "note call the accountant"', 'New note', 'Title', 'Text', 'Save', 'Search notes', 'No notes.', 'Saved in Expenses: {x}', 'Saved in Deadlines: {x}', 'Saved as income in Deadlines: {x}', 'Saved in Notes: {x}', 'Undo', 'Listening...'],
  es: ['Notas y voz', 'Bloc de notas y asistente de voz: habla y la app lo coloca en Gastos, Vencimientos o Notas.', 'Asistente de voz', 'Escribe o dicta una frase', 'Hablar', 'Guardar', 'El micrófono no está disponible en este navegador: escribe la frase.', 'Ejemplos: "gasto 25 euros gasolina" · "vencimiento seguro 300 euros el 15/12" · "ingreso 500 euros mañana" · "nota llamar al contable"', 'Nueva nota', 'Título', 'Texto', 'Guardar', 'Buscar notas', 'Sin notas.', 'Guardado en Gastos: {x}', 'Guardado en Vencimientos: {x}', 'Guardado como ingreso en Vencimientos: {x}', 'Guardado en Notas: {x}', 'Deshacer', 'Escuchando...'],
  de: ['Notizen & Sprache', 'Notizblock und Sprachassistent: sprich, die App sortiert in Ausgaben, Fristen oder Notizen.', 'Sprachassistent', 'Satz tippen oder sprechen', 'Sprechen', 'Speichern', 'Mikrofon in diesem Browser nicht verfügbar: Satz tippen.', 'Beispiele: "Ausgabe 25 Euro Benzin" · "Frist Versicherung 300 Euro am 15/12" · "Einnahme 500 Euro morgen" · "Notiz Steuerberater anrufen"', 'Neue Notiz', 'Titel', 'Text', 'Speichern', 'Notizen durchsuchen', 'Keine Notizen.', 'In Ausgaben gespeichert: {x}', 'In Fristen gespeichert: {x}', 'Als Einnahme in Fristen gespeichert: {x}', 'In Notizen gespeichert: {x}', 'Rückgängig', 'Ich höre zu...'],
  fr: ['Notes et voix', 'Bloc-notes et assistant vocal : parlez et l\'appli classe dans Dépenses, Échéances ou Notes.', 'Assistant vocal', 'Tapez ou dictez une phrase', 'Parler', 'Enregistrer', 'Micro indisponible sur ce navigateur : tapez la phrase.', 'Exemples : "dépense 25 euros essence" · "échéance assurance 300 euros le 15/12" · "revenu 500 euros demain" · "note appeler le comptable"', 'Nouvelle note', 'Titre', 'Texte', 'Enregistrer', 'Chercher dans les notes', 'Aucune note.', 'Enregistré dans Dépenses : {x}', 'Enregistré dans Échéances : {x}', 'Enregistré comme revenu dans Échéances : {x}', 'Enregistré dans Notes : {x}', 'Annuler', 'J\'écoute...'],
  pt: ['Notas e voz', 'Bloco de notas e assistente de voz: fale e a app arruma em Despesas, Prazos ou Notas.', 'Assistente de voz', 'Escreva ou dite uma frase', 'Falar', 'Guardar', 'Microfone indisponível neste navegador: escreva a frase.', 'Exemplos: "despesa 25 euros gasolina" · "prazo seguro 300 euros dia 15/12" · "receita 500 euros amanhã" · "nota ligar ao contabilista"', 'Nova nota', 'Título', 'Texto', 'Guardar', 'Procurar notas', 'Sem notas.', 'Guardado em Despesas: {x}', 'Guardado em Prazos: {x}', 'Guardado como receita em Prazos: {x}', 'Guardado em Notas: {x}', 'Anular', 'A ouvir...']
};
Object.keys(I18N).forEach(l => NT_KEYS.forEach((k, i) => { I18N[l][k] = (NT_VALS[l] || NT_VALS.en)[i]; }));

const VOICE_LANG = { it: 'it-IT', en: 'en-GB', es: 'es-ES', de: 'de-DE', pl: 'pl-PL', sv: 'sv-SE', nl: 'nl-NL', fi: 'fi-FI', fr: 'fr-FR', pt: 'pt-PT', da: 'da-DK', cs: 'cs-CZ', ro: 'ro-RO', el: 'el-GR', hu: 'hu-HU' };
const VOICE_CAT = [
  ['c_auto', /benzin|carburant|gasolio|diesel|fuel|petrol|gasolina|essence|tagliando|autostrada|pedaggio/i],
  ['c_spesa', /supermerc|spesa al|groceries|grocery|alimentari|cibo|mercado|supermarch|lebensmittel/i],
  ['c_utenze', /bolletta|bollette|luce|utenze|energia|internet|telefon|bill|electric|factura|rechnung|facture/i],
  ['c_casa', /affitto|mutuo|condominio|rent\b|alquiler|miete|loyer|aluguer/i],
  ['c_salute', /medico|farmacia|dentista|visita|salute|doctor|pharmacy|health|médico|arzt|santé/i],
  ['c_svago', /cinema|aperitivo|ristorante|pizza|svago|bar\b|caffè|caffe|restaurant|drinks|dinner|cena/i],
  ['c_forniture', /fornit|material|merce|goods|supplies/i],
  ['c_personale', /stipendio|dipendent|personale|salary|payroll|wages/i],
  ['c_tasse', /tasse|imposta|\biva\b|inps|f24|tax\b|steuer|impuesto|impôt/i],
  ['c_marketing', /pubblicit|marketing|\bads\b|sponsor|social/i]
];
const VOICE_MONTHS = { gen: 1, jan: 1, feb: 2, mar: 3, apr: 4, mag: 5, may: 5, giu: 6, jun: 6, lug: 7, jul: 7, ago: 8, aug: 8, set: 9, sep: 9, ott: 10, oct: 10, nov: 11, dic: 12, dec: 12, ene: 1, abr: 4, dez: 12, dez: 12, janv: 1, mai: 5 };

function parseVoice(raw) {
  let x = ' ' + raw.trim() + ' ', today = todayISO(), date = '', tmp;
  const addD = n => { const d = new Date(today + 'T00:00:00'); d.setDate(d.getDate() + n); return Core.iso(d); };
  if (/dopodomani|day after tomorrow|pasado mañana|übermorgen|après-demain|depois de amanhã/i.test(x)) { date = addD(2); x = x.replace(/dopodomani|day after tomorrow|pasado mañana|übermorgen|après-demain|depois de amanhã/i, ' '); }
  else if (/domani|tomorrow|mañana|morgen|demain|amanhã/i.test(x)) { date = addD(1); x = x.replace(/domani|tomorrow|mañana|morgen|demain|amanhã/i, ' '); }
  else if (/\boggi\b|\btoday\b|\bhoy\b|\bheute\b|aujourd'hui|\bhoje\b/i.test(x)) { date = today; x = x.replace(/\boggi\b|\btoday\b|\bhoy\b|\bheute\b|aujourd'hui|\bhoje\b/i, ' '); }
  if (!date && (tmp = x.match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?/))) {
    let y = tmp[3] ? +tmp[3] : +today.slice(0, 4); if (y < 100) y += 2000;
    const d = new Date(y, +tmp[2] - 1, +tmp[1]); if (!tmp[3] && Core.iso(d) < today) d.setFullYear(y + 1);
    date = Core.iso(d); x = x.replace(tmp[0], ' ');
  }
  if (!date && (tmp = x.match(/(\d{1,2})\s*(?:°|º)?\s*(?:di\s+|de\s+|of\s+)?(gen|jan|feb|mar|apr|abr|mag|may|mai|giu|jun|lug|jul|ago|aug|set|sep|ott|oct|nov|dic|dec|dez|ene)[a-zà-ü]*/i))) {
    const mo = VOICE_MONTHS[tmp[2].toLowerCase()], y = +today.slice(0, 4), d = new Date(y, mo - 1, +tmp[1]); if (Core.iso(d) < today) d.setFullYear(y + 1);
    date = Core.iso(d); x = x.replace(tmp[0], ' ');
  }
  if (!date && (tmp = x.match(/\b(?:il|le|on the|el|am|le)\s+(\d{1,2})\b(?!\s*(?:euro|eur|€|\$))/i))) {
    const d = new Date(+today.slice(0, 4), +today.slice(5, 7) - 1, +tmp[1]); if (Core.iso(d) < today) d.setMonth(d.getMonth() + 1);
    date = Core.iso(d); x = x.replace(tmp[0], ' ');
  }
  let amt = 0; tmp = x.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro|eur|\$|usd|dollari|dollars)?/i);
  if (tmp) { amt = parseFloat(tmp[1].replace(',', '.')); x = x.replace(tmp[0], ' '); }
  const isNote = /\b(appunt\w*|nota|note|notiz|memo|promemoria|ricorda\w*|remember|lembrete|rappel)\b/i.test(x);
  const isDl = /\b(scadenz\w*|scade|deadline|due|vencimiento|vence|fällig|échéance|prazo|rata|bolletta da pagare)\b/i.test(x);
  const isIn = /\b(incasso|incassato|entrata|ricevuto|income|received|ingreso|einnahme|revenu|receita)\b/i.test(x);
  const clean = x.replace(/\b(appunt\w*|nota|note|notiz|memo|promemoria|ricorda\w*|remember|lembrete|rappel|scadenz\w*|scade|deadline|due|vencimiento|vence|fällig|échéance|prazo|spesa|spese|speso|ho speso|pagato|ho pagato|expense|spent|paid|gasto|ausgabe|dépense|despesa|incasso|incassato|entrata|ricevuto|income|received|ingreso|einnahme|revenu|receita|di|per|il|per il|euro|eur)\b/ig, ' ').replace(/\s+/g, ' ').trim();
  const text = raw.trim().replace(/^\s*(appunt\w*|nota|note|notiz|memo|promemoria)\s*[:,-]?\s*/i, '');
  if (isNote || !(amt > 0)) return { type: 'note', text };
  if (isIn) return { type: 'in', title: clean || t('c_altro'), amt, date: date || today };
  if (isDl || (date && date !== today)) return { type: 'dl', title: clean || t('c_altro'), amt, date: date || today };
  const cats = CATS[State.get().profile] || CATS.casa, hit = VOICE_CAT.find(([c, r]) => r.test(raw) && cats.includes(c));
  return { type: 'exp', title: clean || t(hit ? hit[0] : 'c_altro'), amt, date: date || today, cat: hit ? hit[0] : 'c_altro' };
}

Modules.appunti = {
  icon: '📝', render(root) {
    const s = State.get(); s.notes = Array.isArray(s.notes) ? s.notes : [];
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    root.innerHTML = head('appunti', 'd_appunti') + `<div class="card"><b>🎤 ${t('nt_voice')}</b>
      <label for="vi">${t('nt_say')}</label><input type="text" id="vi" maxlength="300">
      <p class="noprint"><button id="vm" ${SR ? '' : 'disabled'}>🎤 ${t('nt_mic')}</button> <button id="vg">${t('nt_go')}</button></p>
      <div class="answer" id="vo" style="display:none"></div><small>${SR ? '' : t('nt_nomic') + '<br>'}${t('nt_ex')}</small></div>
      <div class="card"><b>${t('nt_new')}</b><label>${t('nt_title')}</label><input type="text" id="nti" maxlength="80"><label>${t('nt_text')}</label><textarea id="ntx" rows="4" style="width:100%" maxlength="5000"></textarea>
      <p class="noprint"><button id="nts">${t('nt_save')}</button></p></div>
      <div class="card"><input type="search" id="nq" placeholder="${esc(t('nt_search'))}"><div id="nl"></div></div>`;
    const draw = () => {
      const q = $('nq').value.toLowerCase(), L = s.notes.filter(n => (n.t + ' ' + n.x).toLowerCase().includes(q)).sort((a, b) => b.d.localeCompare(a.d));
      $('nl').innerHTML = L.length ? L.map(n => `<details class="xbox"><summary><b>${esc(n.t || n.x.slice(0, 40))}</b> <small>${n.d}</small></summary><p style="white-space:pre-wrap">${esc(n.x)}</p><p class="noprint"><button data-d="${n.id}">${t('del')}</button></p></details>`).join('') : `<p>${t('nt_empty')}</p>`;
      $('nl').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { s.notes = s.notes.filter(n => n.id !== b.dataset.d); State.save(); draw(); });
    };
    const apply = () => {
      const raw = $('vi').value.trim(); if (!raw) return;
      const r = parseVoice(raw), id = uid(), msg = $('vo'); let undo;
      if (r.type === 'exp') { s.expenses.push({ id, desc: r.title, amt: r.amt, cat: r.cat, date: r.date }); undo = () => { s.expenses = s.expenses.filter(e => e.id !== id); }; msg.textContent = t('nt_did_exp', { x: `${r.title} · ${fmt(r.amt)} · ${r.date}` }); }
      else if (r.type === 'dl' || r.type === 'in') { s.deadlines.push({ id, title: r.title, amt: r.amt, date: r.date, date0: r.date, n: 0, kind: r.type === 'in' ? 'in' : 'out', acc: '', rep: 'none', alert: 3 }); undo = () => { s.deadlines = s.deadlines.filter(e => e.id !== id); }; msg.textContent = t(r.type === 'in' ? 'nt_did_in' : 'nt_did_dl', { x: `${r.title} · ${fmt(r.amt)} · ${r.date}` }); }
      else { s.notes.push({ id, t: '', x: r.text, d: todayISO() }); undo = () => { s.notes = s.notes.filter(e => e.id !== id); }; msg.textContent = t('nt_did_note', { x: r.text.slice(0, 60) }); }
      State.save(); msg.style.display = ''; $('vi').value = '';
      const u = document.createElement('button'); u.textContent = t('nt_undo'); u.style.marginLeft = '8px'; u.onclick = () => { undo(); State.save(); msg.style.display = 'none'; draw(); }; msg.appendChild(u); draw();
    };
    $('vg').onclick = apply; $('vi').onkeydown = e => { if (e.key === 'Enter') apply(); };
    if (SR) $('vm').onclick = () => {
      const rec = new SR(); rec.lang = VOICE_LANG[s.lang] || 'en-GB'; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onresult = e => { $('vi').value = e.results[0][0].transcript; apply(); }; rec.onend = () => { $('vm').textContent = '🎤 ' + t('nt_mic'); }; rec.onerror = rec.onend;
      $('vm').textContent = '🎤 ' + t('nt_listen'); try { rec.start(); } catch (e) { }
    };
    $('nts').onclick = () => { const x = $('ntx').value.trim(); if (!x) return; s.notes.push({ id: uid(), t: $('nti').value.trim(), x, d: todayISO() }); State.save(); $('nti').value = $('ntx').value = ''; draw(); };
    $('nq').oninput = draw; draw();
  }
};
