# Environment Variables

- DATABASE_URL: Connexion PostgreSQL (si utilisez un client direct). Optionnel avec Supabase.
- EMAIL_HOST: Hote SMTP.
- EMAIL_PORT: Port SMTP (587 ou 465).
- EMAIL_USER: Utilisateur SMTP.
- EMAIL_PASSWORD: Mot de passe SMTP.
- EMAIL_FROM: Adresse "from" (sinon EMAIL_USER).
- EMAIL_LOGO_URL: URL publique du logo pour les emails (optionnel).
- MONCASH_CLIENT_ID: Identifiant MonCash.
- MONCASH_CLIENT_SECRET: Secret MonCash.
- MONCASH_MODE: sandbox ou live.
- UPLOAD_STORAGE_PATH: Dossier pour images (dans le bucket Supabase `products`).
- NEXT_PUBLIC_SITE_URL: Base URL du site (utilisee pour le logo email si EMAIL_LOGO_URL est vide).
- NEXT_PUBLIC_SUPABASE_URL: URL Supabase.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Clé anonyme Supabase.
- SUPABASE_SERVICE_ROLE_KEY: Clé service role (server-side uniquement).
