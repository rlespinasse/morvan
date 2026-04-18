# Guide : Travailler avec Git LFS

Ce guide explique comment cloner, récupérer et contribuer aux 3 couches forestières suivies par Git LFS.

## Prérequis

- [Git LFS](https://git-lfs.com/) installé et initialisé

Sur macOS :

```bash
brew install git-lfs
git lfs install   # une seule fois, globalement
```

## Fichiers suivis par LFS

Les 3 couches forestières sont stockées via LFS en raison de leur taille (13–128 Mo) :

- `data/layers/nature-environnement/forets-anciennes.geojson`
- `data/layers/nature-environnement/forets-recentes.geojson`
- `data/layers/nature-environnement/forets-deboisees.geojson`

Le fichier `.gitattributes` à la racine liste ces chemins avec le filtre `lfs`.

## Cloner un dépôt avec LFS

```bash
git clone https://github.com/rlespinasse/morvan.git
cd morvan
just lfs-pull
```

Si `git lfs install` a bien été exécuté avant le clone, les fichiers LFS sont téléchargés automatiquement et `just lfs-pull` est redondant. En cas de doute, relancer `just lfs-pull` ne coûte rien.

## Vérifier l'état des fichiers LFS

```bash
git lfs ls-files
```

Sortie attendue :

```text
14f279a79d * data/layers/nature-environnement/forets-anciennes.geojson
b08d301494 * data/layers/nature-environnement/forets-deboisees.geojson
bbebba5233 * data/layers/nature-environnement/forets-recentes.geojson
```

L'astérisque `*` signifie que le fichier est présent localement. Un tiret `-` indiquerait un pointeur non résolu.

## Si un fichier LFS n'est pas résolu

Symptôme : le fichier fait quelques centaines d'octets et commence par :

```text
version https://git-lfs.github.com/spec/v1
oid sha256:...
size ...
```

Résoudre :

```bash
just lfs-pull
```

## Ajouter une nouvelle couche volumineuse à LFS

Si vous ajoutez une source GeoJSON qui dépasse 50 Mo, déclarez-la dans `.gitattributes` :

```text
data/layers/<catégorie>/<nom>.geojson filter=lfs diff=lfs merge=lfs -text
```

Puis committez le `.gitattributes` **avant** de commiter le fichier lui-même, sinon Git stockerait le fichier en blob classique malgré l'attribut.

Flux complet :

```bash
echo "data/layers/ma-cat/ma-couche.geojson filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
git add .gitattributes
git commit -m "chore(lfs): suit ma-couche via LFS"

just fetch   # télécharge le fichier
git add data/layers/ma-cat/ma-couche.geojson
git commit -m "feat(data): ajoute ma-couche"
git push
```

Vérifier après push que le fichier est bien en LFS sur GitHub : la page du fichier doit afficher « Stored with Git LFS ».

## Seuil recommandé

Au-delà de ~50 Mo, bascule en LFS. En deçà, un commit Git classique suffit et évite la dépendance à LFS.

## Dépannage

### « This repository is over its data quota »

Le compte GitHub a épuisé le quota LFS. Contact l'administrateur du dépôt ou voir [github.com/settings/billing](https://github.com/settings/billing).

### Pull très lent

Le téléchargement LFS télécharge les blobs binaires par-dessus HTTPS. Sur connexion lente, 241 Mo cumulés prennent plusieurs minutes. Pas de contournement — c'est la taille réelle des données.

### CI échoue sur les fichiers LFS

Le workflow `pages.yml` doit activer LFS explicitement :

```yaml
- uses: actions/checkout@...
  with:
    lfs: true
```

Voir [Référence : Workflow Pages](../reference/workflow-pages.md).

## Voir aussi

- [Pourquoi Git LFS](../explications/choix-lfs.md) — motivation du choix
- [Référence : Workflow Pages](../reference/workflow-pages.md) — LFS en CI
