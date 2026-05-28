-- ============================================================================
-- 0001_init.sql — initial schema for the babysitting marketplace.
-- Conventions:
--   * snake_case everywhere
--   * every table has RLS enabled
--   * every mutable table has a `created_at` / `updated_at`
--   * the `profiles.id` mirrors `auth.users.id` (1:1)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";   -- for geo queries on the search map
create extension if not exists "pg_trgm";   -- for fuzzy text search

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type account_role as enum ('sitter', 'parent', 'admin');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type age_group as enum ('infant', 'toddler', 'preschool', 'school', 'teen');
create type sitter_service as enum (
  'babysitting', 'nanny', 'homework_help', 'school_pickup',
  'overnight', 'weekend', 'special_needs'
);
create type booking_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'completed');

-- ---------------------------------------------------------------------------
-- profiles — base row for every user (parent, sitter, or admin)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            account_role not null,
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  phone           text,
  avatar_url      text,
  bio             text check (char_length(bio) <= 2000),
  city            text,
  wilaya          text,
  location        geography(point, 4326),
  locale          text not null default 'fr' check (locale in ('fr', 'ar')),
  id_verification verification_status not null default 'unverified',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role) where is_active;
create index profiles_location_idx on public.profiles using gist (location);
create index profiles_wilaya_idx on public.profiles (wilaya);

-- ---------------------------------------------------------------------------
-- sitter_profiles — extended info for sitter accounts
-- ---------------------------------------------------------------------------
create table public.sitter_profiles (
  profile_id        uuid primary key references public.profiles(id) on delete cascade,
  hourly_rate       integer check (hourly_rate >= 0),       -- DZD
  experience_years  smallint check (experience_years >= 0),
  languages         text[] not null default '{fr}',
  age_groups        age_group[] not null default '{}',
  services          sitter_service[] not null default '{}',
  availability      jsonb,                                  -- WeeklyAvailability shape
  rating_average    numeric(2,1),
  rating_count      integer not null default 0,
  criminal_record   verification_status not null default 'unverified',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index sitter_rate_idx on public.sitter_profiles (hourly_rate);
create index sitter_services_idx on public.sitter_profiles using gin (services);
create index sitter_ages_idx on public.sitter_profiles using gin (age_groups);

-- ---------------------------------------------------------------------------
-- parent_profiles — extended info for parent accounts
-- ---------------------------------------------------------------------------
create table public.parent_profiles (
  profile_id          uuid primary key references public.profiles(id) on delete cascade,
  number_of_children  smallint check (number_of_children >= 0),
  children            jsonb not null default '[]'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- favorites — saved profiles ("Favori de la famille" in the UI)
-- ---------------------------------------------------------------------------
create table public.favorites (
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  target_id   uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (owner_id, target_id),
  check (owner_id <> target_id)
);

-- ---------------------------------------------------------------------------
-- conversations + messages
-- ---------------------------------------------------------------------------
create table public.conversations (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid not null references public.profiles(id) on delete cascade,
  sitter_id     uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  last_message_preview text,
  created_at    timestamptz not null default now(),
  unique (parent_id, sitter_id),
  check (parent_id <> sitter_id)
);
create index conversations_last_idx on public.conversations (last_message_at desc);

create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (char_length(body) > 0 and char_length(body) <= 4000),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index messages_conv_idx on public.messages (conversation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid not null references public.profiles(id) on delete cascade,
  sitter_id     uuid not null references public.profiles(id) on delete cascade,
  status        booking_status not null default 'pending',
  start_at      timestamptz not null,
  end_at        timestamptz not null,
  notes         text,
  hourly_rate   integer,
  total_amount  integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (end_at > start_at),
  check (parent_id <> sitter_id)
);
create index bookings_parent_idx on public.bookings (parent_id, start_at desc);
create index bookings_sitter_idx on public.bookings (sitter_id, start_at desc);

-- ---------------------------------------------------------------------------
-- reviews — written after a completed booking
-- ---------------------------------------------------------------------------
create table public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  booking_id    uuid references public.bookings(id) on delete set null,
  reviewer_id   uuid not null references public.profiles(id) on delete cascade,
  reviewee_id   uuid not null references public.profiles(id) on delete cascade,
  rating        smallint not null check (rating between 1 and 5),
  body          text check (char_length(body) <= 2000),
  created_at    timestamptz not null default now(),
  check (reviewer_id <> reviewee_id),
  unique (booking_id, reviewer_id)
);
create index reviews_target_idx on public.reviews (reviewee_id, created_at desc);

-- ---------------------------------------------------------------------------
-- reports — moderation queue
-- ---------------------------------------------------------------------------
create table public.reports (
  id            uuid primary key default uuid_generate_v4(),
  reporter_id   uuid not null references public.profiles(id) on delete set null,
  target_id     uuid references public.profiles(id) on delete cascade,
  message_id    uuid references public.messages(id) on delete set null,
  reason        text not null,
  notes         text,
  resolved      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger sitter_profiles_updated_at before update on public.sitter_profiles
  for each row execute function public.set_updated_at();
create trigger parent_profiles_updated_at before update on public.parent_profiles
  for each row execute function public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- Update conversation preview whenever a message is inserted
create or replace function public.bump_conversation()
returns trigger language plpgsql as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 140)
   where id = new.conversation_id;
  return new;
end;
$$;
create trigger messages_bump_conversation after insert on public.messages
  for each row execute function public.bump_conversation();

-- Recompute sitter rating average + count
create or replace function public.recompute_sitter_rating()
returns trigger language plpgsql as $$
declare target uuid;
begin
  target = coalesce(new.reviewee_id, old.reviewee_id);
  update public.sitter_profiles sp
     set rating_average = sub.avg_rating,
         rating_count = sub.cnt
    from (
      select round(avg(rating)::numeric, 1) as avg_rating, count(*) as cnt
        from public.reviews where reviewee_id = target
    ) sub
   where sp.profile_id = target;
  return null;
end;
$$;
create trigger reviews_recompute after insert or update or delete on public.reviews
  for each row execute function public.recompute_sitter_rating();

-- ---------------------------------------------------------------------------
-- RLS — Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.sitter_profiles  enable row level security;
alter table public.parent_profiles  enable row level security;
alter table public.favorites        enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.bookings         enable row level security;
alter table public.reviews          enable row level security;
alter table public.reports          enable row level security;

-- profiles: anyone authenticated can read active profiles; users edit only their own.
create policy "profiles_read_active" on public.profiles
  for select using (is_active = true or id = auth.uid());
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- sitter / parent extended rows: read for any authenticated user, write only owner.
create policy "sitter_read" on public.sitter_profiles for select using (true);
create policy "sitter_write_self" on public.sitter_profiles
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "parent_read_self" on public.parent_profiles
  for select using (profile_id = auth.uid());
create policy "parent_write_self" on public.parent_profiles
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- favorites: only the owner sees / writes their list.
create policy "favorites_self" on public.favorites
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- conversations: only participants.
create policy "conv_select_participants" on public.conversations
  for select using (parent_id = auth.uid() or sitter_id = auth.uid());
create policy "conv_insert_participant" on public.conversations
  for insert with check (parent_id = auth.uid() or sitter_id = auth.uid());

-- messages: only conversation participants can read; only sender can write own.
create policy "msg_select_participants" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.parent_id = auth.uid() or c.sitter_id = auth.uid())
    )
  );
create policy "msg_insert_self_participant" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.parent_id = auth.uid() or c.sitter_id = auth.uid())
    )
  );

-- bookings: parent or sitter on the row.
create policy "bookings_participants" on public.bookings
  for select using (parent_id = auth.uid() or sitter_id = auth.uid());
create policy "bookings_parent_insert" on public.bookings
  for insert with check (parent_id = auth.uid());
create policy "bookings_participant_update" on public.bookings
  for update using (parent_id = auth.uid() or sitter_id = auth.uid())
  with check (parent_id = auth.uid() or sitter_id = auth.uid());

-- reviews: public read, only reviewer can insert/update own.
create policy "reviews_read_all" on public.reviews for select using (true);
create policy "reviews_write_self" on public.reviews
  for all using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());

-- reports: only reporter sees own; admin role (service-role bypasses RLS) handles moderation.
create policy "reports_read_self" on public.reports
  for select using (reporter_id = auth.uid());
create policy "reports_insert_self" on public.reports
  for insert with check (reporter_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Auth trigger — create a profile row whenever a user signs up.
-- The role + names come from raw_user_meta_data sent during signUp.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, first_name, last_name, email, locale)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::account_role, 'parent'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'locale', 'fr')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
