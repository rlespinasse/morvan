# Tutoriel : Premiers pas avec Morvan

Ce tutoriel vous guide à travers le flux de travail complet : cloner le dépôt, télécharger les 73 couches géospatiales du Parc naturel régional du Morvan, les valider, puis lancer l'atlas web pour visualiser les couches sur une carte interactive.

## Ce que vous allez apprendre

- Installer les prérequis et configurer le projet
- Télécharger les 73 couches GeoJSON depuis les portails open data
- Valider l'intégrité des données téléchargées
- Préparer les données pour le site (reprojection, configuration)
- Lancer l'atlas web et explorer les couches sur la carte

## Prérequis

- Git et [Git LFS](https://git-lfs.com/) (pour les 3 couches forestières volumineuses)
- [mise](https://mise.jdx.dev/) installé (gestionnaire d'outils de développement)

> **Alternative sans mise** : installez manuellement Python 3, Node 22, [just](https://github.com/casey/just) et [uv](https://docs.astral.sh/uv/), puis créez le venv vous-même avec `python3 -m venv .venv`.

## Étape 1 : Cloner et configurer

Clonez le dépôt et installez les outils :

```bash
git clone https://github.com/rlespinasse/morvan.git
cd morvan
mise install
```

`mise install` provisionne Python 3, Node 22, `just`, `uv` et `markdownlint-cli` selon la configuration de `.mise.toml`. Un environnement virtuel Python `.venv/` est également créé automatiquement.

## Étape 2 : Installer les dépendances Python

```bash
just install
```

Cette recette installe les paquets listés dans `requirements.txt` (`requests`, `pyproj`, `shapely`) dans le venv `.venv/`.

## Étape 3 : Télécharger les données

Lancez le téléchargement de toutes les couches :

```bash
just fetch
```

Le script `fetch_all.py` :

1. Lit les 73 définitions de couches depuis `data/sources.json`
2. Télécharge chaque fichier GeoJSON depuis son URL source
3. Injecte les métadonnées `_source` (identifiant, date, provenance)
4. Sauvegarde les fichiers dans `data/layers/<catégorie>/`

Vous verrez la progression s'afficher :

```text
Fetching 73 layers...
  [1/73] administratif/departements
  [2/73] administratif/communes
  ...
Done: 73/73 layers downloaded successfully.
```

> **Note** : le téléchargement prend quelques minutes. Le script attend 0,5 seconde entre chaque requête pour respecter les serveurs. En cas d'erreur réseau, il réessaie automatiquement jusqu'à 3 fois.

## Étape 4 : Récupérer les fichiers LFS

Trois couches forestières (forêts anciennes, récentes, déboisées) sont stockées via Git LFS car trop volumineuses pour le dépôt Git classique :

```bash
just lfs-pull
```

## Étape 5 : Valider les données

Vérifiez l'intégrité des données téléchargées :

```bash
just validate
```

Le script `validate.py` vérifie :

- Que chaque couche définie dans `sources.json` a bien un fichier sur le disque
- Que chaque fichier est du GeoJSON valide (type `FeatureCollection`)
- Que les métadonnées `_source` sont présentes
- Que les références de `links.json` pointent vers des couches existantes
- Qu'aucun fichier orphelin ne traîne dans `data/layers/`

Si tout est correct :

```text
Validating 73 layers...
Validating links.json...
Checking for orphan files...

==================================================
Checked: 73/73 layers
Errors: 0
Warnings: 0
All validations passed!
```

## Étape 6 : Préparer les données pour le site

Les données brutes sont en projection Lambert 93 (EPSG:2154). Le navigateur a besoin de WGS84 (EPSG:4326). La recette `prepare` regroupe toutes les transformations :

```bash
just prepare
```

Elle enchaîne :

1. `lfs-pull` — s'assure que les fichiers LFS sont présents
2. `reproject` — reprojette vers `site/public/data/layers/`
3. `generate-config` — génère `site/src/generated-config.js` (groupes, styles, types géométriques)
4. `generate-links` — calcule les liens spatiaux bidirectionnels entre features

## Étape 7 : Installer et lancer le site

Installez les dépendances npm (une seule fois) :

```bash
just site-setup
```

Puis lancez le serveur de développement :

```bash
just site-dev
```

Ouvrez <http://localhost:5173> dans votre navigateur. Vous voyez l'atlas interactif du Morvan avec :

- Un sélecteur de couches regroupé par catégorie (à droite)
- Le périmètre du PNR affiché par défaut
- Au clic sur une feature, un panneau détaillant les attributs et les relations avec les autres couches

Remarquez que chaque catégorie a sa propre palette de couleurs (verts pour la nature, bleus pour l'hydrographie, etc.), et que les points de patrimoine s'affichent comme des cercles alors que les itinérances apparaissent en lignes.

## Raccourci : tout-en-un

Pour exécuter les étapes 2 à 5 (côté données) en une seule commande :

```bash
just all
```

Puis les étapes 6 à 7 (côté site) :

```bash
just site-setup
just site-dev
```

## Ce que vous avez construit

Vous disposez d'un atlas web local qui agrège 73 couches géospatiales du Morvan, avec sélection par catégorie, styles distincts par couche, et navigation croisée entre features via les liens spatiaux calculés.

## Et ensuite ?

- Consultez le [catalogue des couches](../reference/catalogue-des-donnees.md) pour voir toutes les données disponibles
- Lisez [le pipeline en deux étapes](../explications/pipeline-deux-etapes.md) pour comprendre pourquoi `data/layers/` et `site/public/data/` coexistent
- Suivez [Mettre à jour les données](../guides/mettre-a-jour-les-donnees.md) pour rafraîchir les couches
- Suivez [Ajouter une source de données](../guides/ajouter-une-source.md) pour contribuer
- Déployez votre propre instance avec [Déployer le site](../guides/deployer-le-site.md)
