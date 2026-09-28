# Umrah Companion — رفيق العمرة — Compagnon de la 'Omra

Application mobile (iOS / Android) qui accompagne le pèlerin pas à pas pendant la 'Omra,
en **arabe**, **français** et **anglais**.

## Fonctionnalités

- **Guide de la 'Omra** : les 6 étapes (Ihram, Talbiya, Tawaf, Sa'i, Taqsir, fin), avec invocations, notes et suivi de progression.
- **Miqat** : le miqat le plus proche selon la position, les distances, la navigation Google Maps et la recherche dans les trois langues.
- **Horaires de prière** : la prochaine prière avec compte à rebours. La méthode *Umm al-Qura* est utilisée en Arabie saoudite, la *Ligue islamique mondiale* ailleurs.
- **Qibla** : une boussole basée sur le nord géographique, avec la distance jusqu'à la Kaaba et une alerte d'étalonnage.
- **Invocations** : des du'as classées par thème (arabe, translittération, traduction).
- **Réglages** : langue (par défaut celle du téléphone), taille du texte et réinitialisation de la progression.

Aucune donnée personnelle n'est collectée : tout est stocké localement sur l'appareil.

## Structure

```
frontend/   Application Expo (SDK 54, expo-router, TypeScript)
  app/          Écrans (routage par fichiers)
  contexts/     Langue et réglages
  data/         Étapes, miqats, invocations (JSON)
  utils/        Calculs (distance, Qibla, prières, localisation)
  __tests__/    Tests unitaires Jest
backend/    API FastAPI + MongoDB (optionnelle, l'app fonctionne hors ligne)
tests/      Tests de l'API (pytest)
```

## Démarrer

### Application mobile

```bash
cd frontend
yarn install
yarn start          # puis scanner le QR code avec Expo Go
```

Vérifications :

```bash
yarn typecheck      # TypeScript
yarn lint           # ESLint
yarn test           # Jest
```

### API

```bash
pip install -r backend/requirements-dev.txt
cp backend/.env.example backend/.env   # optionnel
uvicorn server:app --reload --app-dir backend
pytest tests
```

Variables d'environnement : `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS` (liste séparée par des virgules).

## Publication

Voir [GUIDE_PUBLICATION_FR.md](GUIDE_PUBLICATION_FR.md) et [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Avertissement

Cette application est un outil d'orientation. Pour toute question religieuse, consultez des savants qualifiés.
