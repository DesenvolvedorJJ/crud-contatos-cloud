/**
 * Configuração do Supabase
 * -------------------------------------------------------------
 * Substitua os dois valores abaixo pelos do SEU projeto Supabase:
 *   Dashboard → Project Settings → Data API / API Keys
 *
 *   - SUPABASE_URL      → "Project URL"
 *   - SUPABASE_ANON_KEY → chave "anon" / "public"
 *
 * ⚠️ SEGURANÇA:
 *   - A chave "anon" é PÚBLICA por design e pode ficar no repositório.
 *     Ela só é segura porque a tabela está protegida por RLS (Row Level
 *     Security). Veja sql/setup.sql.
 *   - NUNCA coloque aqui a chave "service_role" (ela ignora o RLS e dá
 *     acesso total ao banco).
 */
const SUPABASE_URL = "https://rghgtvqexcmfyjhhcbpd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaGd0dnFleGNtZnlqaGhjYnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDQ1OTgsImV4cCI6MjA5NzEyMDU5OH0.07nUfUr4XCg5e8SRB_JLYY2z7jCmlDu_B0SBesCiN90";
