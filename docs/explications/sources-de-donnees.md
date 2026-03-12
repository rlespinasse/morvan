# Explication : Les sources de données

Ce document explique d'où viennent les données du projet et pourquoi ces portails ont été choisis.

## Les portails utilisés

Le projet s'appuie sur deux portails de données ouvertes :

### data.gouv.fr

[data.gouv.fr](https://www.data.gouv.fr/) est la plateforme nationale française d'open data. C'est le portail de référence pour les jeux de données publics. Dans le projet, chaque couche a une page de référence sur data.gouv.fr (champ `dataset_url` dans `sources.json`).

Ce portail fournit :

- Un identifiant stable par jeu de données (`dataset_id`)
- Un identifiant par ressource (`resource_id`)
- Les métadonnées de provenance (producteur, licence, fréquence de mise à jour)

### ternum-bfc.fr

[trouver.ternum-bfc.fr](https://trouver.ternum-bfc.fr/) est la plateforme de données géographiques de la région Bourgogne-Franche-Comté, opérée par Ternum BFC (Territoires Numériques BFC). C'est un portail régional spécialisé dans les données géospatiales.

Dans le projet, les fichiers GeoJSON sont téléchargés depuis ce portail (champ `resource_url` dans `sources.json`). Ce choix s'explique par :

- **Proximité géographique** : le Morvan est en Bourgogne-Franche-Comté
- **Format natif** : les données y sont disponibles directement en GeoJSON
- **Fiabilité** : les URLs de téléchargement sont stables et structurées
- **Richesse** : ce portail concentre les données produites par le PNR du Morvan lui-même

## Le producteur de données

La majorité des jeux de données sont produits et publiés par le **Parc naturel régional du Morvan** (PNR du Morvan). Le PNR est l'organisme gestionnaire du parc, chargé de la protection et de la valorisation du territoire.

Quelques jeux de données proviennent d'autres producteurs publics :

- **INSEE** : données démographiques (population, logements, emplois)
- **Ministère de l'Éducation nationale** : établissements scolaires
- **IGN / ONF** : données forestières
- **Admin Express** : limites administratives

## Pourquoi ces données

Le projet agrège les données nécessaires à une vision transversale du territoire du Morvan :

- **Périmètre administratif** : pour définir les limites du territoire d'étude
- **Nature et environnement** : pour cartographier les zones protégées et la biodiversité
- **Hydrographie** : pour suivre les politiques de l'eau (contrats territoriaux, GEMAPI)
- **Paysages** : pour documenter l'atlas des paysages du Morvan
- **Patrimoine et culture** : pour inventorier le patrimoine bâti et les sites culturels
- **Tourisme et économie** : pour analyser l'offre touristique et économique
- **Démographie** : pour comprendre la dynamique de population
- **Énergie** : pour suivre la transition énergétique sur le territoire

## Format et intégrité

Toutes les données sont en format **GeoJSON** ([RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)), un standard ouvert pour les données géographiques. Ce format est :

- Lisible par l'humain (JSON)
- Supporté nativement par les outils SIG (QGIS, Mapbox, Leaflet, etc.)
- Facilement manipulable en Python, JavaScript, et tout langage supportant JSON

Le pipeline n'effectue aucune transformation sur les données au-delà de l'injection des métadonnées `_source`. Le GeoJSON original est préservé tel quel.

## Limites

- **Pas de mise à jour automatique** : les données ne sont pas rafraîchies en continu. Il faut relancer `just fetch` manuellement.
- **Dépendance aux portails** : si une URL de téléchargement change, la couche concernée doit être mise à jour dans `sources.json`.
- **Pas de vérification de licence** : les licences des jeux de données ne sont pas vérifiées automatiquement. Consultez la page `dataset_url` de chaque couche pour connaître la licence applicable.

## Voir aussi

- [Modèle de données](modele-de-donnees.md) — comment les couches s'articulent
- [Référence sources.json](../reference/sources-json.md) — schéma des définitions de couches
- [Guide : Ajouter une source](../guides/ajouter-une-source.md) — pour contribuer de nouvelles couches
