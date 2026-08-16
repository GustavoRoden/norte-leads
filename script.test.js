const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const LeadScoring = require("./scoring.js");
const WhatsAppMessaging = require("./messaging.js");

const html = fs.readFileSync("./index.html", "utf8");
const instagramPosition = html.indexOf('id="instagram"');
const whatsappPosition = html.indexOf('id="whatsapp"');

assert.ok(instagramPosition >= 0 && whatsappPosition > instagramPosition);
assert.match(
  html,
  /<input id="whatsapp" name="whatsapp" type="tel" placeholder="\(48\) 99999-9999" autocomplete="tel" required \/>/,
);
assert.match(html, /WhatsApp: <strong id="result-whatsapp"><\/strong>/);
assert.match(html, /<h2 id="crm-title">Mini CRM<\/h2>/);

function createElement() {
  return {
    textContent: "",
    hidden: true,
    children: [],
    style: {},
    className: "",
    type: "",
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
    setAttribute() {},
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
    "#copy-feedback",
    "#crm-list",
    "#crm-empty",
  ];
  const elements = Object.fromEntries(selectors.map((selector) => [selector, createElement()]));
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
    console: {
      log(message, lead) {
        if (message === "Lead capturado:") context.capturedLead = lead;
      },
      error: (...args) => context.consoleErrors.push(args),
    },
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

  assert.equal(context.capturedLead.whatsapp, hotLead.whatsapp);
  assert.equal(elements["#result-name"].textContent, hotLead.nome);
  assert.equal(elements["#result-whatsapp"].textContent, hotLead.whatsapp);
  assert.equal(elements["#result-classification"].textContent, "Quente");
  assert.match(elements["#result-whatsapp-message"].textContent, /Marina/);
  assert.match(elements["#result-whatsapp-message"].textContent, /Casa Aurora/);
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
  assert.deepEqual(context.consoleErrors, []);
}

{
  const localStorage = createLocalStorage();
  const firstLoad = loadApplication({ localStorage });
  const form = firstLoad.elements["#lead-form"];
  form.reset = () => {};
  form.formData = new Map(Object.entries(hotLead));
  form.listeners.submit({ preventDefault() {} });
  form.formData = new Map(Object.entries({ ...hotLead, nome: "Joana", nomeDaLoja: "Sol" }));
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
  assert.equal(details.children[1].children.length, 11);
  firstCard.children[2].listeners.click();
  assert.equal(JSON.parse(localStorage.getItem("norteLeads")).length, 1);
  assert.equal(reload.elements["#crm-list"].children.length, 1);

  const cancelled = loadApplication({ localStorage, confirm: () => false });
  cancelled.elements["#crm-list"].children[0].children[2].listeners.click();
  assert.equal(JSON.parse(localStorage.getItem("norteLeads")).length, 1);

  const reopened = loadApplication({ localStorage });
  assert.equal(reopened.elements["#crm-list"].children.length, 1);
  reopened.elements["#crm-list"].children[0].children[2].listeners.click();
  assert.equal(JSON.parse(localStorage.getItem("norteLeads")).length, 0);
  assert.equal(reopened.elements["#crm-list"].children.length, 0);
  assert.equal(reopened.elements["#crm-empty"].hidden, false);
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
