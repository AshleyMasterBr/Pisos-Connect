-- ============================================================
-- SQL: CONFIGURAÇÃO DE BUCKETS DE STORAGE (PISOS CONNECT)
-- Execute no SQL Editor do Supabase
-- Script idempotente — pode rodar múltiplas vezes sem erro
-- ============================================================

-- 1. Criar o Bucket 'lojas_fotos' (ignora se já existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lojas_fotos', 'lojas_fotos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove políticas antigas (se existirem) antes de recriar
DROP POLICY IF EXISTS "Fotos públicas das lojas" ON storage.objects;
DROP POLICY IF EXISTS "Upload por profissionais autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Profissionais atualizam suas fotos" ON storage.objects;
DROP POLICY IF EXISTS "Profissionais deletam suas fotos" ON storage.objects;

-- 3. Política de Leitura Pública
CREATE POLICY "Fotos públicas das lojas"
ON storage.objects FOR SELECT
USING (bucket_id = 'lojas_fotos');

-- 4. Política de Upload (Insert)
CREATE POLICY "Upload por profissionais autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lojas_fotos'
  AND auth.uid() IS NOT NULL
);

-- 5. Política de Update
CREATE POLICY "Profissionais atualizam suas fotos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lojas_fotos'
  AND auth.uid() = owner
);

-- 6. Política de Delete
CREATE POLICY "Profissionais deletam suas fotos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lojas_fotos'
  AND auth.uid() = owner
);
