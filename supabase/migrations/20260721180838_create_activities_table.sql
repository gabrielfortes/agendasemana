/*
# Create activities table (single-tenant, no auth)

1. New Tables
- `activities`
  - `id` (uuid, primary key)
  - `title` (text, not null) - nome da atividade
  - `description` (text, nullable) - descricao opcional
  - `day_of_week` (int, not null) - dia da semana (0=Dom .. 6=Sab)
  - `start_time` (time, not null) - horario de inicio
  - `end_time` (time, not null) - horario de termino
  - `color` (text, nullable) - cor de destaque
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `activities`.
- Allow anon + authenticated CRUD (single-tenant shared data).
*/

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  color text DEFAULT 'sky',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activities" ON activities;
CREATE POLICY "anon_select_activities" ON activities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
CREATE POLICY "anon_insert_activities" ON activities FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_activities" ON activities;
CREATE POLICY "anon_update_activities" ON activities FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_activities" ON activities;
CREATE POLICY "anon_delete_activities" ON activities FOR DELETE
  TO anon, authenticated USING (true);