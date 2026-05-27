# CoachPilot

Application de suivi à distance pour coachs sportifs, avec une IA Claude intégrée comme bras droit du coach.

## Fonctionnalités

**Espace coach** (`/coach`)
- Tableau de bord avec stats de tous les clients
- Création de clients avec profil complet (objectifs musculaires/nutrition, contraintes, atouts, blessures)
- Programme d'entraînement détaillé (bibliothèque de 50+ exercices, séries, reps, poids, repos, jour)
- Lien personnalisé généré pour chaque client
- Assistant IA Claude avec accès à toutes les données
- Suggestions IA proactives sur la page d'accueil
- Personnalisation complète (logo, couleurs, nom de marque)

**Espace client** (`/client/[token]`)
- Aucun login nécessaire — accès via lien unique
- Entraînement du jour (cochage, ajustement séries/reps/poids)
- Prochaines séances visibles
- Suivi sommeil quotidien (note + heures + commentaire)
- Suivi nutrition (objectif atteint ou non + détail)
- Prise de notes libre (encourage le client à tout commenter)
- Historique des séances + compteur depuis le début
- Reprend automatiquement la DA du coach (logo, couleurs)

## Stack

- Next.js 16 App Router + TypeScript + Tailwind
- SQLite (better-sqlite3) — DB locale dans `./data/coachpilot.db`
- Auth coach maison (bcrypt + JWT cookies via `jose`)
- AI SDK + `@ai-sdk/anthropic` (Claude Sonnet 4.6 par défaut)

## Démarrage

```bash
cp .env.local.example .env.local
# Édite .env.local et ajoute ta clé ANTHROPIC_API_KEY

npm run dev
```

Ouvre http://localhost:3000 et crée ton compte coach.

## Configuration

Variables d'environnement (dans `.env.local`) :

- `ANTHROPIC_API_KEY` — requise pour l'IA (Claude)
- `CLAUDE_MODEL` — optionnel, défaut `claude-sonnet-4-6`
- `SESSION_SECRET` — secret JWT, à changer en production

## Structure

```
src/
  app/
    login/, signup/   # auth coach
    coach/            # espace coach (protégé)
      clients/        # liste, création, fiche, édition
      settings/       # personnalisation marque
    client/[token]/   # espace client public (token)
    api/              # routes API
  components/         # UI partagée
  lib/                # db, auth, queries, schemas, ai-context
data/
  coachpilot.db       # généré automatiquement
```
