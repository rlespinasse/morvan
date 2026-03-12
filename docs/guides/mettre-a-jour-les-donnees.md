# Guide : Mettre à jour les données

Ce guide explique comment rafraîchir les données GeoJSON après une mise à jour des sources en amont.

## Re-télécharger toutes les couches

```bash
just fetch
```

Le script télécharge toutes les couches et remplace les fichiers existants dans `data/layers/`. Le bloc `_source.fetched_at` est mis à jour avec la nouvelle date de téléchargement.

## Valider après mise à jour

Après le téléchargement, vérifiez l'intégrité :

```bash
just validate
```

Cela détecte les problèmes potentiels :

- Fichier devenu invalide en amont (JSON malformé, structure modifiée)
- Ressource devenue indisponible (erreur 404)
- Features vides (jeu de données vidé en amont)

## En cas d'erreur de téléchargement

Si certaines couches échouent :

1. Consultez les erreurs affichées par `just fetch`
2. Vérifiez que l'URL source est toujours valide en ouvrant `dataset_url` dans un navigateur
3. Si la ressource a changé d'URL, mettez à jour `resource_url` dans `data/sources.json`
4. Relancez `just fetch`

## Mettre à jour une seule couche manuellement

Le script `fetch_all.py` télécharge toujours toutes les couches. Pour ne mettre à jour qu'une seule couche, téléchargez-la directement :

```bash
curl -o data/layers/<catégorie>/<nom>.geojson "<resource_url>"
```

> **Attention** : le téléchargement manuel ne génère pas le bloc `_source`. La validation signalera ce fichier comme invalide. Pour un usage ponctuel, préférez `just fetch` complet.

## Voir aussi

- [Recettes justfile](../reference/recettes-justfile.md) — détails sur les commandes
- [Sources de données](../explications/sources-de-donnees.md) — provenance des données
