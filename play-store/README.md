# Mise à jour Google Play · version 1.3.0

Tout ce qu'il faut pour publier la version 1.3.0 de **رفيق العمرة والحج** (`com.aymen.umrahcompanion`) sur Google Play et activer les publicités AdMob.

| Dossier / fichier | Contenu |
|---|---|
| `textes/fr.md`, `textes/en.md`, `textes/ar.md` | Nom, description courte, description complète et notes de version, prêts à copier (limites de caractères vérifiées) |
| `images/icon-512.png` | Icône de la fiche (512 × 512) |
| `images/feature-graphic-fr.png` (`-en`, `-ar`) | Bannière de la fiche (1024 × 500), une par langue |
| `images/screenshots-fr/` (`-en`, `-ar`) | 7 captures de téléphone (1080 × 1920) par langue, dans l'ordre d'affichage |
| `scripts/` | Scripts qui ont généré les images, pour les refaire après un changement d'écran |

Les écrans suivent l'ordre des captures : accueil, invocations du Hajj ('Arafat), étapes du Hajj, compteur de tours, horaires de prière, invocations, checklist.

---

## 1. Construire le fichier pour Google Play

Google Play demande un fichier **.aab** (le build *preview* produit un .apk, qui sert seulement aux tests).

```bash
git checkout main && git pull
cd frontend && yarn install
npx eas-cli build --platform android --profile production
```

- Version : **1.3.0**, code de version **4** (`frontend/app.json`).
- Si la Play Console refuse le fichier parce que le code de version est déjà utilisé, augmentez `android.versionCode` dans `app.json` puis relancez le build.
- Le fichier doit être signé avec la même clé que la version 1.0.0. Si la 1.0.0 a été construite avec EAS sur le même compte Expo, EAS réutilise automatiquement la clé. Sinon, importez l'ancienne clé avec `npx eas-cli credentials` avant le build.

## 2. Publier la version

Play Console › **Tester et publier** › **Test interne** (conseillé d'abord) ou **Production** › **Créer une version**.

1. Importez le fichier .aab.
2. Nom de la version : `1.3.0 (4)`.
3. Notes de version : collez le bloc ci-dessous, qui contient les trois langues (textes tirés de `textes/`).

```
<fr-FR>
Nouveau : le Hajj, jour par jour du 8 au 13 Dhoul Hijja, avec les invocations de chaque étape.
• Nouveau nom et nouvelle icône : رفيق العمرة والحج
• Invocations de chaque étape de la Omra, avec audio
• Compteur de tours Tawaf et Sa'i
• Rappels des horaires de prière
• Carte des lieux saints et numéros d'urgence
• Checklist de voyage, Qibla améliorée, mode sombre
</fr-FR>
<en-US>
New: Hajj, day by day from 8 to 13 Dhul Hijjah, with the du'as of every step.
• New name and icon: Umrah & Hajj Companion
• Du'as for every step of Umrah, with audio
• Tawaf and Sa'i lap counter
• Prayer time reminders
• Map of the holy sites and emergency numbers
• Travel checklist, improved Qibla, dark mode
</en-US>
<ar>
جديد: الحج يوماً بيوم من ٨ إلى ١٣ ذي الحجة، مع أدعية كل مرحلة.
• اسم جديد وأيقونة جديدة: رفيق العمرة والحج
• أدعية كل مرحلة من العمرة مع الاستماع
• عدّاد أشواط الطواف والسعي
• تنبيهات أوقات الصلاة
• خريطة الأماكن المقدسة وأرقام الطوارئ
• قائمة تجهيز السفر، تحسين القبلة، الوضع الليلي
</ar>
```

Une langue qui n'est pas encore ajoutée à la fiche (étape 3) est ignorée : ajoutez les traductions de la fiche avant d'envoyer la version.

Avec le test interne, installez l'app depuis le lien de test, vérifiez-la, puis **Promouvoir la version › Production**.

## 3. Mettre à jour la fiche du Store

Play Console › **Développer la présence sur le Store** › **Fiche principale du Store**.

1. Pour chaque langue (**Gérer les traductions › Ajouter vos propres traductions** : `fr-FR`, `en-US`, `ar`) :
   - **Nom de l'application**, **description courte**, **description complète** : copiez les blocs de `textes/<langue>.md`.
   - **Bannière** : `images/feature-graphic-<langue>.png`.
   - **Captures d'écran du téléphone** : les 7 fichiers de `images/screenshots-<langue>/`, dans l'ordre.
2. **Icône de l'application** : `images/icon-512.png` (la même pour toutes les langues).
3. **Coordonnées** : site web `https://pelerinage.creationapp.academy`, e-mail `aymenkssi@gmail.com`. Le site web est indispensable pour que AdMob trouve le fichier `app-ads.txt` (étape 5).

Le nouveau nom et les nouvelles images passent en examen avec la version ; l'examen prend en général de quelques heures à quelques jours.

## 4. Contenu de l'application (déclarations)

Play Console › **Règles et programmes** › **Contenu de l'application**. Chaque rubrique doit être à jour avant l'envoi en production.

| Rubrique | Réponse |
|---|---|
| Règles de confidentialité | `https://pelerinage.creationapp.academy/privacy` |
| Annonces | **Oui, mon application contient des annonces** |
| Identifiant publicitaire | **Oui**, pour la **Publicité ou le marketing** |
| Public cible et contenu | **18 ans et plus** conseillé (en dessous de 13 ans, les règles « Familles » imposent d'autres réglages AdMob) |
| Classification du contenu | Catégorie **Référence, actualités ou éducation**, répondre **Non** aux questions sur la violence, la sexualité, les jeux d'argent, etc. |
| Application d'actualités | Non |
| Autorisations | Localisation uniquement au premier plan : pas de déclaration de localisation en arrière-plan à faire. |

### Sécurité des données

Réponses conformes à ce que fait l'app et à la politique de confidentialité :

- **Données collectées ou partagées ?** Oui. **Chiffrées en transit ?** Oui. **Suppression possible ?** Oui (Réglages › Statistiques anonymes efface les statistiques de l'installation).
- **Statistiques de l'app** (serveur `pelerinage.creationapp.academy`) : collectées, **non partagées**, finalité **Analyse** :
  - *Identifiants de l'appareil ou autres* : identifiant d'installation aléatoire ;
  - *Activité dans l'application › Interactions avec l'application* : écrans ouverts ;
  - *Position › Position approximative* : pays déduit de l'adresse IP (l'adresse n'est pas enregistrée).
- **Publicités Google AdMob** : cochez ce que le SDK Google Mobile Ads collecte d'après la page officielle de Google (<https://developers.google.com/admob/android/privacy/play-data-disclosure>) : *Position approximative*, *Interactions avec l'application*, *Diagnostics et journaux de plantage*, *Identifiants de l'appareil ou autres*, pour la **Publicité ou le marketing**, l'**Analyse** et la **Prévention des fraudes et sécurité**.
- **Position précise** : utilisée seulement sur le téléphone (Qibla, miqat, horaires de prière), jamais envoyée. Elle n'est pas « collectée » au sens de Google Play et ne se déclare pas.

## 5. Activer les publicités AdMob

**Côté application, tout est prêt** : l'identifiant d'application AdMob (`ca-app-pub-7488746561313974~7775293011`), le bloc d'annonces bannière (`ca-app-pub-7488746561313974/5332962502`) et le formulaire de consentement de Google (RGPD) sont intégrés. Les bannières s'affichent sur l'accueil, le miqat, les horaires de prière et les réglages, jamais pendant les rites. Les builds de développement affichent les annonces de test de Google.

Il reste cinq actions à faire dans les comptes Google :

1. **Relier l'app AdMob à Google Play** (une fois la version publiée) : AdMob › **Applications** › votre app › **Paramètres de l'application** › **Plate-forme de téléchargement** › **Ajouter**, puis recherchez `com.aymen.umrahcompanion`. AdMob examine ensuite l'app (quelques jours) ; avant cette validation, les annonces sont limitées.
2. **Publier le message de consentement RGPD** : AdMob › **Confidentialité et messages** › **Réglementations européennes** › **Créer un message**, sélectionnez l'app, les langues français, anglais et arabe, puis **Publier**. Sans ce message, le formulaire de consentement ne s'affiche pas dans l'app, et en Europe, au Royaume-Uni et en Suisse, presque aucune annonce n'est diffusée.
3. **Vérifier `app-ads.txt`** : après le redéploiement du backend (étape 6), `https://pelerinage.creationapp.academy/app-ads.txt` doit afficher `google.com, pub-7488746561313974, DIRECT, f08c47fec0942fa0`. AdMob › Applications › **app-ads.txt** passe à « Vérifié » dans les 24 heures qui suivent la mise à jour de la fiche. Si AdMob ne le trouve pas, publiez la même ligne sur `https://creationapp.academy/app-ads.txt`.
4. **Configurer les paiements** : AdMob › **Paiements** : profil de paiement, informations fiscales, puis compte bancaire. Google envoie un code PIN par courrier à 10 € de revenus pour vérifier l'adresse ; le paiement est versé à partir de 70 €.
5. **Déclarer votre téléphone comme appareil de test** : AdMob › **Paramètres** › **Appareils de test** › **Ajouter**, avec l'identifiant publicitaire du téléphone (Paramètres Android › Google › Annonces). Les builds preview et production affichent de **vraies** annonces : ne cliquez jamais sur vos propres annonces, cela peut faire suspendre le compte AdMob.

Les premières annonces peuvent mettre quelques heures à apparaître après la publication.

## 6. Après la publication

- **Backend** : sur le VPS, `git pull` puis `docker compose up -d --build` dans `deploy/` (nouveau nom sur le site et dans la politique de confidentialité, invocations du Hajj dans l'onglet Audio de l'admin, `app-ads.txt`).
- **Vérifier** : installer la version depuis Google Play, ouvrir le guide du Hajj, le compteur, les horaires de prière, et vérifier qu'une bannière apparaît sur l'accueil.

## Refaire les images

1. Lancer la version web de l'app : `cd frontend && npx expo start --web --port 8094`.
2. `node play-store/scripts/capture-screens.js` (captures brutes dans `play-store/build/raw/`).
3. Télécharger les polices dans `play-store/build/fonts/` (`npm pack @fontsource/figtree @fontsource/noto-kufi-arabic`, puis décompresser chaque archive dans un dossier du même nom), puis `node play-store/scripts/compose-images.js` (images finales dans `play-store/build/out/`).
