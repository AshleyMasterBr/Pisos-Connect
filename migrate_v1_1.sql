-- ============================================================
-- PISOS CONNECT — MIGRAÇÃO v1.1
-- Execute no SQL Editor do Supabase APÓS o database.sql inicial
-- ============================================================

-- 1. TABELA DE PROFISSIONAIS
CREATE TABLE IF NOT EXISTS profissionais (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome_empresa  TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('loja','fabrica','instalador')),
  descricao     TEXT,
  cidade        TEXT NOT NULL,
  whatsapp      TEXT NOT NULL,
  site          TEXT,
  logo_url      TEXT,
  status        TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','ativo','suspenso')),
  destaque      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE SERVIÇOS (instaladores — modelo híbrido)
-- Instaladores podem ter serviços (mão de obra) e/ou produtos
CREATE TABLE IF NOT EXISTS servicos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,   -- Ex: "Instalação de Vinílico Click"
  descricao       TEXT,
  preco_m2        DECIMAL(10,2) NOT NULL,  -- preço por m² de mão de obra
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VINCULAR PRODUTOS A PROFISSIONAIS (Opção A — catálogo global)
-- profissional_id NULL = produto do Denis (plataforma)
-- profissional_id preenchido = produto de um profissional parceiro
ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL;

-- 4. RLS — PROFISSIONAIS
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Todos veem profissionais ativos
CREATE POLICY "Profissionais ativos visíveis" ON profissionais
  FOR SELECT USING (status = 'ativo');

-- Profissional gerencia o próprio perfil
CREATE POLICY "Profissional edita próprio perfil" ON profissionais
  FOR UPDATE USING (usuario_id = auth.uid());

-- Admin gerencia todos
CREATE POLICY "Admin gerencia profissionais" ON profissionais
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin')
  );

-- Qualquer autenticado pode submeter cadastro
CREATE POLICY "Inserir cadastro profissional" ON profissionais
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Serviços: visíveis se profissional ativo
CREATE POLICY "Serviços ativos visíveis" ON servicos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profissionais WHERE id = profissional_id AND status = 'ativo')
    AND ativo = true
  );

CREATE POLICY "Profissional gerencia serviços" ON servicos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profissionais WHERE id = profissional_id AND usuario_id = auth.uid())
  );

CREATE POLICY "Admin gerencia serviços" ON servicos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. ATUALIZAR PERFIS: adicionar role 'profissional' à constraint
-- (se a constraint existir, recrie-a)
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_role_check;
ALTER TABLE perfis ADD CONSTRAINT perfis_role_check
  CHECK (role IN ('cliente', 'profissional', 'admin'));

-- 6. DADOS DE EXEMPLO — Profissionais placeholder
INSERT INTO profissionais (nome_empresa, tipo, descricao, cidade, whatsapp, status, destaque)
VALUES
  ('Piso & Cia', 'loja', 'Loja especializada em pisos vinílicos e porcelanatos. Atendemos projetos residenciais e comerciais.', 'São Paulo, SP', '5511988880001', 'ativo', true),
  ('Cerâmica Nobre', 'fabrica', 'Fábrica de revestimentos cerâmicos de alta resistência. Vendas no atacado e varejo.', 'Criciúma, SC', '5548988880002', 'ativo', false),
  ('Instalações Pro', 'instalador', 'Instalação profissional de todos os tipos de piso. Garantia de 1 ano no serviço.', 'São Paulo, SP', '5511988880003', 'ativo', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARA APROVAR UM PROFISSIONAL MANUALMENTE:
-- UPDATE profissionais SET status = 'ativo'
-- WHERE id = 'uuid-do-profissional-aqui';
--
-- PARA VINCULAR PROFISSIONAL AO USUÁRIO DELES:
-- UPDATE profissionais SET usuario_id = (
--   SELECT id FROM auth.users WHERE email = 'email@profissional.com'
-- ) WHERE nome_empresa = 'Nome da Empresa';
-- ============================================================
