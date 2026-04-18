# Référence : Recettes justfile

Le fichier `justfile` à la racine du projet définit les commandes de build disponibles via [just](https://github.com/casey/just). Les recettes sont organisées en quatre groupes : `setup`, `data`, `site`, `quality`.

## Lister les recettes

```bash
just
```

Affiche toutes les recettes disponibles, regroupées par catégorie (comportement par défaut).

## Groupe `setup`

### `install`

Installe les dépendances Python dans le venv (créé automatiquement par mise).

```bash
just install
```

**Actions** : `uv pip install -r requirements.txt`.

**Prérequis** : `mise install` doit avoir été exécuté au préalable pour provisionner Python, `uv` et activer le venv `.venv/`.

**Idempotent** : peut être relancé sans risque.

---

### `site-setup`

Installe les dépendances npm du site.

```bash
just site-setup
```

**Actions** : `cd site && npm install`.

**Prérequis** : Node.js (fourni par `mise install`).

---

## Groupe `data`

### `fetch`

Télécharge toutes les couches GeoJSON définies dans `data/sources.json`.

```bash
just fetch
```

**Actions** :

1. Lit les définitions de couches depuis `data/sources.json`
2. Télécharge chaque fichier GeoJSON depuis son `resource_url`
3. Injecte les métadonnées `_source` dans chaque fichier
4. Sauvegarde dans `data/layers/<catégorie>/<nom>.geojson`

**Paramètres du script** :

- Timeout : 60 secondes par requête
- Délai entre requêtes : 0,5 seconde (rate limiting)
- Tentatives max : 3 (avec backoff exponentiel)

**Prérequis** : `just install` doit avoir été exécuté.

**Code de sortie** : `1` si au moins un téléchargement échoue après les 3 tentatives.

---

### `lfs-pull`

Récupère les fichiers suivis par Git LFS (les 3 couches forestières).

```bash
just lfs-pull
```

**Actions** : `git lfs pull`.

**Prérequis** : Git LFS installé localement.

---

### `reproject`

Reprojette tous les GeoJSON de `data/layers/` vers `site/public/data/layers/` en WGS84.

```bash
just reproject
```

**Actions** :

1. Parcourt `data/layers/**/*.geojson`
2. Transforme chaque géométrie de EPSG:2154 (Lambert 93) vers EPSG:4326 (WGS84)
3. Arrondit les coordonnées à 6 décimales
4. Supprime les propriétés `crs` (interdites par RFC 7946)
5. Écrit le résultat dans `site/public/data/layers/<catégorie>/<nom>.geojson`

**Prérequis** : `just fetch` + `just lfs-pull` doivent avoir été exécutés.

---

### `generate-config`

Génère `site/src/generated-config.js` à partir de `sources.json`.

```bash
just generate-config
```

**Actions** :

1. Parcourt les couches de `sources.json`
2. Détecte le type géométrique en lisant les premiers features reprojetés
3. Assigne une couleur distincte à chaque couche selon sa catégorie
4. Génère les exports `layerGroups`, `styles`, `geometryTypes`

**Prérequis** : `just reproject` doit avoir été exécuté (nécessaire pour la détection de type géométrique).

---

### `generate-links`

Calcule les liens spatiaux bidirectionnels entre features et produit `site/public/data/reverse-links.json`.

```bash
just generate-links
```

**Actions** :

1. Charge les couches conteneurs (départements, EPCI, communes, entités paysagères, Natura 2000)
2. Pour chaque feature des autres couches, identifie les conteneurs qui la contiennent (test spatial au centroïde)
3. Produit les liens dans les deux sens (feature ↔ conteneur)
4. Tronque à 50 liens par paire couche-conteneur

**Prérequis** : `just reproject` doit avoir été exécuté.

---

### `prepare`

Enchaîne `lfs-pull` + `reproject` + `generate-config` + `generate-links`.

```bash
just prepare
```

Utilisé comme étape préparatoire de `site-dev` et `site-build`.

---

### `all`

Exécute le pipeline complet côté données : `install` + `fetch` + `validate`.

```bash
just all
```

S'arrête à la première étape en erreur.

---

## Groupe `site`

### `site-dev`

Lance le serveur de développement Vite.

```bash
just site-dev
```

**Actions** :

1. Exécute `just prepare` (LFS + reproject + configs)
2. Démarre `npm run dev` dans `site/`

Le site devient accessible sur <http://localhost:5173>.

**Prérequis** : `just site-setup`.

---

### `site-build`

Construit le site pour la production.

```bash
just site-build
```

**Actions** :

1. Exécute `just prepare`
2. Démarre `npm run build` dans `site/`

La sortie est écrite dans `site/dist/`.

**Prérequis** : `just site-setup`.

---

### `favicons`

Régénère l'ensemble des icônes à partir des SVG sources.

```bash
just favicons
```

**Actions** : utilise ImageMagick (`magick`) pour produire depuis `site/public/favicon.svg` et `favicon-maskable.svg` :

- `favicon-16x16.png`, `favicon-32x32.png`
- `icon-192.png`, `icon-512.png` (maskable)
- `apple-touch-icon.png` (180×180)
- `favicon.ico` (multi-tailles 16/32)

**Prérequis** : [ImageMagick](https://imagemagick.org/) installé (`brew install imagemagick`).

---

## Groupe `quality`

### `validate`

Valide l'intégrité des données téléchargées.

```bash
just validate
```

**Vérifications** :

1. Chaque couche de `sources.json` a un fichier correspondant dans `data/layers/`
2. Chaque fichier est du GeoJSON valide (type `FeatureCollection`, `Feature` ou `GeometryCollection`)
3. Le bloc `_source` est présent dans chaque fichier
4. Chaque référence dans `links.json` pointe vers une couche existante
5. Aucun fichier orphelin dans `data/layers/`

**Code de sortie** : `1` si des erreurs sont détectées. Les avertissements (features vides) n'affectent pas le code de sortie.

---

### `check`

Vérifie la présence des artefacts attendus côté données brutes et côté site.

```bash
just check
```

**Vérifications** :

1. Nombre de fichiers dans `data/layers/` vs nombre de couches dans `sources.json`
2. Présence de `data/links.json`
3. Présence de `site/src/generated-config.js`
4. Présence d'au moins un GeoJSON dans `site/public/data/`

**Différence avec `validate`** : `check` est un contrôle d'existence rapide (listing). `validate` est un contrôle structurel approfondi (parsing).

**Code de sortie** : `1` si au moins un artefact est manquant.

---

### `lint-md`

Vérifie le style des fichiers Markdown avec [markdownlint](https://github.com/DavidAnson/markdownlint).

```bash
just lint-md
```

**Prérequis** : `markdownlint-cli` disponible dans le `PATH` (installé via `mise install`).

**Code de sortie** : `1` si des erreurs de style sont détectées.

---

## Voir aussi

- [Tutoriel : Premiers pas](../tutoriels/premiers-pas.md)
- [Guide : Lancer le site localement](../guides/lancer-site-localement.md)
- [Guide : Mettre à jour les données](../guides/mettre-a-jour-les-donnees.md)
- [Explication : Le pipeline en deux étapes](../explications/pipeline-deux-etapes.md)
