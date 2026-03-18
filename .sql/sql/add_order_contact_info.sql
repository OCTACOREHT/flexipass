-- AJOUT DES COLONNES DE CONTACT DANS LA TABLE ORDERS POUR UN AFFICHAGE FIABLE
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Mettre à jour les commandes existantes si possible (optionnel)
-- UPDATE public.orders o SET customer_email = u.email FROM public.users u WHERE o.user_id = u.id AND o.customer_email IS NULL;

-- Rafraîchir le cache PostgREST
NOTIFY pgrst, 'reload schema';
