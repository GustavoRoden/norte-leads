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

function createElement() {
  return {
    textContent: "",
    hidden: true,
    children: [],
    style: {},
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

function loadApplication({ clipboard, execCommand = () => true } = {}) {
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
    console: {
      log(message, lead) {
        if (message === "Lead capturado:") context.capturedLead = lead;
      },
      error: (...args) => context.consoleErrors.push(args),
    },
    consoleErrors: [],
  };

  vm.runInNewContext(fs.readFileSync("./script.js", "utf8"), context);
  return { elements, temporaryElements, context };
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
  const { elements, context } = loadApplication();
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
  assert.deepEqual(context.consoleErrors, []);
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
