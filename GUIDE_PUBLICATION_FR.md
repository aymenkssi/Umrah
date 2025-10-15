# 🚀 Guide Complet de Publication - Umrah Companion

## 📋 Résumé Rapide

**Coûts:**
- Compte Google Play Developer: **25$ (une fois)**
- Compte AdMob: **Gratuit**
- Build avec Expo EAS: **Gratuit** (limité) ou **29$/mois** (illimité)

**Temps estimé:**
- Configuration: 2-3 heures
- Première révision Google Play: 3-7 jours
- Activation AdMob: 24-48 heures

---

## 🎯 ÉTAPE 1: Préparation des Ressources

### Ce dont vous avez besoin:

1. **Icône de l'application (obligatoire)**
   - Format: PNG
   - Taille: 512x512 pixels
   - Fond transparent ou coloré (#2E7D32 vert islamique)

2. **Screenshots (minimum 2, recommandé 4-8)**
   - Format: PNG ou JPEG
   - Résolution: 1080x1920 (portrait) ou 1920x1080 (paysage)
   - Montrer: Page d'accueil, Guide Umrah, Miqat, Qibla

3. **Bannière promotionnelle (optionnelle mais recommandée)**
   - Taille: 1024x500 pixels
   - Utilisée dans le Play Store

4. **Textes marketing:**
   - Titre court (max 30 caractères): "Umrah Companion"
   - Description courte (max 80 caractères)
   - Description complète (max 4000 caractères)
   - En plusieurs langues (AR/EN/FR)

---

## 🔧 ÉTAPE 2: Configuration du Projet

### 2.1 Créer un compte Expo

```bash
# Sur votre machine locale
npm install -g eas-cli
eas login
# Créez un compte sur expo.dev si vous n'en avez pas
```

### 2.2 Mettre à jour app.json

```json
{
  "expo": {
    "name": "Umrah Companion",
    "slug": "umrah-companion",
    "version": "1.0.0",
    "android": {
      "package": "com.votreentreprise.umrahcompanion",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#2E7D32"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "SERA_GENERE_AUTOMATIQUEMENT"
      }
    }
  }
}
```

**Important:** Changez `com.votreentreprise.umrahcompanion` par votre propre identifiant unique.

### 2.3 Initialiser EAS

```bash
cd /app/frontend
eas build:configure
```

Cette commande va:
- Créer un fichier `eas.json`
- Vous demander de créer un projet Expo
- Générer un `projectId`

---

## 📦 ÉTAPE 3: Créer le Build Android

### Option A: Build APK (pour test)

```bash
eas build --platform android --profile preview
```

Vous pouvez installer ce fichier directement sur votre téléphone pour tester.

### Option B: Build AAB (pour Play Store)

```bash
eas build --platform android --profile production
```

**Important:** 
- Le build peut prendre 15-30 minutes
- Vous recevrez un email quand c'est prêt
- Le fichier sera disponible sur expo.dev

---

## 🏪 ÉTAPE 4: Publication sur Google Play Store

### 4.1 Créer un compte développeur

1. Allez sur [Google Play Console](https://play.google.com/console)
2. Payez 25$ (frais unique)
3. Remplissez votre profil développeur

### 4.2 Créer une nouvelle application

1. Cliquez sur "Créer une application"
2. Remplissez:
   - **Nom:** Umrah Companion - رفيق العمرة
   - **Langue par défaut:** Arabe
   - **Type:** Application
   - **Gratuit/Payant:** Gratuit

### 4.3 Remplir la fiche du Store

#### Informations principales:
- **Titre court:** Umrah Companion
- **Description courte (80 caractères):**
  ```
  Guide complet pour l'Umrah avec Miqat, prières, Qibla et instructions
  ```

- **Description complète (exemple):**
  ```
  Umrah Companion (رفيق العمرة) est votre guide complet et gratuit pour 
  effectuer l'Umrah de manière sereine.

  ✅ FONCTIONNALITÉS:
  • Guide détaillé des 6 étapes de l'Umrah avec du'a authentiques
  • Localisation du Miqat le plus proche avec GPS
  • Horaires de prière automatiques
  • Boussole Qibla en temps réel
  • Support multilingue (Arabe, Français, Anglais)
  • Fonctionne hors ligne
  
  🕋 MIQAT:
  6 points de Miqat inclus, dont Masjid Aisha pour les résidents de La Mecque
  
  📿 CONTENU AUTHENTIQUE:
  Toutes les informations sont basées sur des sources fiables. 
  Consultez toujours les érudits locaux en cas de doute.
  
  🌍 OFFLINE:
  Tous les contenus sont disponibles hors ligne sauf la navigation GPS.
  
  ❤️ GRATUIT ET SANS PUB INTRUSIVE:
  Application gratuite créée pour aider les pèlerins du monde entier.
  ```

#### Screenshots:
- Téléchargez minimum 2 screenshots (recommandé: 4-6)
- Montrez les fonctionnalités principales

#### Icône:
- Téléchargez votre icône 512x512

#### Catégorie:
- **Catégorie principale:** Voyages et infos locales
- **Tags:** Religion, Islam, Umrah, Hajj, Makkah

### 4.4 Questionnaire de contenu

Google vous posera des questions sur:
- **Classification:** Tous publics
- **Publicités:** Oui (si vous ajoutez AdMob)
- **Achats in-app:** Non
- **Politique de confidentialité:** **OBLIGATOIRE**

### 4.5 Créer une politique de confidentialité

Créez une page simple (vous pouvez utiliser GitHub Pages):

```markdown
# Politique de Confidentialité - Umrah Companion

Dernière mise à jour: [DATE]

## Collecte de données
Umrah Companion collecte uniquement:
- Votre localisation GPS (pour Miqat, prières, Qibla)
- Vos préférences locales (langue, progression)

## Utilisation des données
- Les données de localisation sont utilisées uniquement pour:
  * Trouver le Miqat le plus proche
  * Calculer les horaires de prière
  * Afficher la direction de la Qibla
- Toutes les données sont stockées localement sur votre appareil
- Aucune donnée n'est envoyée à des serveurs externes

## Publicités
L'application peut afficher des publicités Google AdMob.
AdMob peut collecter des données selon sa propre politique:
https://policies.google.com/privacy

## Contact
Email: votreemail@exemple.com

## Modifications
Nous pouvons mettre à jour cette politique. Les changements seront 
publiés sur cette page.
```

**Hébergez cette page et ajoutez l'URL dans Google Play Console.**

### 4.6 Télécharger votre AAB

1. Dans la section "Production"
2. Cliquez sur "Créer une version"
3. Téléchargez votre fichier `.aab`
4. Ajoutez les notes de version:
   ```
   Version initiale de Umrah Companion:
   - Guide complet des étapes de l'Umrah
   - Localisation Miqat avec GPS
   - Horaires de prière automatiques
   - Boussole Qibla
   - Support AR/EN/FR
   ```

### 4.7 Soumettre pour examen

1. Vérifiez toutes les sections
2. Cliquez sur "Examiner la version"
3. Cliquez sur "Démarrer le déploiement en production"

**⏱️ Délai:** 3-7 jours pour la première révision

---

## 💰 ÉTAPE 5: Intégrer Google AdMob

### 5.1 Créer un compte AdMob

1. Allez sur [admob.google.com](https://admob.google.com)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Commencer"

### 5.2 Créer votre application

1. Cliquez sur "Applications" → "Ajouter une application"
2. Sélectionnez "Android"
3. Nom: "Umrah Companion"
4. Notez votre **App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

### 5.3 Créer des blocs d'annonces

#### Banner (Recommandé pour commencer):
1. Allez dans "Blocs d'annonces"
2. Créez un nouveau bloc
3. Type: "Bannière"
4. Nom: "Banner Home"
5. Notez l'**Ad Unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

#### Interstitiel (Optionnel):
- Type: "Interstitielle"
- Nom: "Interstitial After Step"

### 5.4 Installer la bibliothèque (À FAIRE PLUS TARD)

**Note:** L'intégration AdMob nécessite un rebuild complet. 
Publiez d'abord votre app sans pub, puis ajoutez les pubs dans une mise à jour.

Pour la prochaine version:
```bash
npx expo install expo-ads-admob
```

### 5.5 Configurer app.json (Version future)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-VOTRE_VRAI_ID~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

---

## 📊 ÉTAPE 6: Stratégie de Monétisation

### Recommandations pour une app islamique:

#### Option 1: Minimal et Respectueux (RECOMMANDÉ)
- ✅ 1 banner en bas de la page d'accueil
- ✅ 1 banner en bas des settings
- ❌ PAS de pubs sur les écrans de du'a ou guide
- ❌ PAS d'interstitiels pendant les étapes d'Umrah
- **Revenus estimés:** 0.50€ - 2€ par jour avec 1000 utilisateurs actifs

#### Option 2: Donation + Pubs Légères
- ✅ Banners légers
- ✅ Bouton "Enlever les pubs" via don PayPal
- ✅ Garde l'esprit de l'app
- **Meilleure expérience utilisateur**

#### Option 3: Version Premium
- Utiliser `expo-in-app-purchases`
- Version gratuite avec pubs
- Version Premium (1.99€) sans pubs
- **Plus de travail technique**

---

## ✅ CHECKLIST FINALE

Avant de publier:

### Technique:
- [ ] App testée sur plusieurs appareils Android
- [ ] Toutes les permissions fonctionnent
- [ ] GPS fonctionne pour Miqat et Qibla
- [ ] Prières calculées correctement
- [ ] Toutes les langues fonctionnent
- [ ] Mode offline fonctionne

### Play Store:
- [ ] Compte développeur créé (25$)
- [ ] Icône 512x512 prête
- [ ] Minimum 2 screenshots
- [ ] Description en 3 langues
- [ ] Politique de confidentialité publiée
- [ ] Fichier AAB téléchargé

### Marketing:
- [ ] Description attractive
- [ ] Screenshots de qualité
- [ ] Catégorie correcte
- [ ] Tags pertinents

---

## 🆘 DÉPANNAGE COMMUN

### "Le build échoue"
- Vérifiez que `package.json` est valide
- Vérifiez que `app.json` est correct
- Essayez `eas build --clear-cache`

### "Version rejetée par Google"
- Vérifiez la politique de confidentialité
- Assurez-vous que toutes les permissions sont expliquées
- Vérifiez qu'il n'y a pas de contenu sensible

### "Les pubs ne s'affichent pas"
- Utilisez les IDs de test d'abord
- Attendez 24-48h après création du compte AdMob
- Vérifiez que l'app est en production

---

## 📈 APRÈS LA PUBLICATION

### Semaine 1:
- Surveillez les commentaires
- Répondez aux questions
- Corrigez les bugs critiques

### Mois 1:
- Ajoutez AdMob si vous le souhaitez
- Analysez les statistiques Play Console
- Préparez la première mise à jour

### Promotion:
- Partagez sur les réseaux sociaux
- Groupes Facebook de pèlerins
- Forums islamiques
- Mosquées locales

---

## 💡 CONSEILS FINAUX

1. **Commencez simple:** Publiez sans pubs d'abord
2. **Écoutez les utilisateurs:** Les commentaires sont précieux
3. **Mises à jour régulières:** Gardez l'app à jour
4. **Restez humble:** C'est une app religieuse, priorité à l'utilité
5. **Testez beaucoup:** Surtout sur différents appareils

---

## 📞 RESSOURCES UTILES

- [Documentation Expo EAS](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [AdMob Help Center](https://support.google.com/admob)
- [Générateur de Privacy Policy](https://www.freeprivacypolicy.com/)

---

**Bonne chance avec votre publication! May Allah accept your efforts! 🤲**
