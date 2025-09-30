# Guide de nettoyage des animations - Session du 2025-09-30

## Problème initial

Quand on scrollait jusqu'en bas puis qu'on remontait, les animations SVG avaient des comportements étranges :
- Des éléments restaient visibles alors qu'ils auraient dû disparaître
- Des couleurs changeaient bizarrement
- Des SVG "fantômes" apparaissaient pendant d'autres steps
- Les positions des éléments animés n'étaient pas réinitialisées

## Pourquoi ça arrivait ?

### 1. Les SVGs restaient en mémoire
**Problème :** Les conteneurs SVG étaient juste "cachés" (opacity 0) mais restaient dans le DOM.
- Tous les SVGs s'accumulaient en mémoire avec leurs IDs dupliqués
- GSAP pouvait cibler les mauvais éléments (ceux d'un ancien SVG)
- Les styles inline de GSAP persistaient

**Solution :** Maintenant, en mode "hard" (quand on sort complètement du scroll), on **détruit vraiment** le conteneur du DOM avec `removeChild()` et on réinitialise la variable à `null`.

```javascript
// AVANT
gsap.set(stepContainer, { display: "none" });

// APRÈS
if (stepContainer && stepContainer.parentNode) {
  stepContainer.parentNode.removeChild(stepContainer);
}
stepContainer = null;
```

### 2. Le mode "soft" ne nettoyait rien
**Problème :** Quand on passait rapidement d'un step à l'autre (mode "soft"), aucun nettoyage n'était fait.
- Les opacités restaient modifiées par les animations
- Les transformations GSAP (x, y, rotation, etc.) persistaient
- Les attributs SVG modifiés (cx, cy, r, d pour les paths) gardaient leurs valeurs finales

**Solution :** En mode "soft", on réinitialise maintenant **tous** les éléments à leur état initial :
- Opacités remises à 0 ou 1 selon le besoin
- Transformations GSAP nettoyées avec `clearProps`
- Attributs SVG restaurés (pour les éléments générés dynamiquement)

### 3. Les éléments générés dynamiquement n'étaient pas gérés
**Problème :** Certains steps créent des éléments SVG à la volée (cercles, clones, etc.).
- Step3 : 300 cercles générés qui migrent
- Step4 : Clones d'étoiles qui se transforment
- Step9 : Morphing de paths (attribut `d` modifié)

Ces éléments avaient des problèmes spécifiques :
- Références DOM "orphelines" (pointant vers des éléments détruits)
- Positions pas sauvegardées donc impossibles à restaurer
- Éléments pas supprimés proprement

**Solution :** Pour chaque step avec génération dynamique :

#### Step3 (300 cercles générés)
- Sauvegarde des positions originales dans `originalStarsData`
- Vérification que `generatedGroup` est bien attaché au DOM actuel
- Restauration des positions (cx, cy, r) en mode soft

#### Step4 (clones d'étoiles)
- Vérification que `animationGroup` existe et est dans le SVG actuel
- Réinitialisation des arrays avant de les remplir
- Suppression de tous les clones en mode soft
- Restauration des attributs originaux des étoiles

#### Step9 (morphing de paths)
- Sauvegarde des attributs `d` originaux dans `originalStripesD`
- Restauration des formes originales en mode soft
- Repositionnement des cercles déplacés (x=0, y=0)

#### Step10 (67 étoiles qui migrent)
- Repositionnement des 67 étoiles (x=0, y=0)
- Réinitialisation des opacités

### 4. Les animations de fade-in continuaient après avoir quitté le step
**Problème :** Steps 5 et 6 avaient des `gsap.to()` pour faire apparaître les conteneurs, mais ces animations n'étaient **pas dans la timeline**.

Résultat : Si on scrollait très vite, `tl.kill()` était appelé mais l'animation de fade-in continuait, et le SVG devenait visible pendant un autre step.

**Solution :**
- Intégrer les fade-in dans la timeline
- Ajouter `gsap.killTweensOf(container)` pour tuer **toutes** les animations sur le conteneur

```javascript
// AVANT (animation indépendante)
gsap.to(container, { opacity: 1, duration: 0.5 });
tl = gsap.timeline();

// APRÈS (animation dans la timeline)
tl = gsap.timeline();
tl.to(container, { opacity: 1, duration: 0.5 });
```

## Résumé des corrections par step

### Step 0 (écran d'accueil)
- ✅ Destruction complète du DOM en mode hard

### Step 1
- ✅ Destruction complète du DOM en mode hard

### Step 2
- ✅ Destruction complète du DOM en mode hard

### Step 3 (300 cercles générés)
- ✅ Vérification que `generatedGroup` est attaché au DOM
- ✅ Sauvegarde des positions originales des cercles
- ✅ Reset complet en mode soft : cercles repositionnés + étoiles/têtes SVG cachées

### Step 4 (clones d'étoiles + perles)
- ✅ Vérification que `animationGroup` est attaché au DOM
- ✅ Réinitialisation des arrays (stars, pearls, originalStarsData)
- ✅ Reset complet en mode soft : suppression des clones + restauration attributs SVG

### Step 5 (simple fade-in)
- ✅ Fade-in intégré à la timeline
- ✅ `killTweensOf()` pour tuer les animations indépendantes
- ✅ Destruction complète du DOM en mode hard

### Step 6 (frames + commune, 2 SVGs)
- ✅ Fade-in des 2 conteneurs intégré à la timeline
- ✅ `killTweensOf()` sur les 2 conteneurs
- ✅ Reset complet en mode soft : frame1 visible, autres frames + sol + persos cachés
- ✅ Destruction complète des 2 conteneurs en mode hard

### Step 7 (sol + 14 persos + 7 stripes)
- ✅ Reset complet en mode soft : tous les éléments à opacity 0
- ✅ Destruction complète du DOM en mode hard

### Step 8 (spirale + 10 stripes)
- ✅ Reset complet en mode soft : spirale + stripes à opacity 0
- ✅ Destruction complète du DOM en mode hard

### Step 9 (morphing + migration cercles)
- ✅ Sauvegarde des attributs `d` originaux (formes avant morphing)
- ✅ Reset complet en mode soft :
  - Restoration des formes originales des stripes
  - Coeurs cachés
  - Cercles repositionnés (x=0, y=0)
  - Éléments initiaux (lune, famille, femme) visibles
- ✅ Destruction complète du DOM en mode hard

### Step 10 (67 étoiles qui migrent)
- ✅ Reset complet en mode soft :
  - 67 étoiles repositionnées (x=0, y=0, opacity 0)
  - Lune, PleineLune, Communauté cachées
  - Sol, Famille, Coeur visibles
- ✅ Destruction complète du DOM en mode hard

## Architecture finale : 2 niveaux de cleanup

### Mode "soft" (transitions rapides entre steps)
**Quand :** Passage normal d'un step à l'autre pendant le scroll

**Ce qui est fait :**
- Fade-out rapide (0.3s)
- Reset de tous les éléments à leur état initial
- Les conteneurs restent en mémoire pour un rechargement rapide

**Avantages :** Transitions fluides, pas de rechargement de SVG

### Mode "hard" (sortie complète du scroll)
**Quand :** Scroll tout en haut (retour accueil) ou tout en bas (sortie)

**Ce qui est fait :**
- Fade-out (0.5s)
- Destruction complète du conteneur avec `removeChild()`
- Réinitialisation de toutes les variables à `null` ou `[]`

**Avantages :** Libération de la mémoire, état totalement propre

## Autres améliorations

### Cache buster pour les SVGs
Ajout d'un timestamp à chaque chargement de SVG pour forcer le navigateur à charger la version la plus récente :

```javascript
const cacheBuster = `?v=${Date.now()}`;
const response = await fetch(path + cacheBuster);
```

**Pourquoi :** Le navigateur cachait agressivement les SVGs, les modifications ne se reflétaient pas après un reload.

## Bonnes pratiques identifiées

1. **Toujours utiliser `container.querySelector()` au lieu de `document.querySelector()`**
   - Évite de cibler des éléments dans d'autres SVGs

2. **Sauvegarder les états initiaux avant de les modifier**
   - Positions (cx, cy, r)
   - Formes (attribut `d` pour les paths)
   - Couleurs, opacités, etc.

3. **Vérifier que les éléments générés dynamiquement sont toujours dans le DOM**
   - Test : `element && element.parentNode`
   - Évite les références orphelines

4. **Toujours ajouter les animations à la timeline principale**
   - Permet de les tuer toutes avec `timeline.kill()`
   - Ajouter `gsap.killTweensOf()` en sécurité supplémentaire

5. **Réinitialiser les variables de cache même en mode soft**
   - Arrays vidés avant d'être remplis
   - Évite l'accumulation de vieilles références

## Résultat final

✅ Plus d'éléments qui restent visibles après avoir quitté un step
✅ Plus de couleurs bizarres lors du scroll retour
✅ Plus de SVGs fantômes visibles pendant d'autres steps
✅ Les animations recommencent proprement à chaque fois
✅ Scroll rapide géré correctement (pas d'animations qui persistent)
✅ Mémoire libérée correctement en mode hard

Le scrollytelling fonctionne maintenant parfaitement dans les deux sens ! 🎉