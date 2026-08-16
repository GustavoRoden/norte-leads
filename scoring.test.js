const assert = require("node:assert/strict");
const {
  calculateLeadScore,
  getClassification,
  scoreRules,
  commercialActions,
} = require("./scoring.js");

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
  commercialAction: commercialActions.Quente,
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

const leadsByTemperature = {
  Frio: {
    possuiLoja: "Não",
    volumeMedio: "Menos de 20 peças",
    principalInteresse: "Quero conhecer a marca",
    previsaoDeCompra: "Ainda não tenho previsão",
  },
  Morno: {
    possuiLoja: "Sim",
    volumeMedio: "Menos de 20 peças",
    principalInteresse: "Quero conhecer a marca",
    previsaoDeCompra: "Nos próximos 3 meses",
  },
  Quente: hottestLead,
};

Object.entries(leadsByTemperature).forEach(([classification, lead]) => {
  const result = calculateLeadScore(lead);

  assert.equal(result.classification, classification);
  assert.deepEqual(result.commercialAction, commercialActions[classification]);
});

assert.deepEqual(commercialActions, {
  Quente: {
    priority: "Alta",
    nextAction: "Contato comercial prioritário",
    guidance: "Entrar em contato o quanto antes para iniciar uma conversa comercial.",
    reason: "Lead apresenta forte intenção e potencial de compra.",
  },
  Morno: {
    priority: "Média",
    nextAction: "Enviar catálogo + realizar follow-up",
    guidance: "Apresentar a coleção e realizar um novo contato posteriormente.",
    reason:
      "Lead apresenta potencial, mas ainda não demonstra urgência suficiente para abordagem comercial prioritária.",
  },
  Frio: {
    priority: "Baixa",
    nextAction: "Nutrição e relacionamento",
    guidance: "Manter o lead na base para futuras oportunidades de relacionamento.",
    reason: "Lead ainda apresenta baixa intenção comercial imediata.",
  },
});

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
