-- ==========================================
-- add_order_contact_info.sql
-- ==========================================
-- AJOUT DES COLONNES DE CONTACT DANS LA TABLE ORDERS POUR UN AFFICHAGE FIABLE
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Mettre à jour les commandes existantes si possible (optionnel)
-- UPDATE public.orders o SET customer_email = u.email FROM public.users u WHERE o.user_id = u.id AND o.customer_email IS NULL;

-- Rafraîchir le cache PostgREST
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- enable_realtime.sql
-- ==========================================
-- EXÉCUTER CE SCRIPT DANS LE SQL EDITOR DE SUPABASE POUR ACTIVER LE TEMPS RÉEL SUR LES PRODUITS

-- 1. Activer la réplication pour la table products
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- 2. Ajouter la table au canal realtime (si ce n'est pas déjà fait)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.products;
COMMIT;

-- ==========================================
-- fix_orders_schema.sql
-- ==========================================
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

-- ==========================================
-- fix_rls.sql
-- ==========================================
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

-- ==========================================
-- fix_storage_rls.sql
-- ==========================================
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

-- ==========================================
-- seed_products.sql
-- ==========================================
-- seed_products.sql
-- Run this script in the Supabase SQL Editor to seed 24 new active products.
-- This assumes the table is named `products` and has columns:
-- id (UUID), title (text), type (text), price (numeric), currency (text), 
-- plan (text), duration_days (int), image_url (text), short_description (text), active (boolean)

INSERT INTO public.products (title, type, price, currency, plan, duration_days, image_url, short_description, active)
VALUES 
    -- Streaming & Entertainment (8)
    ('Netflix', 'account', 1500, 'HTG', 'Premium 4K', 30, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 'Compte Netflix Premium partagé', true),
    ('Netflix', 'account', 4500, 'HTG', 'Premium 4K', 90, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', 'Compte Netflix Premium 3 mois', true),
    ('Spotify Premium', 'account', 800, 'HTG', 'Individual', 30, 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg', 'Musique sans pub', true),
    ('Apple Music', 'account', 900, 'HTG', 'Individual', 30, 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 'Streaming musical by Apple', true),
    ('Disney+', 'account', 1200, 'HTG', 'Premium', 30, 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', 'Films et séries Disney', true),
    ('Amazon Prime Video', 'account', 1000, 'HTG', 'Standard', 30, 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', 'Films et séries Amazon', true),
    ('Crunchyroll', 'account', 700, 'HTG', 'Mega Fan', 30, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png', 'Anime en streaming', true),
    ('HBO Max', 'account', 1400, 'HTG', 'Ad-Free', 30, 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg', 'Les classiques HBO', true),

    -- Productivity & Software (8)
    ('Canva Pro', 'account', 500, 'HTG', 'Pro', 30, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg', 'Accès Canva Pro (invitation)', true),
    ('Canva Pro', 'account', 5000, 'HTG', 'Pro Annuel', 365, 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg', '1 an de Canva Pro', true),
    ('ChatGPT Plus', 'account', 3000, 'HTG', 'Plus', 30, 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', 'Accès GPT-4', true),
    ('Midjourney', 'account', 2500, 'HTG', 'Basic', 30, 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png', 'Génération d''images IA', true),
    ('Microsoft 365', 'account', 1500, 'HTG', 'Personal', 30, 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg', 'Office complet', true),
    ('Adobe Creative Cloud', 'account', 4500, 'HTG', 'All Apps', 30, 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_Express_logo.svg', 'Toutes les apps Adobe', true),
    ('Zoom Pro', 'account', 2000, 'HTG', 'Pro', 30, 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg', 'Réunions illimitées', true),
    ('Notion Plus', 'account', 1500, 'HTG', 'Plus', 30, 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png', 'Outil de productivité', true),

    -- Gaming & Gift Cards (8)
    ('PlayStation Plus', 'giftcard', 1500, 'HTG', 'Essential $10', null, 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg', 'Carte cadeau PSN $10', true),
    ('PlayStation Plus', 'giftcard', 3500, 'HTG', 'Extra $25', null, 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg', 'Carte cadeau PSN $25', true),
    ('Xbox Game Pass', 'giftcard', 2000, 'HTG', 'Ultimate', 30, 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg', 'Abonnement Xbox Game Pass', true),
    ('Steam Gift Card', 'giftcard', 1500, 'HTG', '$10', null, 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg', 'Carte Steam $10', true),
    ('Steam Gift Card', 'giftcard', 3000, 'HTG', '$20', null, 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg', 'Carte Steam $20', true),
    ('Roblox Robux', 'giftcard', 1500, 'HTG', '800 Robux', null, 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Roblox_Logo_2022.svg', 'Carte 800 Robux', true),
    ('Nintendo eShop', 'giftcard', 3000, 'HTG', '$20', null, 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg', 'Carte eShop $20', true),
    ('V-Bucks Fortnite', 'giftcard', 1500, 'HTG', '1000 V-Bucks', null, 'https://upload.wikimedia.org/wikipedia/commons/1/1a/FortniteLogo.svg', 'Carte 1000 V-Bucks', true);

-- ==========================================
-- storage_setup.sql
-- ==========================================
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

-- ==========================================
-- sync_users.sql
-- ==========================================
-- SCRIPT POUR SYNCHRONISER AUTH.USERS AVEC PUBLIC.USERS AUTOMATIQUEMENT

-- 1. S'assurer que la table public.users a la bonne structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la fonction de trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Client')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger (supprimer s'il existe déjà pour éviter les doublons)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Activer RLS sur public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Politique pour les admins (tout voir/modifier) ou pour chaque utilisateur (voir son propre profil)
DROP POLICY IF EXISTS "Admins can see everything" ON public.users;
CREATE POLICY "Admins can see everything" ON public.users
    USING (true); -- Pour simplifier pour l'instant, on laisse l'admin tout voir

