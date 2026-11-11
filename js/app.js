const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const real = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

let filtroCategoria = "todos";
let termoBusca = "";
let sacola = [];

const CHAVE_SACOLA = "anab-sacola-v2";
const QTD_MAXIMA = 20;
try {
  const salva = JSON.parse(localStorage.getItem(CHAVE_SACOLA));
  if (Array.isArray(salva)) {
    sacola = salva.filter((i) => i && PRODUTOS.some((p) => p.id === i.id) && Number.isInteger(i.qtd) && i.qtd > 0)
      .map((i) => ({ id: i.id, qtd: Math.min(i.qtd, QTD_MAXIMA) }));
  }
} catch (e) { sacola = []; }

function salvarSacola() {
  try { localStorage.setItem(CHAVE_SACOLA, JSON.stringify(sacola)); } catch (e) {}
}

function linkWhats(texto) {
  return `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`;
}

function linkWhatsProduto(p) {
  return linkWhats(`Olá, Ana B! Vi no site e tenho interesse:\n• ${p.nome} (${p.marca}) — ${real(p.preco)}\nAinda tem disponível?`);
}

// protege o HTML: um nome com aspas ou < > (ex: Perfume "Sweet") não quebra a página
function esc(txt) {
  return String(txt ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const FOTO_PADRAO = `<div class="foto-padrao">${icone("sacola")}</div>`;

function fotoProduto(p) {
  return p.imagem
    ? `<img src="${esc(p.imagem)}" alt="${esc(p.nome)}" loading="lazy">`
    : FOTO_PADRAO;
}

// coloca a foto de fundo pelo JavaScript (e não com style="" no HTML),
// assim a política de segurança (CSP) pode bloquear estilos escritos dentro da página
function aplicarFundos(raiz) {
  raiz.querySelectorAll("[data-fundo]").forEach((el) => {
    el.style.backgroundImage = `url("${encodeURI(el.dataset.fundo)}")`;
  });
}

// foto que não carrega (caminho errado, arquivo apagado) vira o desenho padrão
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG" || img.dataset.falhou) return;
  img.dataset.falhou = "1";
  if (img.closest(".logo, .rodape-marca")) { img.hidden = true; return; }
  img.outerHTML = FOTO_PADRAO;
}, true);

// tira acentos e deixa minúsculo, para "arabe" achar "Árabe"
function normalizar(txt) {
  return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function desconto(p) {
  return p.precoAntigo > p.preco ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
}

// ---------- Régua de vantagens (andando) ----------
function montarRegua() {
  const itens = [
    ["caminhao", "Entregamos", `em ${LOJA.entregas}`],
    ["etiqueta", "Melhores preços", "da região"],
    ["whatsapp", "Pedidos", "pelo WhatsApp"],
    ["loja", "Loja física", "e online"]
  ].map(([ic, forte, resto]) =>
    `<div class="regua-item">${icone(ic)}<p><strong>${esc(forte)}</strong> ${esc(resto)}</p></div>`).join("");
  $("#reguaTexto").textContent =
    `Entregamos em ${LOJA.entregas}. Melhores preços da região. Pedidos pelo WhatsApp. Loja física e online.`;
  const trilho = $("#reguaTrilho");
  // cada grupo precisa ser mais largo que a tela, senão aparece um buraco no fim da volta
  const preencher = () => {
    trilho.innerHTML = `<div class="regua-grupo">${itens}</div>`;
    const larguraItens = trilho.firstElementChild.getBoundingClientRect().width || 1;
    const vezes = Math.max(1, Math.ceil(window.innerWidth / larguraItens));
    const grupo = itens.repeat(vezes);
    // duas cópias iguais para a faixa girar sem emenda
    trilho.innerHTML = `<div class="regua-grupo">${grupo}</div><div class="regua-grupo" aria-hidden="true">${grupo}</div>`;
    trilho.style.setProperty("--vezes", vezes);
  };
  preencher();
  let ultimaLargura = window.innerWidth;
  window.addEventListener("resize", () => {
    if (Math.abs(window.innerWidth - ultimaLargura) < 50) return;
    ultimaLargura = window.innerWidth;
    preencher();
  });
}

// ---------- Banner grande ----------
let bannerAtual = 0;
let timerBanner;

function montarBanners() {
  $("#bannerSlides").innerHTML = BANNERS.map((b, i) => `
    <a href="#vitrine" class="banner-slide ${i === 0 ? "ativo" : ""}" data-cat="${esc(b.categoria || "todos")}"
       data-fundo="${esc(b.imagem)}">
      <div class="container banner-conteudo">
        <div class="banner-texto">
          <span class="banner-tag">${esc(b.tag)}</span>
          ${i === 0 ? `<h1>${esc(b.titulo)}</h1>` : `<h2 class="banner-titulo">${esc(b.titulo)}</h2>`}
          <p>${esc(b.texto)}</p>
          <span class="btn btn-principal">${esc(b.botao)} ${icone("seta")}</span>
        </div>
      </div>
    </a>`).join("");
  aplicarFundos($("#bannerSlides"));
  $("#bannerPontos").innerHTML = BANNERS.map((_, i) =>
    `<button class="${i === 0 ? "ativo" : ""}" data-banner="${i}" aria-label="Banner ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`).join("");
  reiniciarBanner();
}

function irParaBanner(n) {
  const slides = $$(".banner-slide");
  bannerAtual = (n + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle("ativo", i === bannerAtual));
  $$("#bannerPontos button").forEach((p, i) => {
    p.classList.toggle("ativo", i === bannerAtual);
    if (i === bannerAtual) p.setAttribute("aria-current", "true"); else p.removeAttribute("aria-current");
  });
  reiniciarBanner();
}

function reiniciarBanner() {
  clearInterval(timerBanner);
  if (bannerPausado || BANNERS.length < 2) return;
  timerBanner = setInterval(() => irParaBanner(bannerAtual + 1), 6000);
}

let bannerPausado = false;
function ativarBanner() {
  const area = $(".banner-full");
  area.addEventListener("mouseenter", () => { bannerPausado = true; clearInterval(timerBanner); });
  area.addEventListener("mouseleave", () => { bannerPausado = false; reiniciarBanner(); });
  area.addEventListener("focusin", () => { bannerPausado = true; clearInterval(timerBanner); });
  area.addEventListener("focusout", (e) => {
    if (!area.contains(e.relatedTarget)) { bannerPausado = false; reiniciarBanner(); }
  });

  // arrastar com o dedo no celular
  let inicioX = null, inicioY = 0, arrastou = false;
  area.addEventListener("touchstart", (e) => {
    inicioX = e.touches[0].clientX; inicioY = e.touches[0].clientY; arrastou = false;
  }, { passive: true });
  area.addEventListener("touchend", (e) => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    const dy = e.changedTouches[0].clientY - inicioY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      arrastou = true;
      irParaBanner(bannerAtual + (dx < 0 ? 1 : -1));
    }
    inicioX = null;
  });
  // se a pessoa arrastou, não conta como clique no banner
  area.addEventListener("click", (e) => {
    if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; }
  }, true);
}

// ---------- Cartão de produto ----------
function cartao(p) {
  const d = desconto(p);
  return `
    <article class="produto">
      <div class="produto-imagem">
        ${d ? `<span class="selo-desconto">-${d}%</span>` : ""}
        <button class="produto-foto" data-espiar="${p.id}" aria-label="Ver ${esc(p.nome)}">${fotoProduto(p)}</button>
        <button class="espiar" data-espiar="${p.id}">${icone("olho")} Espiar</button>
      </div>
      <div class="produto-info">
        <span class="produto-marca">${esc(p.marca)}</span>
        <button class="produto-nome" data-espiar="${p.id}">${esc(p.nome)}</button>
        <div class="produto-preco">
          ${d ? `<s>${real(p.precoAntigo)}</s>` : ""}
          <strong>${real(p.preco)}</strong>
        </div>
        <a class="btn btn-whats btn-pequeno" target="_blank" rel="noopener" href="${linkWhatsProduto(p)}">${icone("whatsapp")}<span><span class="so-pc">Pedir no </span>WhatsApp</span></a>
        <button class="btn-add" data-add="${p.id}">${icone("mais")} Adicionar ao pedido</button>
      </div>
    </article>`;
}

// ---------- Janela "Espiar" ----------
function espiar(id) {
  const p = PRODUTOS.find((x) => x.id === id);
  if (!p) return;
  const d = desconto(p);
  $("#modalConteudo").innerHTML = `
    <div class="modal-foto">${fotoProduto(p)}</div>
    <div class="modal-info">
      <span class="modal-marca">${esc(p.marca)}</span>
      <h2 id="modalTitulo">${esc(p.nome)}</h2>
      <span class="modal-cat">${esc(CATEGORIAS[p.categoria]?.nome)}</span>
      <div class="produto-preco modal-preco">
        ${d ? `<s>${real(p.precoAntigo)}</s>` : ""}
        <strong>${real(p.preco)}</strong>
        ${d ? `<span class="economia">Economize ${real(p.precoAntigo - p.preco)}</span>` : ""}
      </div>
      <a class="btn btn-whats" target="_blank" rel="noopener" href="${linkWhatsProduto(p)}">${icone("whatsapp")} Pedir no WhatsApp</a>
      <button class="btn btn-contorno" data-add="${p.id}">${icone("mais")} Adicionar ao pedido</button>
      <ul class="modal-vantagens">
        <li>${icone("caminhao")} Entregamos em ${esc(LOJA.entregas)}</li>
        <li>${icone("loja")} Ou retire na loja</li>
        <li>${icone("escudo")} Produto original</li>
      </ul>
    </div>`;
  if ($("#modal").hidden) ultimoFoco = document.activeElement;
  $("#modal").hidden = false;
  $(".modal-caixa").setAttribute("aria-labelledby", "modalTitulo");
  document.body.classList.add("travado");
  $(".modal-fechar").focus();
}

let ultimoFoco = null;
function fecharModal() {
  if ($("#modal").hidden) return;
  $("#modal").hidden = true;
  document.body.classList.remove("travado");
  if (ultimoFoco) ultimoFoco.focus();
}

// ---------- Montagem das seções ----------
function montarMenu() {
  const itens = Object.entries(CATEGORIAS);
  $("#departamentosLista").innerHTML =
    `<a href="#vitrine" data-cat="todos">Ver todos os produtos</a>` +
    itens.map(([k, c]) => `<a href="#vitrine" data-cat="${k}">${esc(c.nome)}</a>`).join("");
  $("#menuLinks").innerHTML =
    `<a href="#vitrine" data-cat="todos" class="so-celular">Todos os produtos</a>` +
    itens.map(([k, c]) => `<a href="#vitrine" data-cat="${k}">${esc(c.nome)}</a>`).join("") +
    `<a href="#" data-whats class="so-celular menu-extra">${icone("whatsapp")} Falar no WhatsApp</a>` +
    `<a href="${esc(LOJA.instagram)}" target="_blank" rel="noopener" class="so-celular menu-extra">${icone("instagram")} Instagram</a>`;
  $("#rodapeCategorias").innerHTML = itens.map(([k, c]) => `<a href="#vitrine" data-cat="${k}">${esc(c.nome)}</a>`).join("");
}

function montarMiniBanners() {
  $("#miniBanners").innerHTML = MINI_BANNERS.map((b) => `
    <a href="#vitrine" class="mini-banner" data-cat="${esc(b.categoria)}" data-fundo="${esc(b.imagem)}">
      <div>
        <strong>${esc(b.titulo)}</strong>
        <span>${esc(b.texto)}</span>
        <em>Confira ${icone("seta")}</em>
      </div>
    </a>`).join("");
  aplicarFundos($("#miniBanners"));
}

function montarCategorias() {
  $("#categorias").innerHTML = Object.entries(CATEGORIAS).map(([k, c]) => `
    <a href="#vitrine" class="categoria" data-cat="${k}">
      <span class="categoria-foto"><img src="${esc(c.imagem)}" alt="" loading="lazy"></span>
      <span>${esc(c.nome)}</span>
    </a>`).join("");
}

function montarVitrines() {
  $("#novidades").innerHTML = PRODUTOS.filter((p) => p.novidade).map(cartao).join("");
  $("#recomendados").innerHTML = PRODUTOS.filter((p) => p.destaque).map(cartao).join("");
}

function montarFiltros() {
  const botoes = [["todos", "Todos"]].concat(Object.entries(CATEGORIAS).map(([k, c]) => [k, c.nome]));
  const filtros = $("#filtros");
  filtros.innerHTML = botoes.map(([k, n]) =>
    `<button class="filtro ${filtroCategoria === k ? "ativo" : ""}" data-cat="${k}" aria-pressed="${filtroCategoria === k}">${esc(n)}</button>`).join("");
  const ativo = filtros.querySelector(".ativo");
  if (ativo && filtros.scrollWidth > filtros.clientWidth) {
    filtros.scrollLeft = ativo.offsetLeft - (filtros.clientWidth - ativo.offsetWidth) / 2;
  }
}

function montarTodos() {
  const temBusca = termoBusca.trim() !== "";
  const lista = (temBusca ? resultadosBusca(termoBusca) : PRODUTOS)
    .filter((p) => filtroCategoria === "todos" || p.categoria === filtroCategoria);
  $("#produtos").innerHTML = lista.map(cartao).join("");
  $("#vazio").hidden = lista.length > 0;

  let titulo = filtroCategoria === "todos" ? "Todos os produtos" : CATEGORIAS[filtroCategoria].nome;
  if (temBusca) titulo = `Resultados para "${termoBusca}"`;
  $("#vitrineTitulo").textContent = titulo;
  montarFiltros();
}

// ---------- Carrosséis de produtos ----------
function ativarCarrosseis() {
  $$("[data-carrossel]").forEach((c) => {
    const lista = c.querySelector(".carrossel-lista");
    const passo = () => lista.clientWidth * 0.8;
    const esq = c.querySelector(".seta-esq");
    const dir = c.querySelector(".seta-dir");
    esq.addEventListener("click", () => lista.scrollBy({ left: -passo(), behavior: "smooth" }));
    dir.addEventListener("click", () => lista.scrollBy({ left: passo(), behavior: "smooth" }));
    const atualizarSetas = () => {
      const fim = lista.scrollWidth - lista.clientWidth - 2;
      esq.disabled = lista.scrollLeft <= 2;
      dir.disabled = lista.scrollLeft >= fim;
      c.classList.toggle("sem-rolagem", fim <= 0);
    };
    lista.addEventListener("scroll", atualizarSetas, { passive: true });
    window.addEventListener("resize", atualizarSetas);
    window.addEventListener("load", atualizarSetas);
    atualizarSetas();
  });
}

// ---------- Sacola (pedido vai para o WhatsApp) ----------
function adicionar(id) {
  const item = sacola.find((i) => i.id === id);
  if (item && item.qtd >= QTD_MAXIMA) return mostrarAviso(`Máximo de ${QTD_MAXIMA} unidades por produto`);
  if (item) item.qtd++;
  else sacola.push({ id, qtd: 1 });
  salvarSacola();
  atualizarSacola();
  mostrarAviso("Adicionado ao pedido!");
}

function mudarQtd(id, delta) {
  const item = sacola.find((i) => i.id === id);
  if (!item) return;
  item.qtd = Math.min(item.qtd + delta, QTD_MAXIMA);
  if (item.qtd <= 0) sacola = sacola.filter((i) => i.id !== id);
  salvarSacola();
  atualizarSacola();
}

function itensSacola() {
  return sacola.map((i) => ({ ...PRODUTOS.find((p) => p.id === i.id), qtd: i.qtd })).filter((i) => i.nome);
}

function atualizarSacola() {
  const itens = itensSacola();
  const qtd = itens.reduce((s, i) => s + i.qtd, 0);
  const total = itens.reduce((s, i) => s + i.qtd * i.preco, 0);
  $("#sacolaQtd").textContent = qtd;
  $("#sacolaQtd").hidden = qtd === 0;
  $("#sacolaItensTexto").textContent = `${qtd} ${qtd === 1 ? "item" : "itens"}`;
  $("#abrirSacola").setAttribute("aria-label", `Ver meu pedido, ${qtd} ${qtd === 1 ? "item" : "itens"}`);
  $("#sacolaTotal").textContent = real(total);
  $("#sacolaItens").innerHTML = itens.length
    ? itens.map((i) => `
      <div class="sacola-item">
        <div class="sacola-item-foto">${fotoProduto(i)}</div>
        <div class="sacola-item-info">
          <strong>${esc(i.nome)}</strong>
          <span>${real(i.preco)}</span>
          <div class="qtd">
            <button data-menos="${i.id}" aria-label="Diminuir ${esc(i.nome)}">${icone("menos")}</button>
            <span>${i.qtd}</span>
            <button data-mais="${i.id}" aria-label="Aumentar ${esc(i.nome)}"${i.qtd >= QTD_MAXIMA ? " disabled" : ""}>${icone("mais")}</button>
          </div>
        </div>
      </div>`).join("")
    : `<div class="sacola-vazia">${icone("sacola")}<p>Seu pedido está vazio.<br>Adicione os produtos que você gostou e envie tudo de uma vez pelo WhatsApp!</p></div>`;
  $("#finalizar").disabled = itens.length === 0;
  $("#esvaziar").hidden = itens.length === 0;
}

function finalizar() {
  const itens = itensSacola();
  if (!itens.length) return;
  const nome = $("#nomeCliente").value.trim();
  const entrega = $("#entrega").value;
  const endereco = $("#enderecoCliente").value.trim();
  const total = itens.reduce((s, i) => s + i.qtd * i.preco, 0);
  const linhas = [
    "Olá, Ana B! Quero fazer um pedido:",
    ...(nome ? [`Nome: ${nome}`] : []),
    "",
    ...itens.map((i) => `• ${i.qtd}x ${i.nome} — ${real(i.qtd * i.preco)}`),
    "",
    `Total: ${real(total)}`,
    `Forma: ${entrega}`,
    ...(entrega === "Entrega" ? [`Endereço: ${endereco || "vou informar aqui na conversa"}`] : [])
  ];
  const link = linkWhats(linhas.join("\n"));
  const janela = window.open(link, "_blank");
  if (janela) {
    // a aba nova não ganha acesso de volta a esta página (proteção contra "tabnabbing")
    try { janela.opener = null; } catch (e) {}
  } else {
    window.location.href = link; // navegador bloqueou a janela nova
  }
  try {
    localStorage.setItem("anab-nome", nome);
    localStorage.setItem("anab-endereco", endereco);
    localStorage.setItem("anab-entrega", entrega);
  } catch (e) {}
  mostrarAviso("Pedido enviado para o WhatsApp!");
}

function esvaziarSacola() {
  if (!sacola.length || !confirm("Tirar todos os produtos do pedido?")) return;
  sacola = [];
  salvarSacola();
  atualizarSacola();
}

let focoAntesSacola = null;
function abrirSacola() {
  fecharModal();
  fecharMenu();
  esconderSugestoes();
  focoAntesSacola = document.activeElement;
  document.body.classList.add("sacola-aberta");
  $("#sacola").removeAttribute("inert");
  setTimeout(() => $("#fecharSacola").focus(), 50);
}
function fecharSacola() {
  if (!document.body.classList.contains("sacola-aberta")) return;
  document.body.classList.remove("sacola-aberta");
  $("#sacola").setAttribute("inert", "");
  if (focoAntesSacola) focoAntesSacola.focus();
}

// Tab não sai da janela "Espiar" nem da sacola enquanto estão abertas
function prenderFoco(e) {
  if (e.key !== "Tab") return;
  const caixa = !$("#modal").hidden ? $(".modal-caixa")
    : document.body.classList.contains("sacola-aberta") ? $("#sacola") : null;
  if (!caixa) return;
  const focaveis = [...caixa.querySelectorAll("a[href], button:not([disabled]), input, select")]
    .filter((el) => el.offsetParent !== null);
  if (!focaveis.length) return;
  const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
  if (!caixa.contains(document.activeElement)) { e.preventDefault(); primeiro.focus(); }
  else if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
}

let timerAviso;
function mostrarAviso(txt) {
  const a = $("#aviso");
  a.innerHTML = `${icone("sacola")} ${esc(txt)}`;
  a.classList.add("visivel");
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => a.classList.remove("visivel"), 1800);
}

// ---------- Eventos ----------
document.addEventListener("click", (e) => {
  const alvo = (s) => e.target.closest(s);

  if (alvo("[data-fechar-modal]")) return fecharModal();

  const sug = alvo("[data-sugestao]");
  if (sug) { esconderSugestoes(); return espiar(Number(sug.dataset.sugestao)); }
  if (alvo("[data-ver-resultados]")) return verResultados();
  if (!alvo(".busca-area")) esconderSugestoes();

  const banner = alvo("[data-banner]");
  if (banner) return irParaBanner(Number(banner.dataset.banner));

  const esp = alvo("[data-espiar]");
  if (esp) return espiar(Number(esp.dataset.espiar));

  const add = alvo("[data-add]");
  if (add) return adicionar(Number(add.dataset.add));

  const mais = alvo("[data-mais]");
  if (mais) return mudarQtd(Number(mais.dataset.mais), 1);
  const menos = alvo("[data-menos]");
  if (menos) return mudarQtd(Number(menos.dataset.menos), -1);

  const cat = alvo("[data-cat]");
  if (cat) {
    filtroCategoria = cat.dataset.cat;
    termoBusca = "";
    $("#busca").value = "";
    fecharMenu();
    fecharDepartamentos();
    montarTodos();
    if (cat.tagName === "BUTTON") return;
  }

  if (!alvo(".departamentos")) fecharDepartamentos();
  if (!alvo(".header")) fecharMenu();
});

function fecharMenu() {
  document.body.classList.remove("menu-aberto");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}
function fecharDepartamentos() {
  $(".departamentos").classList.remove("aberto");
  $("#departamentosBtn").setAttribute("aria-expanded", "false");
}

document.addEventListener("keydown", (e) => {
  prenderFoco(e);
  if (e.key === "Escape") {
    if (!$("#modal").hidden) return fecharModal(); // Esc fecha uma coisa de cada vez
    fecharSacola(); fecharMenu(); fecharDepartamentos(); esconderSugestoes();
  }
});

function buscar() {
  termoBusca = $("#busca").value.trim();
  filtroCategoria = "todos";
  montarTodos();
}

function resultadosBusca(termo) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (!palavras.length) return [];
  return PRODUTOS.filter((p) => {
    const texto = normalizar(`${p.nome} ${p.marca} ${CATEGORIAS[p.categoria]?.nome}`);
    return palavras.every((w) => texto.includes(w));
  });
}

let sugestaoAtiva = -1;
function mostrarSugestoes() {
  const termo = $("#busca").value.trim();
  const caixa = $("#sugestoes");
  if (termo.length < 2) return esconderSugestoes();
  const achados = resultadosBusca(termo);
  sugestaoAtiva = -1;
  caixa.innerHTML = achados.length
    ? achados.slice(0, 5).map((p) => `
      <button class="sugestao" role="option" data-sugestao="${p.id}">
        <span class="sugestao-foto">${fotoProduto(p)}</span>
        <span class="sugestao-texto"><small>${esc(p.marca)}</small>${esc(p.nome)}</span>
        <strong>${real(p.preco)}</strong>
      </button>`).join("") +
      `<button class="sugestao-todos" data-ver-resultados>Ver ${achados.length === 1 ? "o resultado" : `os ${achados.length} resultados`} ${icone("seta")}</button>`
    : `<p class="sugestao-nada">Nada encontrado para "${esc(termo)}". <a href="#" data-whats-busca>Pergunte no WhatsApp</a></p>`;
  const zap = caixa.querySelector("[data-whats-busca]");
  if (zap) {
    zap.href = linkWhats(`Olá, Ana B! Vocês têm "${termo}"?`);
    zap.target = "_blank"; zap.rel = "noopener";
  }
  caixa.hidden = false;
  $("#busca").setAttribute("aria-expanded", "true");
}

function esconderSugestoes() {
  $("#sugestoes").hidden = true;
  $("#busca").setAttribute("aria-expanded", "false");
  sugestaoAtiva = -1;
}

function verResultados() {
  buscar();
  esconderSugestoes();
  $("#busca").blur();
  $("#vitrine").scrollIntoView({ behavior: "smooth" });
}

$("#busca").addEventListener("input", () => { buscar(); mostrarSugestoes(); });
$("#busca").addEventListener("focus", mostrarSugestoes);
$("#busca").addEventListener("keydown", (e) => {
  const opcoes = [...$$("#sugestoes .sugestao, #sugestoes .sugestao-todos")];
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && opcoes.length && !$("#sugestoes").hidden) {
    e.preventDefault();
    sugestaoAtiva = (sugestaoAtiva + (e.key === "ArrowDown" ? 1 : -1) + opcoes.length) % opcoes.length;
    opcoes.forEach((o, i) => o.classList.toggle("ativa", i === sugestaoAtiva));
    opcoes[sugestaoAtiva].scrollIntoView({ block: "nearest" });
  }
  if (e.key === "Enter" && sugestaoAtiva >= 0 && opcoes[sugestaoAtiva]) {
    e.preventDefault();
    e.stopImmediatePropagation();
    opcoes[sugestaoAtiva].click();
  }
});
$("#busca").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    verResultados();
  }
});
$("#buscaBtn").addEventListener("click", verResultados);

$("#departamentosBtn").addEventListener("click", () => {
  const aberto = $(".departamentos").classList.toggle("aberto");
  $("#departamentosBtn").setAttribute("aria-expanded", aberto);
});
$("#menuToggle").addEventListener("click", () => {
  const aberto = document.body.classList.toggle("menu-aberto");
  $("#menuToggle").setAttribute("aria-expanded", aberto);
});
$("#bannerAnterior").addEventListener("click", () => irParaBanner(bannerAtual - 1));
$("#bannerProximo").addEventListener("click", () => irParaBanner(bannerAtual + 1));
$("#abrirSacola").addEventListener("click", abrirSacola);
$("#fecharSacola").addEventListener("click", fecharSacola);
$("#continuar").addEventListener("click", fecharSacola);
$("#sacolaFundo").addEventListener("click", fecharSacola);
$("#finalizar").addEventListener("click", finalizar);
$("#esvaziar").addEventListener("click", esvaziarSacola);
try {
  $("#nomeCliente").value = localStorage.getItem("anab-nome") || "";
  $("#enderecoCliente").value = localStorage.getItem("anab-endereco") || "";
  if (localStorage.getItem("anab-entrega") === "Retirada na loja") $("#entrega").value = "Retirada na loja";
} catch (e) {}
// campo de endereço só aparece quando é entrega
function mostrarCampoEndereco() { $("#campoEndereco").hidden = $("#entrega").value !== "Entrega"; }
$("#entrega").addEventListener("change", mostrarCampoEndereco);
mostrarCampoEndereco();
try { localStorage.removeItem("anab-sacola"); } catch (e) {} // chave da versão antiga

// ---------- Início ----------
$("#sacola").setAttribute("inert", "");
trocarIcones();
montarRegua();
montarBanners();
ativarBanner();
montarMenu();
montarMiniBanners();
montarCategorias();
montarVitrines();
montarTodos();
ativarCarrosseis();
atualizarSacola();

$$("[data-whats]").forEach((a) => {
  a.href = linkWhats("Olá, Ana B! Vim pelo site e gostaria de mais informações.");
  a.target = "_blank";
  a.rel = "noopener";
});
["#linkInstagramTopo", "#linkInstagramNews", "#linkInstagramRodape"].forEach((s) => ($(s).href = LOJA.instagram));
$("#linkInstagramNews").innerHTML = `${icone("instagram")} Seguir ${esc(LOJA.instagramNome)}`;
$("#telefoneRodape").textContent = LOJA.telefoneVisivel;
$("#horarioRodape").textContent = LOJA.horario;
$("#enderecoRodape").textContent = LOJA.endereco ? `${LOJA.endereco} · ${LOJA.cidade}` : LOJA.cidade;
$("#entregasRodape").textContent = `Entregamos em ${LOJA.entregas}`;
$("#ano").textContent = new Date().getFullYear();
