-- BULLDOG SHOW — Schema do banco de dados
-- Cole este SQL no SQL Editor do Supabase e execute

-- Habilitar autenticação por email
-- (já habilitado por padrão no Supabase)

-- Tabela de episódios
create table if not exists episodes (
  id bigint primary key generated always as identity,
  title text not null default 'Novo Episódio',
  status text not null default 'planejado',
  convidados text[] default '{}',
  tier_list text default '',
  debate text default '',
  game text default '',
  gravacao_data text default '',
  gravacao_horario text default '10:00',
  gravacao_duracao text default '2h',
  local text default 'Rádio FM O Dia',
  endereco text default 'R. Carlos Machado, 131 — Barra da Tijuca, Rio de Janeiro',
  notas text default '',
  mensagem_convidado text default 'Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!',
  retroativo boolean default false,
  links jsonb default '[]',
  investimento numeric default 0,
  roi numeric default 0,
  created_at timestamptz default now()
);

-- Tabela de tier lists
create table if not exists tier_lists (
  id bigint primary key generated always as identity,
  nome text not null,
  estrelas integer default 0,
  created_at timestamptz default now()
);

-- Tabela de convidados
create table if not exists convidados (
  id bigint primary key generated always as identity,
  nome text not null,
  created_at timestamptz default now()
);

-- Tabela de games
create table if not exists games (
  id bigint primary key generated always as identity,
  nome text not null,
  descricao text default '',
  jogadores text default '',
  duracao text default '',
  dificuldade text default 'Fácil',
  ideias text default '',
  estrelas integer default 0,
  created_at timestamptz default now()
);

-- Desabilitar RLS para uso interno (equipe fechada)
alter table episodes disable row level security;
alter table tier_lists disable row level security;
alter table convidados disable row level security;
alter table games disable row level security;

-- Dados iniciais — Tier Lists
insert into tier_lists (nome, estrelas) values
('As Camisas da Seleção BR mais iradas!', 0),
('Se fosse mulher você pegava? (Léo Santana, Cauã Reymond, Rodrigo Hilbert — versão feminina com IA)', 0),
('Os melhores Álbuns de Pagode', 0),
('O sósia + parecido', 0),
('Ditados Populares', 0),
('A melhor novela das 9', 0),
('Os primeiros MEME da história da Internet', 0),
('Constrangimento na tv', 0),
('Tretas de famosos', 0),
('Melhores Gols em Copa', 0),
('Comentários mais bizarros do futebol', 0),
('Falas do Tropa de Elite e Cidade de Deus', 0),
('Comidas lendárias no churrasco', 0),
('A maior comida brasileira', 0),
('Top 10 laricas da humanidade', 0);

-- Dados iniciais — Convidados
insert into convidados (nome) values
('MC Gorila'),('Tília'),('LD Júnior'),('Egídio'),('Gamadinho'),('Gabily'),
('Kamilla Fialho'),('Pimentel'),('Igorfina'),('Tettrem'),('Marcus Braz'),
('Luana Zucoloto'),('Tabet'),('Treinador App'),('Rica Perrone'),
('Samantha Alves'),('Latino'),('Mulher Melão'),('Elisa Sanches'),
('Talita Galhardo'),('Léo Stronda'),('Dennis'),('Pedro Scooby'),
('Viviane Araújo'),('Shana (filha do Maninho)'),('Renan (irmão da Anitta)'),
('Raphael Ghanem'),('Neguere'),('Ninja Sincero'),('Nego Damoé'),
('Pagodeiro'),('Muvuka');

-- Dados iniciais — Games
insert into games (nome, descricao, jogadores, duracao, dificuldade, ideias, estrelas) values
('Contagem Substituída', 'Contar de 1 a 10 alternando os números por nomes ou palavras definidas antes do jogo. Quem errar, paga um mico.', '2+', '5–10 min', 'Fácil', 'Substituir números por nomes de jogadores do Flamengo, palavras proibidas do episódio, nomes de ex famosos', 0),
('Quem Sou Eu?', 'Cada participante tem um nome colado na testa (famoso, personagem, atleta) e precisa adivinhar quem é fazendo perguntas de sim ou não para os outros.', '3+', '10–15 min', 'Médio', 'Usar apenas jogadores de futebol, apenas ex-BBBs, apenas personagens de novela, apenas pagodeiros', 0),
('Mímica', 'Participante recebe uma palavra ou cena e precisa representar só com gestos. Os outros tentam adivinhar no menor tempo possível.', '4+', '10–20 min', 'Médio', 'Categorias temáticas: jogadas de futebol, cenas de novela, músicas de pagode, memes brasileiros, danças famosas', 0),
('Adivinhe a Nota Secreta', 'Um participante pensa em uma nota de 0 a 10. Os outros dão dicas de coisas equivalentes àquela nota. O grupo tenta chegar na nota exata.', '3+', '10–15 min', 'Médio', 'Nota de beleza de celebridades, nota de uma música nova, nota de um jogador na última partida', 0);

-- Dados iniciais — Episódios
insert into episodes (title, status, convidados, tier_list, debate, gravacao_horario, local, endereco, mensagem_convidado) values
('Episódio 1', 'planejado', '{"Neguere","Ninja Sincero"}', 'As Camisas da Seleção BR mais iradas!', 'Neymar tem que ir pra Copa?', '10:00', 'Rádio FM O Dia', 'R. Carlos Machado, 131 — Barra da Tijuca, Rio de Janeiro', 'Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!'),
('Episódio 2', 'planejado', '{"MC Gorila","Nego Damoé"}', 'Se fosse mulher você pegava? (Léo Santana, Cauã Reymond, Rodrigo Hilbert — versão feminina com IA)', 'A definir — aguardar tema em alta', '14:00', 'Rádio FM O Dia', 'R. Carlos Machado, 131 — Barra da Tijuca, Rio de Janeiro', 'Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!'),
('Episódio 3', 'planejado', '{"Pagodeiro","Muvuka"}', 'Os melhores Álbuns de Pagode', 'A definir — aguardar tema em alta', '10:00', 'Rádio FM O Dia', 'R. Carlos Machado, 131 — Barra da Tijuca, Rio de Janeiro', 'Oi! Seja muito bem-vindo(a) ao Bulldog Show 🐶 Mal podemos esperar pra gravar com você!');
