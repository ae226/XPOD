# XPOD PWA

XPOD is a mobile-first, voice-driven gym tracker designed for progressive overload.

## Included in this version

- VIP-style PWA UI/UX with high contrast, touch-first controls, and app-shell behavior
- Hands-free commands:
  - `next set`
  - `log set`
  - `start rest timer 90 seconds`
  - `stop rest timer`
- Optional rest timer voice prompts (10-second warning + completion cue)
- Exercise history charts (weight, reps, volume, estimated 1RM)
- Local-first guest mode by default
- Optional Supabase login + cloud sync for multi-device backup

## Quick start

1. Serve this folder locally with any static server, then open in Chrome/Edge:
   - Example (Python): `python -m http.server 8080`
2. Open `http://localhost:8080`.
3. For installable PWA:
   - Use browser install prompt or "Install App".

## Voice examples

- `Bench press 185 pounds 8 reps RPE 8`
- `next set`
- `start rest timer 2 minutes`
- `log set`

## Cloud sync (optional)

You can keep using XPOD as a guest forever.  
If you want cloud sync, connect Supabase URL + anon key in-app, then register/login.

Create this table in Supabase SQL editor:

```sql
create table if not exists public.xpod_sets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null,
  weight numeric not null,
  reps integer not null,
  rpe numeric,
  timestamp timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.xpod_sets enable row level security;

create policy "user can manage own sets"
on public.xpod_sets
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## Notes

- Speech recognition quality and availability depend on browser support.
- Data is stored in browser `localStorage` in guest mode.
