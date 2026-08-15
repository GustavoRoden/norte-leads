const leadForm = document.querySelector("#lead-form");
const successMessage = document.querySelector("#form-success");

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(leadForm);
  const lead = Object.fromEntries(formData.entries());

  console.log("Lead capturado:", lead);
  successMessage.hidden = false;
  leadForm.reset();
});
