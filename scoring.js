(function exposeLeadScoring(globalScope) {
  const scoreRules = {
    possuiLoja: {
      Sim: 20,
      "Não": 0,
    },
    volumeMedio: {
      "50 peças ou mais": 25,
      "20 a 49 peças": 15,
      "Menos de 20 peças": 5,
    },
    principalInteresse: {
      "Quero comprar": 25,
      "Quero receber o catálogo": 15,
      "Quero conhecer a marca": 5,
    },
    previsaoDeCompra: {
      "Nos próximos 30 dias": 30,
      "Nos próximos 3 meses": 15,
      "Ainda não tenho previsão": 0,
    },
  };

  const breakdownLabels = {
    possuiLoja: "Possui loja",
    volumeMedio: "Volume de compra",
    principalInteresse: "Interesse",
    previsaoDeCompra: "Prazo de compra",
  };

  function getClassification(score) {
    if (score >= 70) return "Quente";
    if (score >= 40) return "Morno";
    return "Frio";
  }

  function calculateLeadScore(lead) {
    const breakdown = Object.entries(scoreRules).map(([field, rules]) => {
      const points = rules[lead[field]];

      if (points === undefined) {
        throw new Error(`Opção inválida para ${field}.`);
      }

      return { label: breakdownLabels[field], points };
    });
    const score = breakdown.reduce((total, item) => total + item.points, 0);

    return {
      score,
      classification: getClassification(score),
      breakdown,
    };
  }

  const leadScoring = { calculateLeadScore, getClassification, scoreRules };
  globalScope.LeadScoring = leadScoring;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = leadScoring;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
