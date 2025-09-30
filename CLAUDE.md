# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Vue d'ensemble du projet

Application web de scrollytelling construite avec D3.js, GSAP et Scrollama. Elle présente un récit animé sur les femmes, les filles et les personnes bispirituelles autochtones à travers des animations SVG déclenchées par le défilement. Le projet raconte une histoire en 10 étapes, chacune avec des visuels SVG uniques et des animations GSAP synchronisées à la position de défilement.

## Architecture

### Composants principaux

**Script principal (`script.js`)**
- Point d'entrée qui coordonne toutes les interactions de défilement
- Gère l'état : `currentStepIndex`, `isTransitioning`, `welcomeDismissed`
- Utilise Scrollama avec offset de 0.5 (déclenchement au centre du viewport)
- Implémente le pattern step controller : tableau de paires de fonctions `{show, hide}` pour chaque étape
- **Critique** : Une seule étape doit être `in_progress` à la fois pour éviter les conflits GSAP
- Inclut un mode cleanup soft pour transitions rapides et cleanup complet pour réinitialisations
- Raccourcis debug : Ctrl+D (afficher l'état), Ctrl+Shift+R (réinitialisation forcée)

**Modules d'étapes (`steps/step*.js`)**
- Chaque étape est un module ES6 autonome exportant `showStep*` et `hideStep*`
- Pattern : Charger le SVG une fois, mettre en cache le conteneur, gérer le cycle de vie de la timeline GSAP
- `hideStep*` accepte le paramètre `{soft}` : `true` pour fade-out rapide, `false` pour cleanup complet
- Chaque module suit son propre état actif pour éviter les animations en double
- **Important** : Toujours tuer les timelines existantes avant d'en créer de nouvelles
- Les éléments SVG sont sélectionnés par ID et animés avec GSAP (opacity, transforms, morph, etc.)

**Utilitaires (`utils.js`)**
- `loadSVG(path, containerId, parentId, visibleId)` : Charge et injecte un SVG dans le DOM
- Crée des conteneurs avec positionnement absolu, opacity 0, z-index 1500
- Paramètre optionnel `visibleId` pour n'afficher que certains éléments SVG par ID
- `showElement(id)` / `hideElement(id)` : Basculement simple de l'opacité

### Structure des fichiers

```
/
├── index.html          # HTML principal avec 10 divs step (data-step="1" à "10")
├── script.js           # Logique d'orchestration principale
├── style.css           # Styles pour les steps et overlays de texte
├── utils.js            # Utilitaires de chargement SVG
├── steps/              # Modules d'animation (step0.js à step10.js)
└── svg/                # Assets SVG pour chaque étape
```

### Architecture d'animation

**Flux de transition** :
1. `handleStepEnter` détecte le scroll vers une nouvelle étape
2. `transitionToStep` gère la séquence :
   - Cleanup soft de l'étape actuelle (cacher texte, fade SVG)
   - Délai de 100ms pour éviter les conflits GSAP
   - Activer la nouvelle étape (charger/afficher SVG, déclencher animations, afficher texte)
3. Les modules d'étapes gèrent leurs propres timelines GSAP de façon indépendante

**Gestion d'état** :
- `currentStepIndex` : Étape actuellement active (-1 = aucune)
- `isTransitioning` : Verrou mutex pour éviter les transitions qui se chevauchent
- `welcomeDismissed` : Suit si l'écran d'accueil initial (step0) a été caché

**Comportements spéciaux** :
- Scroll vers le haut jusqu'au début affiche step0 (écran d'accueil)
- Scroll vers le bas après la dernière étape nettoie toutes les animations
- Step0 peut être réaffiché lors du retour en haut

## Développement

### Lancer le projet

Site web statique sans processus de build. Servir avec n'importe quel serveur HTTP :

```bash
# Python 3
python -m http.server 8000

# PHP
php -S localhost:8000

# Node.js (si http-server installé)
npx http-server -p 8000
```

Accès sur `http://localhost:8000`

### Dépendances (chargées via CDN)

- D3.js v7
- GSAP 3.12.5 (avec MotionPathPlugin, MorphSVGPlugin)
- Scrollama
- Flubber (interpolation de morphing)

Toutes chargées via CDN dans `index.html` - pas de package.json ni d'outils de build.

### Ajouter une nouvelle étape

1. Créer `steps/stepN.js` en suivant le pattern existant :
   ```javascript
   import { loadSVG } from "../utils.js";

   let stepNContainer = null;
   let stepNTimeline = null;
   let isStepNActive = false;

   export async function showStepN() {
     if (isStepNActive) return;
     if (stepNTimeline) stepNTimeline.kill();

     // Charger SVG, configurer animations
     isStepNActive = true;
   }

   export function hideStepN({ soft = false } = {}) {
     isStepNActive = false;
     if (stepNTimeline) stepNTimeline.kill();
     // Nettoyer en mode soft ou complet
   }
   ```

2. Ajouter le fichier SVG correspondant dans `svg/stepN_*.svg`

3. Importer et enregistrer dans `script.js` :
   - Ajouter l'import en haut
   - Ajouter l'objet `{show, hide}` au tableau `stepControllers`

4. Ajouter une div step dans `index.html` avec l'attribut `data-step="N"`

### Pièges courants

- **Conflits GSAP** : Toujours tuer les timelines avant d'en créer de nouvelles. Utiliser un délai de 100ms entre transitions.
- **Chargement SVG** : Les éléments SVG doivent avoir des IDs uniques pour être sélectionnables. Vérifier la console du navigateur pour les éléments manquants.
- **Offset Scrollama** : Actuellement à 0.5 (déclenche au centre du viewport). Ajuster dans `initScrollama()` si nécessaire.
- **Couches z-index** : Les conteneurs step utilisent z-index 1500, s'assurer que les nouveaux éléments n'entrent pas en conflit.
- **Fuites d'état** : Toujours réinitialiser les flags `isStepNActive` dans les fonctions hide pour permettre la ré-entrée.

### Débogage

- Activer le mode debug Scrollama : Mettre `debug: true` dans `scroller.setup()`
- La console du navigateur affiche toutes les transitions avec emojis (✅ show, 👋 hide, 🔄 transition)
- Utiliser Ctrl+D pour afficher l'état actuel
- Utiliser Ctrl+Shift+R pour forcer une réinitialisation complète