/* planner.js : organisation du mariage (privée, réservée aux admins)
   Chargé par admin.html. Aucune clé secrète ici : la sécurité vient des règles de la base (plan_setup.sql). */
(function () {
  "use strict";
  const cfg = window.LISTE_CONFIG || {};
  const devise = cfg.DEVISE || "CHF";
  const URG = [["urgent", "Urgent"], ["bientot", "Bientôt"], ["plustard", "Plus tard"]];
  const TASK_CATS = ["Administratif", "Lieu", "Prestataires", "Organisation", "Style"];
  const GUEST_CATS = [["famille", "Famille"], ["amis_famille", "Amis de la famille"], ["amis", "Amis"], ["temoins", "Témoins"]];
  const SIDES = [["kira", "Côté Kira"], ["dan", "Côté Dan"]];

  let db, el, lastLoad = 0, taskFilter = "all", importMsg = "";
  const S = { error: "", settings: { total_budget: 14000, notes: "" }, tasks: [], cats: [], expenses: [], contribs: [], savings: [], guests: [] };
  const $ = (id) => document.getElementById(id);
  const n0 = (v) => Number(v) || 0;
  const fmt = (n) => n0(n).toLocaleString("fr-CH", { maximumFractionDigits: 2 });
  const money = (n) => fmt(n) + " " + devise;
  const sum = (arr, k) => arr.reduce((a, x) => a + n0(x[k]), 0);
  const nextPos = (arr) => arr.reduce((m, x) => Math.max(m, n0(x.position)), 0) + 1;

  // ---------- Style ----------
  const CSS = `
  [data-pane^="plan-"] .pl-banner { background:#fff; border:1.5px solid var(--line); border-radius:16px; padding:16px 18px; margin-top:14px; }
  [data-pane^="plan-"] .pl-chips { display:flex; gap:6px; flex-wrap:wrap; margin:8px 0 14px; }
  [data-pane^="plan-"] .pl-chip { font:inherit; font-size:.85rem; padding:5px 13px; border-radius:999px; border:1.5px solid var(--line); background:#fff; color:var(--ink); cursor:pointer; }
  [data-pane^="plan-"] .pl-chip.on { background:var(--ink); border-color:var(--ink); color:#fff; }
  [data-pane^="plan-"] .pl-board { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; align-items:start; }
  [data-pane^="plan-"] .pl-col { background:#e4edf5; border-radius:18px; padding:12px; }
  [data-pane^="plan-"] .pl-col-head { display:flex; align-items:center; gap:8px; margin-bottom:10px; padding:0 4px; }
  [data-pane^="plan-"] .pl-count { margin-left:auto; color:var(--muted); font-size:.85rem; }
  [data-pane^="plan-"] .pl-dot { width:10px; height:10px; border-radius:50%; flex:none; }
  [data-pane^="plan-"] .pl-dot.urgent { background:var(--coral-2); }
  [data-pane^="plan-"] .pl-dot.bientot { background:var(--dusty); }
  [data-pane^="plan-"] .pl-dot.plustard { background:#b9cfdf; }
  [data-pane^="plan-"] .pl-card { background:#fff; border:1.5px solid var(--line); border-radius:14px; padding:10px 12px; margin-bottom:8px; }
  [data-pane^="plan-"] .pl-card.done { opacity:.5; }
  [data-pane^="plan-"] .pl-card.done .pl-title { text-decoration:line-through; }
  [data-pane^="plan-"] .pl-card-top { display:flex; gap:8px; align-items:flex-start; }
  [data-pane^="plan-"] input.pl-chk { width:18px; height:18px; padding:0; margin-top:4px; accent-color:var(--fund); flex:none; }
  [data-pane^="plan-"] input.pl-title { border:0; background:none; padding:2px 0; border-radius:0; font-size:.95rem; min-width:0; }
  [data-pane^="plan-"] .pl-card-meta { display:flex; gap:6px; align-items:center; margin-top:6px; flex-wrap:wrap; }
  [data-pane^="plan-"] .pl-card-meta select { width:auto; font-size:.8rem; padding:3px 8px; border-radius:8px; }
  [data-pane^="plan-"] .pl-add { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; background:#e4edf5; padding:12px; border-radius:16px; }
  [data-pane^="plan-"] .pl-add input[type=text] { flex:1; min-width:160px; width:auto; }
  [data-pane^="plan-"] .pl-add select { width:auto; }
  [data-pane^="plan-"] .pl-add input[type=number] { width:110px; }
  [data-pane^="plan-"] .pl-add .btn { padding:10px 18px; }
  [data-pane^="plan-"] .pl-table input, [data-pane^="plan-"] .pl-table select { padding:5px 8px; border-radius:8px; font-size:.9rem; }
  [data-pane^="plan-"] .pl-table input.pl-name { border-color:transparent; background:transparent; min-width:150px; font-weight:500; }
  [data-pane^="plan-"] .pl-table input.pl-name:focus { background:#fff; border-color:var(--fund); }
  [data-pane^="plan-"] .pl-table input[type=number] { width:84px; }
  [data-pane^="plan-"] .pl-table select { width:auto; }
  [data-pane^="plan-"] .pl-table td.num { white-space:nowrap; font-variant-numeric:tabular-nums; }
  [data-pane^="plan-"] .pl-table td.over { color:#a8433a; font-weight:700; }
  [data-pane^="plan-"] .pl-table tfoot td { font-weight:700; border-bottom:0; }
  [data-pane^="plan-"] .pl-table tr.pl-dinner td { background:#d6ecd9; }
  [data-pane^="plan-"] .pl-table input.pl-warn { border-color:#a8433a; }
  [data-pane^="plan-"] .pl-target { font-family:var(--display); font-weight:800; font-size:2rem; letter-spacing:-.04em; border:0; border-bottom:1.5px dashed var(--line); border-radius:0; padding:0; background:none; width:100%; }
  [data-pane^="plan-"] .pl-rows .item-row .amt { font-variant-numeric:tabular-nums; font-weight:600; white-space:nowrap; }
  [data-pane^="plan-"] .pl-bar { height:22px; border-radius:999px; background:#e4edf5; overflow:hidden; margin:16px 0 6px; }
  [data-pane^="plan-"] .pl-bar > i { display:block; height:100%; background:var(--fund); border-radius:999px; transition:width .4s; }
  [data-pane^="plan-"] .pl-mrow { display:flex; align-items:center; gap:10px; padding:6px 0; }
  [data-pane^="plan-"] .pl-mrow .lbl { width:110px; flex:none; font-size:.85rem; color:var(--muted); }
  [data-pane^="plan-"] .pl-mrow .trk { flex:1; height:14px; border-radius:8px; background:#e4edf5; overflow:hidden; }
  [data-pane^="plan-"] .pl-mrow .trk i { display:block; height:100%; background:var(--dusty); border-radius:8px; }
  [data-pane^="plan-"] .pl-mrow .amt { width:110px; flex:none; text-align:right; font-variant-numeric:tabular-nums; font-size:.92rem; }
  [data-pane^="plan-"] textarea.pl-notes { min-height:380px; line-height:1.6; }
  @media (max-width:820px) { [data-pane^="plan-"] .pl-board { grid-template-columns:1fr; } }
  `;

  // ---------- Petits outils ----------
  function input(type, value, onChange, props) {
    const i = el("input", Object.assign({ type }, props || {}));
    i.value = value == null ? "" : value;
    if (onChange) i.addEventListener("change", () => onChange(i.value, i));
    return i;
  }
  function select(options, value, onChange, props) {
    const s = el("select", props || null);
    options.forEach(([v, l]) => s.append(el("option", { value: v, text: l })));
    s.value = value;
    if (onChange) s.addEventListener("change", () => onChange(s.value));
    return s;
  }
  function btn(text, onClick, cls) {
    const b = el("button", { type: "button", class: "btn " + (cls || ""), text });
    b.addEventListener("click", onClick);
    return b;
  }
  const delBtn = (onClick) => btn("✕", onClick, "danger small");
  function csv(name, headers, rows) {
    const q = (v) => { const s = v == null ? "" : String(v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const text = "\ufeff" + [headers, ...rows].map((r) => r.map(q).join(";")).join("\r\n");
    const a = el("a", { href: URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" })), download: name });
    document.body.append(a); a.click(); a.remove();
  }
  function banner(host) {
    if (!S.error) return false;
    host.append(el("div", { class: "pl-banner" },
      el("p", { style: "margin:0 0 6px", text: "Les données d'organisation n'ont pas pu être chargées." }),
      el("p", { class: "hint", text: S.error + " — As-tu lancé le script plan_setup.sql dans Supabase (SQL Editor) ?" })));
    return true;
  }
  const kpi = (v, l) => el("div", { class: "kpi" }, el("b", { text: String(v) }), el("span", { text: l }));

  // ---------- Base de données ----------
  async function run(q) {
    const { data, error } = await q;
    if (error) { console.error(error); alert("L'enregistrement n'a pas fonctionné (" + error.message + ")."); await loadAll(); return null; }
    return data === null || data === undefined ? true : data;
  }
  async function save(table, row, patch, after) {
    Object.assign(row, patch);
    if (after) after();
    await run(db.from(table).update(patch).eq("id", row.id));
  }
  async function add(table, row, list, after) {
    const r = await run(db.from(table).insert(row).select().single());
    if (r && r !== true) { list.push(r); if (after) after(); }
  }
  async function remove(table, id, list, after) {
    const i = list.findIndex((x) => x.id === id);
    if (i > -1) list.splice(i, 1);
    if (after) after();
    await run(db.from(table).delete().eq("id", id));
  }

  async function loadAll() {
    const byPos = (t) => db.from(t).select("*").order("position", { ascending: true }).order("created_at", { ascending: true });
    const byDate = (t) => db.from(t).select("*").order("created_at", { ascending: true });
    const res = await Promise.all([
      db.from("plan_settings").select("*").eq("id", 1).maybeSingle(),
      byPos("plan_tasks"), byPos("plan_categories"), byDate("plan_expenses"), byDate("plan_contributions"), byDate("plan_savings"), byPos("plan_guests")
    ]);
    const bad = res.find((r) => r.error);
    S.error = bad ? bad.error.message : "";
    if (!bad) {
      S.settings = res[0].data || S.settings;
      S.tasks = res[1].data || []; S.cats = res[2].data || []; S.expenses = res[3].data || [];
      S.contribs = res[4].data || []; S.savings = res[5].data || []; S.guests = res[6].data || [];
    }
    lastLoad = Date.now();
    renderAll();
  }

  // ---------- Tâches ----------
  function renderTasks() {
    const host = $("plan-tasks"); if (!host) return; host.replaceChildren();
    if (banner(host)) return;
    const cats = [...new Set([...TASK_CATS, ...S.tasks.map((t) => t.category)])];
    const chips = el("div", { class: "pl-chips" });
    [["all", "Toutes"], ...cats.map((c) => [c, c])].forEach(([v, l]) => {
      const b = el("button", { type: "button", class: "pl-chip" + (taskFilter === v ? " on" : ""), text: l });
      b.addEventListener("click", () => { taskFilter = v; renderTasks(); });
      chips.append(b);
    });
    const board = el("div", { class: "pl-board" });
    URG.forEach(([u, label]) => {
      const items = S.tasks.filter((t) => t.urgency === u && (taskFilter === "all" || t.category === taskFilter)).sort((a, b) => a.done - b.done);
      const col = el("div", { class: "pl-col" }, el("div", { class: "pl-col-head" },
        el("span", { class: "pl-dot " + u }), el("b", { text: label }), el("span", { class: "pl-count", text: String(items.filter((t) => !t.done).length) })));
      items.forEach((t) => col.append(taskCard(t, cats)));
      if (!items.length) col.append(el("p", { class: "hint", style: "padding:4px", text: "Rien ici" }));
      board.append(col);
    });
    const title = input("text", "", null, { placeholder: "Nouvelle tâche…", maxlength: 200 });
    const cat = select(cats.map((c) => [c, c]), cats[0]);
    const urg = select(URG, "urgent");
    const go = async () => {
      const v = title.value.trim(); if (!v) return;
      title.value = "";
      await add("plan_tasks", { title: v, category: cat.value, urgency: urg.value, position: nextPos(S.tasks) }, S.tasks, renderTasks);
    };
    title.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    host.append(chips, board, el("div", { class: "pl-add" }, title, cat, urg, btn("Ajouter", go)));
  }
  function taskCard(t, cats) {
    const chk = el("input", { type: "checkbox", class: "pl-chk", "aria-label": "Fait" }); chk.checked = !!t.done;
    chk.addEventListener("change", () => save("plan_tasks", t, { done: chk.checked }, renderTasks));
    const title = input("text", t.title, (v) => { if (!v.trim()) return renderTasks(); save("plan_tasks", t, { title: v.trim() }); }, { class: "pl-title", maxlength: 200 });
    return el("div", { class: "pl-card" + (t.done ? " done" : "") },
      el("div", { class: "pl-card-top" }, chk, title),
      el("div", { class: "pl-card-meta" },
        select(cats.map((c) => [c, c]), t.category, (v) => save("plan_tasks", t, { category: v }, renderTasks)),
        select(URG, t.urgency, (v) => save("plan_tasks", t, { urgency: v }, renderTasks)),
        delBtn(() => { if (confirm("Supprimer cette tâche ?")) remove("plan_tasks", t.id, S.tasks, renderTasks); })));
  }

  // ---------- Budget ----------
  function renderBudget() {
    const host = $("plan-budget"); if (!host) return; host.replaceChildren();
    if (banner(host)) return;
    const total = n0(S.settings.total_budget), spent = sum(S.expenses, "amount"), gifts = sum(S.contribs, "amount");
    const target = input("number", total, async (v) => {
      S.settings.total_budget = Math.max(0, n0(v)); renderBudget(); renderSavings();
      await run(db.from("plan_settings").update({ total_budget: S.settings.total_budget }).eq("id", 1));
    }, { class: "pl-target", min: "0" });
    host.append(el("div", { class: "kpis" },
      el("div", { class: "kpi" }, target, el("span", { text: "budget cible (" + devise + ")" })),
      kpi(money(spent), "dépensé"), kpi(money(gifts), "cadeaux reçus"), kpi(money(total - spent + gifts), "restant")));

    // Catégories (tableau façon Excel)
    const estSum = sum(S.cats, "estimated");
    const tb = el("tbody");
    S.cats.forEach((c) => {
      const s = sum(S.expenses.filter((x) => x.category_id === c.id), "amount"), rest = n0(c.estimated) - s;
      tb.append(el("tr", null,
        el("td", null, input("text", c.name, (v) => { if (v.trim()) save("plan_categories", c, { name: v.trim() }, renderBudget); else renderBudget(); }, { class: "pl-name", maxlength: 100 })),
        el("td", null, input("number", c.estimated, (v) => save("plan_categories", c, { estimated: Math.max(0, n0(v)) }, renderBudget), { min: "0" })),
        el("td", { class: "num", text: fmt(s) }),
        el("td", { class: "num" + (rest < 0 ? " over" : ""), text: fmt(rest) }),
        el("td", null, delBtn(() => {
          if (!confirm("Supprimer « " + c.name + " » et toutes ses dépenses ?")) return;
          S.expenses = S.expenses.filter((x) => x.category_id !== c.id);
          remove("plan_categories", c.id, S.cats, renderBudget);
        }))));
    });
    const foot = el("tfoot", null, el("tr", null, el("td", { text: "Total" }), el("td", { class: "num", text: fmt(estSum) }),
      el("td", { class: "num", text: fmt(spent) }), el("td", { class: "num" + (estSum - spent < 0 ? " over" : ""), text: fmt(estSum - spent) }), el("td")));
    host.append(el("h2", { text: "Catégories" }),
      el("p", { class: "hint", text: "Clique un nom ou un montant pour le modifier. Total estimé : " + money(estSum) + " pour un budget cible de " + money(total) + "." }),
      el("div", { class: "panel scroll" }, el("table", { class: "pl-table" },
        el("thead", null, el("tr", null, ...["Catégorie", "Estimé", "Dépensé", "Restant", ""].map((h) => el("th", { text: h })))), tb, foot)));
    const cName = input("text", "", null, { placeholder: "Nouvelle catégorie…", maxlength: 100 }), cEst = input("number", "", null, { placeholder: "Estimé", min: "0" });
    const addCat = async () => {
      const v = cName.value.trim(); if (!v) return;
      cName.value = ""; const e = n0(cEst.value); cEst.value = "";
      await add("plan_categories", { name: v, estimated: e, position: nextPos(S.cats) }, S.cats, renderBudget);
    };
    cName.addEventListener("keydown", (e) => { if (e.key === "Enter") addCat(); });
    host.append(el("div", { class: "pl-add" }, cName, cEst, btn("Ajouter la catégorie", addCat)));

    // Dépenses
    const exHead = el("div", { class: "toolbar" }, el("h2", { style: "margin:34px 0 0", text: "Dépenses" }),
      btn("Exporter pour Excel", () => csv("depenses.csv", ["Catégorie", "Description", "Montant", "Date"],
        S.expenses.map((x) => { const c = S.cats.find((k) => k.id === x.category_id); return [c ? c.name : "", x.description, x.amount, new Date(x.created_at).toLocaleDateString("fr-CH")]; })), "ghost small"));
    host.append(exHead);
    if (S.cats.length) {
      const eCat = select(S.cats.map((c) => [c.id, c.name]), S.cats[0].id), eDesc = input("text", "", null, { placeholder: "Description (ex. acompte salle)", maxlength: 200 }), eAmt = input("number", "", null, { placeholder: "Montant", step: "0.05" });
      const addExp = async () => {
        if (!eAmt.value) return;
        const row = { category_id: eCat.value, description: eDesc.value.trim(), amount: n0(eAmt.value) };
        await add("plan_expenses", row, S.expenses, renderBudget);
      };
      eDesc.addEventListener("keydown", (e) => { if (e.key === "Enter") addExp(); });
      host.append(el("div", { class: "pl-add" }, eCat, eDesc, eAmt, btn("Ajouter la dépense", addExp)));
    }
    host.append(rowsPanel(S.expenses.slice().reverse(), "Aucune dépense enregistrée.", (x) => {
      const c = S.cats.find((k) => k.id === x.category_id);
      return [el("span", { class: "tag blue", text: c ? c.name : "—" }), document.createTextNode(x.description || "")];
    }, (x) => "-" + fmt(x.amount), (x) => remove("plan_expenses", x.id, S.expenses, renderBudget)));

    // Cadeaux et contributions reçus
    host.append(el("h2", { text: "Cadeaux et contributions reçus" }),
      el("p", { class: "hint", text: "L'argent qu'on vous donne (famille, amis…) s'ajoute au « restant » ci-dessus." }));
    const gDesc = input("text", "", null, { placeholder: "De qui / pour quoi (ex. cadeau de grand-maman)", maxlength: 200 }), gAmt = input("number", "", null, { placeholder: "Montant", step: "0.05" });
    const addGift = async () => { if (!gAmt.value) return; await add("plan_contributions", { description: gDesc.value.trim(), amount: n0(gAmt.value) }, S.contribs, renderBudget); };
    gDesc.addEventListener("keydown", (e) => { if (e.key === "Enter") addGift(); });
    host.append(el("div", { class: "pl-add" }, gDesc, gAmt, btn("Ajouter", addGift)),
      rowsPanel(S.contribs.slice().reverse(), "Aucun cadeau enregistré.", (x) => [document.createTextNode(x.description || "")], (x) => "+" + fmt(x.amount),
        (x) => remove("plan_contributions", x.id, S.contribs, renderBudget)));
  }
  function rowsPanel(list, emptyText, left, amount, onDelete) {
    const p = el("div", { class: "panel pl-rows" });
    if (!list.length) p.append(el("p", { class: "hint", text: emptyText }));
    list.forEach((x) => p.append(el("div", { class: "item-row" },
      el("span", { class: "lt" }, ...left(x)), el("span", { class: "acts" }, el("span", { class: "amt", text: amount(x) + " " + devise }),
        delBtn(() => { if (confirm("Supprimer cette ligne ?")) onDelete(x); })))));
    return p;
  }

  // ---------- Épargne ----------
  function renderSavings() {
    const host = $("plan-savings"); if (!host) return; host.replaceChildren();
    if (banner(host)) return;
    const target = n0(S.settings.total_budget), saved = sum(S.savings, "amount");
    const pct = target > 0 ? Math.min(100, saved / target * 100) : 0;
    host.append(el("div", { class: "kpis" }, kpi(money(target), "objectif (= budget cible)"), kpi(money(saved), "déjà épargné"), kpi(money(Math.max(0, target - saved)), "reste à épargner")),
      el("div", { class: "pl-bar", role: "progressbar", "aria-valuenow": String(Math.round(pct)), "aria-valuemin": "0", "aria-valuemax": "100" }, el("i", { style: "width:" + pct + "%" })),
      el("p", { class: "hint", style: "text-align:right", text: Math.round(pct) + " %" }),
      el("h2", { text: "Versements" }));
    const month = input("text", "", null, { placeholder: "Mois (ex. Décembre 2026)", maxlength: 40 }), amt = input("number", "", null, { placeholder: "Montant", step: "0.05" }), note = input("text", "", null, { placeholder: "Note (facultatif)", maxlength: 120 });
    const go = async () => {
      if (!month.value.trim() || !amt.value) return;
      await add("plan_savings", { month: month.value.trim(), amount: n0(amt.value), note: note.value.trim() }, S.savings, renderSavings);
    };
    host.append(el("div", { class: "pl-add" }, month, amt, note, btn("Ajouter", go)));
    const max = S.savings.reduce((m, x) => Math.max(m, n0(x.amount)), 0);
    const p = el("div", { class: "panel" });
    if (!S.savings.length) p.append(el("p", { class: "hint", text: "Aucun versement pour le moment." }));
    S.savings.forEach((x) => p.append(el("div", { class: "pl-mrow" },
      el("span", { class: "lbl", text: x.month }), el("span", { class: "trk" }, el("i", { style: "width:" + (max ? n0(x.amount) / max * 100 : 0) + "%" })),
      el("span", { class: "amt", title: x.note || "", text: fmt(x.amount) + " " + devise }),
      delBtn(() => { if (confirm("Supprimer ce versement ?")) remove("plan_savings", x.id, S.savings, renderSavings); }))));
    host.append(p);
  }

  // ---------- Invités (planning) ----------
  function renderGuests() {
    const host = $("plan-guests"); if (!host) return; host.replaceChildren();
    if (banner(host)) return;
    host.append(el("div", { class: "kpis" }, kpi(sum(S.guests, "civil_count"), "au civil"), kpi(sum(S.guests, "ceremony_count"), "à la cérémonie (total invités)"), kpi(sum(S.guests, "dinner_count"), "au souper")),
      el("div", { class: "toolbar", style: "margin-top:18px" }, el("p", { class: "hint", text: "Les lignes vertes sont celles où au moins une personne vient au souper." }),
        btn("Exporter pour Excel", () => csv("invites-organisation.csv", ["Côté", "Nom", "Catégorie", "Cérémonie", "Souper", "Civil"],
          S.guests.map((g) => [g.side === "kira" ? "Kira" : "Dan", g.name, (GUEST_CATS.find((c) => c[0] === g.category) || [0, g.category])[1], g.ceremony_count, g.dinner_count, g.civil_count])), "ghost small")));
    SIDES.forEach(([side, label]) => host.append(guestSide(side, label)));
  }
  function guestSide(side, label) {
    const rows = S.guests.filter((g) => g.side === side);
    const tb = el("tbody");
    rows.forEach((g) => {
      const cnt = (k, warn) => input("number", g[k], (v) => save("plan_guests", g, { [k]: Math.max(0, Math.round(n0(v))) }, renderGuests), { min: "0", class: warn ? "pl-warn" : null, title: warn ? "Plus que le nombre d'invités" : null });
      tb.append(el("tr", { class: g.dinner_count > 0 ? "pl-dinner" : null },
        el("td", null, input("text", g.name, (v) => { if (v.trim()) save("plan_guests", g, { name: v.trim() }); else renderGuests(); }, { class: "pl-name", maxlength: 200 })),
        el("td", null, select(GUEST_CATS, g.category, (v) => save("plan_guests", g, { category: v }))),
        el("td", null, cnt("ceremony_count")), el("td", null, cnt("dinner_count", g.dinner_count > g.ceremony_count)), el("td", null, cnt("civil_count", g.civil_count > g.ceremony_count)),
        el("td", null, delBtn(() => { if (confirm("Supprimer « " + g.name + " » ?")) remove("plan_guests", g.id, S.guests, renderGuests); }))));
    });
    if (!rows.length) tb.append(el("tr", null, el("td", { colspan: "6", class: "hint", text: "Aucun invité de ce côté." })));
    const tot = (k) => sum(rows, k);
    const name = input("text", "", null, { placeholder: "Nom ou groupe…", maxlength: 200 }), cat = select(GUEST_CATS, "amis");
    const c1 = input("number", "1", null, { min: "0", title: "Cérémonie" }), c2 = input("number", "0", null, { min: "0", title: "Souper" }), c3 = input("number", "0", null, { min: "0", title: "Civil" });
    const go = async () => {
      const v = name.value.trim(); if (!v) return;
      name.value = ""; const row = { name: v, side, category: cat.value, ceremony_count: n0(c1.value), dinner_count: n0(c2.value), civil_count: n0(c3.value), position: nextPos(S.guests) };
      c1.value = "1"; c2.value = "0"; c3.value = "0";
      await add("plan_guests", row, S.guests, renderGuests);
    };
    name.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    return el("div", null,
      el("h2", { text: label + " · " + tot("ceremony_count") + " cérémonie · " + tot("dinner_count") + " souper · " + tot("civil_count") + " civil" }),
      el("div", { class: "panel scroll" }, el("table", { class: "pl-table" },
        el("thead", null, el("tr", null, ...["Nom", "Catégorie", "Cérémonie", "Souper", "Civil", ""].map((h) => el("th", { text: h })))), tb)),
      el("div", { class: "pl-add" }, name, cat, el("span", { class: "hint", style: "align-self:center", text: "cér. / souper / civil" }), c1, c2, c3, btn("Ajouter", go)));
  }

  // ---------- Notes, sauvegarde et import ----------
  function renderNotes() {
    const host = $("plan-notes"); if (!host) return;
    if (document.activeElement && document.activeElement.id === "pl-notes-ta") return; // ne pas écraser pendant la frappe
    host.replaceChildren();
    if (banner(host)) return;
    const ta = el("textarea", { class: "pl-notes", id: "pl-notes-ta", placeholder: "Écris ici…" });
    ta.value = S.settings.notes || "";
    const ok = el("span", { class: "ok", hidden: true, text: "Enregistré" });
    let timer;
    ta.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        S.settings.notes = ta.value;
        const r = await run(db.from("plan_settings").update({ notes: ta.value }).eq("id", 1));
        if (r) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 1500); }
      }, 700);
    });
    host.append(ta, el("div", { class: "row", style: "margin-top:8px" }, ok));

    // Sauvegarde et import de l'ancien outil
    const paste = el("textarea", { placeholder: "Colle ici le contenu exporté depuis l'ancien tableau de bord…", style: "min-height:120px;font-family:monospace;font-size:.8rem" });
    const status = el("p", { class: "hint", style: "margin-top:8px", text: importMsg });
    const importBtn = btn("Importer", async () => {
      importBtn.disabled = true; importMsg = ""; status.textContent = "Import en cours…";
      try { importMsg = await importLegacy(paste.value); paste.value = ""; await loadAll(); }
      catch (e) { console.error(e); importMsg = "L'import a échoué : " + (e.message || e); status.textContent = importMsg; }
      importBtn.disabled = false;
    });
    host.append(el("h2", { text: "Sauvegarde et import" }),
      el("div", { class: "panel" },
        el("p", { class: "hint", text: "Une copie complète de toutes les données d'organisation, à garder au chaud." }),
        el("div", { class: "row", style: "margin-top:10px;justify-content:flex-start" }, btn("Télécharger une sauvegarde", () => {
          const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), settings: S.settings, tasks: S.tasks, categories: S.cats, expenses: S.expenses, contributions: S.contribs, savings: S.savings, guests: S.guests }, null, 2)], { type: "application/json" });
          const a = el("a", { href: URL.createObjectURL(blob), download: "sauvegarde-organisation.json" }); document.body.append(a); a.click(); a.remove();
        }, "ghost small")),
        el("h3", { style: "margin:22px 0 6px;font-size:1.05rem", text: "Importer l'ancien outil" }),
        el("p", { class: "hint", text: "Dans l'ancien tableau de bord, bouton « Exporter pour le site », puis colle le texte ici." }), paste,
        el("div", { class: "row", style: "justify-content:flex-start;margin-top:10px" }, importBtn), status));
  }

  async function must(q) { const { data, error } = await q; if (error) throw error; return data; }
  async function importLegacy(raw) {
    let d; try { d = JSON.parse(raw); } catch (e) { return "Ce texte n'est pas un export valide : rien n'a été importé."; }
    const arr = (v) => (Array.isArray(v) ? v : []);
    const tasks = arr(d.tasks), b = d.budget || {}, cats = arr(b.categories), exps = arr(b.expenses), gifts = arr(b.contributions), sav = arr((d.savings || {}).entries), guests = arr(d.guests);
    if (!tasks.length && !cats.length && !guests.length && !sav.length) return "Rien à importer dans ce texte.";
    const hasData = S.tasks.length || S.cats.length || S.guests.length || S.savings.length || S.expenses.length;
    if (hasData && !confirm("Il y a déjà des données dans l'organisation. Ajouter celles de l'ancien outil en plus (risque de doublons) ?")) return "Import annulé.";
    const U = ["urgent", "bientot", "plustard"], GC = GUEST_CATS.map((c) => c[0]);
    const chunk = async (table, rows) => { for (let i = 0; i < rows.length; i += 100) await must(db.from(table).insert(rows.slice(i, i + 100))); };
    await chunk("plan_tasks", tasks.map((t, i) => ({ title: String(t.title || "Sans titre").slice(0, 200), category: t.cat || "Organisation", urgency: U.includes(t.urg) ? t.urg : "bientot", done: !!t.done, position: nextPos(S.tasks) + i })));
    const map = {};
    for (let i = 0; i < cats.length; i++) {
      const r = await must(db.from("plan_categories").insert({ name: String(cats[i].name || "Catégorie").slice(0, 100), estimated: n0(cats[i].estimated), position: nextPos(S.cats) + i }).select().single());
      map[cats[i].id] = r.id;
    }
    const okExp = exps.filter((x) => map[x.cat]);
    await chunk("plan_expenses", okExp.map((x) => ({ category_id: map[x.cat], description: String(x.desc || "").slice(0, 200), amount: n0(x.amount) })));
    await chunk("plan_contributions", gifts.map((x) => ({ description: String(x.desc || "").slice(0, 200), amount: n0(x.amount) })));
    await chunk("plan_savings", sav.map((x) => ({ month: String(x.month || "").slice(0, 40), amount: n0(x.amount), note: String(x.note || "").slice(0, 120) })));
    await chunk("plan_guests", guests.map((g, i) => ({
      name: String(g.name || "Sans nom").slice(0, 200), side: g.side === "dan" ? "dan" : "kira", category: GC.includes(g.cat) ? g.cat : "amis",
      ceremony_count: Math.max(0, Math.round(n0(g.count))), dinner_count: Math.max(0, Math.round(g.dinnerCount != null ? n0(g.dinnerCount) : (g.dinner ? n0(g.count) : 0))),
      civil_count: Math.max(0, Math.round(n0(g.civilCount))), position: nextPos(S.guests) + i })));
    const patch = {};
    if (b.totalBudget != null) patch.total_budget = Math.max(0, n0(b.totalBudget));
    if (d.notes && String(d.notes).trim()) patch.notes = (S.settings.notes ? S.settings.notes + "\n\n" : "") + d.notes;
    if (Object.keys(patch).length) await must(db.from("plan_settings").update(patch).eq("id", 1));
    return "Importé : " + tasks.length + " tâches, " + cats.length + " catégories, " + okExp.length + " dépenses, " + gifts.length + " cadeaux, " + sav.length + " versements, " + guests.length + " invités." + (exps.length - okExp.length ? " (" + (exps.length - okExp.length) + " dépense(s) sans catégorie ignorée(s).)" : "");
  }

  // ---------- Démarrage ----------
  function renderAll() { renderTasks(); renderBudget(); renderSavings(); renderGuests(); renderNotes(); }
  function isPlanPane() { const p = document.querySelector("[data-pane]:not([hidden])"); return !!p && /^plan-/.test(p.dataset.pane); }

  window.Planner = {
    start(ctx) {
      if (db) return;
      db = ctx.db; el = ctx.el;
      const st = document.createElement("style"); st.textContent = CSS; document.head.append(st);
      window.addEventListener("focus", () => { if (isPlanPane() && Date.now() - lastLoad > 15000) loadAll(); });
      loadAll();
    },
    onShow(name) { if (db && /^plan-/.test(name) && Date.now() - lastLoad > 4000) loadAll(); }
  };
})();
