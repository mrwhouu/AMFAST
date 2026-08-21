# AMfast Förvaltningsportal

Webbapp för AMfast Fastighetsförvaltning AB: inloggade, behöriga användare ser
och (beroende på roll) redigerar fastigheter, objekt/kontrakt, hyresgäster och
fakturor. Bygger vidare på designen i `forvaltningsportal.html` (referens),
men med riktig databas (Supabase/Postgres), inloggning och
behörighetsstyrning via Row Level Security.

## Teknikstack

- **Frontend:** React 19 + Vite + TypeScript + React Router
- **Styling:** Tailwind CSS v4, med designtokens (färger/typsnitt) hämtade
  från referensprototypen
- **Backend:** Supabase (Postgres + Auth + Row Level Security)

## Kom igång lokalt

### 1. Skapa ett Supabase-projekt

Gå till [supabase.com](https://supabase.com), skapa ett nytt projekt och
notera **Project URL** och **anon public key** under
_Project Settings → API_.

### 2. Kör databasmigrationerna

I Supabase-projektets SQL-editor (eller via Supabase CLI), kör i tur och
ordning:

1. `supabase/migrations/0001_init.sql` — tabeller
2. `supabase/migrations/0002_rls.sql` — Row Level Security-policyer

Med Supabase CLI:

```bash
supabase link --project-ref <ditt-project-ref>
supabase db push
```

### 3. Konfigurera miljövariabler

```bash
cp .env.example .env
```

Fyll i `VITE_SUPABASE_URL` och `VITE_SUPABASE_ANON_KEY` i `.env`.

### 4. Installera beroenden och starta dev-servern

```bash
npm install
npm run dev
```

### 5. Skapa ditt första admin-konto

Skapa en användare via Supabase Auth (t.ex. i dashboarden under
_Authentication → Users → Add user_, eller genom att registrera dig om du
lagt till en registreringsvy). En rad skapas automatiskt i `profiles` med
rollen `viewer`. Höj sedan rollen till `admin` direkt i tabellen `profiles`
(SQL-editorn):

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

Logga sedan in i appen — admin ser allt och kan hantera fastigheter och
användaråtkomst under `/admin`.

### 6. Importera exempeldata (rentroll)

Ett engångsskript läser in exempeldata (samma data som fanns inbäddad i
referensprototypen `forvaltningsportal.html`) i databasen, så portalen inte
startar tom.

```bash
cp .env.import.example .env.import
# fyll i SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY (Project Settings → API)
npm run import:data
```

> Service role-nyckeln kringgår RLS. Använd den bara lokalt för detta
> skript — checka aldrig in `.env.import` och exponera den aldrig i
> frontend-koden.

Efter importen, ge dig själv (eller andra användare) åtkomst till
fastigheterna under `/admin → Användare & åtkomst`.

## Datamodell

| Tabell | Beskrivning |
|---|---|
| `profiles` | 1:1 mot `auth.users`, med roll (`admin`/`forvaltare`/`agare`/`viewer`) |
| `fastigheter` | Förvaltade fastigheter |
| `objekt` | Uthyrningsbara objekt/lokaler inom en fastighet |
| `fakturor` | Hyresavier per objekt/hyresgäst |
| `anvandare_fastighet` | Behörighetstabell: vilka fastigheter en användare ser, och `read`/`write` |

`fakturor.objekt_id` är nullable, med denormaliserade `objektnummer` och
`hyresgast`-kolumner samt en egen `fastighet_id`. Det är en avsiktlig
avvikelse från den ursprungliga briefen: den låter en faktura bokföras även
när den saknar en matchande rad i `objekt` — exakt det referensprototypen
flaggar under "Fakturerade objekt saknas i rentroll" i Åtgärder-vyn.

## Roller och behörighet (RLS)

| Roll | Ser | Redigerar |
|---|---|---|
| `admin` | Alla fastigheter/objekt/fakturor | Allt, inkl. fastigheter, objekt och användaråtkomst |
| `forvaltare` | Fastigheter kopplade via `anvandare_fastighet` | Objekt/fakturor inom sina fastigheter, om `behorighet = write` |
| `agare` | Fastigheter kopplade via `anvandare_fastighet` | Inget — read-only |
| `viewer` | Fastigheter kopplade via `anvandare_fastighet` | Inget — read-only |

Åtkomsten styrs av RLS-policyer i databasen (`supabase/migrations/0002_rls.sql`),
inte bara av frontend-logik.

## Vyer

- **Översikt** (`/`) — KPI-rad, fastighetskort med beläggnings-ribbon
- **Objekt & kontrakt** — filtrerbar/sökbar tabell, redigerbar för `write`-roller
- **Fakturor** — grupperat per hyresgäst, med flaggor för anmärkningar
- **Åtgärder** — automatiska flaggor: vakanser, kontrakt som snart löper ut,
  betalningsanmärkningar, fakturerade objekt som saknas i rentrollen
- **Fastighetsvy** (`/fastighet/:id`) — samma vyer, filtrerat till en fastighet
- **Admin** (`/admin`, endast roll `admin`) — CRUD för fastigheter, samt
  hantering av vilka användare som har åtkomst till vilka fastigheter

## Deploy

Bygg med `npm run build` (kör typecheck + `vite build`, output i `dist/`).
Koppla repot till Vercel eller Netlify, sätt `VITE_SUPABASE_URL` och
`VITE_SUPABASE_ANON_KEY` som miljövariabler i respektive projekt, och peka
sedan en subdomän (t.ex. `portal.amfast.se`) mot deploy-URL:en.
