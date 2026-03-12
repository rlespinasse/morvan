# Explication : Le modèle de données

Ce document explique comment les concepts clés du projet s'articulent : couches, catégories, liens et métadonnées.

## Vue d'ensemble

Le projet Morvan agrège des données géospatiales ouvertes sur le territoire du Parc naturel régional du Morvan. Le modèle repose sur trois piliers :

1. **Les couches** (`sources.json`) — les jeux de données GeoJSON individuels
2. **Les liens** (`links.json`) — les relations spatiales et thématiques entre couches
3. **Les catégories** — le classement thématique des couches

```text
sources.json ──définit──▶ 73 couches GeoJSON
    │                         │
    │                    organisées en
    │                         │
    │                    9 catégories
    │
links.json ──définit──▶ 22 relations entre couches
```

## Couches (layers)

Chaque couche représente un jeu de données géographiques. Une couche est identifiée par une clé unique au format `<catégorie>/<nom>`, par exemple `administratif/communes`.

Chaque couche est :

- **Définie** dans `data/sources.json` avec ses métadonnées (nom, URL, identifiants)
- **Téléchargée** comme fichier GeoJSON dans `data/layers/<catégorie>/<nom>.geojson`
- **Enrichie** avec un bloc `_source` traçant son origine et sa date de téléchargement

Les couches sont des instantanés : elles reflètent l'état des données au moment du téléchargement. Un nouveau `just fetch` remplace les fichiers existants par des versions à jour.

## Catégories

Les 9 catégories organisent les couches par thématique. Chaque catégorie correspond à un sous-dossier dans `data/layers/` :

| Catégorie | Thématique | Exemples |
|-----------|-----------|----------|
| `administratif` | Limites et découpage du territoire | Communes, départements, périmètre du parc |
| `nature-environnement` | Milieux naturels protégés | Natura 2000, tourbières, forêts anciennes |
| `hydrographie` | Eau et bassins versants | Contrats territoriaux, cours d'eau, GEMAPI |
| `paysages` | Paysages et atlas | Entités paysagères, points de vue, enjeux |
| `patrimoine-culture` | Patrimoine et culture | Châteaux, écomusée, patrimoine bâti |
| `tourisme-economie` | Activités économiques et touristiques | Hébergements, itinérances, producteurs |
| `programmes` | Programmes et politiques publiques | LEADER, animations EnR, parcelles acquises |
| `demographie` | Population et services | Population, emplois, écoles |
| `energie` | Production énergétique | EnR par commune, chaufferies bois |

Une couche appartient à **exactement une catégorie**, indiquée par le champ `category` et le préfixe de sa clé.

## Liens (links)

Les liens définissent les relations entre couches. Ils ne stockent pas de données spatiales eux-mêmes ; ils décrivent comment deux couches se rapportent l'une à l'autre.

Chaque lien a :

- un **type** de relation (ex. `contains`, `located_in`)
- une couche **source** (`from`)
- une couche **cible** (`to`)
- un **indice de jointure** (`join_hint`) décrivant comment relier les données

### Types de relations

| Type | Signification | Exemple |
|------|--------------|---------|
| `contains` | La source contient géographiquement la cible | Départements → Communes |
| `within` | La source est à l'intérieur de la cible | Communes → Périmètre du parc |
| `located_in` | La source (ponctuelle) se situe dans la cible | Patrimoine bâti → Communes |
| `aggregates` | La source agrège des statistiques de la cible | Communes → Population |
| `intersects` | Les géométries se chevauchent | Natura 2000 → Communes |
| `covers` | La source couvre la totalité de la cible | Entités paysagères → Sous-entités |
| `passes_through` | La source (linéaire) traverse la cible | Grandes itinérances → Communes |

### Indices de jointure

Le champ `join_hint` indique comment relier techniquement deux couches :

- `"property:NOM_COM"` — jointure par propriété GeoJSON partagée
- `"spatial"` — jointure par intersection géométrique

Ces indices sont informatifs : ils guident un futur outil de croisement mais ne sont pas exploités par le pipeline actuel.

## Les communes comme pivot

La couche `administratif/communes` est le pivot central du modèle. La majorité des liens passent par cette couche :

- Les couches statistiques (démographie, énergie, tourisme) **agrègent** des données par commune
- Les couches ponctuelles (patrimoine, chaufferies) sont **localisées dans** des communes
- Les couches linéaires (itinérances, chemins) **traversent** des communes
- Les zones naturelles (Natura 2000, RICE) **intersectent** des communes

Ce rôle central reflète la réalité administrative française : la commune est l'unité de base pour croiser des données territoriales.

## Cycle de vie des données

```text
1. sources.json    →  Définit quoi télécharger
2. just fetch      →  Télécharge et enrichit avec _source
3. just validate   →  Vérifie intégrité + cohérence avec links.json
4. data/layers/    →  Données prêtes à l'emploi
```

Les données ne sont pas transformées au-delà de l'injection `_source`. Le GeoJSON original est préservé tel quel, ce qui garantit la fidélité aux sources et simplifie le diagnostic en cas de problème.

## Voir aussi

- [Sources de données](sources-de-donnees.md) — d'où viennent les données
- [Référence sources.json](../reference/sources-json.md) — schéma complet
- [Référence links.json](../reference/links-json.md) — schéma des liens
