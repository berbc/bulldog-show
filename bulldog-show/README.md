# 🐶 Bulldog Show — Production Manager

App de gestão interna da produção + página pública para convidados.

## Estrutura

- `/` → App interno da equipe (episódios, tier lists, convidados, games, calendário)
- `/ep/[id]` → Página pública do convidado (ex: `/ep/1`) — mostra só pauta, data e horário

## Como fazer deploy no Vercel

1. Suba esta pasta para um repositório no GitHub
2. Acesse vercel.com e clique em "Add New Project"
3. Conecte o repositório
4. Clique em Deploy — pronto!

## Atualizar dados

Edite o arquivo `src/lib/data.js` para atualizar episódios, convidados, tier lists e games.

Em breve: integração com banco de dados para editar direto no app.
