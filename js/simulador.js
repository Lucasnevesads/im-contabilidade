/* =========================================================
   IM Contabilidade, Simulador de plano (wizard)
   Renderiza em #simApp. Estima plano + faixa de valor e
   entrega o lead pronto no WhatsApp.
   ========================================================= */
(function () {
  const app = document.getElementById("simApp");
  if (!app) return;

  /* ---- Ícones ---- */
  const ic = {
    mei: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h6"/>',
    rocket: '<path d="M12 3c3 1 6 4 6 9l-3 3-3 1-1-1 1-3 3-3M9 15l-3 3M6 12l-3 3M12 21l-2-4"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7"/>',
    scale: '<path d="M12 3v18M6 21h12M5 7l-3 6h6zM19 7l-3 6h6zM5 7h14"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1 1.3-1.5 3-1.5s3 .8 3 2-1.5 2-3 2-3 .8-3 2 1.3 2 3 2 3-.5 3-1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 010 6M21 20c0-2-1-3.5-3-4.5"/>',
    doc: '<path d="M7 3h7l4 4v14H7zM14 3v4h4"/><path d="M10 13h5M10 16h5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
  };
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

  /* ---- Definição dos passos ---- */
  const steps = [
    {
      key: "tipo",
      title: "Qual o seu perfil hoje?",
      sub: "Isso define o ponto de partida do seu plano.",
      type: "choice",
      options: [
        { v: "mei", t: "Sou MEI", d: "Microempreendedor individual", i: ic.mei },
        { v: "autonomo", t: "Autônomo / Liberal", d: "Presto serviço como PF", i: ic.user },
        { v: "empresa", t: "Já tenho empresa", d: "ME, EPP ou LTDA", i: ic.building },
        { v: "abrir", t: "Quero abrir empresa", d: "Ainda não tenho CNPJ", i: ic.rocket },
      ],
    },
    {
      key: "regime",
      title: "Qual o regime tributário?",
      sub: "Se não souber, a gente identifica o melhor pra você.",
      type: "choice",
      showIf: (s) => s.tipo === "empresa" || s.tipo === "abrir",
      options: [
        { v: "simples", t: "Simples Nacional", d: "O mais comum p/ pequenas", i: ic.layers },
        { v: "presumido", t: "Lucro Presumido", d: "Faturamento maior", i: ic.chart },
        { v: "real", t: "Lucro Real", d: "Estrutura mais complexa", i: ic.scale },
        { v: "nao-sei", t: "Não sei ainda", d: "A IM te orienta", i: ic.user },
      ],
    },
    {
      key: "faturamento",
      title: "Qual o faturamento mensal médio?",
      sub: "Uma estimativa já basta.",
      type: "choice",
      options: [
        { v: "ate-15k", t: "Até R$ 15 mil", d: "", i: ic.money },
        { v: "15-50k", t: "R$ 15 mil a 50 mil", d: "", i: ic.money },
        { v: "50-150k", t: "R$ 50 mil a 150 mil", d: "", i: ic.money },
        { v: "150k+", t: "Acima de R$ 150 mil", d: "", i: ic.money },
      ],
    },
    {
      key: "funcionarios",
      title: "Quantos funcionários registrados?",
      sub: "Inclui folha de pagamento e obrigações do DP.",
      type: "choice",
      options: [
        { v: "0", t: "Nenhum", d: "Sem folha por enquanto", i: ic.user },
        { v: "1-3", t: "1 a 3", d: "", i: ic.users },
        { v: "4-10", t: "4 a 10", d: "", i: ic.users },
        { v: "10+", t: "Mais de 10", d: "", i: ic.users },
      ],
    },
    {
      key: "notas",
      title: "Qual o volume de notas fiscais por mês?",
      sub: "Ajuda a dimensionar a parte fiscal.",
      type: "choice",
      options: [
        { v: "baixo", t: "Poucas (até 20)", d: "", i: ic.doc },
        { v: "medio", t: "Médio (20 a 100)", d: "", i: ic.doc },
        { v: "alto", t: "Alto (mais de 100)", d: "", i: ic.doc },
      ],
    },
    {
      key: "contato",
      title: "Pronto! Pra onde enviamos sua proposta?",
      sub: "Sem compromisso, a IM responde em até 5 minutos no horário comercial.",
      type: "form",
    },
  ];

  /* ---- Preços (base de estimativa mensal em R$) ---- */
  function calc(s) {
    let base = 0;
    if (s.tipo === "mei") base = 120;
    else if (s.tipo === "autonomo") base = 160;
    else {
      const reg = { simples: 320, presumido: 560, real: 980, "nao-sei": 350 };
      base = reg[s.regime] || 350;
    }
    const fat = { "ate-15k": 0, "15-50k": 90, "50-150k": 220, "150k+": 480 };
    const func = { "0": 0, "1-3": 100, "4-10": 260, "10+": 520 };
    const nf = { baixo: 0, medio: 70, alto: 180 };

    let total = base + (fat[s.faturamento] || 0) + (func[s.funcionarios] || 0) + (nf[s.notas] || 0);
    if (s.tipo === "abrir") total = Math.round(total * 0.95); // abertura entra como cortesia

    let plano, cor, features;
    if (total < 260) {
      plano = "Essencial";
      features = ["Contabilidade e impostos em dia", "Guia de impostos mensal", "Suporte por WhatsApp", "Declaração anual inclusa"];
    } else if (total < 620) {
      plano = "Profissional";
      features = ["Tudo do Essencial", "Folha de pagamento e DP", "Emissão de notas fiscais", "Relatórios gerenciais mensais", "Consultor contábil dedicado"];
    } else {
      plano = "Completo";
      features = ["Tudo do Profissional", "Planejamento tributário", "BPO financeiro", "Atendimento prioritário", "Reuniões periódicas de resultado"];
    }

    const low = Math.round((total * 0.9) / 10) * 10;
    const high = Math.round((total * 1.2) / 10) * 10;
    return { plano, low, high, features };
  }

  /* ---- Estado ---- */
  const state = {};
  let idx = 0;
  const visible = () => steps.filter((st) => !st.showIf || st.showIf(state));

  /* ---- Render ---- */
  function render() {
    const list = visible();
    const step = list[idx];
    const total = list.length;

    const progress = `<div class="sim-progress">${list.map((_, i) => `<i class="${i <= idx ? "done" : ""}"></i>`).join("")}</div>`;

    let content = "";
    if (step.type === "choice") {
      content = `
        <span class="sim-q-num">Passo ${idx + 1} de ${total}</span>
        <h3>${step.title}</h3>
        <p>${step.sub}</p>
        <div class="opt-grid">
          ${step.options
            .map(
              (o) => `
            <button type="button" class="opt ${state[step.key] === o.v ? "selected" : ""}" data-val="${o.v}">
              <span class="opt-ic">${svg(o.i)}</span>
              <span><b>${o.t}</b>${o.d ? `<small>${o.d}</small>` : ""}</span>
            </button>`
            )
            .join("")}
        </div>`;
    } else {
      content = `
        <span class="sim-q-num">Passo ${idx + 1} de ${total}</span>
        <h3>${step.title}</h3>
        <p>${step.sub}</p>
        <form id="simForm">
          <div class="field"><label>Nome</label><input name="nome" required placeholder="Como podemos te chamar?"></div>
          <div class="field"><label>WhatsApp / Telefone</label><input name="telefone" required placeholder="(91) 9____-____"></div>
          <div class="field"><label>E-mail (opcional)</label><input name="email" type="email" placeholder="voce@email.com"></div>
        </form>`;
    }

    const nav = `
      <div class="sim-nav">
        ${idx > 0 ? `<button type="button" class="sim-back" data-back>${svg('<path d="M15 18l-6-6 6-6"/>')} Voltar</button>` : "<span></span>"}
        ${
          step.type === "form"
            ? `<button type="button" class="btn btn-primary" data-finish>Ver minha proposta ${svg('<path d="M5 12h14M13 6l6 6-6 6"/>')}</button>`
            : `<button type="button" class="btn btn-primary" data-next ${state[step.key] ? "" : "disabled style=opacity:.5;cursor:not-allowed"}>Continuar ${svg('<path d="M5 12h14M13 6l6 6-6 6"/>')}</button>`
        }
      </div>`;

    app.querySelector(".sim-form").innerHTML = `<div class="sim-step active">${progress}${content}${nav}</div>`;
    bind(step);
    updateSide();
  }

  function bind(step) {
    app.querySelectorAll(".opt").forEach((b) =>
      b.addEventListener("click", () => {
        state[step.key] = b.dataset.val;
        render();
      })
    );
    const back = app.querySelector("[data-back]");
    if (back) back.addEventListener("click", () => { idx = Math.max(0, idx - 1); render(); });
    const next = app.querySelector("[data-next]");
    if (next) next.addEventListener("click", () => { if (state[step.key]) { idx++; render(); } });
    const finish = app.querySelector("[data-finish]");
    if (finish) finish.addEventListener("click", finalize);
  }

  /* ---- Painel lateral (resultado ao vivo) ---- */
  function updateSide() {
    const side = app.querySelector(".sim-side-inner");
    const answered = state.tipo && state.faturamento && state.funcionarios && state.notas;
    if (!answered) {
      side.innerHTML = `
        <span class="eyebrow">Sua estimativa</span>
        <h3 style="color:#fff">Vamos montar seu plano ideal</h3>
        <p class="result-empty">Responda as perguntas e a sua estimativa aparece aqui, em tempo real.</p>
        <div class="result-list">
          <li>${svg(ic.check)} Sem compromisso</li>
          <li>${svg(ic.check)} Resposta em até 5 minutos</li>
          <li>${svg(ic.check)} 1º mês com condição especial</li>
        </div>`;
      return;
    }
    const r = calc(state);
    side.innerHTML = `
      <span class="eyebrow">Sua estimativa</span>
      <div class="result-plan">${svg(ic.check)} Plano ${r.plano}</div>
      <div class="result-price">R$ ${r.low}<small> a R$ ${r.high}/mês</small></div>
      <ul class="result-list">${r.features.map((f) => `<li>${svg(ic.check)} ${f}</li>`).join("")}</ul>
      <p class="result-note">*Valor estimado. A proposta final é personalizada conforme a análise da sua empresa.</p>`;
  }

  /* ---- Finalizar -> WhatsApp ---- */
  function finalize() {
    const form = document.getElementById("simForm");
    if (!form.reportValidity()) return;
    const nome = form.nome.value.trim();
    const tel = form.telefone.value.trim();
    const email = form.email.value.trim();
    const r = calc(state);

    const label = {
      mei: "MEI", autonomo: "Autônomo/Liberal", empresa: "Empresa já aberta", abrir: "Quer abrir empresa",
      simples: "Simples Nacional", presumido: "Lucro Presumido", real: "Lucro Real", "nao-sei": "Não sabe o regime",
      "ate-15k": "até R$15 mil", "15-50k": "R$15 a 50 mil", "50-150k": "R$50 a 150 mil", "150k+": "acima de R$150 mil",
      "0": "nenhum", "1-3": "1 a 3", "4-10": "4 a 10", "10+": "mais de 10",
      baixo: "poucas notas", medio: "volume médio", alto: "alto volume",
    };
    const L = (k) => label[state[k]] || "-";

    const msg =
      `Olá, IM Contabilidade! Fiz a simulação no site 👇\n\n` +
      `*Nome:* ${nome}\n` +
      `*Telefone:* ${tel}\n` +
      (email ? `*E-mail:* ${email}\n` : "") +
      `\n*Perfil:* ${L("tipo")}\n` +
      (state.regime ? `*Regime:* ${L("regime")}\n` : "") +
      `*Faturamento:* ${L("faturamento")}\n` +
      `*Funcionários:* ${L("funcionarios")}\n` +
      `*Notas fiscais:* ${L("notas")}\n\n` +
      `➡️ *Plano sugerido:* ${r.plano} (R$ ${r.low} a ${r.high}/mês)\n\n` +
      `Gostaria de receber a proposta detalhada.`;

    window.open(waLink(msg), "_blank", "noopener");
  }

  render();
})();
