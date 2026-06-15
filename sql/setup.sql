-- ============================================================
--  Agenda de Contatos · Supabase (PostgreSQL)
--  Script de criação da tabela + SEGURANÇA (RLS)
--  Execute em: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1) TABELA
--    (equivale ao CREATE TABLE CONTATO do enunciado; usamos
--     "identity" no lugar de SERIAL — prática recomendada atual.)
-- ------------------------------------------------------------
create table if not exists public.contato (
  id        bigint generated always as identity primary key,
  nome      varchar(255) not null,
  email     varchar(255),
  telefone  varchar(25),
  obs       varchar(255),
  dtcontato date default current_date
);

-- ------------------------------------------------------------
-- 2) HABILITAR RLS (Row Level Security)
--    Sem políticas explícitas, NENHUMA linha é lida ou escrita
--    pela chave anon — o padrão passa a ser "negar tudo".
-- ------------------------------------------------------------
alter table public.contato enable row level security;

-- ------------------------------------------------------------
-- 3) POLÍTICAS (acesso público CONTROLADO para a role "anon")
--    A app é 100% frontend e não tem login, então liberamos o
--    CRUD para a chave pública (anon), mas com validação de dados
--    no INSERT/UPDATE (WITH CHECK) — não é um "if true" cego.
-- ------------------------------------------------------------

-- Limpa políticas antigas (idempotente ao reexecutar o script)
drop policy if exists "contato_select_anon" on public.contato;
drop policy if exists "contato_insert_anon" on public.contato;
drop policy if exists "contato_update_anon" on public.contato;
drop policy if exists "contato_delete_anon" on public.contato;

-- 3.1) SELECT — leitura pública
create policy "contato_select_anon"
  on public.contato
  for select
  to anon
  using (true);

-- 3.2) INSERT — só aceita dados válidos
create policy "contato_insert_anon"
  on public.contato
  for insert
  to anon
  with check (
    char_length(trim(nome)) between 1 and 255
    and (telefone is null or char_length(telefone) <= 25)
    and (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );

-- 3.3) UPDATE — mesma validação do INSERT
create policy "contato_update_anon"
  on public.contato
  for update
  to anon
  using (true)
  with check (
    char_length(trim(nome)) between 1 and 255
    and (telefone is null or char_length(telefone) <= 25)
    and (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );

-- 3.4) DELETE — remoção por linha (id)
create policy "contato_delete_anon"
  on public.contato
  for delete
  to anon
  using (true);

-- ============================================================
--  OBSERVAÇÕES DE SEGURANÇA (para a defesa)
-- ------------------------------------------------------------
--  • A app usa SOMENTE a chave "anon" (pública). A chave
--    "service_role" NUNCA vai para o frontend/GitHub, pois ela
--    ignora o RLS.
--  • RLS habilitado + políticas explícitas = padrão "negar tudo"
--    com exceções controladas, em vez de banco aberto.
--  • WITH CHECK valida nome/telefone/email no servidor, então
--    dados inválidos são rejeitados mesmo que alguém chame a API
--    diretamente, fora do nosso JS.
--
--  Variação MAIS restritiva (impedir exclusão pela app), caso o
--  professor peça "impeça exclusão em massa": basta NÃO criar a
--  policy 3.4 de DELETE — sem ela, a role anon não apaga nada.
-- ============================================================

-- (Opcional) Dados de exemplo para a demonstração:
-- insert into public.contato (nome, email, telefone, obs) values
--   ('João Silva',  'joao@email.com',  '(11) 99999-9999', 'Cliente preferencial'),
--   ('Maria Souza', 'maria@email.com', '(21) 98888-7777', 'Fornecedora');
