# Guide : Lancer le site localement

Ce guide explique comment démarrer l'atlas web du Morvan sur votre machine pour le développement ou l'inspection.

## Prérequis

- Dépôt cloné et outils installés via `mise install`
- Dépendances Python installées (`just install`)
- Données téléchargées (`just fetch`) et LFS récupéré (`just lfs-pull`)

## Étapes

### 1. Installer les dépendances npm

Une seule fois, après clonage :

```bash
just site-setup
```

Cette recette exécute `npm install` dans `site/` et installe notamment [Leaflet](https://leafletjs.com/), [leaflet-atlas](https://www.npmjs.com/package/leaflet-atlas) et [Vite](https://vitejs.dev/).

### 2. Lancer le serveur de développement

```bash
just site-dev
```

La recette enchaîne automatiquement :

1. `lfs-pull` — récupère les fichiers LFS manquants
2. `reproject` — reprojette les couches de `data/layers/` vers `site/public/data/layers/` en WGS84
3. `generate-config` — produit `site/src/generated-config.js`
4. `generate-links` — calcule `site/public/data/reverse-links.json`
5. Démarre Vite sur <http://localhost:5173>

Le serveur recharge automatiquement l'onglet à chaque modification de `site/src/`.

### 3. Construire pour la production

Pour tester le bundle final :

```bash
just site-build
```

Le résultat est écrit dans `site/dist/`. Servez-le avec un serveur HTTP statique, par exemple :

```bash
cd site && npm run preview
```

## Dépannage

### La carte est vide ou des couches manquent

Vérifiez que `site/public/data/layers/` contient bien des fichiers GeoJSON :

```bash
just check
```

Si des fichiers manquent, relancez `just prepare`.

### « Cannot find module 'leaflet-atlas' »

Les dépendances npm n'ont pas été installées. Exécutez `just site-setup`.

### Les couches forestières n'apparaissent pas

Les couches `forets-anciennes`, `forets-recentes` et `forets-deboisees` sont stockées via Git LFS. Si `git lfs pull` n'a jamais été exécuté, les fichiers ne contiennent que des pointeurs LFS. Lancez :

```bash
just lfs-pull
just reproject
```

### Erreur « ECONNREFUSED » au démarrage de Vite

Un autre service occupe peut-être le port 5173. Changez de port via :

```bash
cd site && npm run dev -- --port 5174
```

## Voir aussi

- [Recettes justfile](../reference/recettes-justfile.md) — détails sur `site-dev` et `site-build`
- [Configuration du site](../reference/site-config.md) — schéma de `generated-config.js`
- [Le pipeline en deux étapes](../explications/pipeline-deux-etapes.md) — pourquoi une étape de reprojection
