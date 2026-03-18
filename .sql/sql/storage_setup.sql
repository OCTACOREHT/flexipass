-- EXÉCUTER CE SCRIPT DANS LE SQL EDITOR DE SUPABASE

-- 1. Création du bucket 'orders' pour les preuves de paiement
INSERT INTO storage.buckets (id, name, public) 
VALUES ('orders', 'orders', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques RLS pour le bucket 'orders'
-- Permettre l'upload public (ou restreindre aux utilisateurs connectés)
CREATE POLICY "Public Upload Preuves" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'orders');

CREATE POLICY "Public Read Preuves" ON storage.objects 
FOR SELECT USING (bucket_id = 'orders');

-- 3. Activer le temps réel pour la table orders (indispensable pour le client et l'admin)
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- S'assurer que la table orders est dans la publication realtime
-- Note: Si vous avez déjà exécuté enable_realtime.sql, cette étape complète pour les commandes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
