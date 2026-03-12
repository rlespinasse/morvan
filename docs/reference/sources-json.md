# Référence : sources.json

Le fichier `data/sources.json` est le registre central de toutes les couches de données du projet. Il définit chaque couche GeoJSON à télécharger.

## Structure générale

```json
{
  "layers": {
    "<catégorie>/<nom-couche>": {
      "name": "...",
      "dataset_id": "...",
      "resource_id": "...",
      "dataset_url": "...",
      "resource_url": "...",
      "format": "geojson",
      "category": "..."
    }
  }
}
```

## Champs d'une couche

| Champ | Type | Obligatoire | Description |
|-------|------|:-----------:|-------------|
| `name` | string | oui | Nom lisible de la couche en français |
| `dataset_id` | string | oui | Identifiant du jeu de données sur data.gouv.fr |
| `resource_id` | string | oui | Identifiant UUID de la ressource |
| `dataset_url` | string | oui | URL de la page du jeu de données sur data.gouv.fr |
| `resource_url` | string | oui | URL de téléchargement direct du fichier GeoJSON |
| `format` | string | oui | Format du fichier, toujours `"geojson"` |
| `category` | string | oui | Catégorie thématique (doit correspondre au préfixe de la clé) |

## Clé de couche

La clé de chaque couche suit le format `<catégorie>/<nom-couche>` :

- `<catégorie>` : une des 9 catégories thématiques (ex. `administratif`, `hydrographie`)
- `<nom-couche>` : identifiant court en kebab-case (ex. `communes`, `ct-aron-bassin`)

La clé détermine le chemin de stockage du fichier téléchargé :

```text
data/layers/<catégorie>/<nom-couche>.geojson
```

**Exemple** : la clé `hydrographie/ct-aron-bassin` produit le fichier `data/layers/hydrographie/ct-aron-bassin.geojson`.

## Catégories valides

| Catégorie | Couches |
|-----------|:-------:|
| `administratif` | 5 |
| `nature-environnement` | 9 |
| `hydrographie` | 13 |
| `paysages` | 11 |
| `patrimoine-culture` | 7 |
| `tourisme-economie` | 11 |
| `programmes` | 5 |
| `demographie` | 5 |
| `energie` | 7 |

## Métadonnées `_source`

Lors du téléchargement, le script `fetch_all.py` injecte un bloc `_source` à la racine de chaque fichier GeoJSON :

```json
{
  "type": "FeatureCollection",
  "features": [...],
  "_source": {
    "dataset_id": "600066a9f10b2dab055d2022",
    "dataset_name": "Départements du Parc naturel régional du Morvan",
    "resource_id": "8f2852b4-76c7-40ae-b75b-9841a6cfee31",
    "dataset_url": "https://www.data.gouv.fr/datasets/...",
    "layer": "administratif/departements",
    "fetched_at": "2025-01-15T10:30:00+00:00"
  }
}
```

Ce bloc permet de tracer l'origine de chaque fichier et la date de téléchargement.

## Validation

Le script `validate.py` vérifie que :

- Chaque couche de `sources.json` a un fichier correspondant sur le disque
- Chaque fichier est du GeoJSON valide (type `FeatureCollection`)
- Le bloc `_source` est présent
- Aucun fichier orphelin n'existe dans `data/layers/`

## Voir aussi

- [Ajouter une source de données](../guides/ajouter-une-source.md)
- [Catalogue des couches](catalogue-des-donnees.md)
- [Modèle de données](../explications/modele-de-donnees.md)
