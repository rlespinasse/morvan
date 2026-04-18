# Explication : Le pipeline en deux étapes

Le projet maintient deux copies parallèles des données : `data/layers/` (données brutes) et `site/public/data/layers/` (données reprojetées pour le site). Ce document explique pourquoi cette duplication est un choix délibéré plutôt qu'un accident.

## Deux stades, deux publics

### `data/layers/` — la fidélité aux sources

Les fichiers dans `data/layers/` sont une copie quasi-identique des GeoJSON téléchargés depuis data.gouv.fr et ternum-bfc.fr. Les seules modifications sont :

- L'injection du bloc `_source` (traçabilité)
- Rien d'autre — pas de reprojection, pas de simplification, pas de filtrage

Ce stade sert :

- **La vérification** : confronter les données stockées à la source originale
- **L'archivage** : conserver un instantané exact des données telles qu'elles étaient à la date de `fetched_at`
- **La manipulation SIG** : les outils comme QGIS consomment naturellement ces fichiers en Lambert 93

### `site/public/data/layers/` — l'adaptation au navigateur

Les fichiers servis au front sont reprojetés, arrondis, et nettoyés. Cette couche sert :

- **L'affichage sur carte** : Leaflet attend du WGS84
- **La performance** : coordonnées arrondies à 6 décimales (≈ 10 cm), fichiers plus petits
- **La conformité** : suppression de la propriété `crs` que RFC 7946 interdit

## Pourquoi séparer plutôt que transformer à la volée

On pourrait imaginer deux alternatives. Chacune a été écartée.

### Alternative 1 : reprojection côté navigateur

Charger les fichiers Lambert 93 tels quels et reprojeter en JavaScript.

- ✗ Coût CPU à chaque chargement de page
- ✗ Dépendance à `proj4js` dans le bundle
- ✗ Les 73 couches sollicitent le CPU du client à chaque session
- ✓ Évite une copie disque

Écarté : le travail effectué une fois côté pipeline remplace le travail répété par chaque visiteur.

### Alternative 2 : reprojection à la volée, en commitant uniquement la version WGS84

Ne garder que `site/public/data/layers/` et supprimer `data/layers/`.

- ✗ Perte de la fidélité aux sources (l'original est irrécupérable après reprojection)
- ✗ Impossible de changer l'arrondi, le format, ou le système cible sans re-fetch
- ✗ Un bug de reprojection contaminerait les données archivées
- ✓ Une seule copie disque

Écarté : la séparation brut / dérivé est un principe de pipeline sain. Le dérivé se régénère ; le brut est la source de vérité.

## Cycle de vie complet

```text
┌──────────────┐   fetch     ┌──────────────────┐
│  Portails    │ ───────────▶│  data/layers/    │  ← source de vérité
│  open data   │             │  (Lambert 93)    │    committée (LFS pour les gros)
└──────────────┘             └─────────┬────────┘
                                       │
                                       │ reproject
                                       ▼
                             ┌──────────────────────────┐
                             │  site/public/data/layers/ │  ← artefact dérivé
                             │  (WGS84)                  │    gitignored
                             └─────────┬─────────────────┘
                                       │
                                       │ generate-config / generate-links
                                       ▼
                          ┌──────────────────────────────────┐
                          │  site/src/generated-config.js    │
                          │  site/public/data/reverse-links  │
                          └──────────────────────────────────┘
                                       │
                                       │ vite build
                                       ▼
                                ┌──────────────┐
                                │  site/dist/  │  ← publié sur Pages
                                └──────────────┘
```

## Conséquences pratiques

- Un contributeur qui modifie `data/sources.json` doit relancer `just fetch` puis `just prepare`. Une modification de `reproject.py` ne nécessite que `just prepare`.
- `site/public/data/` est dans `.gitignore` — régénéré, jamais commité.
- Le workflow GitHub Actions reprojette à chaque déploiement : le runner CI recrée `site/public/data/` depuis `data/layers/` à partir de zéro.
- En cas de doute sur une coordonnée affichée, remonter à `data/layers/` (brut) permet de distinguer un bug de reprojection d'un bug amont.

## Voir aussi

- [Recettes justfile](../reference/recettes-justfile.md) — `reproject`, `prepare`
- [Configuration du site](../reference/site-config.md) — artefacts consommés par le front
- [Modèle de données](modele-de-donnees.md) — structure des couches brutes
