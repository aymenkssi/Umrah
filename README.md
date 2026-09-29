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

Aucun compte n'est nécessaire : la progression et les réglages restent sur l'appareil. Des bannières Google AdMob financent l'application (voir plus bas).

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

## Publicités (AdMob)

Une bannière AdMob s'affiche en bas des écrans **Accueil, Miqat, Horaires et Réglages**. Elle n'apparaît jamais pendant les rites (Guide, Invocations, Qibla).
Le formulaire de consentement de Google (UMP, obligatoire pour l'UE, le Royaume-Uni et la Suisse) s'affiche automatiquement quand il est requis. Les Réglages proposent ensuite un lien « Confidentialité des publicités ».

Les identifiants **Android** réels sont configurés (package `com.aymen.umrahcompanion`). iOS affiche encore les **publicités de test de Google**, et les builds de développement aussi. Pour ajouter ou changer des identifiants :

1. Sur [apps.admob.com](https://apps.admob.com), crée une app Android et une app iOS, puis un bloc d'annonces **Bannière** pour chacune.
2. Dans `frontend/app.json` (plugin `react-native-google-mobile-ads`), remplace `androidAppId` et `iosAppId` (format `ca-app-pub-…~…`).
3. Dans `frontend/constants/ads.ts`, renseigne `BANNER_AD_UNIT_IDS` (format `ca-app-pub-…/…`). Pour couper toutes les pubs, passe `ADS_ENABLED` à `false`.
4. Dans AdMob > Confidentialité et messages, crée un message **RGPD** (et, pour iOS, un message **IDFA / ATT**).
5. Sur le Play Console, déclare « Mon application contient des annonces ». Publie aussi un fichier `app-ads.txt` sur le site du développeur.

Les pubs ne fonctionnent pas dans **Expo Go**, qui ne contient pas le module natif ; l'application tourne alors normalement, sans pub. Pour les voir, il faut un build :

```bash
cd frontend
eas build --profile development --platform android   # build de test avec expo-dev-client
yarn start --dev-client
```

Les builds de développement affichent toujours des pubs de test. Ne clique jamais sur tes propres pubs réelles, sinon le compte AdMob peut être suspendu.

## Publication

Voir [GUIDE_PUBLICATION_FR.md](GUIDE_PUBLICATION_FR.md) et [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Avertissement

Cette application est un outil d'orientation. Pour toute question religieuse, consultez des savants qualifiés.
