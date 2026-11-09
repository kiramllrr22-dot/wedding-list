/* Moteur commun : connexion, traductions, menu, pied de page */
(function () {
  const cfg = window.LISTE_CONFIG || {};
  const LANGS = ["fr", "de", "es"];
  const LOCALES = { fr: "fr-CH", de: "de-CH", es: "es-ES" };

  const STR = {
    fr: {
      nav_home: "Accueil", nav_infos: "Infos", nav_list: "La liste", nav_rsvp: "Je réponds", menu: "Menu",
      hero_tag: "On se marie !", cd_days: "Plus que {n} jours", cd_tomorrow: "C'est demain !", cd_today: "C'est aujourd'hui !", cd_past: "Merci d'avoir été là", discover: "Découvrir",
      story_a: "Notre", story_b: "histoire",
      next_infos: "Le programme et les infos", next_rsvp: "Répondre à l'invitation", next_list: "Voir la liste", next_go: "par ici",
      prog_a: "Le", prog_b: "programme", prog_lead: "Le déroulement de la journée, du premier « oui » à la dernière danse.", map: "Voir la carte",
      practical_a: "Infos", practical_b: "pratiques", soon: "Les détails arrivent bientôt.",
      rsvp_a: "Tu viens", rsvp_b: "fêter avec nous", rsvp_c: " ?", rsvp_deadline: "Merci de répondre avant le {date}.",
      rsvp_lead: "Dis-nous si tu seras là, ça nous aide beaucoup pour l'organisation.",
      f_name: "Ton nom", f_name_hint: "Si tu viens accompagné·e, indique aussi les autres noms.", f_coming: "Tu seras là ?",
      yes: "Avec plaisir", no: "Je ne pourrai pas venir", f_guests: "Nombre de personnes, toi compris·e", f_diet: "Régime ou allergies",
      f_diet_ph: "Végétarien, sans gluten…", f_msg: "Un petit mot (facultatif)", send: "Envoyer", private_rsvp: "Tes réponses ne sont visibles que par nous.",
      thanks_title: "Merci", thanks_yes: "Merci {name}, on a hâte de te voir !", thanks_no: "Merci {name} de nous avoir prévenus. Tu vas nous manquer !",
      rsvp_closed: "Les réponses sont closes. Pour toute question, écris-nous directement.", another: "Envoyer une autre réponse",
      err_name: "Indique ton nom.", err_choice: "Dis-nous si tu seras là.", err_send: "L'envoi n'a pas fonctionné. Vérifie ta connexion et réessaie.",
      list_eyebrow: "La liste", list_a: "De quoi nous", list_b: "faire plaisir", list_intro: "Un cadeau, un bout de voyage, ou rien du tout : votre présence compte déjà beaucoup.",
      fund_pill: "Voyage", fund_of: "{a} sur {b}", fund_raised: "{a} récoltés", fund_start: "Tout commence ici", contrib_1: "1 participation", contrib_n: "{n} participations",
      approx: "env. {p}", see: "Voir", choose: "Choisir ce cadeau", join: "Participer au voyage", taken: "Déjà pris", gift_pill: "Cadeau",
      d_gift_sub: "Il sera marqué comme pris pour les autres.", d_fund_sub: "Le montant que tu veux, petit ou grand.", d_amount: "Montant ({cur})",
      d_private: "Ton nom et ton message ne sont visibles que par nous.", back: "Retour", confirm: "Valider", close: "Fermer", thanks_gift: "Merci {name}, c'est noté.",
      err_amount: "Indique un montant supérieur à 0.", err_taken: "Quelqu'un vient de le choisir juste avant toi.",
      faq_a: "Bon à", faq_b: "savoir", faq_how_q: "Comment ça marche ?",
      faq_how_a: "Touche la petite icône sous un cadeau et laisse ton nom : il sera marqué comme pris pour les autres. Pour le voyage, chacun met ce qu'il veut, et plusieurs personnes peuvent participer.",
      faq_who_q: "Qui voit mon nom ?", faq_who_a: "Personne d'autre que nous. Les autres invités voient seulement qu'un cadeau est pris, ou combien a été récolté pour le voyage.",
      faq_pay_q: "Comment payer ?", faq_oops_q: "Je me suis trompé·e, je fais comment ?", faq_oops_a: "Pas de souci, écris-nous et on corrige.",
      list_empty: "La liste arrive bientôt.", loading: "Chargement…", load_error: "Impossible de charger pour le moment. Réessaie dans quelques minutes.",
      not_configured: "Le site n'est pas encore configuré.", merci: "Merci"
    },
    de: {
      nav_home: "Startseite", nav_infos: "Infos", nav_list: "Wunschliste", nav_rsvp: "Antworten", menu: "Menü",
      hero_tag: "Wir heiraten!", cd_days: "Noch {n} Tage", cd_tomorrow: "Morgen ist es so weit!", cd_today: "Heute ist der Tag!", cd_past: "Danke, dass ihr dabei wart", discover: "Entdecken",
      story_a: "Unsere", story_b: "Geschichte",
      next_infos: "Programm und Infos", next_rsvp: "Auf die Einladung antworten", next_list: "Zur Wunschliste", next_go: "hier entlang",
      prog_a: "Das", prog_b: "Programm", prog_lead: "Der Ablauf des Tages, vom ersten «Ja» bis zum letzten Tanz.", map: "Karte anzeigen",
      practical_a: "Praktische", practical_b: "Infos", soon: "Die Details folgen bald.",
      rsvp_a: "Feierst du", rsvp_b: "mit uns", rsvp_c: "?", rsvp_deadline: "Bitte antworte bis zum {date}.",
      rsvp_lead: "Sag uns, ob du dabei bist – das hilft uns sehr bei der Planung.",
      f_name: "Dein Name", f_name_hint: "Wenn du in Begleitung kommst, gib bitte auch die anderen Namen an.", f_coming: "Bist du dabei?",
      yes: "Sehr gerne", no: "Ich kann leider nicht kommen", f_guests: "Anzahl Personen, dich eingeschlossen", f_diet: "Ernährung oder Allergien",
      f_diet_ph: "Vegetarisch, glutenfrei …", f_msg: "Ein paar Worte (freiwillig)", send: "Senden", private_rsvp: "Deine Antworten sehen nur wir.",
      thanks_title: "Danke", thanks_yes: "Danke {name}, wir freuen uns auf dich!", thanks_no: "Danke {name}, dass du uns Bescheid gibst. Du wirst uns fehlen!",
      rsvp_closed: "Die Anmeldung ist geschlossen. Bei Fragen schreib uns direkt.", another: "Eine weitere Antwort senden",
      err_name: "Bitte gib deinen Namen an.", err_choice: "Sag uns, ob du dabei bist.", err_send: "Das Senden hat nicht geklappt. Prüfe deine Verbindung und versuche es noch einmal.",
      list_eyebrow: "Wunschliste", list_a: "Womit ihr uns", list_b: "eine Freude macht", list_intro: "Ein Geschenk, ein Stück Reise oder gar nichts: Eure Anwesenheit ist uns schon das Wichtigste.",
      fund_pill: "Reise", fund_of: "{a} von {b}", fund_raised: "{a} gesammelt", fund_start: "Alles beginnt hier", contrib_1: "1 Beitrag", contrib_n: "{n} Beiträge",
      approx: "ca. {p}", see: "Ansehen", choose: "Dieses Geschenk auswählen", join: "Zur Reise beitragen", taken: "Schon vergeben", gift_pill: "Geschenk",
      d_gift_sub: "Es wird für die anderen als vergeben markiert.", d_fund_sub: "Der Betrag, den du möchtest – klein oder gross.", d_amount: "Betrag ({cur})",
      d_private: "Deinen Namen und deine Nachricht sehen nur wir.", back: "Zurück", confirm: "Bestätigen", close: "Schliessen", thanks_gift: "Danke {name}, ist notiert.",
      err_amount: "Bitte gib einen Betrag über 0 an.", err_taken: "Jemand hat es gerade vor dir ausgewählt.",
      faq_a: "Gut zu", faq_b: "wissen", faq_how_q: "Wie funktioniert es?",
      faq_how_a: "Tippe auf das kleine Symbol unter einem Geschenk und gib deinen Namen an: Es wird für die anderen als vergeben markiert. Zur Reise kann jede und jeder beitragen, so viel man möchte.",
      faq_who_q: "Wer sieht meinen Namen?", faq_who_a: "Niemand ausser uns. Die anderen Gäste sehen nur, dass ein Geschenk vergeben ist oder wie viel für die Reise gesammelt wurde.",
      faq_pay_q: "Wie bezahle ich?", faq_oops_q: "Ich habe mich vertan, was nun?", faq_oops_a: "Kein Problem, schreib uns und wir korrigieren es.",
      list_empty: "Die Wunschliste folgt bald.", loading: "Wird geladen …", load_error: "Laden ist im Moment nicht möglich. Versuche es in ein paar Minuten noch einmal.",
      not_configured: "Die Website ist noch nicht eingerichtet.", merci: "Danke"
    },
    es: {
      nav_home: "Inicio", nav_infos: "Información", nav_list: "La lista", nav_rsvp: "Responder", menu: "Menú",
      hero_tag: "¡Nos casamos!", cd_days: "Faltan {n} días", cd_tomorrow: "¡Es mañana!", cd_today: "¡Es hoy!", cd_past: "Gracias por estar ahí", discover: "Descubrir",
      story_a: "Nuestra", story_b: "historia",
      next_infos: "El programa y la información", next_rsvp: "Responder a la invitación", next_list: "Ver la lista", next_go: "por aquí",
      prog_a: "El", prog_b: "programa", prog_lead: "Cómo será el día, desde el primer «sí» hasta el último baile.", map: "Ver el mapa",
      practical_a: "Información", practical_b: "práctica", soon: "Pronto añadiremos los detalles.",
      rsvp_a: "¿Vienes a", rsvp_b: "celebrar con nosotros", rsvp_c: "?", rsvp_deadline: "Por favor, responde antes del {date}.",
      rsvp_lead: "Dinos si vendrás, nos ayuda mucho con la organización.",
      f_name: "Tu nombre", f_name_hint: "Si vienes acompañado/a, indica también los demás nombres.", f_coming: "¿Vendrás?",
      yes: "Con mucho gusto", no: "No podré ir", f_guests: "Número de personas, contándote a ti", f_diet: "Dieta o alergias",
      f_diet_ph: "Vegetariano, sin gluten…", f_msg: "Unas palabras (opcional)", send: "Enviar", private_rsvp: "Solo nosotros vemos tus respuestas.",
      thanks_title: "Gracias", thanks_yes: "¡Gracias, {name}! Tenemos muchas ganas de verte.", thanks_no: "Gracias, {name}, por avisarnos. ¡Te vamos a echar de menos!",
      rsvp_closed: "Ya no se aceptan respuestas. Si tienes alguna pregunta, escríbenos directamente.", another: "Enviar otra respuesta",
      err_name: "Indica tu nombre.", err_choice: "Dinos si vendrás.", err_send: "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.",
      list_eyebrow: "La lista", list_a: "Algo para", list_b: "hacernos ilusión", list_intro: "Un regalo, un trocito de viaje o nada en absoluto: vuestra presencia ya es lo más importante.",
      fund_pill: "Viaje", fund_of: "{a} de {b}", fund_raised: "{a} recaudados", fund_start: "Todo empieza aquí", contrib_1: "1 aportación", contrib_n: "{n} aportaciones",
      approx: "aprox. {p}", see: "Ver", choose: "Elegir este regalo", join: "Aportar al viaje", taken: "Ya elegido", gift_pill: "Regalo",
      d_gift_sub: "Se marcará como elegido para los demás.", d_fund_sub: "La cantidad que quieras, grande o pequeña.", d_amount: "Cantidad ({cur})",
      d_private: "Solo nosotros vemos tu nombre y tu mensaje.", back: "Volver", confirm: "Confirmar", close: "Cerrar", thanks_gift: "Gracias, {name}, ¡anotado!",
      err_amount: "Indica una cantidad mayor que 0.", err_taken: "Alguien lo acaba de elegir justo antes que tú.",
      faq_a: "Es bueno", faq_b: "saberlo", faq_how_q: "¿Cómo funciona?",
      faq_how_a: "Toca el pequeño icono debajo de un regalo y deja tu nombre: se marcará como elegido para los demás. Para el viaje, cada uno aporta lo que quiera, y pueden participar varias personas.",
      faq_who_q: "¿Quién ve mi nombre?", faq_who_a: "Nadie más que nosotros. Los demás invitados solo ven que un regalo está elegido o cuánto se ha recaudado para el viaje.",
      faq_pay_q: "¿Cómo pago?", faq_oops_q: "Me he equivocado, ¿qué hago?", faq_oops_a: "No pasa nada, escríbenos y lo corregimos.",
      list_empty: "La lista llegará pronto.", loading: "Cargando…", load_error: "No se puede cargar en este momento. Inténtalo de nuevo en unos minutos.",
      not_configured: "El sitio aún no está configurado.", merci: "Gracias"
    }
  };

  // Langue : choix mémorisé, sinon langue de l'appareil, sinon français
  let lang = "fr";
  try { lang = localStorage.getItem("site-lang") || ""; } catch {}
  if (!LANGS.includes(lang)) {
    const nav = (navigator.languages || [navigator.language || "fr"]).map((l) => String(l).slice(0, 2).toLowerCase());
    lang = nav.find((l) => LANGS.includes(l)) || "fr";
  }
  document.documentElement.lang = lang;

  function t(key, vars) {
    let s = (STR[lang] && STR[lang][key]) || STR.fr[key] || key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
    return s;
  }
  function tr(row, field) {
    if (!row) return "";
    const v = row.i18n && row.i18n[lang] && row.i18n[lang][field];
    return (v && String(v).trim()) ? v : (row[field] || "");
  }
  function el(tag, props, ...children) {
    const n = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null) continue;
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v);
    }
    for (const c of children) if (c != null && c !== false) n.append(c);
    return n;
  }
  function safeUrl(u) {
    try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; } catch { return null; }
  }
  const devise = cfg.DEVISE || "CHF";
  function money(n) {
    const v = Number(n) || 0;
    return v.toLocaleString(LOCALES[lang], { maximumFractionDigits: v % 1 ? 2 : 0 }) + " " + devise;
  }
  function parseDate(s) {
    if (!s) return null;
    const [y, m, d] = String(s).split("-").map(Number);
    return y ? new Date(y, (m || 1) - 1, d || 1) : null;
  }
  function fmtLong(d) { return d ? new Intl.DateTimeFormat(LOCALES[lang], { day: "numeric", month: "long", year: "numeric" }).format(d) : ""; }
  function fmtDots(d) {
    if (!d) return "";
    const p = (n) => String(n).padStart(2, "0");
    return p(d.getDate()) + " . " + p(d.getMonth() + 1) + " . " + d.getFullYear();
  }
  function daysUntil(d) {
    if (!d) return null;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((d - now) / 86400000);
  }
  function rsvpOpen(s) {
    if (!s || !s.show_rsvp) return false;
    const dl = parseDate(s.rsvp_deadline);
    return !dl || daysUntil(dl) >= 0;
  }
  function namesNode(names, cls) {
    const h = el("span", { class: cls || "" });
    const parts = String(names || "").split("&");
    if (parts.length === 2) {
      h.append(parts[0].trim() + " ", el("span", { class: "amp", text: "&" }), " " + parts[1].trim());
    } else h.textContent = names || "";
    return h;
  }
  function monogram(s) {
    if (s.logo) return s.logo;
    const parts = String(s.names || "").split("&").map((p) => p.trim()[0]).filter(Boolean);
    return parts.length === 2 ? parts[0] + " & " + parts[1] : "♡";
  }

  const ready = !!(window.supabase && cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("xxxx"));
  const db = ready ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY, { auth: { persistSession: false } }) : null;

  function translateStatic() {
    document.querySelectorAll("[data-t]").forEach((n) => { n.textContent = t(n.getAttribute("data-t")); });
    document.querySelectorAll("[data-t-ph]").forEach((n) => { n.setAttribute("placeholder", t(n.getAttribute("data-t-ph"))); });
  }

  function buildHeader(page, s) {
    const head = document.getElementById("site-head");
    if (!head) return;
    if (page === "home") head.classList.add("on-photo");
    const links = el("nav", { class: "nav-links", id: "nav-links", "aria-label": t("menu") });
    const add = (href, key, id) => links.append(el("a", { href, text: t(key), "aria-current": page === id ? "page" : null }));
    add("./", "nav_home", "home");
    if (s.show_infos) add("infos.html", "nav_infos", "infos");
    if (s.show_list) add("liste.html", "nav_list", "list");
    if (s.show_rsvp) add("rsvp.html", "nav_rsvp", "rsvp");

    const burger = el("button", { class: "burger", type: "button", "aria-label": t("menu"), "aria-expanded": "false", "aria-controls": "nav-links" });
    burger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });

    const langBox = el("div", { class: "lang", role: "group", "aria-label": "Langue / Sprache / Idioma" });
    LANGS.forEach((l) => {
      const b = el("button", { type: "button", text: l.toUpperCase(), "aria-pressed": String(l === lang), lang: l });
      b.addEventListener("click", () => { try { localStorage.setItem("site-lang", l); } catch {} location.reload(); });
      langBox.append(b);
    });
    const right = el("div", { class: "head-right" }, langBox);
    if (rsvpOpen(s) && page !== "rsvp") right.append(el("a", { class: "btn coral", href: "rsvp.html", text: t("nav_rsvp") }));
    right.append(burger);

    head.replaceChildren(el("div", { class: "wrap" }, links, el("a", { class: "monogram", href: "./", text: monogram(s) }), right));
  }

  function buildFooter(s) {
    const f = document.getElementById("site-foot");
    if (!f) return;
    const d = parseDate(s.event_date);
    f.replaceChildren(el("div", { class: "big", text: t("merci") }),
      el("p", { text: [s.names, fmtLong(d), s.place].filter(Boolean).join(" · ") }));
  }

  let settings = null;
  async function init(page) {
    translateStatic();
    if (!db) { showStatus(t("not_configured"), true); return null; }
    const { data, error } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) { console.error(error); showStatus(t("load_error"), true); return null; }
    settings = data;
    const gate = { infos: "show_infos", list: "show_list", rsvp: "show_rsvp" }[page];
    if (gate && !data[gate]) { location.replace("./"); return null; }
    buildHeader(page, data);
    buildFooter(data);
    if (data.names) document.title = data.names + (page === "home" ? "" : " · " + t({ infos: "nav_infos", list: "nav_list", rsvp: "nav_rsvp" }[page] || "nav_home"));
    return data;
  }
  function showStatus(msg, isError) {
    const s = document.getElementById("status");
    if (!s) return;
    s.hidden = false; s.textContent = msg; s.className = "status" + (isError ? " error" : "");
  }

  function reveal(node) {
    node.classList.add("reveal");
    if (!("IntersectionObserver" in window)) { node.classList.add("seen"); return; }
    if (!reveal.io) reveal.io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("seen"); reveal.io.unobserve(e.target); }
    }), { threshold: 0.15 });
    reveal.io.observe(node);
  }

  const ICON_GIFT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12"/><path d="M12 8v12.5"/><path d="M12 8C10.5 4.5 6.5 4 6.5 6.5S10 8 12 8z"/><path d="M12 8c1.5-3.5 5.5-4 5.5-1.5S14 8 12 8z"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  window.Site = { db, lang, t, tr, el, safeUrl, money, parseDate, fmtLong, fmtDots, daysUntil, rsvpOpen, namesNode,
    init, showStatus, reveal, devise, ICON_GIFT, ICON_CHECK, get settings() { return settings; } };
})();
