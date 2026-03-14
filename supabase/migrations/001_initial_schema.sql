-- =============================================================
-- MathViz Architect — полная схема БД
-- Выполнить в Supabase: Dashboard → SQL Editor → Run
-- =============================================================

-- -------------------------------------------------------------
-- 1. user_progress
--    Прогресс ученика по темам. Синхронизируется с IndexedDB.
-- -------------------------------------------------------------
create table if not exists user_progress (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  topic_id           text not null,
  attempts           int  not null default 0,
  correct            int  not null default 0,
  current_difficulty int  not null default 1,
  last_attempt_at    timestamptz,
  updated_at         timestamptz not null default now(),

  unique (user_id, topic_id)
);

create index if not exists user_progress_user_idx on user_progress (user_id);

alter table user_progress enable row level security;

-- Пользователь видит и изменяет только свои записи
create policy "user_progress: own read"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "user_progress: own insert"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "user_progress: own update"
  on user_progress for update
  using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 2. sync_log
--    Лог синхронизаций для отладки и восстановления.
-- -------------------------------------------------------------
create table if not exists sync_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  topic_id    text not null,
  action      text not null,           -- 'upsert' | 'delete'
  payload     jsonb,
  synced_at   timestamptz not null default now(),
  client_info text,                    -- user-agent / версия приложения
  status      text not null default 'ok',  -- 'ok' | 'error'
  error_msg   text
);

create index if not exists sync_log_user_idx on sync_log (user_id);
create index if not exists sync_log_synced_at_idx on sync_log (synced_at desc);

alter table sync_log enable row level security;

create policy "sync_log: own read"
  on sync_log for select
  using (auth.uid() = user_id);

create policy "sync_log: own insert"
  on sync_log for insert
  with check (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 3. rooms
--    Комнаты для совместной работы на холсте (учитель + ученики).
-- -------------------------------------------------------------
create table if not exists rooms (
  id           text primary key,          -- короткий хеш, напр. 'abc-123-xyz'
  owner_id     uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz,               -- null = бессрочно
  canvas_data  jsonb not null default '{"objects": []}',
  is_active    boolean not null default true
);

create index if not exists rooms_owner_idx on rooms (owner_id);
create index if not exists rooms_active_idx on rooms (is_active) where is_active = true;

alter table rooms enable row level security;

-- Читать может любой (по ссылке с roomId)
create policy "rooms: public read"
  on rooms for select
  using (is_active = true);

-- Создавать может только авторизованный пользователь
create policy "rooms: auth insert"
  on rooms for insert
  with check (auth.uid() = owner_id);

-- Обновлять canvas_data может любой (анонимные участники тоже рисуют)
-- owner_id проверяется на уровне приложения
create policy "rooms: public update canvas"
  on rooms for update
  using (is_active = true);

-- Удалять (деактивировать) может только владелец
create policy "rooms: owner delete"
  on rooms for delete
  using (auth.uid() = owner_id);

-- -------------------------------------------------------------
-- 4. Триггер: обновлять updated_at в user_progress автоматически
-- -------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_progress_updated_at on user_progress;
create trigger user_progress_updated_at
  before update on user_progress
  for each row execute function set_updated_at();

-- -------------------------------------------------------------
-- Supabase Realtime — включить для таблицы rooms
-- (выполняется отдельно через Dashboard → Realtime, или:)
-- -------------------------------------------------------------
-- alter publication supabase_realtime add table rooms;
