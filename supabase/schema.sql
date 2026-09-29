-- BARAMEEL WORLD V14 — production data model
create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  player_code text unique not null,
  nickname text not null default '',
  runner text not null default 'brona',
  total_points bigint not null default 0,
  weekly_points bigint not null default 0,
  rank integer,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.scan_tickets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  source text not null default 'campaign',
  status text not null default 'available' check(status in ('available','consumed','revoked')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_scan_id uuid
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  ticket_id uuid references public.scan_tickets(id),
  qr_token text not null,
  collection_id text,
  image_id text,
  piece_number integer,
  rarity text,
  points bigint not null default 0,
  duplicate boolean not null default false,
  idempotency_key text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id text primary key,
  display_name text not null,
  active boolean not null default true
);

create table if not exists public.collection_pieces (
  collection_id text not null references public.collections(id) on delete cascade,
  image_id text not null,
  piece_number integer not null check(piece_number between 1 and 9),
  rarity text not null default 'COMMON',
  points bigint not null default 20000,
  weight numeric not null default 1,
  active boolean not null default true,
  primary key(collection_id,image_id,piece_number)
);

create table if not exists public.player_pieces (
  player_id uuid not null references public.players(id) on delete cascade,
  collection_id text not null,
  image_id text not null,
  piece_number integer not null,
  first_found_at timestamptz not null default now(),
  primary key(player_id,collection_id,image_id,piece_number)
);

create table if not exists public.duo_links (
  id uuid primary key default gen_random_uuid(),
  player_a uuid not null references public.players(id) on delete cascade,
  player_b uuid not null references public.players(id) on delete cascade,
  pair_key text unique not null,
  result_type text not null,
  reward_points bigint not null default 0,
  reward_code text,
  created_at timestamptz not null default now(),
  check(player_a <> player_b)
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  player_id uuid references public.players(id) on delete set null,
  event text not null,
  meta jsonb not null default '{}'::jsonb,
  path text,
  created_at timestamptz not null default now()
);

create index if not exists scans_player_idx on public.scans(player_id,created_at desc);
create index if not exists tickets_player_idx on public.scan_tickets(player_id,status);
create index if not exists analytics_event_idx on public.analytics_events(event,created_at desc);

-- Atomic ticket consumption. The UPDATE lock is what prevents two phones/tabs from spending the same ticket.
create or replace function public.consume_scan_ticket(p_ticket uuid, p_player uuid)
returns boolean language plpgsql security definer as $$
declare ok boolean;
begin
  update public.scan_tickets
  set status='consumed', consumed_at=now()
  where id=p_ticket and player_id=p_player and status='available'
  returning true into ok;
  return coalesce(ok,false);
end $$;

-- Server-side reward draw. Weighted selection is deterministic only from the DB state, never from the client.
create or replace function public.draw_reward()
returns table(collection_id text,image_id text,piece_number integer,rarity text,points bigint)
language sql security definer as $$
with pool as (
  select cp.*, sum(cp.weight) over () as total_weight,
         sum(cp.weight) over(order by cp.collection_id,cp.image_id,cp.piece_number) as running_weight
  from public.collection_pieces cp
  join public.collections c on c.id=cp.collection_id and c.active
  where cp.active
), r as (select random() * max(total_weight) as n from pool)
select p.collection_id,p.image_id,p.piece_number,p.rarity,p.points
from pool p, r where p.running_weight >= r.n order by p.running_weight limit 1;
$$;

-- One-time ticket grant for trusted POS/admin workflows. Do not expose this SQL function to anonymous clients.
create or replace function public.grant_scan_ticket(p_player uuid,p_source text default 'campaign')
returns uuid language plpgsql security definer as $$
declare tid uuid;
begin
  insert into public.scan_tickets(player_id,source) values(p_player,p_source) returning id into tid;
  return tid;
end $$;
