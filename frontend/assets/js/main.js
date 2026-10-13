// URL do app da Web do Google Apps Script (termina em /exec). Veja o README.
const API_URL = "https://script.google.com/macros/s/AKfycbyQfd15zjr5sa_kpKaqnSkfbFOM0Vaw-ZNH9G0cBtYZ0LhOgd3FQm64auYNMd80kNXV/exec";

document.getElementById("ano").textContent = new Date().getFullYear();

const form = document.getElementById("lead-form");
const statusEl = form.querySelector(".form-status");
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "form-status" + (type ? " " + type : "");
}

function validate() {
  let firstInvalid = null;
  form.querySelectorAll("[required]").forEach((el) => {
    const wrapper = el.closest(".field, .consent");
    const ok = el.type === "checkbox" ? el.checked : el.checkValidity() && el.value.trim() !== "";
    wrapper.classList.toggle("invalid", !ok);
    if (!ok && !firstInvalid) firstInvalid = el;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

form.addEventListener("input", (e) => {
  const wrapper = e.target.closest(".field, .consent");
  if (wrapper) wrapper.classList.remove("invalid");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) {
    setStatus("Confira os campos destacados.", "error");
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  data.consentimento = form.consentimento.checked;

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  setStatus("");

  try {
    // text/plain evita a checagem de CORS que o Apps Script não suporta
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || "Falha no envio");

    form.reset();
    setStatus("Recebemos seus dados! Em breve entraremos em contato.", "success");
  } catch (err) {
    setStatus(err.message && err.message !== "Failed to fetch"
      ? err.message
      : "Não foi possível enviar agora. Tente novamente em alguns minutos.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar";
  }
});
