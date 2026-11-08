-- VELTRIX JOURNAL — initial schema
create extension if not exists pgcrypto;

create table if not exists public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  market text not null default 'Mixed',
  created_at timestamptz not null default now()
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.trading_accounts(id) on delete set null,
  market text not null check (market in ('Forex','Crypto')),
  symbol text not null,
  direction text not null check (direction in ('BUY','SELL')),
  entry_at timestamptz not null,
  exit_at timestamptz,
  entry_price numeric not null default 0,
  exit_price numeric,
  stop_loss numeric,
  take_profit numeric,
  position_size numeric not null default 0,
  risk_percent numeric not null default 0,
  actual_rr numeric not null default 0,
  net_pnl numeric not null default 0,
  fees numeric not null default 0,
  strategy text,
  session text,
  emotion text,
  rule_followed boolean not null default true,
  notes text,
  screenshot_url text,
  status text not null default 'closed' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prop_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  starting_balance numeric not null,
  daily_limit numeric not null default 5,
  max_drawdown numeric not null default 10,
  target numeric not null default 8,
  status text not null default 'active' check (status in ('active','passed','failed','paused')),
  created_at timestamptz not null default now()
);

create index if not exists trades_user_entry_idx on public.trades(user_id, entry_at desc);
create index if not exists trades_account_idx on public.trades(account_id);
create index if not exists accounts_user_idx on public.trading_accounts(user_id);
create index if not exists challenges_user_idx on public.prop_challenges(user_id);

alter table public.trading_accounts enable row level security;
alter table public.trades enable row level security;
alter table public.prop_challenges enable row level security;

drop policy if exists "accounts own rows" on public.trading_accounts;
create policy "accounts own rows" on public.trading_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "trades own rows" on public.trades;
create policy "trades own rows" on public.trades for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "challenges own rows" on public.prop_challenges;
create policy "challenges own rows" on public.prop_challenges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trade-screenshots','trade-screenshots',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "trade screenshots upload own folder" on storage.objects;
create policy "trade screenshots upload own folder" on storage.objects for insert to authenticated
with check (bucket_id='trade-screenshots' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "trade screenshots read own folder" on storage.objects;
create policy "trade screenshots read own folder" on storage.objects for select to authenticated
using (bucket_id='trade-screenshots' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "trade screenshots delete own folder" on storage.objects;
create policy "trade screenshots delete own folder" on storage.objects for delete to authenticated
using (bucket_id='trade-screenshots' and (storage.foldername(name))[1]=auth.uid()::text);
