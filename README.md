# marketingwerk Kundenportal

Ein React-basiertes Kundenportal für marketingwerk — Kampagnen, Leads und Performance auf einen Blick.

**Tech Stack:** React · Vite · TypeScript · Tailwind CSS · Supabase

---

## Setup

### 1. Repository klonen

```bash
git clone https://github.com/hoellermike/marketingwerk-portal.git
cd marketingwerk-portal
npm install
```

### 2. Supabase Projekt erstellen

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Gehe zu **SQL Editor** und führe `supabase/migration.sql` aus
3. Optional: Führe `supabase/seed.sql` aus für Beispieldaten

### 3. Environment Variables

Erstelle `.env` im Projektroot:

```env
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...dein-anon-key
```

### 4. Starten

```bash
npm run dev
```

---

## Portal-User anlegen

Das Portal nutzt Magic Links (passwordless auth). So legst du einen User an:

1. **Auth-User erstellen:** Supabase Dashboard → Authentication → Users → Invite User (E-Mail eingeben)
2. **User erhält Magic Link** per E-Mail und kann sich einloggen
3. **portal_users verknüpfen:** Damit der User seinen Kunden sieht, muss ein Eintrag in `portal_users` existieren:

```sql
-- Die auth.uid() findest du unter Authentication → Users
INSERT INTO portal_users (id, customer_id, role)
VALUES ('auth-user-uuid-hier', 'customer-id-hier', 'admin');
```

Ohne diese Verknüpfung sieht der User die Willkommensseite ("Account wird eingerichtet").

---

## Deployment auf Vercel

1. Verbinde das GitHub Repo mit [vercel.com](https://vercel.com)
2. Framework Preset: **Vite**
3. Environment Variables setzen: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`
4. Deploy — fertig!

**Wichtig:** In Supabase unter Authentication → URL Configuration die Vercel-Domain als Redirect URL hinzufügen.

---

## Projektstruktur

```
src/
  components/   # Layout, StatCard, StatusBadge, etc.
  contexts/     # AuthContext (Supabase Auth + Customer)
  pages/        # Dashboard, Campaigns, Documents, Links, Login
  lib/          # Supabase Client
supabase/
  migration.sql # Datenbank-Schema
  seed.sql      # Beispieldaten
```
