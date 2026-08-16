const assert = require("node:assert/strict");
const { generateWhatsAppMessage } = require("./messaging.js");

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

console.log(`${generatedMessages.length} perfis de mensagem validados.`);
