# 📒 Agenda de Contatos — CRUD na Nuvem com Supabase

Aplicação web de página única (HTML5 + CSS3 + JavaScript nativo) que gerencia
uma agenda de contatos integrada a um banco de dados na nuvem (BaaS).
Atividade prática de **Desenvolvimento de Aplicação em Nuvem**.

## 👥 Alunos:

- JOÃO PEDRO OLIVEIRA DA SILVA
- LUIZ FLÁVIO DE OLIVEIRA PINTO

## 🗄️ Banco de dados escolhido

**Supabase** (PostgreSQL relacional) — usado como **BaaS** para persistência
dos contatos, com **RLS (Row Level Security)** habilitado para proteger a tabela.

## 🌐 Aplicação publicada (GitHub Pages)

🔗 **https://desenvolvedorjj.github.io/crud-contatos-cloud/**

> Atualize o link acima após ativar o GitHub Pages (ver seção *Deploy*).

---

## ✨ Funcionalidades

- **Listar** contatos (ordenados por nome).
- **Buscar** por nome (filtro parcial, sem diferenciar maiúsculas/minúsculas).
- **Cadastrar** novo contato (nome, telefone, e-mail, data e observação).
- **Editar** um contato existente (mesmo formulário).
- **Excluir** com confirmação.
- Atualização **em tempo real** (Supabase Realtime, opcional) ou logo após cada operação.

## 🧱 Estrutura do projeto

```
crud-contatos-cloud/
├── index.html              # Estrutura da página (formulário, busca, tabela)
├── css/
│   └── style.css           # Estilo (layout limpo e responsivo)
├── js/
│   ├── config.js           # URL + anon key do Supabase (você preenche)
│   └── app.js              # Lógica CRUD (SELECT/INSERT/UPDATE/DELETE)
├── sql/
│   └── setup.sql           # Cria a tabela + habilita RLS + políticas
├── docs/
│   └── apresentacao.md     # Roteiro da defesa / apresentação
└── README.md
```

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS) — sem framework, sem build.
- **Banco:** Supabase (PostgreSQL) via SDK oficial `@supabase/supabase-js` (CDN).
- **Hospedagem:** GitHub Pages (site estático).

---

## ⚙️ Como rodar / configurar

### 1. Criar o projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Vá em **SQL Editor → New query**, cole o conteúdo de [`sql/setup.sql`](sql/setup.sql) e execute.
   Isso cria a tabela `contato`, **habilita o RLS** e cria as **políticas de acesso**.

### 2. Pegar as credenciais
No Dashboard do Supabase → **Project Settings → API**:
- **Project URL** → `SUPABASE_URL`
- Chave **anon / public** → `SUPABASE_ANON_KEY`

Cole as duas em [`js/config.js`](js/config.js):

```js
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY_AQUI";
```

### 3. Rodar localmente
Por ser site estático, basta abrir o `index.html`. Para evitar bloqueios de
CORS/Realtime, prefira servir por HTTP:

```bash
# Python
python -m http.server 5500
# ou Node
npx serve .
```
Abra `http://localhost:5500`.

---

## 🚀 Deploy no GitHub Pages

1. Suba o projeto para um repositório no GitHub (o `index.html` **deve** estar na raiz).
2. No repositório: **Settings → Pages**.
3. Em *Build and deployment* → **Source: Deploy from a branch**.
4. *Branch*: `main` · pasta `/ (root)` → **Save**.
5. Em ~1–2 min o site fica em `https://desenvolvedorjj.github.io/crud-contatos-cloud/`.

---

## 🔒 Segurança implementada (obrigatório na atividade)

Como a app roda inteiramente no navegador, a chave de conexão fica visível no
código. A proteção real está **no banco**, via RLS:

- **RLS habilitado** na tabela `contato` (`enable row level security`). Sem
  políticas, o padrão vira **negar tudo** — nada de "modo teste público".
- **Políticas explícitas por operação** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
  para a role **`anon`**.
- **Validação no servidor** com `WITH CHECK` no INSERT/UPDATE: nome obrigatório,
  tamanho de telefone e formato de e-mail. Mesmo chamando a API direto, dados
  inválidos são rejeitados.
- **Apenas a chave `anon`** (pública por design) vai para o frontend/GitHub.
  A chave **`service_role` nunca é exposta** (ela ignora o RLS).
- Variação mais restritiva disponível no `setup.sql`: remover a policy de
  `DELETE` impede a exclusão pela app.

> Detalhes e respostas para a defesa em [`docs/apresentacao.md`](docs/apresentacao.md).
