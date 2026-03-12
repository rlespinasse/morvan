# Guide : Ajouter une source de données

Ce guide explique comment ajouter une nouvelle couche GeoJSON au projet.

## Trouver la source

1. Rendez-vous sur [data.gouv.fr](https://www.data.gouv.fr/) ou [trouver.ternum-bfc.fr](https://trouver.ternum-bfc.fr/)
2. Recherchez un jeu de données lié au Parc naturel régional du Morvan
3. Vérifiez qu'une ressource au format GeoJSON est disponible
4. Notez les identifiants nécessaires :
   - **dataset_id** : visible dans l'URL de la page du jeu de données
   - **resource_id** : UUID de la ressource GeoJSON (visible dans l'URL de téléchargement)
   - **dataset_url** : URL de la page du jeu de données
   - **resource_url** : URL de téléchargement direct du fichier GeoJSON

## Choisir la catégorie

Placez la couche dans l'une des catégories existantes :

| Catégorie | Pour les données sur... |
|-----------|------------------------|
| `administratif` | Limites administratives, périmètre du parc |
| `nature-environnement` | Zones protégées, forêts, biodiversité |
| `hydrographie` | Cours d'eau, bassins versants, contrats territoriaux |
| `paysages` | Atlas des paysages, structures paysagères |
| `patrimoine-culture` | Patrimoine bâti, musées, sites culturels |
| `tourisme-economie` | Hébergements, itinéraires, producteurs locaux |
| `programmes` | Programmes européens, parcelles, animations |
| `demographie` | Population, logements, emplois, écoles |
| `energie` | Énergies renouvelables, chaufferies |

## Ajouter l'entrée dans sources.json

Ouvrez `data/sources.json` et ajoutez une entrée dans l'objet `layers` :

```json
{
  "layers": {
    "...entrées existantes...",
    "ma-categorie/mon-nouveau-layer": {
      "name": "Nom lisible en français",
      "dataset_id": "identifiant-du-dataset",
      "resource_id": "uuid-de-la-ressource",
      "dataset_url": "https://www.data.gouv.fr/datasets/...",
      "resource_url": "https://trouver.ternum-bfc.fr/dataset/.../resource/.../download/fichier.geojson",
      "format": "geojson",
      "category": "ma-categorie"
    }
  }
}
```

### Règles de nommage

- **Clé** : `<catégorie>/<nom-en-kebab-case>` (ex. `nature-environnement/zones-humides`)
- **`category`** : doit correspondre au préfixe de la clé
- **`name`** : nom complet en français, tel qu'affiché sur le portail source

## Télécharger et valider

```bash
# Télécharger toutes les couches (la nouvelle sera incluse)
just fetch

# Vérifier l'intégrité
just validate
```

## Vérifier le fichier téléchargé

Vérifiez que le fichier a bien été créé :

```bash
ls data/layers/ma-categorie/mon-nouveau-layer.geojson
```

Inspectez les métadonnées injectées :

```bash
python3 -c "
import json
with open('data/layers/ma-categorie/mon-nouveau-layer.geojson') as f:
    data = json.load(f)
print(json.dumps(data['_source'], indent=2))
"
```

## Ajouter des liens (optionnel)

Si la nouvelle couche a des relations avec des couches existantes, consultez le guide [Ajouter un lien](ajouter-un-lien.md).

## Voir aussi

- [Référence sources.json](../reference/sources-json.md) — schéma complet
- [Catalogue des couches](../reference/catalogue-des-donnees.md) — liste de toutes les couches
- [Modèle de données](../explications/modele-de-donnees.md) — comment les couches sont organisées
