const assert = require("node:assert/strict");
const { calculateLeadScore, getClassification, scoreRules } = require("./scoring.js");

const hottestLead = {
  possuiLoja: "Sim",
  volumeMedio: "50 peças ou mais",
  principalInteresse: "Quero comprar",
  previsaoDeCompra: "Nos próximos 30 dias",
};

assert.deepEqual(calculateLeadScore(hottestLead), {
  score: 100,
  classification: "Quente",
  breakdown: [
    { label: "Possui loja", points: 20 },
    { label: "Volume de compra", points: 25 },
    { label: "Interesse", points: 25 },
    { label: "Prazo de compra", points: 30 },
  ],
});

assert.equal(
  calculateLeadScore({
    possuiLoja: "Não",
    volumeMedio: "Menos de 20 peças",
    principalInteresse: "Quero conhecer a marca",
    previsaoDeCompra: "Ainda não tenho previsão",
  }).score,
  10,
);

assert.equal(
  calculateLeadScore({
    possuiLoja: "Sim",
    volumeMedio: "20 a 49 peças",
    principalInteresse: "Quero receber o catálogo",
    previsaoDeCompra: "Nos próximos 3 meses",
  }).classification,
  "Morno",
);

assert.equal(getClassification(39), "Frio");
assert.equal(getClassification(40), "Morno");
assert.equal(getClassification(69), "Morno");
assert.equal(getClassification(70), "Quente");
assert.equal(getClassification(100), "Quente");

const possibleScores = Object.values(scoreRules).map((rule) => Object.values(rule));
const allTotals = possibleScores[0].flatMap((store) =>
  possibleScores[1].flatMap((volume) =>
    possibleScores[2].flatMap((interest) =>
      possibleScores[3].map((deadline) => store + volume + interest + deadline),
    ),
  ),
);

assert.equal(Math.max(...allTotals), 100);
assert.ok(allTotals.every((score) => score >= 0 && score <= 100));

console.log(`Lead Scoring validado em ${allTotals.length} combinações.`);
