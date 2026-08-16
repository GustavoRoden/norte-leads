const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const LeadScoring = require("./scoring.js");
const WhatsAppMessaging = require("./messaging.js");

const html = fs.readFileSync("./index.html", "utf8");
const css = fs.readFileSync("./style.css", "utf8");
const instagramPosition = html.indexOf('id="instagram"');
const whatsappPosition = html.indexOf('id="whatsapp"');

assert.ok(instagramPosition >= 0 && whatsappPosition > instagramPosition);
assert.match(
  html,
  /<input id="whatsapp" name="whatsapp" type="tel" placeholder="\(48\) 99999-9999" autocomplete="tel" required \/>/,
);
assert.match(html, /WhatsApp: <strong id="result-whatsapp"><\/strong>/);
assert.match(html, /id="open-whatsapp"[^>]*>\s*Abrir no WhatsApp/);
assert.doesNotMatch(html, /id="open-whatsapp"[^>]*href="#"/);
assert.match(html, /id="open-whatsapp"[^>]*aria-describedby="result-whatsapp-message"/);
assert.match(html, /<span>Pontuação do lead<\/span>/);
assert.doesNotMatch(html, /Lead Score|Total de Leads|Leads Quentes|Leads Mornos|Leads Frios/);
assert.match(html, /<h2 id="crm-title">Mini CRM<\/h2>/);
assert.match(html, /<strong id="total-leads">0<\/strong>/);
assert.match(html, /<option value="score-desc">Maior pontuação primeiro<\/option>/);
assert.match(html, /<footer>\s*<p>Projeto acadêmico desenvolvido para demonstrar automação e CRM\.<\/p>\s*<\/footer>/);
assert.match(css, /\.crm-dashboard\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.crm-dashboard\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
assert.match(css, /\.mini-crm\s*\{[^}]*overflow-x:\s*clip/s);
assert.match(css, /@media \(pointer: coarse\)[\s\S]*?min-height:\s*48px/);
assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.whatsapp-message__actions\s*\{[^}]*grid-template-columns:\s*1fr/s);
assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.crm-lead__delete,\s*\.crm-lead__whatsapp\s*\{[^}]*width:\s*100%/s);

function createElement() {
  return {
    textContent: "",
    hidden: true,
    children: [],
    style: {},
    className: "",
    type: "",
    value: "",
    listeners: {},
    append(...children) {
      this.children.push(...children);
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    select() {},
    remove() {
      this.removed = true;
    },
  };
}

function createLocalStorage(initial = {}) {
  const values = { ...initial };
  return {
    getItem(key) { return Object.hasOwn(values, key) ? values[key] : null; },
    setItem(key, value) { values[key] = String(value); },
    values,
  };
}

let idCounter = 1;

function loadApplication({ clipboard, execCommand = () => true, localStorage = createLocalStorage(), confirm = () => true } = {}) {
  const selectors = [
    "#lead-form",
    "#form-success",
    "#score-result",
    "#result-name",
    "#result-whatsapp",
    "#result-score",
    "#result-classification",
    "#score-breakdown",
    "#result-final",
    "#result-priority",
    "#result-next-action",
    "#result-guidance",
    "#result-reason",
    "#result-whatsapp-message",
    "#copy-message",
    "#open-whatsapp",
    "#copy-feedback",
    "#crm-list",
    "#crm-empty",
    "#crm-filter",
    "#crm-sort",
    "#total-leads",
    "#hot-leads",
    "#warm-leads",
    "#cold-leads",
  ];
  const elements = Object.fromEntries(selectors.map((selector) => [selector, createElement()]));
  elements["#crm-filter"].value = "Todos";
  elements["#crm-sort"].value = "score-desc";
  const temporaryElements = [];
  const document = {
    body: {
      append(element) {
        temporaryElements.push(element);
      },
    },
    querySelector: (selector) => elements[selector],
    createElement,
    execCommand,
  };
  const context = {
    document,
    navigator: clipboard === undefined ? {} : { clipboard },
    FormData: class {
      constructor(form) {
        return form.formData;
      }
    },
    LeadScoring,
    WhatsAppMessaging,
    localStorage,
    confirm,
    crypto: { randomUUID: () => `lead-${idCounter++}` },
    console: { error: (...args) => context.consoleErrors.push(args) },
    consoleErrors: [],
  };

  vm.runInNewContext(fs.readFileSync("./script.js", "utf8"), context);
  return { elements, temporaryElements, context, localStorage };
}

const hotLead = {
  nome: "Marina",
  nomeDaLoja: "Casa Aurora",
  cidade: "Natal",
  instagram: "@casaaurora",
  whatsapp: "(48) 99999-9999",
  possuiLoja: "Sim",
  volumeMedio: "50 peças ou mais",
  principalInteresse: "Quero comprar",
  previsaoDeCompra: "Nos próximos 30 dias",
};

{
  const { elements, context, localStorage } = loadApplication();
  const form = elements["#lead-form"];
  form.formData = new Map(Object.entries(hotLead));
  form.reset = () => {
    form.wasReset = true;
  };

  form.listeners.submit({ preventDefault() {} });

  assert.equal(elements["#result-name"].textContent, hotLead.nome);
  assert.equal(elements["#result-whatsapp"].textContent, hotLead.whatsapp);
  assert.equal(elements["#result-classification"].textContent, "Quente");
  assert.equal(elements["#result-final"].textContent, "100/100 — Classificação: Quente");
  assert.match(elements["#result-whatsapp-message"].textContent, /Marina/);
  assert.match(elements["#result-whatsapp-message"].textContent, /Casa Aurora/);
  assert.equal(
    elements["#open-whatsapp"].href,
    WhatsAppMessaging.generateWhatsAppLink(
      hotLead.whatsapp,
      elements["#result-whatsapp-message"].textContent,
    ),
  );
  assert.doesNotMatch(elements["#result-whatsapp-message"].textContent, /99999-9999/);
  assert.equal(elements["#form-success"].hidden, false);
  assert.equal(elements["#score-result"].hidden, false);
  assert.equal(form.wasReset, true);
  const storedLeads = JSON.parse(localStorage.getItem("norteLeads"));
  assert.equal(storedLeads.length, 1);
  const storedLead = storedLeads[0];
  Object.entries(hotLead).forEach(([field, value]) => assert.equal(storedLead[field], value));
  const expectedResult = LeadScoring.calculateLeadScore(hotLead);
  assert.equal(storedLead.score, expectedResult.score);
  assert.equal(storedLead.classificacao, expectedResult.classification);
  assert.equal(storedLead.prioridade, expectedResult.commercialAction.priority);
  assert.equal(storedLead.proximaAcao, expectedResult.commercialAction.nextAction);
  assert.equal(storedLead.orientacao, expectedResult.commercialAction.guidance);
  assert.equal(storedLead.motivo, expectedResult.commercialAction.reason);
  assert.equal(storedLead.mensagemWhatsApp, elements["#result-whatsapp-message"].textContent);
  assert.ok(storedLead.id);
  assert.ok(Number.isFinite(Date.parse(storedLead.cadastradoEm)));
  assert.equal(elements["#crm-list"].children.length, 1);
  assert.equal(elements["#crm-empty"].hidden, true);
  assert.equal(elements["#total-leads"].textContent, "1");
  assert.equal(elements["#hot-leads"].textContent, "1");
  assert.deepEqual(context.consoleErrors, []);
}

{
  const localStorage = createLocalStorage();
  const firstLoad = loadApplication({ localStorage });
  const form = firstLoad.elements["#lead-form"];
  form.reset = () => {};
  form.formData = new Map(Object.entries(hotLead));
  form.listeners.submit({ preventDefault() {} });
  form.formData = new Map(Object.entries({
    ...hotLead,
    nome: "Joana",
    nomeDaLoja: "Sol",
    whatsapp: "(11) 98888-7777",
  }));
  form.listeners.submit({ preventDefault() {} });
  const multipleLeads = JSON.parse(localStorage.getItem("norteLeads"));
  assert.equal(multipleLeads.length, 2);
  assert.equal(new Set(multipleLeads.map(({ id }) => id)).size, 2);
  assert.deepEqual(multipleLeads.map(({ nome }) => nome), ["Marina", "Joana"]);

  const reload = loadApplication({ localStorage });
  assert.equal(reload.elements["#crm-list"].children.length, 2);
  assert.equal(reload.elements["#crm-empty"].hidden, true);
  const firstCard = reload.elements["#crm-list"].children[0];
  const details = firstCard.children[1];
  assert.equal(details.children[0].textContent, "Ver detalhes");
  assert.equal(details.children[1].children.length, 10);
  assert.equal(details.children[1].children.some(({ textContent }) => textContent === "Identificador"), false);
  assert.equal(details.children[1].children.some(({ textContent }) => textContent === multipleLeads[0].id), false);
  assert.equal(details.children[2].textContent, "Abrir no WhatsApp");
  assert.equal(
    details.children[2].href,
    WhatsAppMessaging.generateWhatsAppLink(multipleLeads[0].whatsapp, multipleLeads[0].mensagemWhatsApp),
  );
  const secondWhatsAppLink = reload.elements["#crm-list"].children[1].children[1].children[2];
  assert.equal(
    secondWhatsAppLink.href,
    WhatsAppMessaging.generateWhatsAppLink(multipleLeads[1].whatsapp, multipleLeads[1].mensagemWhatsApp),
  );
  assert.notEqual(details.children[2].href, secondWhatsAppLink.href);
  assert.equal(details.children[2].target, "_blank");
  assert.equal(details.children[2].rel, "noopener noreferrer");
  assert.equal(details.children[2]["aria-label"], "Abrir conversa com Marina no WhatsApp");
  assert.equal(firstCard["aria-label"], "Lead Marina");
  assert.equal(firstCard.children[2]["aria-label"], "Excluir lead Marina");
  firstCard.children[2].listeners.click();
  assert.equal(JSON.parse(localStorage.getItem("norteLeads")).length, 1);
  assert.equal(reload.elements["#crm-list"].children.length, 1);
  assert.equal(reload.elements["#total-leads"].textContent, "1");
  assert.equal(reload.elements["#hot-leads"].textContent, "1");

  const cancelled = loadApplication({ localStorage, confirm: () => false });
  cancelled.elements["#crm-list"].children[0].children[2].listeners.click();
  assert.equal(JSON.parse(localStorage.getItem("norteLeads")).length, 1);

  const reopened = loadApplication({ localStorage });
  assert.equal(reopened.elements["#crm-list"].children.length, 1);
  reopened.elements["#crm-list"].children[0].children[2].listeners.click();
  assert.equal(JSON.parse(localStorage.getItem("norteLeads")).length, 0);
  assert.equal(reopened.elements["#crm-list"].children.length, 0);
  assert.equal(reopened.elements["#crm-empty"].hidden, false);
  assert.equal(reopened.elements["#total-leads"].textContent, "0");
}

{
  const storedLeads = [
    { ...hotLead, id: "warm", nome: "Morna", score: 55, classificacao: "Morno", cadastradoEm: "2026-01-02T10:00:00.000Z" },
    { ...hotLead, id: "cold", nome: "Fria", score: 20, classificacao: "Frio", cadastradoEm: "2026-01-03T10:00:00.000Z" },
    { ...hotLead, id: "hot", nome: "Quente", score: 90, classificacao: "Quente", cadastradoEm: "2026-01-01T10:00:00.000Z" },
    { ...hotLead, id: "hot-recent", nome: "Quente recente", score: 75, classificacao: "Quente", cadastradoEm: "2026-01-04T10:00:00.000Z" },
  ].map((lead) => ({
    ...lead,
    prioridade: "Prioridade",
    proximaAcao: "Ação",
    orientacao: "Orientação",
    motivo: "Motivo",
    mensagemWhatsApp: "Mensagem",
  }));
  const app = loadApplication({
    localStorage: createLocalStorage({ norteLeads: JSON.stringify(storedLeads) }),
  });
  const cardName = (card) => card.children[0].children[0].children[1].textContent;

  const storedSnapshot = app.localStorage.getItem("norteLeads");
  assert.equal(app.elements["#crm-filter"].value, "Todos");
  assert.equal(app.elements["#crm-sort"].value, "score-desc");
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Quente", "Quente recente", "Morna", "Fria"]);
  assert.equal(app.elements["#total-leads"].textContent, "4");
  assert.equal(app.elements["#hot-leads"].textContent, "2");
  assert.equal(app.elements["#warm-leads"].textContent, "1");
  assert.equal(app.elements["#cold-leads"].textContent, "1");

  app.elements["#crm-filter"].value = "Quente";
  app.elements["#crm-filter"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Quente", "Quente recente"]);

  app.elements["#crm-filter"].value = "Morno";
  app.elements["#crm-filter"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Morna"]);

  app.elements["#crm-filter"].value = "Frio";
  app.elements["#crm-filter"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Fria"]);

  app.elements["#crm-filter"].value = "Todos";
  app.elements["#crm-filter"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Quente", "Quente recente", "Morna", "Fria"]);
  assert.equal(app.localStorage.getItem("norteLeads"), storedSnapshot);

  app.elements["#crm-sort"].value = "score-asc";
  app.elements["#crm-sort"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Fria", "Morna", "Quente recente", "Quente"]);

  app.elements["#crm-sort"].value = "recent";
  app.elements["#crm-sort"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Quente recente", "Fria", "Morna", "Quente"]);

  app.elements["#crm-filter"].value = "Quente";
  app.elements["#crm-sort"].value = "score-asc";
  app.elements["#crm-filter"].listeners.change();
  assert.deepEqual(app.elements["#crm-list"].children.map(cardName), ["Quente recente", "Quente"]);
  assert.equal(app.localStorage.getItem("norteLeads"), storedSnapshot);

  const reload = loadApplication({ localStorage: app.localStorage });
  assert.equal(reload.elements["#total-leads"].textContent, "4");
  assert.equal(reload.elements["#hot-leads"].textContent, "2");
  assert.equal(reload.elements["#warm-leads"].textContent, "1");
  assert.equal(reload.elements["#cold-leads"].textContent, "1");
  assert.deepEqual(reload.context.consoleErrors, []);
}

(async () => {
  const modernCopies = [];
  const modern = loadApplication({
    clipboard: { writeText: async (text) => modernCopies.push(text) },
  });
  modern.elements["#result-whatsapp-message"].textContent = "Mensagem moderna";
  await modern.elements["#copy-message"].listeners.click();
  assert.deepEqual(modernCopies, ["Mensagem moderna"]);
  assert.equal(modern.elements["#copy-feedback"].textContent, "Mensagem copiada!");

  const fallbackCopies = [];
  const fallback = loadApplication({
    execCommand: (command) => {
      fallbackCopies.push(command);
      return true;
    },
  });
  fallback.elements["#result-whatsapp-message"].textContent = "Mensagem fallback";
  await fallback.elements["#copy-message"].listeners.click();
  assert.deepEqual(fallbackCopies, ["copy"]);
  assert.equal(fallback.elements["#copy-feedback"].textContent, "Mensagem copiada!");
  assert.equal(fallback.temporaryElements[0].removed, true);

  const rejectedModern = loadApplication({
    clipboard: { writeText: async () => Promise.reject(new Error("bloqueado")) },
  });
  rejectedModern.elements["#result-whatsapp-message"].textContent = "Usar fallback";
  await rejectedModern.elements["#copy-message"].listeners.click();
  assert.equal(rejectedModern.elements["#copy-feedback"].textContent, "Mensagem copiada!");

  const failed = loadApplication({ execCommand: () => { throw new Error("falha"); } });
  failed.elements["#result-whatsapp-message"].textContent = "Falha esperada";
  await failed.elements["#copy-message"].listeners.click();
  assert.match(failed.elements["#copy-feedback"].textContent, /Não foi possível copiar/);
  assert.equal(failed.temporaryElements[0].removed, true);

  console.log("Cadastro, geração automática e clipboard validados.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
