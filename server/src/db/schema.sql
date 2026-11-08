-- Schéma de la base Tantsaha Connect (PostgreSQL).
-- Exécuté par « npm run db:migrer » ; peut être relancé sans danger (IF NOT EXISTS).

-- Cultures proposées dans le journal (riz, maïs, tomate…)
CREATE TABLE IF NOT EXISTS cultures (
  id      SERIAL PRIMARY KEY,
  code    TEXT NOT NULL UNIQUE,          -- identifiant stable utilisé par l'application
  nom_mg  TEXT NOT NULL,                 -- nom en malagasy
  nom_fr  TEXT NOT NULL,                 -- nom en français
  icone   TEXT NOT NULL                  -- nom du pictogramme côté client
);

-- Observations du journal de culture : semis, pluie, parasite, récolte
CREATE TABLE IF NOT EXISTS observations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             TEXT NOT NULL,
  culture_id       INTEGER REFERENCES cultures (id),
  date_observation DATE NOT NULL,
  note             TEXT,
  -- identifiant créé sur le téléphone : évite les doublons quand une
  -- observation saisie hors ligne est envoyée plusieurs fois
  id_client        TEXT UNIQUE,
  cree_le          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Règles sur les types, (re)créées à chaque lancement : une base créée avec
-- une version précédente (sans « recolte ») est ainsi mise à jour.
ALTER TABLE observations DROP CONSTRAINT IF EXISTS observations_type_check;
ALTER TABLE observations ADD CONSTRAINT observations_type_check
  CHECK (type IN ('semis', 'pluie', 'parasite', 'recolte'));
-- un semis et une récolte concernent toujours une culture
ALTER TABLE observations DROP CONSTRAINT IF EXISTS semis_avec_culture;
ALTER TABLE observations ADD CONSTRAINT semis_avec_culture
  CHECK (type NOT IN ('semis', 'recolte') OR culture_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_observations_date ON observations (date_observation DESC);

-- Données de départ : les cultures les plus courantes à Madagascar
INSERT INTO cultures (code, nom_mg, nom_fr, icone) VALUES
  ('vary',    'Vary',      'Riz',      'riz'),
  ('katsaka', 'Katsaka',   'Maïs',     'mais'),
  ('mangahazo','Mangahazo','Manioc',   'manioc'),
  ('voatabia','Voatabia',  'Tomate',   'tomate'),
  ('karaoty', 'Karaoty',   'Carotte',  'carotte'),
  ('tsaramaso','Tsaramaso','Haricot',  'haricot')
ON CONFLICT (code) DO NOTHING;
