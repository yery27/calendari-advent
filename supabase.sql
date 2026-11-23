-- Executa-ho una vegada al SQL Editor de Supabase
create table cupons (
  dia int primary key check (dia between 1 and 24),
  nota text,
  canviat_at timestamptz default now()
);
alter table cupons enable row level security;
-- La web (clau anon) pot llegir i inserir; mai modificar ni esborrar.
create policy "llegir"   on cupons for select using (true);
create policy "inserir"  on cupons for insert with check (true);
