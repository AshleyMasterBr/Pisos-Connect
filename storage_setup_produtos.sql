-- ============================================================
-- SQL: CONFIGURAÇÃO DO BUCKET PARA FOTOS DE PRODUTOS
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Criar o Bucket 'produtos_fotos' (ignora se já existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos_fotos', 'produtos_fotos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove políticas antigas (se existirem) antes de recriar
DROP POLICY IF EXISTS "Fotos públicas dos produtos" ON storage.objects;
DROP POLICY IF EXISTS "Upload por administradores" ON storage.objects;
DROP POLICY IF EXISTS "Admins atualizam fotos" ON storage.objects;
DROP POLICY IF EXISTS "Admins deletam fotos" ON storage.objects;

-- 3. Política de Leitura Pública
CREATE POLICY "Fotos públicas dos produtos"
ON storage.objects FOR SELECT
USING (bucket_id = 'produtos_fotos');

-- 4. Política de Upload (Insert)
-- Assumimos que quem manipula produtos é autenticado e admin
CREATE POLICY "Upload por administradores"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'produtos_fotos'
  AND auth.uid() IS NOT NULL
);

-- 5. Política de Update
CREATE POLICY "Admins atualizam fotos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'produtos_fotos'
  AND auth.uid() IS NOT NULL
);

-- 6. Política de Delete
CREATE POLICY "Admins deletam fotos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'produtos_fotos'
  AND auth.uid() IS NOT NULL
);
