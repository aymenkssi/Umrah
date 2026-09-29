# Consignes pour Claude

- Après chaque mise à jour poussée, **ouvrir la pull request vers `main` sans demander** (ou mettre à jour la PR ouverte de la branche). Si la PR précédente a été fusionnée, repartir de `main` à jour.
- Répondre en français.

## Vérifications avant chaque push

```bash
# Application (dossier frontend)
yarn typecheck && yarn lint && yarn test

# Backend (racine du dépôt)
flake8 --max-line-length 110 backend tests && pytest tests
```

## Points d'attention

- Expo SDK 57 : utiliser les hooks d'`expo-router` (ex. `useIsFocused`), jamais `@react-navigation/*` directement.
- Couleurs : toujours via `useTheme()` / `useThemedStyles()` (mode sombre), jamais de couleur codée en dur.
- Textes : clés de traduction dans `contexts/LanguageContext.tsx`, en arabe, anglais et français.
- Si les invocations changent (`frontend/data/*.json`), régénérer `python backend/build_audio_catalog.py`.
- Déploiement du backend : voir `deploy/README.md` (VPS avec Traefik, sous-domaine `pelerinage.creationapp.academy`).
