# Database Schema (Supabase)

## Overview
This schema stores integration credentials and cached external data for the Northstar Roofing dashboard.

## Tables

### `api_connections`
Stores credentials and connection metadata for Trello, QuickBooks Online, and Estimator App.

```sql
create table if not exists public.api_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('trello', 'quickbooks', 'estimator')),
  display_name text,
  credentials jsonb not null,
  metadata jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists api_connections_provider_idx
  on public.api_connections (provider);
```

### `sync_cache`
Caches data fetched from external APIs to reduce rate limits and speed up UI queries.

```sql
create table if not exists public.sync_cache (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('trello', 'quickbooks', 'estimator')),
  resource text not null,
  external_id text,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz,
  hash text,
  created_at timestamptz not null default now()
);

create index if not exists sync_cache_source_resource_idx
  on public.sync_cache (source, resource);

create unique index if not exists sync_cache_source_resource_external_id_uq
  on public.sync_cache (source, resource, external_id);
```

## Notes
- Store encrypted secrets in `credentials` or use Supabase Vault if available.
- `sync_cache.expires_at` supports TTL-based invalidation during background sync jobs.
