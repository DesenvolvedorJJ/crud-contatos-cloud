/**
 * Agenda de Contatos — CRUD com Supabase (Vanilla JS)
 * -------------------------------------------------------------
 * Operações: SELECT (listar/buscar), INSERT, UPDATE e DELETE.
 * Toda a comunicação usa o SDK @supabase/supabase-js (v2) e a chave
 * "anon", protegida no servidor pelas políticas de RLS (sql/setup.sql).
 */

"use strict";

// O CDN expõe o objeto global `supabase`; criamos o cliente a partir dele.
const TABELA = "contato";
let db = null;
let contatosCache = []; // cache da última listagem (usado ao editar)

/* ====================== Elementos da página ====================== */
const $ = (id) => document.getElementById(id);

const els = {
  busca: $("campoBusca"),
  btnBuscar: $("btnBuscar"),
  btnNovo: $("btnNovo"),
  cardForm: $("cardForm"),
  form: $("formContato"),
  formTitulo: $("formTitulo"),
  id: $("contatoId"),
  nome: $("nome"),
  telefone: $("telefone"),
  email: $("email"),
  dtcontato: $("dtcontato"),
  obs: $("obs"),
  btnSalvar: $("btnSalvar"),
  btnCancelar: $("btnCancelar"),
  status: $("status"),
  lista: $("listaContatos"),
  contador: $("contador"),
  vazio: $("vazio"),
};

/* ====================== Inicialização ====================== */
document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!credenciaisConfiguradas()) {
    mostrarStatus(
      "⚠️ Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/config.js para conectar ao banco.",
      "erro",
      true
    );
    return;
  }

  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Eventos
  els.btnBuscar.addEventListener("click", () => carregarContatos(els.busca.value));
  els.busca.addEventListener("keydown", (e) => {
    if (e.key === "Enter") carregarContatos(els.busca.value);
  });
  els.btnNovo.addEventListener("click", abrirNovo);
  els.btnCancelar.addEventListener("click", cancelar);
  els.form.addEventListener("submit", salvar);

  // Delegação de eventos para os botões editar/excluir da tabela
  els.lista.addEventListener("click", onAcaoTabela);

  carregarContatos();
  assinarRealtime();
}

function credenciaisConfiguradas() {
  return (
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    !SUPABASE_URL.includes("SEU-PROJETO") &&
    !SUPABASE_ANON_KEY.includes("SUA_ANON_KEY")
  );
}

/* ====================== READ (listar / buscar) ====================== */
async function carregarContatos(filtroNome = "") {
  try {
    let query = db.from(TABELA).select("*").order("nome", { ascending: true });

    const filtro = filtroNome.trim();
    if (filtro) {
      query = query.ilike("nome", `%${filtro}%`); // busca parcial, sem diferenciar maiúsc.
    }

    const { data, error } = await query;
    if (error) throw error;

    contatosCache = data || [];
    renderTabela(contatosCache);
  } catch (err) {
    mostrarStatus("Erro ao carregar contatos: " + err.message, "erro");
  }
}

function renderTabela(contatos) {
  els.lista.innerHTML = "";

  if (!contatos.length) {
    els.vazio.hidden = false;
    els.contador.textContent = "";
    return;
  }
  els.vazio.hidden = true;
  els.contador.textContent = `${contatos.length} contato(s)`;

  const linhas = contatos
    .map(
      (c) => `
      <tr>
        <td>${esc(c.nome)}</td>
        <td>${esc(c.telefone) || "—"}</td>
        <td>${esc(c.email) || "—"}</td>
        <td class="col-acoes">
          <div class="acoes">
            <button class="icon-btn editar" data-id="${c.id}" title="Editar" aria-label="Editar">🖊️</button>
            <button class="icon-btn excluir" data-id="${c.id}" title="Excluir" aria-label="Excluir">🗑️</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  els.lista.innerHTML = linhas;
}

/* ====================== CREATE / UPDATE ====================== */
async function salvar(e) {
  e.preventDefault();

  const nome = els.nome.value.trim();
  const email = els.email.value.trim();

  // Validação básica no cliente (o banco também valida via RLS/WITH CHECK)
  if (!nome) {
    mostrarStatus("O campo Nome é obrigatório.", "erro");
    els.nome.focus();
    return;
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    mostrarStatus("E-mail inválido.", "erro");
    els.email.focus();
    return;
  }

  const contato = {
    nome,
    telefone: els.telefone.value.trim() || null,
    email: email || null,
    obs: els.obs.value.trim() || null,
    dtcontato: els.dtcontato.value || null,
  };

  travarForm(true);
  try {
    const id = els.id.value;
    if (id) {
      // UPDATE
      const { error } = await db.from(TABELA).update(contato).eq("id", id);
      if (error) throw error;
      mostrarStatus("Contato atualizado com sucesso!", "ok");
    } else {
      // INSERT
      const { error } = await db.from(TABELA).insert([contato]);
      if (error) throw error;
      mostrarStatus("Contato cadastrado com sucesso!", "ok");
    }
    cancelar();
    carregarContatos(els.busca.value);
  } catch (err) {
    mostrarStatus("Erro ao salvar: " + err.message, "erro");
  } finally {
    travarForm(false);
  }
}

/* ====================== Editar (preenche o formulário) ====================== */
function editar(id) {
  const c = contatosCache.find((x) => String(x.id) === String(id));
  if (!c) return;

  els.id.value = c.id;
  els.nome.value = c.nome || "";
  els.telefone.value = c.telefone || "";
  els.email.value = c.email || "";
  els.obs.value = c.obs || "";
  els.dtcontato.value = c.dtcontato || "";

  els.formTitulo.textContent = "Editar Contato";
  abrirForm();
}

/* ====================== DELETE ====================== */
async function excluir(id) {
  const c = contatosCache.find((x) => String(x.id) === String(id));
  const nome = c ? c.nome : "este contato";
  if (!confirm(`Deseja mesmo excluir "${nome}"?`)) return;

  try {
    const { error } = await db.from(TABELA).delete().eq("id", id);
    if (error) throw error;
    mostrarStatus("Contato excluído.", "info");
    carregarContatos(els.busca.value);
  } catch (err) {
    mostrarStatus("Erro ao excluir: " + err.message, "erro");
  }
}

/* ====================== Ações da tabela (delegação) ====================== */
function onAcaoTabela(e) {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains("editar")) editar(id);
  else if (btn.classList.contains("excluir")) excluir(id);
}

/* ====================== Controle do formulário ====================== */
function abrirNovo() {
  limparForm();
  els.formTitulo.textContent = "Novo Contato";
  abrirForm();
}

function abrirForm() {
  els.cardForm.hidden = false;
  els.nome.focus();
  els.cardForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function cancelar() {
  limparForm();
  els.cardForm.hidden = true;
}

function limparForm() {
  els.form.reset();
  els.id.value = "";
}

function travarForm(travar) {
  els.btnSalvar.disabled = travar;
  els.btnSalvar.textContent = travar ? "Salvando..." : "💾 Salvar";
}

/* ====================== Tempo real (opcional) ====================== */
// Atualiza a lista automaticamente quando o banco muda.
// Requer ativar Realtime na tabela (Database → Replication). Se estiver
// desativado, o app continua funcionando via recarga após cada operação.
function assinarRealtime() {
  try {
    db.channel("contatos-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABELA },
        () => carregarContatos(els.busca.value)
      )
      .subscribe();
  } catch (_) {
    /* Realtime indisponível — segue sem tempo real. */
  }
}

/* ====================== Utilidades ====================== */
function mostrarStatus(msg, tipo = "info", fixo = false) {
  els.status.textContent = msg;
  els.status.className = "status " + tipo;
  els.status.hidden = false;
  if (!fixo) {
    clearTimeout(mostrarStatus._t);
    mostrarStatus._t = setTimeout(() => (els.status.hidden = true), 4000);
  }
}

// Escapa HTML para evitar injeção ao renderizar dados do banco.
function esc(valor) {
  if (valor == null) return "";
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
