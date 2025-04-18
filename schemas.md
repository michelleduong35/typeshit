-- 1. Create bathrooms
create table bathrooms (
  id           uuid          primary key default gen_random_uuid(),
  name         text          not null,
  building     text          not null,
  address      text          not null,
  floor        text,
  directions   text,
  status       text          not null default 'pending',  -- 'pending' | 'approved'
  created_by   uuid          not null,
  created_at   timestamptz   not null default now()
);
alter table bathrooms enable row level security;

-- 2. Create bathroom_images
create table bathroom_images (
  id            uuid          primary key default gen_random_uuid(),
  bathroom_id   uuid          not null references bathrooms(id) on delete cascade,
  url           text          not null,
  caption       text,
  uploaded_by   uuid          not null,
  created_at    timestamptz   not null default now()
);
alter table bathroom_images enable row level security;

-- 3. Create reviews
create table reviews (
  id            uuid          primary key default gen_random_uuid(),
  bathroom_id   uuid          not null references bathrooms(id) on delete cascade,
  user_id       uuid          not null,
  rating        int           not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz   not null default now()
);
alter table reviews enable row level security;

-- 4. (Optional) Create profiles for admin flag
create table profiles (
  id        uuid    primary key references auth.users(id),
  is_admin  boolean not null default false,
  full_name text
);
alter table profiles enable row level security;
