const leadForm = document.querySelector("#lead-form");
const successMessage = document.querySelector("#form-success");
const scoreResult = document.querySelector("#score-result");
const resultName = document.querySelector("#result-name");
const resultScore = document.querySelector("#result-score");
const resultClassification = document.querySelector("#result-classification");
const scoreBreakdown = document.querySelector("#score-breakdown");
const resultFinal = document.querySelector("#result-final");
const resultPriority = document.querySelector("#result-priority");
const resultNextAction = document.querySelector("#result-next-action");
const resultGuidance = document.querySelector("#result-guidance");
const resultReason = document.querySelector("#result-reason");

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(leadForm);
  const lead = Object.fromEntries(formData.entries());
  const result = LeadScoring.calculateLeadScore(lead);

  leadForm.reset();
  console.log("Lead capturado:", lead);
  resultName.textContent = lead.nome;
  resultScore.textContent = `${result.score}/100`;
  resultClassification.textContent = result.classification;
  resultPriority.textContent = result.commercialAction.priority;
  resultNextAction.textContent = result.commercialAction.nextAction;
  resultGuidance.textContent = result.commercialAction.guidance;
  resultReason.textContent = result.commercialAction.reason;
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
