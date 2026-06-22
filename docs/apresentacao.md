# Apresentação / Defesa — Agenda de Contatos (Supabase)

> Roteiro para demonstrar o app funcionando e responder às perguntas do
> professor sobre **código**, **fluxo de dados** e **segurança**.

- **Disciplina:** Desenvolvimento de Aplicação em Nuvem
- **Integrantes:** JOÃO PEDRO OLIVEIRA DA SILVA E LUIZ FLÁVIO DE OLIVEIRA PINTO
- **Banco escolhido:** Supabase (PostgreSQL) + RLS
- **App publicado:** https://desenvolvedorjj.github.io/crud-contatos-cloud/

---

## 1) O que é o projeto (1 frase)

Uma agenda de contatos web (página única, Vanilla JS) que faz **CRUD completo**
em um banco PostgreSQL hospedado no **Supabase**, com segurança garantida por
**Row Level Security (RLS)**.

---

## 2) Fluxo dos dados (como funciona por dentro)

```
[ Navegador / index.html ]
        │  evento (submit, clique)
        ▼
[ js/app.js ]  → monta o objeto { nome, email, telefone, obs, dtcontato }
        │  usa o SDK supabase-js com a anon key (js/config.js)
        ▼
[ API REST do Supabase ]  → verifica as POLÍTICAS DE RLS
        │  (permite/nega a operação para a role "anon")
        ▼
[ PostgreSQL · tabela "contato" ]
        │  retorna os dados
        ▼
[ app.js renderiza a tabela (renderTabela) ]
```

Mapa **operação → código → SQL**:

| Ação na tela | Função em `app.js` | SDK Supabase | SQL equivalente |
|--------------|--------------------|--------------|-----------------|
| Listar/Buscar | `carregarContatos()` | `.from('contato').select().ilike()` | `SELECT ... WHERE nome ILIKE ...` |
| Salvar (novo) | `salvar()` | `.insert([...])` | `INSERT INTO contato ...` |
| Salvar (edição) | `salvar()` | `.update().eq('id', id)` | `UPDATE contato SET ... WHERE id = ?` |
| Excluir | `excluir()` | `.delete().eq('id', id)` | `DELETE FROM contato WHERE id = ?` |


