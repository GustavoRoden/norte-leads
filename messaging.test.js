const assert = require("node:assert/strict");
const {
  generateWhatsAppMessage,
  normalizeWhatsAppNumber,
  generateWhatsAppLink,
} = require("./messaging.js");

const classifications = ["Frio", "Morno", "Quente"];
const interests = [
  "Quero comprar",
  "Quero receber o catálogo",
  "Quero conhecer a marca",
];
const generatedMessages = [];

classifications.forEach((classification) => {
  interests.forEach((principalInteresse) => {
    const message = generateWhatsAppMessage(
      { nome: "Marina", nomeDaLoja: "Casa Aurora", principalInteresse },
      classification,
    );

    assert.match(message, /Marina/);
    assert.match(message, /Casa Aurora/);
    assert.doesNotMatch(message, /Lead Score|Lead Quente|Lead Morno|Lead Frio|prioridade comercial/i);
    generatedMessages.push(message);
  });
});

assert.equal(new Set(generatedMessages).size, classifications.length * interests.length);
assert.match(generatedMessages[0], /no seu tempo/);
assert.match(generatedMessages.at(-1), /Podemos conversar agora/);
assert.throws(
  () =>
    generateWhatsAppMessage(
      { nome: "Marina", nomeDaLoja: "Casa Aurora", principalInteresse: "Outro" },
      "Morno",
    ),
  /Não foi possível gerar/,
);

assert.equal(normalizeWhatsAppNumber("(48) 99999-9999"), "5548999999999");
assert.equal(normalizeWhatsAppNumber("48 3333-4444"), "554833334444");
assert.equal(normalizeWhatsAppNumber("48.99999/9999"), "5548999999999");
assert.equal(normalizeWhatsAppNumber("+55 (48) 99999-9999"), "5548999999999");
assert.equal(normalizeWhatsAppNumber("+1 (305) 555-0199"), "13055550199");
const specialCharacterMessage = "Olá, Marina!\nCatálogo & condições? #novidades ✨";
const generatedLink = generateWhatsAppLink("(48) 99999-9999", specialCharacterMessage);
assert.equal(
  generatedLink,
  "https://wa.me/5548999999999?text=Ol%C3%A1%2C%20Marina!%0ACat%C3%A1logo%20%26%20condi%C3%A7%C3%B5es%3F%20%23novidades%20%E2%9C%A8",
);
const parsedLink = new URL(generatedLink);
assert.equal(parsedLink.hostname, "wa.me");
assert.equal(parsedLink.pathname, "/5548999999999");
assert.equal(parsedLink.searchParams.get("text"), specialCharacterMessage);
assert.equal(parsedLink.searchParams.has("send"), false);

console.log(`${generatedMessages.length} perfis de mensagem validados.`);
