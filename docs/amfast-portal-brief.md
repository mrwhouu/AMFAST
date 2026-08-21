# AMfast Förvaltningsportal — Projektbrief för Claude Code

## Vad vi bygger

En webbapp för AMfast Fastighetsförvaltning AB där inloggade, behöriga användare
kan se och (beroende på roll) redigera en förvaltningsdashboard: fastigheter,
objekt/kontrakt, hyresgäster och fakturor. Ersätter en statisk HTML-prototyp
med en riktig databas, inloggning och behörighetsstyrning per fastighet/roll.

**Referensfil:** `forvaltningsportal.html` (bifogas separat) — en fristående
prototyp med all UI-design (färger, typografi, layout, komponenter som
beläggnings-ribbon, KPI-kort, fakturagrupper) och exempeldata inbakad. Använd
den som visuell och strukturell referens för hur vyerna ska se ut och vilken
data som behövs — bygg om den till en riktig databaskopplad app, återanvänd
inte bara filen som den är.

## Teknikval

- **Frontend:** React + Vite (eller Next.js om du föredrar det för routing/SSR)
- **Backend/DB/Auth:** Supabase (Postgres + Auth + Row Level Security)
- **Hosting:** Vercel eller Netlify, kopplat mot en subdomän senare
  (t.ex. `portal.amfast.se`)
- **Styling:** Tailwind CSS, men följ designspråket från referensfilen
  (mörkblå/marinblå + guld/mässing-accent, seriffont för rubriker,
  monospace för siffror/objektnummer)

## Datamodell (Supabase/Postgres)

### `profiles`
Kopplas 1:1 mot `auth.users`.
| kolumn | typ | beskrivning |
|---|---|---|
| id | uuid, PK, FK till auth.users | |
| full_name | text | |
| role | text | `admin` \| `forvaltare` \| `agare` \| `viewer` |
| created_at | timestamptz | |

### `fastigheter`
| kolumn | typ |
|---|---|
| id | uuid, PK |
| namn | text (t.ex. "Aeolus 1") |
| adress | text |
| agare | text (t.ex. "Dina Palaisbacken AB") |
| forvaltare | text (default "AMfast Fastighetsförvaltning AB") |
| created_at | timestamptz |

### `objekt`
| kolumn | typ |
|---|---|
| id | uuid, PK |
| fastighet_id | uuid, FK → fastigheter |
| objektnummer | text (t.ex. "851-1002") |
| typ | text (t.ex. "Kontor", "Förråd", "Rest/Cafe") |
| hyresgast | text, nullable |
| area_kvm | numeric |
| kr_per_kvm | numeric |
| hyra_ar | numeric |
| fastighetsskatt_ar | numeric |
| ovrigt_ar | numeric |
| status | text (`uthyrd` \| `vakant`) |
| vakanshyra_ar | numeric, nullable |
| kontrakt_fran | date, nullable |
| kontrakt_tom | date, nullable |
| gata | text |
| created_at, updated_at | timestamptz |

### `fakturor`
| kolumn | typ |
|---|---|
| id | uuid, PK |
| objekt_id | uuid, FK → objekt |
| fakturanummer | text |
| period | text (t.ex. "2026-07" eller "2026-Q3") |
| forfallodatum | date |
| belopp | numeric |
| anmarkning | text, nullable (t.ex. påminnelseavgift, dröjsmålsränta) |
| created_at | timestamptz |

### `anvandare_fastighet` (behörighetstabell)
| kolumn | typ |
|---|---|
| user_id | uuid, FK → auth.users |
| fastighet_id | uuid, FK → fastigheter |
| behorighet | text (`read` \| `write`) |

## Roller och behörighet (Row Level Security)

| Roll | Ser | Redigerar |
|---|---|---|
| `admin` | Alla fastigheter/objekt/fakturor | Allt, inkl. skapa/ta bort fastigheter och objekt, hantera användare |
| `forvaltare` | Fastigheter kopplade via `anvandare_fastighet` | Objekt/hyresgäster/fakturor inom sina fastigheter (om `behorighet = write`) |
| `agare` | Fastigheter kopplade via `anvandare_fastighet` | Inget — read-only |
| `viewer` | Fastigheter kopplade via `anvandare_fastighet` | Inget — read-only |

Implementera detta som RLS-policies i Supabase (inte bara frontend-logik) —
åtkomsten ska vara skyddad på databasnivå.

## Funktioner att bygga (i denna ordning)

1. **Projektskelett** — Vite/React-app, Supabase-klient, miljövariabler för
   Supabase-URL/nyckel, grundläggande routing (`/login`, `/`, `/fastighet/:id`,
   `/admin`).
2. **Inloggning** — e-post + lösenord via Supabase Auth. Enkel login-vy med
   samma visuella stil som resten av appen.
3. **Översiktsvy** — motsvarande "Översikt"-fliken i referensfilen: KPI-rad,
   fastighetskort med beläggnings-ribbon, filtrerat efter vilka fastigheter
   den inloggade användaren har åtkomst till.
4. **Objekt & kontrakt-vy** — tabell över objekt, filtrerbar/sökbar, som i
   referensfilen. Redigerbar inline eller via formulär för roller med
   `write`-behörighet.
5. **Fakturor-vy** — grupperat per hyresgäst med flaggor för anmärkningar,
   som i referensfilen.
6. **Åtgärder-vy** — automatiska flaggor: vakanser, kontrakt som snart löper
   ut, betalningsanmärkningar.
7. **Admin-panel** (endast roll `admin`) — CRUD för fastigheter (lägg
   till/ta bort/redigera), CRUD för objekt, samt hantering av vilka
   användare som har åtkomst till vilka fastigheter.
8. **Import av befintlig data** — skriv ett engångsskript som läser in
   nuvarande rentroll-data (finns som exempel i referensfilens inbäddade
   JSON) till Supabase-tabellerna, så portalen inte startar tom.

## Branding

- Namn: **AMfast Förvaltningsportal**
- Färgpalett (hämta exakta hex-värden från referensfilens CSS-variabler):
  djup marinblå som primärfärg, mässingsguld som accent, ljus
  blågrå bakgrund, seriffont (Fraunces) för rubriker, sans-serif (Inter)
  för brödtext/UI, monospace (IBM Plex Mono) för siffror och objektnummer.
- Förvaltare i UI-text ska alltid vara **AMfast Fastighetsförvaltning AB**,
  inte Savills.

## Leverabler för denna första session

- Fungerande lokal dev-miljö (`npm run dev`) med inloggning mot ett
  Supabase-projekt (jag skapar kontot/projektet separat och ger dig
  URL + nycklar, eller så guidar du mig genom att skapa det).
- Databasschema och RLS-policies som SQL-migrationer i repot.
- Översiktsvyn och Objekt-vyn kopplade mot riktig data (kan vara
  testdata till att börja med).
- Ett git-repo, redo att kopplas till Vercel/Netlify för deploy.

Fråga mig om Supabase-projekt, domän eller designdetaljer om något är
oklart innan du börjar bygga.
