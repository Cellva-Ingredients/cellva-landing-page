// Recebe o formulário da landing page, grava o lead nesta planilha e envia por e-mail.
// Instalação: veja o README do projeto.

const EMAIL_DESTINO = "carine.pontes@cellva.com";
const NOME_ABA = "Leads";
const LIMITE_POR_HORA = 30; // proteção contra envios em massa

const CAMPOS = [
  { key: "nome", label: "Nome", required: true, max: 120 },
  { key: "empresa", label: "Empresa", required: true, max: 160 },
  { key: "email", label: "E-mail", required: true, max: 160 },
  { key: "telefone", label: "WhatsApp / telefone", required: true, max: 30 },
  { key: "segmento", label: "Segmento", required: true, max: 80 },
  { key: "cidade", label: "Cidade / UF", required: false, max: 80 },
  { key: "mensagem", label: "Mensagem", required: false, max: 2000 },
];

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return resposta({ error: "Requisição inválida." });
  }

  // Campo invisível preenchido = robô. Responde sucesso para não dar pistas.
  if (body.site) return resposta({ ok: true });

  const dados = {};
  for (const c of CAMPOS) {
    const valor = typeof body[c.key] === "string" ? body[c.key].trim() : "";
    if (c.required && !valor) return resposta({ error: "Preencha o campo " + c.label + "." });
    if (valor.length > c.max) return resposta({ error: "O campo " + c.label + " está muito longo." });
    dados[c.key] = valor;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) return resposta({ error: "E-mail inválido." });
  if (body.consentimento !== true) return resposta({ error: "É preciso autorizar o contato." });

  if (!dentroDoLimite()) return resposta({ error: "Muitas tentativas. Tente novamente mais tarde." });

  const agora = new Date();
  salvarNaPlanilha(dados, agora);
  enviarEmail(dados, agora);
  return resposta({ ok: true });
}

function dentroDoLimite() {
  const cache = CacheService.getScriptCache();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const total = Number(cache.get("envios") || 0);
    if (total >= LIMITE_POR_HORA) return false;
    cache.put("envios", String(total + 1), 3600);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function salvarNaPlanilha(dados, agora) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(["Data"].concat(CAMPOS.map((c) => c.label)));
    aba.setFrozenRows(1);
  }
  // Prefixo "'" impede que textos começando com = + - @ virem fórmulas
  const linha = CAMPOS.map((c) => (/^[=+\-@]/.test(dados[c.key]) ? "'" : "") + dados[c.key]);
  aba.appendRow([agora].concat(linha));
}

function enviarEmail(dados, agora) {
  const linhas = CAMPOS.filter((c) => dados[c.key]);
  const html =
    '<h2 style="font-family:sans-serif">Novo contato pela landing page</h2>' +
    '<table style="font-family:sans-serif;border-collapse:collapse">' +
    linhas
      .map(
        (c) =>
          '<tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">' + c.label +
          '</td><td style="padding:6px 0;white-space:pre-wrap">' + escapar(dados[c.key]) + "</td></tr>"
      )
      .join("") +
    "</table>" +
    '<p style="font-family:sans-serif;color:#777;font-size:12px">Enviado em ' +
    Utilities.formatDate(agora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm") + "</p>";

  MailApp.sendEmail({
    to: EMAIL_DESTINO,
    replyTo: dados.email,
    name: "Site Cellva",
    subject: ("Novo lead: " + dados.empresa + " (" + dados.segmento + ")").replace(/[\r\n]+/g, " "),
    body: linhas.map((c) => c.label + ": " + dados[c.key]).join("\n"),
    htmlBody: html,
  });
}

function escapar(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Rode esta função uma vez pelo editor para autorizar o envio de e-mail e o acesso à planilha.
function testarEnvio() {
  const agora = new Date();
  const teste = { nome: "Teste", empresa: "Cellva (teste)", email: EMAIL_DESTINO, telefone: "-", segmento: "Teste", cidade: "", mensagem: "Mensagem de teste." };
  salvarNaPlanilha(teste, agora);
  enviarEmail(teste, agora);
}
