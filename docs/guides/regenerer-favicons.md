# Guide : Régénérer les favicons

Ce guide explique comment régénérer les icônes (favicons, icônes d'application, icône Apple) à partir des fichiers SVG sources.

## Prérequis

- [ImageMagick](https://imagemagick.org/) installé (commande `magick` disponible)

Sur macOS :

```bash
brew install imagemagick
```

## Quand régénérer

Après toute modification de :

- `site/public/favicon.svg` (icône classique)
- `site/public/favicon-maskable.svg` (icône maskable pour PWA)

Les fichiers dérivés deviennent alors obsolètes et doivent être reproduits.

## Étape

Une seule commande régénère tous les formats :

```bash
just favicons
```

Elle produit dans `site/public/` :

| Fichier | Taille | Source | Usage |
|---------|--------|--------|-------|
| `favicon-16x16.png` | 16×16 | `favicon.svg` | Onglet navigateur (petit) |
| `favicon-32x32.png` | 32×32 | `favicon.svg` | Onglet navigateur (standard) |
| `favicon.ico` | 16+32 multi | `favicon-16x16.png` + `favicon-32x32.png` | Compat legacy |
| `apple-touch-icon.png` | 180×180 | `favicon-maskable.svg` | Ajout écran d'accueil iOS |
| `icon-192.png` | 192×192 | `favicon-maskable.svg` | PWA Android |
| `icon-512.png` | 512×512 | `favicon-maskable.svg` | PWA Android haute résolution |

## Vérifier le résultat

Lancez le site et ouvrez les DevTools → onglet **Application** → **Manifest** :

- L'icône doit apparaître dans la barre d'onglet
- Les icônes 192 et 512 doivent être listées sans erreur dans le manifeste

## Commiter

Les PNG générés sont versionnés (pas dans `.gitignore`). Pensez à les commiter après régénération :

```bash
git add site/public/favicon-*.png site/public/apple-touch-icon.png site/public/icon-*.png site/public/favicon.ico
git commit -m "chore(site): régénère les favicons"
```

## Dépannage

### « magick: command not found »

ImageMagick n'est pas installé ou pas dans le `PATH`. Installez-le (`brew install imagemagick`), puis ouvrez un nouveau terminal.

### Icône floue sur Android

Vérifiez que `favicon-maskable.svg` respecte la zone de sécurité maskable (le contenu principal doit tenir dans le cercle inscrit au centre). Voir [maskable.app](https://maskable.app/) pour prévisualiser.

## Voir aussi

- [Recettes justfile](../reference/recettes-justfile.md) — détail de la recette `favicons`
