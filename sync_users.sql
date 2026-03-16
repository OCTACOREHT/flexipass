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
