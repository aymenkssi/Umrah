# Déployer le backend Umrah Companion sur le VPS

Même installation que Neon Strike, sur le **même VPS**, derrière le **Traefik déjà en place** (`/opt/apps/proxy`). Deux conteneurs :

| Service | Rôle | Exposé sur Internet |
|---|---|---|
| `api` | FastAPI : statistiques anonymes de l'app, page d'administration, site (politique de confidentialité, `app-ads.txt`) | oui, via Traefik, sur `pelerinage.creationapp.academy` |
| `mongo` | MongoDB 7 avec mot de passe, données dans un volume | non (réseau interne uniquement) |

| Adresse | Contenu |
|---|---|
| `https://pelerinage.creationapp.academy/` | Page d'accueil de l'application |
| `https://pelerinage.creationapp.academy/privacy` | Politique de confidentialité (FR, EN, AR) |
| `https://pelerinage.creationapp.academy/app-ads.txt` | Fichier AdMob |
| `https://pelerinage.creationapp.academy/admin` | Administration : statistiques (jeton `ADMIN_TOKEN`) |
| `https://pelerinage.creationapp.academy/api/…` | API appelée par l'application |

## 1. DNS

Dans la zone DNS de `creationapp.academy`, ajoutez :

| Type | Nom | Valeur |
|---|---|---|
| A | `pelerinage` | IP du VPS (la même que `api.gameneonstrike.com`) |

Vérifiez avec `ping pelerinage.creationapp.academy` avant de lancer : Traefik en a besoin pour obtenir le certificat HTTPS.

## 2. Installer

```bash
git clone https://github.com/aymenkssi/Umrah.git /opt/apps/umrah-companion
cd /opt/apps/umrah-companion/deploy
cp .env.example .env
nano .env
```

- `DOMAIN=pelerinage.creationapp.academy` (déjà rempli).
- `MONGO_PASSWORD` : `openssl rand -hex 24`.
- `ADMIN_TOKEN` : `openssl rand -hex 32` (gardez-le dans un gestionnaire de mots de passe).
- `TRAEFIK_NETWORK=web`, `TRAEFIK_ENTRYPOINT=websecure`, `TRAEFIK_CERTRESOLVER=letsencrypt` : mêmes valeurs que Neon Strike, déjà remplies.

## 3. Lancer

```bash
docker compose up -d --build
docker compose ps                                              # "running" / "healthy"
curl https://pelerinage.creationapp.academy/api/               # {"message":"Umrah Companion API online"}
curl https://pelerinage.creationapp.academy/app-ads.txt        # google.com, pub-7488746561313974, DIRECT, f08c47fec0942fa0
```

Le projet s'appelle `umrah-companion` et son routeur Traefik `umrah` : aucun conflit avec Neon Strike.
Mise à jour après un `git pull` : `docker compose up -d --build`. Journaux : `docker compose logs -f api`.

## 4. Pays des utilisateurs (GeoIP)

L'API déduit le pays de l'adresse IP avec la base gratuite DB-IP « IP to Country Lite », **sans jamais enregistrer l'adresse**. Sans cette base, elle utilise la région réglée sur le téléphone.

```bash
./geoip-update.sh                     # télécharge geoip/country.mmdb et redémarre l'API
crontab -e                            # puis ajouter (mise à jour mensuelle) :
20 5 3 * * cd /opt/apps/umrah-companion/deploy && ./geoip-update.sh >> geoip/update.log 2>&1
```

## 5. Sauvegardes

```bash
./backup.sh     # crée backups/umrah-AAAA-MM-JJ_HHMM.gz (14 jours conservés)
crontab -e      # puis ajouter :
15 4 * * * cd /opt/apps/umrah-companion/deploy && ./backup.sh >> backups/backup.log 2>&1
```

Restauration :

```bash
docker compose exec -T mongo mongorestore --gzip --archive=/backups/umrah-XXXX.gz \
  --username "$MONGO_USER" --password "$MONGO_PASSWORD" --authenticationDatabase admin --drop
```

## 6. Google Play et AdMob

- **Play Console › Fiche du Store** : site web `https://pelerinage.creationapp.academy`, règles de confidentialité `https://pelerinage.creationapp.academy/privacy`.
- **Play Console › Sécurité des données** : déclarez
  - l'**identifiant publicitaire** et les données collectées par Google AdMob ;
  - les **statistiques d'utilisation** envoyées au serveur : identifiant d'installation, pays approximatif, interactions avec l'app. Elles sont collectées pour l'analyse, non partagées, chiffrées en transit, et supprimables par l'utilisateur (Réglages › Statistiques anonymes).
- **app-ads.txt** : AdMob le cherche sur le domaine du site déclaré dans la fiche Play Store. Selon la façon dont Google traite les sous-domaines, il peut le chercher à la racine du domaine. Publiez donc la même ligne aussi sur `https://creationapp.academy/app-ads.txt` si ce site existe. La ligne est la même que pour Neon Strike (même compte AdMob).

## 7. Administration

Ouvrez **https://pelerinage.creationapp.academy/admin** et collez le `ADMIN_TOKEN`. Le jeton reste dans l'onglet jusqu'à sa fermeture. L'onglet **Statistiques** affiche :

- les installations : total, nouvelles, actives aujourd'hui / 7 jours / 30 jours, et le nombre d'ouvertures ;
- la courbe des installations actives par jour, avec un tableau détaillé ;
- les **pays** (installations et actives sur 30 jours), les écrans les plus consultés, les langues, les versions et les plateformes.

D'autres onglets pourront s'ajouter (messages aux utilisateurs, contenu du guide…) : chaque fonctionnalité est un module Python de `backend/` avec ses routes `/api/admin/…` protégées par `require_admin`.

## Ce que fait l'API

| Route | Rôle |
|---|---|
| `POST /api/sessions` | Appelé à chaque lancement : identifiant d'installation aléatoire, langue, version, plateforme, région du téléphone. Pays déduit de l'IP (non stockée). |
| `POST /api/events` | Écrans ouverts, comptés par jour et par écran, sans identifiant. |
| `DELETE /api/installs/{id}` | L'utilisateur désactive les statistiques : ses données sont effacées. |
| `GET /api/admin/stats` | Statistiques de la page d'administration (jeton obligatoire). |
| `GET /api/health` | Contrôle de santé (utilisé par Docker). |

Limites : 600 requêtes par heure et par adresse IP, car beaucoup de pèlerins partagent la même IP (Wi-Fi du Haram, opérateurs mobiles) ; corps de requête limité à 16 Ko par Traefik. Les installations inactives depuis 24 mois sont supprimées automatiquement, comme l'annonce la politique de confidentialité.
