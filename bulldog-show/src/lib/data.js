// src/lib/data.js
// Fonte de dados central do Bulldog Show.
// Em produção, substitua por um banco de dados real (ex: Supabase, PlanetScale).

export const EPISODES = [
  {
    id: 1,
    title: "Episódio 1",
    status: "planejado",
    convidados: ["Neguere", "Ninja Sincero"],
    tierList: "As Camisas da Seleção BR mais iradas!",
    debate: "Neymar tem que ir pra Copa?",
    game: "",
    gravacao: { data: "", horario: "10:00", duracao: "2h" },
    local: "Estúdio Bulldog",
    endereco: "A confirmar",
    notas: "",
    mensagemConvidado: "Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!"
  },
  {
    id: 2,
    title: "Episódio 2",
    status: "planejado",
    convidados: ["MC Gorila", "Nego Damoé"],
    tierList: "Se fosse mulher você pegava? (Léo Santana, Cauã Reymond, Rodrigo Hilbert — versão feminina com IA)",
    debate: "A definir — aguardar tema em alta",
    game: "",
    gravacao: { data: "", horario: "14:00", duracao: "2h" },
    local: "Estúdio Bulldog",
    endereco: "A confirmar",
    notas: "",
    mensagemConvidado: "Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!"
  },
  {
    id: 3,
    title: "Episódio 3",
    status: "planejado",
    convidados: ["Pagodeiro", "Muvuka"],
    tierList: "Os melhores Álbuns de Pagode",
    debate: "A definir — aguardar tema em alta",
    game: "",
    gravacao: { data: "", horario: "10:00", duracao: "2h" },
    local: "Estúdio Bulldog",
    endereco: "A confirmar",
    notas: "",
    mensagemConvidado: "Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!"
  }
];

export const TIER_LISTS = [
  "As Camisas da Seleção BR mais iradas!",
  "Se fosse mulher você pegava? (Léo Santana, Cauã Reymond, Rodrigo Hilbert — versão feminina com IA)",
  "Os melhores Álbuns de Pagode",
  "O sósia + parecido",
  "Ditados Populares",
  "A melhor novela das 9",
  "Os primeiros MEME da história da Internet",
  "Constrangimento na tv",
  "Tretas de famosos",
  "Melhores Gols em Copa",
  "Comentários mais bizarros do futebol",
  "Falas do Tropa de Elite e Cidade de Deus",
  "Comidas lendárias no churrasco",
  "A maior comida brasileira",
  "Top 10 laricas da humanidade"
];

export const CONVIDADOS = [
  "Dennis","Egídio","Elisa Sanches","Gabily","Gamadinho",
  "Igorfina","Kamilla Fialho","Latino","LD Júnior","Léo Stronda",
  "Luana Zucoloto","Marcus Braz","MC Gorila","Mulher Melão","Muvuka",
  "Nego Damoé","Neguere","Ninja Sincero","Pagodeiro","Pedro Scooby",
  "Pimentel","Raphael Ghanem","Renan (irmão da Anitta)","Rica Perrone",
  "Samantha Alves","Shana (filha do Maninho)","Tabet","Talita Galhardo",
  "Tettrem","Tília","Treinador App","Viviane Araújo"
];

export const GAMES = [
  {
    id: "g1",
    nome: "Contagem Substituída",
    descricao: "Contar de 1 a 10 alternando os números por nomes ou palavras definidas antes do jogo. Quem errar, paga um mico.",
    jogadores: "2+",
    duracao: "5–10 min",
    dificuldade: "Fácil",
    ideias: "Substituir números por nomes de jogadores do Flamengo, palavras proibidas do episódio, nomes de ex famosos"
  },
  {
    id: "g2",
    nome: "Quem Sou Eu?",
    descricao: "Cada participante tem um nome colado na testa (famoso, personagem, atleta) e precisa adivinhar quem é fazendo perguntas de sim ou não para os outros.",
    jogadores: "3+",
    duracao: "10–15 min",
    dificuldade: "Médio",
    ideias: "Usar apenas jogadores de futebol, apenas ex-BBBs, apenas personagens de novela, apenas pagodeiros"
  },
  {
    id: "g3",
    nome: "Mímica",
    descricao: "Participante recebe uma palavra ou cena e precisa representar só com gestos. Os outros tentam adivinhar no menor tempo possível.",
    jogadores: "4+",
    duracao: "10–20 min",
    dificuldade: "Médio",
    ideias: "Categorias temáticas: jogadas de futebol, cenas de novela, músicas de pagode, memes brasileiros, danças famosas"
  },
  {
    id: "g4",
    nome: "Adivinhe a Nota Secreta",
    descricao: "Um participante pensa em uma nota de 0 a 10. Os outros dão dicas de coisas equivalentes àquela nota. O grupo tenta chegar na nota exata.",
    jogadores: "3+",
    duracao: "10–15 min",
    dificuldade: "Médio",
    ideias: "Nota de beleza de celebridades, nota de uma música nova, nota de um jogador na última partida"
  }
];
