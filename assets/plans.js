// Piani: free < base < pro. Finché PLANS_ON è false (pagamenti non attivi) tutti hanno accesso completo.
// Anteprima per i test: app/?plan=free  oppure  app/?plan=base  (vale solo per la sessione).
const PLANS_ON = false;
const PLAN_RANK = { free: 0, base: 1, pro: 2, business: 3 };
const PLAN_OF = { home: 'free', spese: 'free', scadenze: 'free', patrimonio: 'free', report: 'free', prestiti: 'base', risparmio: 'base', veicoli: 'base', invest: 'pro', portafoglio: 'pro', cassa: 'business', fido: 'business', pareggio: 'business', flotta: 'business' };
const PLAN_I18N = {
  it: { pl_lock: 'Funzione disponibile nel piano', pl_text: 'Passa a un piano superiore per sbloccare questo strumento.', pl_see: 'Vedi i piani', pl_cur: 'Il tuo piano' },
  en: { pl_lock: 'Feature available in the plan', pl_text: 'Upgrade to unlock this tool.', pl_see: 'See plans', pl_cur: 'Your plan' },
  es: { pl_lock: 'Función disponible en el plan', pl_text: 'Mejora tu plan para desbloquear esta herramienta.', pl_see: 'Ver planes', pl_cur: 'Tu plan' },
  de: { pl_lock: 'Funktion verfügbar im Tarif', pl_text: 'Wechseln Sie den Tarif, um dieses Tool freizuschalten.', pl_see: 'Tarife ansehen', pl_cur: 'Ihr Tarif' },
  pl: { pl_lock: 'Funkcja dostępna w planie', pl_text: 'Przejdź na wyższy plan, aby odblokować to narzędzie.', pl_see: 'Zobacz plany', pl_cur: 'Twój plan' },
  sv: { pl_lock: 'Funktionen ingår i planen', pl_text: 'Uppgradera för att låsa upp verktyget.', pl_see: 'Se planer', pl_cur: 'Din plan' },
  nl: { pl_lock: 'Functie beschikbaar in het abonnement', pl_text: 'Upgrade om deze tool te ontgrendelen.', pl_see: 'Bekijk abonnementen', pl_cur: 'Jouw abonnement' },
  fi: { pl_lock: 'Ominaisuus kuuluu pakettiin', pl_text: 'Päivitä paketti avataksesi työkalun.', pl_see: 'Näytä paketit', pl_cur: 'Pakettisi' },
  fr: { pl_lock: 'Fonction disponible dans l’offre', pl_text: 'Passez à une offre supérieure pour débloquer cet outil.', pl_see: 'Voir les offres', pl_cur: 'Votre offre' },
  pt: { pl_lock: 'Função disponível no plano', pl_text: 'Mude de plano para desbloquear esta ferramenta.', pl_see: 'Ver planos', pl_cur: 'O seu plano' },
  da: { pl_lock: 'Funktionen er med i planen', pl_text: 'Opgrader for at låse værktøjet op.', pl_see: 'Se planer', pl_cur: 'Din plan' },
  cs: { pl_lock: 'Funkce je dostupná v tarifu', pl_text: 'Přejděte na vyšší tarif a odemkněte tento nástroj.', pl_see: 'Zobrazit tarify', pl_cur: 'Váš tarif' },
  ro: { pl_lock: 'Funcție disponibilă în planul', pl_text: 'Treci la un plan superior pentru a debloca instrumentul.', pl_see: 'Vezi planurile', pl_cur: 'Planul tău' },
  el: { pl_lock: 'Λειτουργία διαθέσιμη στο πλάνο', pl_text: 'Αναβαθμίστε για να ξεκλειδώσετε το εργαλείο.', pl_see: 'Δείτε τα πλάνα', pl_cur: 'Το πλάνο σας' },
  hu: { pl_lock: 'A funkció ebben a csomagban érhető el', pl_text: 'Válts magasabb csomagra az eszköz feloldásához.', pl_see: 'Csomagok megtekintése', pl_cur: 'Csomagod' }
};
Object.keys(PLAN_I18N).forEach(l => Object.assign(I18N[l], PLAN_I18N[l]));

const Plan = {
  get() {
    if (!PLANS_ON) {
      const q = new URLSearchParams(location.search).get('plan');
      if (q in PLAN_RANK) { try { sessionStorage.setItem('plan', q); } catch (e) { } }
      let p = 'business'; try { p = sessionStorage.getItem('plan') || 'business'; } catch (e) { }
      return p in PLAN_RANK ? p : 'business';
    }
    const p = State.get().plan;
    return p in PLAN_RANK ? p : 'free';
  },
  need: id => PLAN_OF[id] || 'free',
  can: id => PLAN_RANK[Plan.get()] >= PLAN_RANK[Plan.need(id)],
  label: p => p.charAt(0).toUpperCase() + p.slice(1),
  lockedView(id) {
    const n = Plan.need(id);
    return `<div class="card" style="text-align:center;padding:40px 20px"><div style="font-size:48px">🔒</div><h2>${t(id)}</h2>
      <p>${t('pl_lock')} <b>${Plan.label(n)}</b></p><p class="sub">${t('pl_text')}</p>
      <p><a class="btn" href="../index.html#p" style="display:inline-block;padding:10px 22px;border-radius:12px;text-decoration:none;color:#041421;background:var(--grad);font-weight:700">${t('pl_see')}</a></p>
      <p class="sub">${t('pl_cur')}: <b>${Plan.label(Plan.get())}</b></p></div>`;
  }
};
