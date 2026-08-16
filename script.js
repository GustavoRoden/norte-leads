const leadForm = document.querySelector("#lead-form");
const successMessage = document.querySelector("#form-success");
const scoreResult = document.querySelector("#score-result");
const resultName = document.querySelector("#result-name");
const resultWhatsApp = document.querySelector("#result-whatsapp");
const resultScore = document.querySelector("#result-score");
const resultClassification = document.querySelector("#result-classification");
const scoreBreakdown = document.querySelector("#score-breakdown");
const resultFinal = document.querySelector("#result-final");
const resultPriority = document.querySelector("#result-priority");
const resultNextAction = document.querySelector("#result-next-action");
const resultGuidance = document.querySelector("#result-guidance");
const resultReason = document.querySelector("#result-reason");
const resultWhatsAppMessage = document.querySelector("#result-whatsapp-message");
const copyMessageButton = document.querySelector("#copy-message");
const copyFeedback = document.querySelector("#copy-feedback");
const crmList = document.querySelector("#crm-list");
const crmEmpty = document.querySelector("#crm-empty");
const crmFilter = document.querySelector("#crm-filter");
const crmSort = document.querySelector("#crm-sort");
const totalLeads = document.querySelector("#total-leads");
const hotLeads = document.querySelector("#hot-leads");
const warmLeads = document.querySelector("#warm-leads");
const coldLeads = document.querySelector("#cold-leads");
const STORAGE_KEY = "norteLeads";

function loadLeads() {
  try {
    const storedLeads = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(storedLeads) ? storedLeads : [];
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function createLeadId(leads) {
  const existingIds = new Set(leads.map(({ id }) => id));
  let id;

  do {
    id = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  } while (existingIds.has(id));

  return id;
}

function appendDetail(list, label, value) {
  const group = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  group.append(term, description);
  list.append(group);
}

function renderLeads() {
  const leads = loadLeads();
  const counts = leads.reduce(
    (totals, lead) => {
      if (Object.hasOwn(totals, lead.classificacao)) totals[lead.classificacao] += 1;
      return totals;
    },
    { Quente: 0, Morno: 0, Frio: 0 },
  );
  totalLeads.textContent = String(leads.length);
  hotLeads.textContent = String(counts.Quente);
  warmLeads.textContent = String(counts.Morno);
  coldLeads.textContent = String(counts.Frio);

  const visibleLeads = leads
    .filter((lead) => crmFilter.value === "Todos" || lead.classificacao === crmFilter.value)
    .sort((first, second) => {
      if (crmSort.value === "score-asc") return first.score - second.score;
      if (crmSort.value === "recent") {
        return new Date(second.cadastradoEm).getTime() - new Date(first.cadastradoEm).getTime();
      }
      return second.score - first.score;
    });

  crmEmpty.hidden = visibleLeads.length > 0;
  crmEmpty.textContent = leads.length === 0
    ? "Nenhum lead cadastrado ainda."
    : "Nenhum lead encontrado para o filtro selecionado.";

  const cards = visibleLeads.map((lead) => {
    const article = document.createElement("article");
    article.className = "crm-lead";

    const summary = document.createElement("div");
    summary.className = "crm-lead__summary";
    [
      ["Nome", lead.nome],
      ["Loja", lead.nomeDaLoja],
      ["WhatsApp", lead.whatsapp],
      ["Score", `${lead.score}/100`],
      ["Classificação", lead.classificacao],
      ["Prioridade", lead.prioridade],
      ["Próxima ação", lead.proximaAcao],
    ].forEach(([label, value]) => {
      const field = document.createElement("div");
      const fieldLabel = document.createElement("span");
      const fieldValue = document.createElement("strong");
      fieldLabel.textContent = label;
      fieldValue.textContent = value;
      field.append(fieldLabel, fieldValue);
      summary.append(field);
    });

    const details = document.createElement("details");
    details.className = "crm-lead__details";
    const detailsButton = document.createElement("summary");
    detailsButton.textContent = "Ver detalhes";
    const detailList = document.createElement("dl");
    [
      ["ID", lead.id],
      ["Cadastrado em", new Date(lead.cadastradoEm).toLocaleString("pt-BR")],
      ["Cidade", lead.cidade],
      ["Instagram", lead.instagram],
      ["Possui loja", lead.possuiLoja],
      ["Volume médio de compra", lead.volumeMedio],
      ["Principal interesse", lead.principalInteresse],
      ["Prazo de compra", lead.previsaoDeCompra],
      ["Orientação", lead.orientacao],
      ["Motivo", lead.motivo],
      ["Mensagem sugerida para WhatsApp", lead.mensagemWhatsApp],
    ].forEach(([label, value]) => appendDetail(detailList, label, value));
    details.append(detailsButton, detailList);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "crm-lead__delete";
    removeButton.textContent = "Excluir lead";
    removeButton.addEventListener("click", () => {
      if (!confirm(`Excluir o lead ${lead.nome}?`)) return;
      saveLeads(loadLeads().filter(({ id }) => id !== lead.id));
      renderLeads();
    });

    article.append(summary, details, removeButton);
    return article;
  });

  crmList.replaceChildren(...cards);
}

crmFilter.addEventListener("change", renderLeads);
crmSort.addEventListener("change", renderLeads);

function legacyCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();

  let copied;

  try {
    copied = document.execCommand("copy");
  } finally {
    textArea.remove();
  }

  if (!copied) throw new Error("Não foi possível copiar a mensagem.");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permissões do navegador podem bloquear a API moderna; tente o fallback.
    }
  }

  legacyCopyText(text);
}

copyMessageButton.addEventListener("click", async () => {
  copyFeedback.textContent = "";

  try {
    await copyText(resultWhatsAppMessage.textContent);
    copyFeedback.textContent = "Mensagem copiada!";
  } catch {
    copyFeedback.textContent = "Não foi possível copiar. Selecione a mensagem manualmente.";
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(leadForm);
  const lead = {
    ...Object.fromEntries(formData.entries()),
    whatsapp: formData.get("whatsapp"),
  };
  const result = LeadScoring.calculateLeadScore(lead);

  leadForm.reset();
  console.log("Lead capturado:", lead);
  resultName.textContent = lead.nome;
  resultWhatsApp.textContent = lead.whatsapp;
  resultScore.textContent = `${result.score}/100`;
  resultClassification.textContent = result.classification;
  resultPriority.textContent = result.commercialAction.priority;
  resultNextAction.textContent = result.commercialAction.nextAction;
  resultGuidance.textContent = result.commercialAction.guidance;
  resultReason.textContent = result.commercialAction.reason;
  resultWhatsAppMessage.textContent = WhatsAppMessaging.generateWhatsAppMessage(
    lead,
    result.classification,
  );
  const storedLeads = loadLeads();
  const storedLead = {
    id: createLeadId(storedLeads),
    cadastradoEm: new Date().toISOString(),
    ...lead,
    score: result.score,
    classificacao: result.classification,
    prioridade: result.commercialAction.priority,
    proximaAcao: result.commercialAction.nextAction,
    orientacao: result.commercialAction.guidance,
    motivo: result.commercialAction.reason,
    mensagemWhatsApp: resultWhatsAppMessage.textContent,
  };
  saveLeads([...storedLeads, storedLead]);
  renderLeads();
  copyFeedback.textContent = "";
  scoreBreakdown.replaceChildren(
    ...result.breakdown.map(({ label, points }) => {
      const item = document.createElement("li");
      const itemLabel = document.createElement("span");
      const itemPoints = document.createElement("strong");

      itemLabel.textContent = `${label}:`;
      itemPoints.textContent = `+${points}`;
      item.append(itemLabel, itemPoints);
      return item;
    }),
  );
  resultFinal.textContent = `${result.score}/100 — Lead ${result.classification}`;
  successMessage.hidden = false;
  scoreResult.hidden = false;
});

renderLeads();
