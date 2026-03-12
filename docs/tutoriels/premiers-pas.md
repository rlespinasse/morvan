# Tutoriel : Premiers pas avec Morvan

Ce tutoriel vous guide à travers le flux de travail complet du projet : cloner le dépôt, télécharger les données géospatiales du Parc naturel régional du Morvan, valider leur intégrité, et inspecter les résultats.

## Ce que vous allez apprendre

- Installer les prérequis et configurer le projet
- Télécharger les 73 couches GeoJSON depuis les portails open data
- Valider l'intégrité des données téléchargées
- Explorer la structure des fichiers résultants

## Prérequis

- Git
- [mise](https://mise.jdx.dev/) installé (gestionnaire d'outils de développement)

> **Alternative sans mise** : installez manuellement Python 3 et [just](https://github.com/casey/just), puis passez directement à l'étape 2.

## Étape 1 : Cloner et configurer

Clonez le dépôt et installez les outils :

```bash
git clone https://github.com/rlespinasse/morvan.git
cd morvan
mise install
```

`mise install` installe automatiquement Python 3 et `just` selon la configuration du fichier `.mise.toml`.

## Étape 2 : Installer les dépendances Python

Créez l'environnement virtuel et installez les dépendances :

```bash
just setup
```

Cette commande crée un dossier `.venv/` et installe la bibliothèque `requests` nécessaire au téléchargement.

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

## Étape 4 : Valider les données

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

## Étape 5 : Explorer les résultats

Consultez la structure des fichiers téléchargés :

```bash
ls data/layers/
```

```text
administratif/       energie/             paysages/
demographie/         hydrographie/        patrimoine-culture/
nature-environnement/ programmes/         tourisme-economie/
```

Inspectez un fichier GeoJSON pour voir sa structure :

```bash
python3 -c "
import json
with open('data/layers/administratif/communes.geojson') as f:
    data = json.load(f)
print(f'Type: {data[\"type\"]}')
print(f'Features: {len(data[\"features\"])}')
print(f'Source: {data[\"_source\"][\"dataset_name\"]}')
print(f'Téléchargé le: {data[\"_source\"][\"fetched_at\"]}')
"
```

## Raccourci : tout-en-un

Pour exécuter les étapes 2 à 4 en une seule commande :

```bash
just all
```

## Et ensuite ?

- Consultez le [catalogue des couches](../reference/catalogue-des-donnees.md) pour voir toutes les données disponibles
- Lisez l'[explication du modèle de données](../explications/modele-de-donnees.md) pour comprendre les relations entre couches
- Suivez le guide [Ajouter une source de données](../guides/ajouter-une-source.md) pour contribuer
