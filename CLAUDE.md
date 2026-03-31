# FOLIO App — Conventions pour Claude

## Stack
- Next.js 15.2, App Router, Turbopack
- TypeScript 5.9
- Supabase (PostgreSQL) — schéma exclusif : `folio_app` (jamais `public`)
- Anthropic SDK — modèle fixe : `claude-sonnet-4-6`
- Tailwind CSS v3, design system dark custom (variables CSS dans globals.css)
- Vercel (déploiement)

## Règles critiques

### Supabase
- **Toujours** appeler `.schema('folio_app')` via l'option `db: { schema: 'folio_app' }` dans le client — jamais le schéma `public`.
- Server Components / API routes → `lib/supabase/server.ts`
- Client Components → `lib/supabase/client.ts`
- Toujours vérifier `getUser()` en premier dans les API routes.
- Toutes les requêtes SQL dans `supabase/migrations/` avec préfixe `YYYYMMDD_description.sql`.

### Auth
- `middleware.ts` protège toutes les routes sauf `/login` et `/api/ai-news/*`
- `/api/ai-news/*` bypass Supabase auth — utilise son propre header `x-ingest-token`
- Session persistante via cookies SSR (`@supabase/ssr`)

### Architecture des fichiers
```
app/(auth)/login/          # page login
app/(main)/[module]/       # pages protégées (Server Components par défaut)
app/api/[module]/          # API routes (vérifier getUser() en premier)
components/[module]/       # composants par module
lib/supabase/              # server.ts + client.ts
lib/anthropic.ts           # instance singleton Anthropic
lib/utils.ts               # cn(), formatDate(), STEP_STATUS, etc.
types/database.ts          # types Supabase
types/index.ts             # re-export + types UI composites
supabase/migrations/       # migrations SQL
```

### Checklist ajout de feature
1. Migration SQL → `supabase/migrations/YYYYMMDD_description.sql`
2. Types → `types/database.ts`
3. API route → `app/api/[module]/route.ts` (getUser() en premier)
4. Composant → `components/[module]/`
5. Page → `app/(main)/[module]/page.tsx`

### Statuts des étapes (StepStatus)
`backlog | planifie | en_cours | en_validation | termine`

### Style
- Design system dark — utiliser les variables CSS (`var(--background)`, `var(--card)`, etc.)
- Police : Geist Sans pour UI, Geist Mono pour code/IDs/métriques
- Préférer les modales pour les détails des phases/étapes
- **Performance d'affichage avant tout** — rapidité > richesse visuelle

### n8n / AI News
- n8n pousse les articles via `POST /api/ai-news`
- Auth : header `x-ingest-token` (valeur = `N8N_AI_NEWS_INGEST_TOKEN` en env)
- `N8N_WEBHOOK_URL_ANALYZE` : webhook n8n pour analyses prospection phase 1
