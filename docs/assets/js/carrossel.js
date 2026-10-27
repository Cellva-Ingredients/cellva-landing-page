// Carrossel de produtos: cards lado a lado que andam de um em um.
// Setas, pontos, arrastar no celular e troca automática a cada 6 s.
// A troca automática pausa quando o mouse ou o foco está no carrossel e fica desligada
// para quem prefere menos movimento.

(function () {
  const carrossel = document.querySelector(".carrossel");
  if (!carrossel) return;

  const trilho = carrossel.querySelector(".carrossel-trilho");
  const slides = Array.from(trilho.querySelectorAll(".produto-slide"));
  const pontosEl = carrossel.querySelector(".carrossel-pontos");
  const INTERVALO = 6000;
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let atual = 0;
  let timer = null;
  let pausado = false;
  let pontos = [];

  // Distância entre o início de um card e o do próximo (largura + espaço)
  function passo() {
    return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : trilho.clientWidth;
  }

  // Quantos cards inteiros cabem na tela e quantas posições o carrossel tem
  function visiveis() {
    const espaco = passo() - slides[0].offsetWidth;
    return Math.max(1, Math.floor((trilho.clientWidth + espaco + 1) / passo()));
  }
  function posicoes() {
    return Math.max(1, slides.length - visiveis() + 1);
  }

  function criarPontos() {
    pontosEl.innerHTML = "";
    pontos = Array.from({ length: posicoes() }, (_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carrossel-ponto";
      b.setAttribute("role", "tab");
      b.addEventListener("click", () => { irPara(i); reiniciar(); });
      pontosEl.appendChild(b);
      return b;
    });
    pontosEl.hidden = pontos.length < 2;
    carrossel.querySelectorAll(".carrossel-seta").forEach((b) => { b.hidden = pontos.length < 2; });
    rotularPontos();
    marcar(Math.min(atual, pontos.length - 1));
  }

  function rotularPontos() {
    pontos.forEach((b, i) => b.setAttribute("aria-label", t("carrossel.irPara") + " " + (i + 1)));
  }

  function marcar(i) {
    atual = i;
    const ultimoVisivel = i + visiveis() - 1;
    pontos.forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
    slides.forEach((s, j) => s.setAttribute("aria-hidden", String(j < i || j > ultimoVisivel)));
  }

  function irPara(i) {
    const total = posicoes();
    const alvo = ((i % total) + total) % total;
    trilho.scrollTo({ left: alvo * passo(), behavior: reduzirMovimento ? "auto" : "smooth" });
    marcar(alvo);
  }

  // Atualiza o ponto ativo quando o visitante arrasta o carrossel
  let espera;
  trilho.addEventListener("scroll", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 2;
      const i = fim ? posicoes() - 1 : Math.round(trilho.scrollLeft / passo());
      if (i !== atual) marcar(Math.min(i, posicoes() - 1));
    }, 80);
  });

  carrossel.querySelectorAll(".carrossel-seta").forEach((b) => {
    b.addEventListener("click", () => { irPara(atual + Number(b.dataset.dir)); reiniciar(); });
  });

  function iniciar() {
    if (reduzirMovimento || timer) return;
    timer = setInterval(() => { if (!pausado && !document.hidden && posicoes() > 1) irPara(atual + 1); }, INTERVALO);
  }
  function reiniciar() { clearInterval(timer); timer = null; iniciar(); }

  carrossel.addEventListener("mouseenter", () => { pausado = true; });
  carrossel.addEventListener("mouseleave", () => { pausado = false; });
  carrossel.addEventListener("focusin", () => { pausado = true; });
  carrossel.addEventListener("focusout", () => { pausado = false; });
  trilho.addEventListener("touchstart", () => { pausado = true; }, { passive: true });
  trilho.addEventListener("touchend", () => { pausado = false; reiniciar(); }, { passive: true });

  // Ao girar o celular ou redimensionar a janela, recalcula quantos cards cabem
  let ultimoTotal = posicoes();
  window.addEventListener("resize", () => {
    if (posicoes() !== ultimoTotal) { ultimoTotal = posicoes(); criarPontos(); }
  });

  document.addEventListener("idiomachange", rotularPontos);

  criarPontos();
  iniciar();
})();
