# Référence : Recettes justfile

Le fichier `justfile` à la racine du projet définit les commandes de build disponibles via [just](https://github.com/casey/just).

## Lister les recettes

```bash
just
```

Affiche toutes les recettes disponibles (comportement par défaut).

## Recettes

### `setup`

Crée l'environnement virtuel Python et installe les dépendances.

```bash
just setup
```

**Actions** :

1. Crée un dossier `.venv/` via `python3 -m venv`
2. Installe les paquets listés dans `requirements.txt` (actuellement : `requests`)

**Prérequis** : Python 3 disponible dans le `PATH`.

**Idempotent** : peut être relancé sans risque. Réinstalle les dépendances dans le venv existant.

---

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

**Prérequis** : `just setup` doit avoir été exécuté au préalable.

**Code de sortie** : `1` si au moins un téléchargement échoue après les 3 tentatives.

---

### `validate`

Valide l'intégrité des données téléchargées.

```bash
just validate
```

**Vérifications** :

1. Chaque couche de `sources.json` a un fichier correspondant sur le disque
2. Chaque fichier est du GeoJSON valide (type `FeatureCollection`, `Feature` ou `GeometryCollection`)
3. Le bloc `_source` est présent dans chaque fichier
4. Chaque référence dans `links.json` pointe vers une couche existante de `sources.json`
5. Aucun fichier orphelin dans `data/layers/`

**Code de sortie** : `1` si des erreurs sont détectées. Les avertissements (ex. features vides) n'affectent pas le code de sortie.

**Prérequis** : `just fetch` doit avoir été exécuté au préalable.

---

### `lint-md`

Vérifie le style des fichiers Markdown avec [markdownlint](https://github.com/DavidAnson/markdownlint).

```bash
just lint-md
```

**Actions** :

1. Exécute `markdownlint` sur tous les fichiers `*.md` du projet

**Prérequis** : `markdownlint-cli` disponible dans le `PATH` (installé via `mise install`).

**Code de sortie** : `1` si des erreurs de style sont détectées.

---

### `all`

Exécute le pipeline complet : setup → fetch → validate.

```bash
just all
```

Équivalent à :

```bash
just setup && just fetch && just validate
```

S'arrête à la première étape en erreur.

## Voir aussi

- [Tutoriel : Premiers pas](../tutoriels/premiers-pas.md)
- [Guide : Mettre à jour les données](../guides/mettre-a-jour-les-donnees.md)
