# Guide : Mettre à jour les données

Ce guide explique comment rafraîchir les données GeoJSON après une mise à jour des sources en amont, puis régénérer les artefacts du site.

## Prérequis

- Dépendances Python installées (`just install`)
- Site configuré si vous voulez aussi régénérer le front (`just site-setup`)

## Étape 1 : Re-télécharger toutes les couches

```bash
just fetch
```

Le script télécharge toutes les couches et remplace les fichiers existants dans `data/layers/`. Le bloc `_source.fetched_at` est mis à jour avec la nouvelle date de téléchargement.

## Étape 2 : Valider après mise à jour

```bash
just validate
```

Cela détecte les problèmes potentiels :

- Fichier devenu invalide en amont (JSON malformé, structure modifiée)
- Ressource devenue indisponible (erreur 404)
- Features vides (jeu de données vidé en amont)

## Étape 3 : Régénérer les artefacts du site

Les données brutes de `data/layers/` sont en Lambert 93. Le site a besoin de la version WGS84 et de la configuration dérivée. Une seule commande couvre tout :

```bash
just prepare
```

Cette recette enchaîne `lfs-pull`, `reproject`, `generate-config`, `generate-links`. Elle doit être relancée après chaque `just fetch` si vous utilisez le site.

> **Note** : si vous travaillez uniquement sur les données brutes (pas sur le site), `just prepare` est facultatif.

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

## Après rafraîchissement : déployer

Si le projet est déployé sur GitHub Pages, commitez les changements sur `main` : le workflow `pages.yml` reprojette et reconstruit automatiquement le site. Voir [Déployer le site](deployer-le-site.md).

## Voir aussi

- [Recettes justfile](../reference/recettes-justfile.md) — détails sur les commandes
- [Sources de données](../explications/sources-de-donnees.md) — provenance des données
- [Le pipeline en deux étapes](../explications/pipeline-deux-etapes.md) — pourquoi reprojeter
