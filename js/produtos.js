// ============================================================
//  CONFIGURAÇÃO DA LOJA — troque aqui
// ============================================================
const LOJA = {
  nome: "Ana B Multimarcas",
  // Número com 55 + DDD + número, só dígitos.
  whatsapp: "5598984477458",
  telefoneVisivel: "(98) 98447-7458", // como o número aparece escrito no site
  instagram: "https://www.instagram.com/anab_multimarcas.oa/",
  instagramNome: "@anab_multimarcas.oa",
  cidade: "Barreirinhas - MA",
  entregas: "Chapadinha, Tutoia, São Luís, Brejo e Parnaíba",
  endereco: "", // ex: "Rua tal, 123 - Centro". Deixe vazio para não mostrar.
  horario: "Segunda a Sábado, 8h às 18h" // EXEMPLO — trocar pelo real
};

// ============================================================
//  BANNER GRANDE (carrossel do topo)
//  imagem: foto de fundo (fica escurecida para o texto aparecer)
//  categoria: ao clicar, mostra essa categoria (vazio = todos)
// ============================================================
const BANNERS = [
  { tag: "Perfumaria e Cosméticos", titulo: "Seu cheiro é sua marca!", texto: "Os melhores preços da região, direto de Barreirinhas para você.", botao: "Ver perfumes", categoria: "", imagem: "imagens/banners/banner-1.jpg" },
  { tag: "Perfumaria Árabe", titulo: "Fragrâncias intensas e marcantes", texto: "Alta fixação para quem gosta de ser lembrado.", botao: "Ver árabes", categoria: "arabe", imagem: "imagens/banners/banner-2.jpg" },
  { tag: "Kits para presente", titulo: "Presentes que encantam", texto: "Kits montados com carinho para todas as ocasiões.", botao: "Ver kits", categoria: "kits", imagem: "imagens/banners/banner-3.jpg" }
];

// ============================================================
//  MINI BANNERS (4 quadros entre as vitrines)
// ============================================================
const MINI_BANNERS = [
  { titulo: "Perfumes Femininos", texto: "Florais, doces e marcantes", categoria: "feminino", imagem: "imagens/banners/mini-feminino.jpg" },
  { titulo: "Perfumes Masculinos", texto: "Amadeirados e cítricos", categoria: "masculino", imagem: "imagens/banners/mini-masculino.jpg" },
  { titulo: "Maquiagem", texto: "Realce sua beleza", categoria: "makes", imagem: "imagens/banners/mini-makes.jpg" },
  { titulo: "Cabelos", texto: "Tratamento completo", categoria: "cabelos", imagem: "imagens/banners/mini-cabelos.jpg" }
];

// ============================================================
//  PRODUTOS — DE EXEMPLO (fotos e preços para demonstração).
//  Troque pelos produtos reais da loja.
//  categoria: feminino | masculino | arabe | kits | makes | cabelos | corpo | joias | infantil
//  imagem: caminho da foto, ex: "imagens/produtos/kit-malbec.jpg"
//  precoAntigo: deixe 0 se não estiver em promoção
//  novidade: true = aparece em "Novidades selecionadas para você"
//  destaque: true = aparece em "Ana B recomenda"
// ============================================================
const PRODUTOS = [
  { id: 1,  nome: "Coco Mademoiselle Eau de Parfum 100ml", marca: "Chanel",          categoria: "feminino",  preco: 989.90, precoAntigo: 1099.90, imagem: "imagens/produtos/coco-mademoiselle.jpg", novidade: true,  destaque: false },
  { id: 2,  nome: "Bleu de Chanel Eau de Parfum 100ml",    marca: "Chanel",          categoria: "masculino", preco: 949.90, precoAntigo: 0,       imagem: "imagens/produtos/bleu-de-chanel.jpg",    novidade: true,  destaque: true },
  { id: 3,  nome: "Eros Eau de Toilette 100ml",            marca: "Versace",         categoria: "masculino", preco: 489.90, precoAntigo: 559.90,  imagem: "imagens/produtos/versace-eros.jpg",      novidade: true,  destaque: false },
  { id: 4,  nome: "Nº5 Eau de Parfum 100ml",               marca: "Chanel",          categoria: "feminino",  preco: 1049.90, precoAntigo: 0,      imagem: "imagens/produtos/chanel-n5.jpg",         novidade: false, destaque: true },
  { id: 5,  nome: "Luna Rossa Black Eau de Parfum 100ml",  marca: "Prada",           categoria: "masculino", preco: 699.90, precoAntigo: 0,       imagem: "imagens/produtos/prada-luna-rossa.jpg",  novidade: true,  destaque: false },
  { id: 6,  nome: "Coco Noir Eau de Parfum 100ml",         marca: "Chanel",          categoria: "feminino",  preco: 999.90, precoAntigo: 0,       imagem: "imagens/produtos/coco-noir.jpg",         novidade: false, destaque: true },
  { id: 7,  nome: "Black Opium Eau de Parfum 90ml",        marca: "Yves Saint Laurent", categoria: "feminino", preco: 749.90, precoAntigo: 829.90, imagem: "imagens/produtos/black-opium.jpg",       novidade: true,  destaque: true },
  { id: 8,  nome: "Acqua di Giò Eau de Toilette 100ml",    marca: "Giorgio Armani",  categoria: "masculino", preco: 589.90, precoAntigo: 0,       imagem: "imagens/produtos/acqua-di-gio.jpg",      novidade: false, destaque: true },
  { id: 9,  nome: "L'Eau Bleue Eau de Parfum 100ml",       marca: "Miu Miu",         categoria: "feminino",  preco: 629.90, precoAntigo: 0,       imagem: "imagens/produtos/miu-miu.jpg",           novidade: true,  destaque: false },
  { id: 10, nome: "Gabrielle Eau de Parfum 100ml",         marca: "Chanel",          categoria: "feminino",  preco: 969.90, precoAntigo: 0,       imagem: "imagens/produtos/gabrielle.jpg",         novidade: false, destaque: false },
  { id: 11, nome: "Perfume Árabe Âmbar Gold 100ml",        marca: "Perfumaria Árabe", categoria: "arabe",    preco: 219.90, precoAntigo: 259.90,  imagem: "imagens/produtos/arabe-ambar.jpg",       novidade: true,  destaque: true },
  { id: 12, nome: "Red Diamond Eau de Parfum 100ml",       marca: "Perfumaria Árabe", categoria: "arabe",    preco: 199.90, precoAntigo: 0,       imagem: "imagens/produtos/arabe-red-diamond.jpg", novidade: true,  destaque: false },
  { id: 13, nome: "Kit Presente Perfume + Hidratante",     marca: "Ana B",           categoria: "kits",      preco: 169.90, precoAntigo: 199.90,  imagem: "imagens/produtos/kit-presente.jpg",      novidade: true,  destaque: true },
  { id: 14, nome: "Kit Natal Surpresa",                    marca: "Ana B",           categoria: "kits",      preco: 129.90, precoAntigo: 0,       imagem: "imagens/produtos/kit-natal.jpg",         novidade: false, destaque: false },
  { id: 15, nome: "Paleta de Sombras 35 Cores",            marca: "Maquiagem",       categoria: "makes",     preco: 89.90,  precoAntigo: 109.90,  imagem: "imagens/produtos/paleta-sombras.jpg",    novidade: false, destaque: true },
  { id: 16, nome: "Batom Cremoso Nude",                    marca: "Maquiagem",       categoria: "makes",     preco: 34.90,  precoAntigo: 0,       imagem: "imagens/produtos/batom.jpg",             novidade: true,  destaque: false },
  { id: 17, nome: "Kit Pincéis + Pó Compacto",             marca: "Maquiagem",       categoria: "makes",     preco: 79.90,  precoAntigo: 0,       imagem: "imagens/produtos/kit-pinceis.jpg",       novidade: false, destaque: false },
  { id: 18, nome: "Kit Shampoo + Condicionador + Máscara", marca: "Cabelos",         categoria: "cabelos",   preco: 99.90,  precoAntigo: 0,       imagem: "imagens/produtos/kit-shampoo.jpg",       novidade: false, destaque: true },
  { id: 19, nome: "Óleo Capilar de Coco 250ml",            marca: "Cabelos",         categoria: "cabelos",   preco: 49.90,  precoAntigo: 0,       imagem: "imagens/produtos/oleo-capilar.jpg",      novidade: true,  destaque: false },
  { id: 20, nome: "Hidratante Corporal 200ml",             marca: "Corpo e Banho",   categoria: "corpo",     preco: 59.90,  precoAntigo: 0,       imagem: "imagens/produtos/hidratante.jpg",        novidade: false, destaque: false },
  { id: 21, nome: "Sérum Facial com Óleos Naturais 30ml",  marca: "Corpo e Banho",   categoria: "corpo",     preco: 69.90,  precoAntigo: 84.90,   imagem: "imagens/produtos/serum.jpg",             novidade: false, destaque: false },
  { id: 22, nome: "Colar de Pérolas",                      marca: "Joias",           categoria: "joias",     preco: 89.90,  precoAntigo: 0,       imagem: "imagens/produtos/colar-perolas.jpg",     novidade: false, destaque: true },
  { id: 23, nome: "Brincos Cravejados Azul Safira",        marca: "Joias",           categoria: "joias",     preco: 59.90,  precoAntigo: 0,       imagem: "imagens/produtos/brincos.jpg",           novidade: true,  destaque: false },
  { id: 24, nome: "Colar Meia-Lua com Pingente",           marca: "Joias",           categoria: "joias",     preco: 49.90,  precoAntigo: 0,       imagem: "imagens/produtos/colar-pingente.jpg",    novidade: false, destaque: false },
  { id: 25, nome: "Kit Brinquedos Infantis",               marca: "Infantil",        categoria: "infantil",  preco: 79.90,  precoAntigo: 0,       imagem: "imagens/produtos/infantil.jpg",          novidade: false, destaque: false }
];

// imagem: foto da bolinha da categoria
const CATEGORIAS = {
  feminino:  { nome: "Perfume Feminino",  imagem: "imagens/produtos/coco-mademoiselle.jpg" },
  masculino: { nome: "Perfume Masculino", imagem: "imagens/produtos/bleu-de-chanel.jpg" },
  arabe:     { nome: "Perfumaria Árabe",  imagem: "imagens/produtos/arabe-ambar.jpg" },
  kits:      { nome: "Kits",              imagem: "imagens/produtos/kit-presente.jpg" },
  makes:     { nome: "Maquiagem",         imagem: "imagens/produtos/paleta-sombras.jpg" },
  cabelos:   { nome: "Cabelos",           imagem: "imagens/produtos/kit-shampoo.jpg" },
  corpo:     { nome: "Corpo e Banho",     imagem: "imagens/produtos/hidratante.jpg" },
  joias:     { nome: "Joias",             imagem: "imagens/produtos/colar-perolas.jpg" },
  infantil:  { nome: "Infantil",          imagem: "imagens/produtos/infantil.jpg" }
};
