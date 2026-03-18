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
