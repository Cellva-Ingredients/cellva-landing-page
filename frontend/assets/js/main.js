// URL do app da Web do Google Apps Script (termina em /exec). Veja o README.
const API_URL = "https://script.google.com/macros/s/AKfycbyQfd15zjr5sa_kpKaqnSkfbFOM0Vaw-ZNH9G0cBtYZ0LhOgd3FQm64auYNMd80kNXV/exec";

document.getElementById("ano").textContent = new Date().getFullYear();

const form = document.getElementById("lead-form");
const statusEl = form.querySelector(".form-status");
const submitBtn = form.querySelector('button[type="submit"]');

// Guarda a chave da mensagem para retraduzir se o visitante trocar de idioma
let statusAtual = null;

function setStatus(chave, type, textoLivre) {
  statusAtual = chave || textoLivre ? { chave, type, textoLivre } : null;
  statusEl.textContent = textoLivre || (chave ? t(chave) : "");
  statusEl.className = "form-status" + (type ? " " + type : "");
}

document.addEventListener("idiomachange", () => {
  if (statusAtual && statusAtual.chave) setStatus(statusAtual.chave, statusAtual.type);
  if (!submitBtn.disabled) submitBtn.textContent = t("form.enviar");
});

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
    setStatus("form.erroCampos", "error");
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  data.consentimento = form.consentimento.checked;

  submitBtn.disabled = true;
  submitBtn.textContent = t("form.enviando");
  setStatus("");

  try {
    // text/plain evita a checagem de CORS que o Apps Script não suporta
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    // O Apps Script responde erros em português; nos outros idiomas mostramos a mensagem genérica
    if (!res.ok || !body.ok) throw new Error(body.error || "");

    form.reset();
    setStatus("form.sucesso", "success");
  } catch (err) {
    const erroDoServidor = err.message && err.message !== "Failed to fetch";
    if (erroDoServidor && idiomaAtual === "pt") setStatus(null, "error", err.message);
    else setStatus("form.erroEnvio", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = t("form.enviar");
  }
});
