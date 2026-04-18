# Explication : Pourquoi Git LFS

Trois couches forestières du projet sont stockées via [Git LFS](https://git-lfs.com/) plutôt qu'en commits Git standards. Ce document explique pourquoi.

## Les fichiers concernés

| Fichier | Taille |
|---------|--------|
| `data/layers/nature-environnement/forets-anciennes.geojson` | 59 Mo |
| `data/layers/nature-environnement/forets-recentes.geojson` | 128 Mo |
| `data/layers/nature-environnement/forets-deboisees.geojson` | 41 Mo |

Total : environ 228 Mo. À titre de comparaison, les 70 autres couches cumulent une dizaine de mégaoctets.

## Le problème

Git n'est pas conçu pour les gros fichiers binaires. Committer directement ces GeoJSON aurait plusieurs conséquences :

- **Clone lent** : tout nouveau clone récupère l'historique complet de chaque fichier, y compris les versions antérieures.
- **Gonflement irréversible** : une fois commité, un gros fichier reste dans `.git/` à vie, même après suppression. Les contributeurs transportent le poids mort indéfiniment.
- **Diff inutilisables** : Git tente de diffuser en texte des fichiers JSON compactés. `git diff` devient inexploitable.
- **Limite GitHub** : GitHub refuse les fichiers > 100 Mo en push classique. `forets-recentes.geojson` (128 Mo) n'est tout simplement pas acceptable sans LFS.

## Le choix

Git LFS remplace le contenu du fichier par un pointeur textuel dans le dépôt Git. Le contenu réel est stocké sur un serveur séparé (GitHub LFS dans notre cas), téléchargé à la demande.

Conséquences concrètes :

- Le clone initial est rapide : seul le pointeur est cloné.
- `git lfs pull` télécharge les blobs à part, en parallèle.
- Les versions anciennes peuvent être élaguées du serveur LFS sans toucher l'historique Git.
- `git diff` n'essaie plus de diffuser les binaires.

## Seuil de bascule

Le projet bascule vers LFS à partir de **~50 Mo** par fichier. En deçà, le coût d'infrastructure LFS (quota GitHub, dépendance supplémentaire pour les contributeurs) dépasse le bénéfice.

Les 3 couches forestières dépassent ce seuil ; une quatrième, `forets-par-commune.geojson` (13 Mo), reste en Git classique malgré son appartenance thématique à la même famille.

## Pourquoi seulement ces fichiers

Les couches forestières sont volumineuses parce qu'elles décrivent des polygones à très haute résolution (contours détaillés au niveau de la parcelle cadastrale). Les autres couches du projet sont soit moins détaillées (communes agrégées), soit moins nombreuses (quelques dizaines de points pour les châteaux).

Aucun traitement ne simplifie ces géométries : le choix est de conserver la précision originale, quitte à payer le coût LFS. Une alternative serait une simplification topologique (Douglas-Peucker, par exemple), mais elle altérerait les données — et ce projet se donne pour règle de ne pas transformer les sources.

## Coût et contraintes

- Le quota LFS par défaut de GitHub est de 1 Go de stockage et 1 Go/mois de bande passante.
- Chaque clone ou `git lfs pull` consomme de la bande passante.
- Les contributeurs doivent installer `git lfs` et exécuter `git lfs install` au moins une fois.
- Le workflow CI doit activer LFS explicitement (`lfs: true` dans `actions/checkout`), sinon les fichiers restent des pointeurs.

## Ce qu'on ferait autrement

Si les couches forestières grossissaient au-delà du quota GitHub, des options existent :

- **Simplification géométrique** au moment de la reprojection (tolérance de quelques mètres)
- **Stockage externe** (S3, Cloudflare R2) avec téléchargement via un script `fetch`
- **Suppression de `data/layers/`** pour ces couches et reconstruction par `just fetch` à la demande

Ces options restent des sujets ouverts ; aucune n'est engagée aujourd'hui.

## Voir aussi

- [Guide : Travailler avec LFS](../guides/travailler-avec-lfs.md) — usage pratique
- [Référence : Workflow Pages](../reference/workflow-pages.md) — activation LFS en CI
