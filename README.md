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
| `profiles` | 1:1 mot `auth.users`, med roll (`admin`/`forvaltare`/`agare`/`viewer`/`drifttekniker`) |
| `fastigheter` | Förvaltade fastigheter |
| `objekt` | Uthyrningsbara objekt/lokaler inom en fastighet ("Lokal" i fastighetshierarkin) |
| `fakturor` | Hyresavier per objekt/hyresgäst |
| `anvandare_fastighet` | Behörighetstabell: vilka fastigheter en användare ser, och `read`/`write` |
| `byggnader` | Byggnader inom en fastighet |
| `vaningsplan` | Våningsplan inom en byggnad (`objekt.vaningsplan_id` placerar en lokal här) |
| `tekniska_objekt` | Tekniska/fysiska objekt (ventilationsaggregat, pumpar, hissar m.m.) — skilt begrepp från `objekt`/lokaler |
| `ritningar` | Ritnings-/modellfiler (PDF/DWG/BIM/3D/point cloud), kopplade till fastighet/byggnad/plan/lokal |
| `dokument` | Dokument kopplade till valfri nivå i hierarkin eller ett tekniskt objekt |
| `garantier` | Garantier registrerade på tekniska objekt |
| `underhall_atgarder` | Löpande drift-/underhållsåtgärder, kan vara återkommande |
| `besiktningar` | Besiktningar/myndighetskontroller, kan vara återkommande |

### Fastighetsstruktur & digital tvilling (MVP1)

Migration `0006_digital_fastighetsplattform.sql` lägger till den hierarkiska
strukturen Fastighet → Byggnad → Våningsplan → Lokal/Tekniskt objekt som den
digitala tvillingen navigeras genom (se `/fastighet/:id`, flikarna
"Fastighetsstruktur" och "Tekniska objekt"). Ett tekniskt objekt (t.ex. ett
ventilationsaggregat) har ett eget informationskort med garanti, underhåll,
besiktningar och dokument samlat på en plats — klicka på objektet i tabellen
för att öppna det.

Återkommande underhåll/besiktningar hanteras via RPC-funktionerna
`slutfor_underhall` och `slutfor_besiktning`: de markerar åtgärden som
utförd och skapar nästa förekomst automatiskt utifrån `intervall_manader`,
på samma sätt som `applicera_index` m.fl. i tidigare migrationer.

Ritningar och dokument lagras i två privata Storage-bucketar (`ritningar`,
`dokument`, skapade av migrationen) med filsökvägen `<fastighet_id>/...` —
storage-policyerna återanvänder `has_fastighet_access()` för att en kund
aldrig ska kunna nå en annan kunds filer.

**Medvetet avgränsat i det här steget** (nästa steg enligt produktbeskrivningens
version 2/3): ritningsvisaren öppnar filen i webbläsarens inbyggda PDF-visare
snarare än en inbyggd zoom/pan/mät-vy — kalibrerings-/mätdata
(`ritningar.skala_kalibrering`) och objektens ritningsposition
(`tekniska_objekt.placering_x/y`) finns redan i schemat så en sådan vy kan
byggas ovanpå utan schemaändringar. 3D/BIM/point cloud-visning, avancerad
hyreshistorik/investeringar och rollbaserad vy-filtrering (t.ex. dölja
hyresdata för `drifttekniker` i gränssnittet) är inte byggda än.

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
| `drifttekniker` | Fastigheter kopplade via `anvandare_fastighet` | Tekniska objekt, underhåll, besiktningar, ritningar och dokument inom sina fastigheter, om `behorighet = write` (RLS är i detta steg inte hårdare begränsad än `forvaltare` — se avsnittet om fastighetsstruktur nedan) |

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

## Backup

`.github/workflows/backup.yml` kör en fullständig `pg_dump` av databasen
varje natt (03:00 UTC) och sparar den som en nedladdningsbar workflow-artefakt
i 30 dagar. Gratis, oberoende av Supabase-plan.

Så här sätter du på den:

1. I Supabase: **Project Settings → Database → Connection string** — kopiera
   URI:n (Session pooler eller direktanslutning).
2. I GitHub-repot: **Settings → Secrets and variables → Actions → New
   repository secret**, namn `DATABASE_URL`, klistra in anslutningssträngen.
3. Klart — workflowet kör automatiskt varje natt. Du kan även trigga det
   manuellt under **Actions → Databasbackup → Run workflow**, och ladda ner
   dumpen under körningens "Artifacts".

Detta ersätter inte Supabase Pro-planens Point-in-Time Recovery (återställning
till valfri minut), men ger en gratis säkerhetskopia oavsett vilken plan
projektet står på.

## Säkerhetscheck (görs i Supabase-dashboarden, inte i kod)

Följande kan inte sättas via migrationer/kod — gör dem manuellt i Supabase-
projektets inställningar:

- [ ] **Authentication → Sign In / Providers → Email** — stäng av "Allow new
  users to sign up". Appen skapar användare via Admin-panelen/dashboarden,
  inte självregistrering, så öppen registrering behövs inte.
- [ ] **Authentication → Policies/Security** — slå på "leaked password
  protection" (varnar om ett valt lösenord finns i kända dataintrång).
- [ ] **Settings → API Keys** — överväg att rotera `service_role`-nyckeln
  om den någonsin delats utanför en betrodd kanal, och uppdatera
  `.env.import` lokalt efteråt.
- [ ] Aktivera tvåfaktorsinloggning på era egna konton hos Supabase, Vercel
  och GitHub — vanligaste vägen in vid intrång är kontot, inte appen.
