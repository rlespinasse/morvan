# Référence : links.json

Le fichier `data/links.json` définit les relations entre les couches de données du projet.

## Structure générale

```json
{
  "links": [
    {
      "type": "...",
      "from": "catégorie/couche-source",
      "to": "catégorie/couche-cible",
      "join_hint": "..."
    }
  ]
}
```

## Champs d'un lien

| Champ | Type | Obligatoire | Description |
|-------|------|:-----------:|-------------|
| `type` | string | oui | Type de relation spatiale ou thématique |
| `from` | string | oui | Clé de la couche source (doit exister dans `sources.json`) |
| `to` | string | oui | Clé de la couche cible (doit exister dans `sources.json`) |
| `join_hint` | string | oui | Indication technique pour réaliser la jointure |

## Types de relations

| Type | Direction | Description |
|------|-----------|-------------|
| `contains` | from contient to | Relation d'inclusion géographique (ex. département → communes) |
| `within` | from est dans to | Relation d'appartenance (ex. communes → périmètre du parc) |
| `located_in` | from est situé dans to | Entité ponctuelle située dans une zone (ex. patrimoine → communes) |
| `aggregates` | from agrège to | Données statistiques agrégées par zone (ex. communes → population) |
| `intersects` | from chevauche to | Zones qui se superposent partiellement (ex. Natura 2000 → communes) |
| `covers` | from couvre to | La source couvre toute la cible (ex. entités → sous-entités paysagères) |
| `passes_through` | from traverse to | Entité linéaire qui traverse une zone (ex. itinérance → communes) |

## Indices de jointure (`join_hint`)

Le champ `join_hint` indique comment relier techniquement les deux couches :

### Jointure par propriété

Format : `"property:<nom_propriété>"`

Indique qu'une propriété GeoJSON partagée permet la jointure entre les deux couches.

```json
{
  "type": "contains",
  "from": "administratif/departements",
  "to": "administratif/communes",
  "join_hint": "property:NOM_DEP"
}
```

### Jointure spatiale

Format : `"spatial"`

Indique que la relation repose sur une opération géométrique (intersection, containment, etc.).

```json
{
  "type": "located_in",
  "from": "patrimoine-culture/ecomusee",
  "to": "administratif/communes",
  "join_hint": "spatial"
}
```

## Liste complète des liens

Le projet définit actuellement **22 liens** :

### Relations `contains` (2)

| Source | Cible | Jointure |
|--------|-------|----------|
| `administratif/departements` | `administratif/communes` | `property:NOM_DEP` |
| `administratif/epci` | `administratif/communes` | `property:NOM_EPCI` |

### Relations `aggregates` (6)

| Source | Cible | Jointure |
|--------|-------|----------|
| `administratif/communes` | `demographie/population` | `property:INSEE_COM` |
| `administratif/communes` | `demographie/logements` | `property:INSEE_COM` |
| `administratif/communes` | `demographie/emplois` | `property:INSEE_COM` |
| `administratif/communes` | `energie/enr-total` | `property:INSEE_COM` |
| `administratif/communes` | `tourisme-economie/hebergements-touristiques` | `property:INSEE_COM` |
| `administratif/communes` | `tourisme-economie/restauration` | `property:INSEE_COM` |
| `administratif/communes` | `nature-environnement/forets-par-commune` | `property:INSEE_COM` |

### Relations `located_in` (6)

| Source | Cible | Jointure |
|--------|-------|----------|
| `patrimoine-culture/patrimoine-bati` | `administratif/communes` | `property:NOM_COM` |
| `patrimoine-culture/ecomusee` | `administratif/communes` | `spatial` |
| `tourisme-economie/marque-valeurs-parc` | `administratif/communes` | `spatial` |
| `tourisme-economie/producteurs-cabrache` | `administratif/communes` | `spatial` |
| `demographie/etablissements-scolaires-ouverts` | `administratif/communes` | `property:nom_commune` |
| `energie/chaufferies-bois` | `administratif/communes` | `spatial` |

### Relations `intersects` (2)

| Source | Cible | Jointure |
|--------|-------|----------|
| `nature-environnement/natura2000` | `administratif/communes` | `spatial` |
| `nature-environnement/rice-zone-coeur` | `administratif/communes` | `spatial` |

### Relations `covers` (1)

| Source | Cible | Jointure |
|--------|-------|----------|
| `paysages/entites-paysageres` | `paysages/sous-entites-paysageres` | `spatial` |

### Relations `within` (2)

| Source | Cible | Jointure |
|--------|-------|----------|
| `hydrographie/ct-aron-communes` | `hydrographie/ct-aron-bassin` | `spatial` |
| `administratif/communes` | `administratif/perimetre-parc` | `spatial` |

### Relations `passes_through` (2)

| Source | Cible | Jointure |
|--------|-------|----------|
| `tourisme-economie/grandes-itinerances` | `administratif/communes` | `spatial` |
| `tourisme-economie/chemins-ruraux-bibracte` | `administratif/communes` | `spatial` |

## Validation

Le script `validate.py` vérifie que chaque `from` et `to` référence une clé existante dans `sources.json`. Il ne vérifie pas la validité spatiale des relations.

## Voir aussi

- [Ajouter un lien](../guides/ajouter-un-lien.md)
- [Modèle de données](../explications/modele-de-donnees.md) — explication des types de relations
- [Référence sources.json](sources-json.md)
