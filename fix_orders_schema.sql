-- EXÉCUTER CE SCRIPT DANS LE SQL EDITOR DE SUPABASE POUR RÉPARER COMPLÈTEMENT LE SYSTÈME DE COMMANDES

-- 1. On passe la colonne 'status' en TEXT pour éviter tout blocage lié aux Enums (plus flexible)
ALTER TABLE public.orders ALTER COLUMN status TYPE TEXT;

-- 2. S'assurer que toutes les colonnes nécessaires existent avec le bon type
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total_amount NUMERIC,
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS gift_code TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'HTG';

-- 3. Mettre à jour les politiques RLS pour permettre à l'Admin de modifier les commandes
-- (On autorise tout pour le développement, à restreindre plus tard)
DROP POLICY IF EXISTS "Admin Update Orders" ON public.orders;
CREATE POLICY "Admin Update Orders" ON public.orders FOR UPDATE USING (true);

-- 4. Rafraîchir le cache
NOTIFY pgrst, 'reload schema';
