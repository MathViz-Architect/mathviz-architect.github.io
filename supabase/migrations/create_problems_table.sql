-- Таблица шаблонов задач для MathViz Architect
create table if not exists problems (
  id      text primary key,
  grade   int  not null,
  subject text not null,
  topic   text not null,
  data    jsonb not null
);

-- Индексы для быстрой фильтрации
create index if not exists problems_grade_idx   on problems (grade);
create index if not exists problems_subject_idx on problems (subject);
create index if not exists problems_topic_idx   on problems (topic);

-- GIN-индекс для поиска внутри jsonb (skills, section и т.д.)
create index if not exists problems_data_gin on problems using gin (data);

-- RLS: публичное чтение, запись только через service_role
alter table problems enable row level security;

create policy "Public read" on problems
  for select using (true);
