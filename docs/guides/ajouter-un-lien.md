# Guide : Ajouter un lien entre couches

Ce guide explique comment définir une nouvelle relation entre deux couches de données dans `links.json`.

## Prérequis

Les deux couches concernées doivent déjà exister dans `data/sources.json`. Si ce n'est pas le cas, commencez par [ajouter la source de données](ajouter-une-source.md).

## Identifier le type de relation

Déterminez le type de relation spatiale ou thématique entre les deux couches :

| Type | Quand l'utiliser |
|------|-----------------|
| `contains` | Une zone contient géographiquement une autre (ex. département → communes) |
| `within` | Une zone est à l'intérieur d'une autre |
| `located_in` | Des points se trouvent dans une zone |
| `aggregates` | Des statistiques sont agrégées par zone |
| `intersects` | Deux zones se chevauchent partiellement |
| `covers` | Une zone couvre entièrement une autre |
| `passes_through` | Un tracé linéaire traverse une zone |

## Déterminer l'indice de jointure

Le `join_hint` indique comment relier techniquement les deux couches :

- **`property:<nom>`** : si les deux couches partagent une propriété commune (ex. `property:INSEE_COM` pour le code commune)
- **`spatial`** : si la relation repose sur la géométrie (intersection, containment, etc.)

Pour identifier une propriété commune, inspectez les propriétés des features dans les deux fichiers GeoJSON.

## Ajouter l'entrée dans links.json

Ouvrez `data/links.json` et ajoutez un objet dans le tableau `links` :

```json
{
  "links": [
    ...liens existants...,
    {
      "type": "located_in",
      "from": "ma-categorie/ma-couche-ponctuelle",
      "to": "administratif/communes",
      "join_hint": "spatial"
    }
  ]
}
```

### Conventions

- **`from`** → **`to`** : la direction reflète la relation. « From » est le sujet, « to » est le complément.
  - `patrimoine-bati` **est localisé dans** `communes` → `from: patrimoine-bati, to: communes`
  - `departements` **contiennent** `communes` → `from: departements, to: communes`
- Les clés `from` et `to` doivent correspondre exactement à des clés de `sources.json`

## Valider

```bash
just validate
```

Le script vérifie que chaque `from` et `to` référence une couche existante dans `sources.json`.

## Voir aussi

- [Référence links.json](../reference/links-json.md) — schéma complet et liste de tous les liens
- [Modèle de données](../explications/modele-de-donnees.md) — explication des types de relations
