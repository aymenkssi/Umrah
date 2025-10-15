# Guide de Déploiement - Umrah Companion

## 📱 Publication sur Google Play Store

### Prérequis
1. **Compte Google Play Developer** (25$ une fois)
2. **EAS CLI installé** : `npm install -g eas-cli`
3. **Compte Expo** (gratuit)

### Étapes de Publication

#### 1. Configuration EAS Build

```bash
cd /app/frontend
eas login
eas build:configure
```

#### 2. Mettre à jour app.json

Ajoutez ces configurations dans `app.json`:

```json
{
  "expo": {
    "name": "Umrah Companion",
    "slug": "umrah-companion",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.umrahcompanion",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#2E7D32"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

#### 3. Créer le Build Android (APK/AAB)

Pour un AAB (Android App Bundle - recommandé pour Play Store):
```bash
eas build --platform android --profile production
```

Pour un APK (test local):
```bash
eas build --platform android --profile preview
```

#### 4. Télécharger le fichier AAB

Une fois le build terminé, téléchargez le fichier `.aab` depuis Expo.

#### 5. Soumettre sur Google Play Console

1. Allez sur [Google Play Console](https://play.google.com/console)
2. Créez une nouvelle application
3. Remplissez les informations:
   - Nom: Umrah Companion - رفيق العمرة
   - Catégorie: Voyages et infos locales
   - Description courte et longue
   - Screenshots (minimum 2)
   - Icône haute résolution (512x512)
4. Téléchargez votre fichier `.aab`
5. Remplissez le questionnaire de contenu
6. Soumettez pour examen

### Configuration EAS (eas.json)

Créez un fichier `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 💰 Intégration Google AdMob

### Étape 1: Créer un compte AdMob

1. Allez sur [AdMob](https://admob.google.com)
2. Créez un compte
3. Créez une application
4. Notez votre **App ID**

### Étape 2: Installation des dépendances

```bash
cd /app/frontend
yarn add expo-ads-admob
```

### Étape 3: Configuration dans app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

### Étape 4: Types de publicité recommandés

**1. Banner Ads** (En bas des écrans)
- Moins intrusif
- Revenus modérés
- Bon pour l'expérience utilisateur

**2. Interstitial Ads** (Plein écran entre les écrans)
- Plus de revenus
- Afficher entre les transitions (ex: après avoir complété une étape)

**3. Rewarded Ads** (Publicité récompensée)
- Meilleure expérience utilisateur
- L'utilisateur choisit de regarder

### Étape 5: Code d'implémentation

Créez un composant pour les bannières:

```typescript
// components/AdBanner.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';

const TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111'; // ID de test Google

export const AdBanner = () => {
  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={__DEV__ ? TEST_AD_UNIT_ID : 'VOTRE_VRAI_ID'}
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error) => console.log(error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
```

Pour les publicités interstitielles:

```typescript
// utils/ads.ts
import { AdMobInterstitial } from 'expo-ads-admob';

const INTERSTITIAL_ID = __DEV__ 
  ? 'ca-app-pub-3940256099942544/1033173712' // Test
  : 'VOTRE_VRAI_ID';

export const initializeAds = async () => {
  await AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);
  await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
};

export const showInterstitialAd = async () => {
  try {
    await AdMobInterstitial.showAdAsync();
    // Recharger pour la prochaine fois
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
  } catch (error) {
    console.log('Ad not ready or error:', error);
  }
};
```

### Étape 6: Placement stratégique des publicités

**Recommandations pour votre app:**

1. **Home Screen**: Banner en bas
2. **Après complétion d'une étape**: Interstitiel (pas à chaque fois)
3. **Settings Screen**: Banner en bas
4. **Entre navigation importante**: Interstitiel occasionnel

**Éviter:**
- Trop de publicités (mauvaise expérience utilisateur)
- Publicités pendant la prière ou lecture de du'a
- Interrompre l'utilisateur pendant les actions importantes

---

## 🎯 Stratégie de Monétisation Recommandée

### Option 1: Publicités uniquement (Gratuit)
- Banner ads en bas des écrans non-critiques
- Interstitiel après 3-4 actions
- Garde l'app gratuite

### Option 2: Freemium
- Version gratuite avec publicités
- Version premium (1.99€) sans publicités
- Utiliser `expo-in-app-purchases`

### Option 3: Mixte (Recommandé)
- App gratuite avec banners légers
- Option "Support the app" (don) pour enlever les pubs
- Garde l'esprit islamique de l'app

---

## 📋 Checklist avant Publication

- [ ] Tester l'app sur plusieurs appareils
- [ ] Vérifier toutes les permissions
- [ ] Préparer screenshots (minimum 2)
- [ ] Icône haute résolution (512x512)
- [ ] Description en plusieurs langues
- [ ] Politique de confidentialité (obligatoire)
- [ ] Tester les publicités avec IDs de test
- [ ] Remplacer par vrais IDs AdMob avant production
- [ ] Vérifier que toutes les fonctionnalités marchent
- [ ] Tester sur Android 5.0+ (API 21+)

---

## 🔑 IDs de Test AdMob

Pour le développement, utilisez ces IDs:
- **Banner**: ca-app-pub-3940256099942544/6300978111
- **Interstitial**: ca-app-pub-3940256099942544/1033173712
- **Rewarded**: ca-app-pub-3940256099942544/5224354917

---

## 📞 Support

Si vous avez des questions:
1. [Documentation Expo EAS Build](https://docs.expo.dev/build/introduction/)
2. [Documentation AdMob](https://docs.expo.dev/versions/latest/sdk/admob/)
3. [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## ⚠️ Notes Importantes

1. **Première publication**: Peut prendre 3-7 jours pour révision
2. **Mises à jour**: Généralement 1-2 jours
3. **Publicités**: Attendre 24-48h après activation AdMob
4. **Revenus**: Variables selon trafic et engagement
5. **Respect des guidelines**: Google Play et AdMob policies
