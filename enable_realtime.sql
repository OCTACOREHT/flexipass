-- EXÉCUTER CE SCRIPT DANS LE SQL EDITOR DE SUPABASE POUR ACTIVER LE TEMPS RÉEL SUR LES PRODUITS

-- 1. Activer la réplication pour la table products
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- 2. Ajouter la table au canal realtime (si ce n'est pas déjà fait)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.products;
COMMIT;
