-- ==========================================
-- alter_users_permissions.sql
-- ==========================================
-- AJOUT DES COLONNES DE PERMISSIONS ET STATUT DANS LA TABLE USERS

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"dashboard":true,"orders":true,"stock":true,"users":true,"settings":true,"admins":true}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- NOTE: Si vous souhaitez modifier les permissions par défaut pour les nouveaux utilisateurs,
-- vous pouvez le faire ici ou dans l'interface de gestion.

-- Rafraîchir le cache PostgREST
NOTIFY pgrst, 'reload schema';
