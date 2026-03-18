-- EXÉCUTER CE SCRIPT DANS LE SQL EDITOR DE SUPABASE
-- Résout l'erreur "new row violates row-level security policy" pour les uploads.

-- 1. Configuration du bucket 'products'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configuration du bucket 'orders' (au cas où)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('orders', 'orders', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Suppression des anciennes politiques pour repartir sur une base propre
DROP POLICY IF EXISTS "Public Upload Products" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Products" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Preuves" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Preuves" ON storage.objects;

-- 4. Nouvelles politiques robustes pour 'products'
CREATE POLICY "Public Upload Products" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public Read Products" ON storage.objects 
FOR SELECT USING (bucket_id = 'products');

-- Pour permettre le remplacement d'image (Update)
CREATE POLICY "Public Update Products" ON storage.objects 
FOR UPDATE USING (bucket_id = 'products');

-- 5. Nouvelles politiques robustes pour 'orders'
CREATE POLICY "Public Upload Preuves" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'orders');

CREATE POLICY "Public Read Preuves" ON storage.objects 
FOR SELECT USING (bucket_id = 'orders');

-- Pour permettre le remplacement si nécessaire
CREATE POLICY "Public Update Preuves" ON storage.objects 
FOR UPDATE USING (bucket_id = 'orders');


-- NOTE: Ces politiques sont "Publiques" (n'importe qui peut uploader). 
-- Si vous voulez restreindre aux Admins uniquement, il faudrait une condition : 
-- auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
-- Mais pour tester et débloquer immédiatement, les politiques ci-dessus sont idéales.
