-- EXÉCUTER CE SCRIPT DANS LE SQL EDITOR DE SUPABASE POUR RÉPARER LES ERREURS RLS

-- 1. Configuration de la table 'products'
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Autoriser tout le monde (anon/authenticated) à lire/écrire pour le développement
-- (Vous pourrez restreindre cela plus tard à l'admin uniquement)
DROP POLICY IF EXISTS "Allow All Access" ON public.products;
CREATE POLICY "Allow All Access" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 2. Configuration du stockage (Images)
-- Politique pour permettre la lecture publique des images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Politique pour permettre l'upload d'images
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

-- Politique pour permettre la mise à jour des images
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'products');

-- Politique pour permettre la suppression des images
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products');
