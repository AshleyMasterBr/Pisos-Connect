-- ============================================================
-- PISOS CONNECT — SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Cole e execute no SQL Editor do Supabase
-- ============================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku              TEXT UNIQUE NOT NULL,
  nome             TEXT NOT NULL,
  tipo             TEXT NOT NULL CHECK (tipo IN ('vinilico','ceramico','porcellanato','laminado')),
  descricao        TEXT,
  preco_m2         DECIMAL(10,2) NOT NULL,
  m2_por_caixa     DECIMAL(5,2) NOT NULL,
  fornecedor       TEXT,
  imagem_url       TEXT,
  estoque_caixas   INTEGER DEFAULT 0,
  ativo            BOOLEAN DEFAULT true,
  destaque         BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PERFIS (extensão do auth.users)
CREATE TABLE IF NOT EXISTS perfis (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome       TEXT,
  whatsapp   TEXT,
  endereco   TEXT,
  role       TEXT DEFAULT 'cliente' CHECK (role IN ('cliente','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido     SERIAL,
  cliente_id        UUID REFERENCES auth.users(id),
  cliente_nome      TEXT NOT NULL,
  cliente_whatsapp  TEXT NOT NULL,
  endereco_entrega  TEXT NOT NULL,
  status            TEXT DEFAULT 'aguardando'
    CHECK (status IN ('aguardando','confirmado','em_entrega','entregue','cancelado')),
  valor_total       DECIMAL(10,2) NOT NULL,
  observacoes       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS pedido_itens (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id     UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id    UUID REFERENCES produtos(id),
  produto_nome  TEXT NOT NULL,
  area_m2       DECIMAL(10,2) NOT NULL,
  caixas        INTEGER NOT NULL,
  preco_m2      DECIMAL(10,2) NOT NULL,
  subtotal      DECIMAL(10,2) NOT NULL
);

-- 5. TRIGGER: cria perfil automaticamente após cadastro
CREATE OR REPLACE FUNCTION public.criar_perfil_novo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, whatsapp, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'whatsapp',
    'cliente'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.criar_perfil_novo_usuario();

-- 6. ROW LEVEL SECURITY
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Produtos: qualquer um vê os ativos
CREATE POLICY "Produtos ativos visíveis" ON produtos
  FOR SELECT USING (ativo = true);

-- Produtos: admin gerencia tudo
CREATE POLICY "Admin gerencia produtos" ON produtos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin')
  );

-- Pedidos: cliente vê só os seus
CREATE POLICY "Cliente vê seus pedidos" ON pedidos
  FOR SELECT USING (cliente_id = auth.uid());

-- Pedidos: cliente cria
CREATE POLICY "Cliente cria pedido" ON pedidos
  FOR INSERT WITH CHECK (cliente_id = auth.uid());

-- Pedidos: admin vê e gerencia todos
CREATE POLICY "Admin gerencia pedidos" ON pedidos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin')
  );

-- Itens: seguem o pedido
CREATE POLICY "Ver itens dos próprios pedidos" ON pedido_itens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pedidos WHERE id = pedido_id AND cliente_id = auth.uid())
  );

CREATE POLICY "Inserir itens em pedido próprio" ON pedido_itens
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pedidos WHERE id = pedido_id AND cliente_id = auth.uid())
  );

CREATE POLICY "Admin gerencia itens" ON pedido_itens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'admin')
  );

-- Perfis: usuário vê o próprio
CREATE POLICY "Usuário vê próprio perfil" ON perfis
  FOR SELECT USING (id = auth.uid());

-- Perfis: admin vê todos
CREATE POLICY "Admin vê todos os perfis" ON perfis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 7. DADOS INICIAIS — Catálogo placeholder para testar
INSERT INTO produtos (sku, nome, tipo, descricao, preco_m2, m2_por_caixa, fornecedor, ativo, destaque)
VALUES
  ('PV-001', 'Vinílico Premium Madeira Clara',      'vinilico',     'Resistente à umidade. Click system.',  89.90, 2.48, 'Ruffino',     true, true),
  ('PV-002', 'Vinílico Sofisticato Stone Cinza',    'vinilico',     'Textura de pedra. Ambientes comerciais.', 114.90, 2.20, 'Ruffino',  true, false),
  ('PC-001', 'Porcelanato Retificado Off White',    'porcellanato', 'Polido, alta resistência. PEI 5.',     139.90, 2.52, 'Portobello', true, true),
  ('PC-002', 'Porcelanato Cimento Concreto 60x60',  'porcellanato', 'Visual industrial. PEI 4.',            119.90, 2.16, 'Portobello', true, false),
  ('LM-001', 'Laminado Floorest Carvalho Natural',  'laminado',     'AC4. Ideal para quartos.',              79.90, 2.13, 'Floorest',   true, false),
  ('LM-002', 'Laminado Quick Step Impressive',      'laminado',     'Linha premium belga. AC5. 25 anos.',  249.90, 1.84, 'Quick Step', true, false)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- Para criar um usuário ADMIN manualmente:
-- 1. Cadastre pelo app normalmente
-- 2. Execute o comando abaixo substituindo o email:
--
-- UPDATE perfis SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'denis@pisosconnect.com.br');
-- ============================================================
