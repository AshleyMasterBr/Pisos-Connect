-- ============================================================
-- PISOS CONNECT — CORREÇÃO RLS v1.1.1
-- "infinite recursion detected in policy for relation perfis"
--
-- O problema: a política "Admin vê todos os perfis" faz uma
-- subquery em `perfis` dentro de uma query em `perfis`,
-- causando loop infinito.
--
-- Solução: usar auth.jwt() para ler o role diretamente do
-- token, sem precisar consultar a tabela perfis novamente.
-- ============================================================

-- 1. Remove as políticas problemáticas
DROP POLICY IF EXISTS "Admin vê todos os perfis" ON perfis;
DROP POLICY IF EXISTS "Admin gerencia produtos" ON produtos;
DROP POLICY IF EXISTS "Admin gerencia pedidos" ON pedidos;
DROP POLICY IF EXISTS "Admin gerencia itens" ON pedido_itens;
DROP POLICY IF EXISTS "Admin gerencia profissionais" ON profissionais;
DROP POLICY IF EXISTS "Admin gerencia serviços" ON servicos;

-- 2. Cria função auxiliar segura (sem recursão)
-- Lê o role da tabela perfis usando SECURITY DEFINER para
-- evitar que a própria RLS bloqueie a consulta
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.perfis WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Recria as políticas admin usando a função (sem recursão)
CREATE POLICY "Admin gerencia produtos" ON produtos
  FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Admin gerencia pedidos" ON pedidos
  FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Admin gerencia itens" ON pedido_itens
  FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Admin vê todos os perfis" ON perfis
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Admin gerencia profissionais" ON profissionais
  FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Admin gerencia serviços" ON servicos
  FOR ALL USING (public.get_my_role() = 'admin');

-- 4. Política de update do perfil pelo próprio usuário
-- (garante que usuário pode ver o próprio perfil)
DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON perfis;
CREATE POLICY "Usuário vê próprio perfil" ON perfis
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON perfis;
CREATE POLICY "Usuário atualiza próprio perfil" ON perfis
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- VERIFICAÇÃO: depois de rodar, execute esta query para testar
-- SELECT public.get_my_role();
-- Deve retornar 'admin' se você estiver logado como admin.
-- ============================================================
