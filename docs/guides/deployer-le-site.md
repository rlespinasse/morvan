# Guide : Déployer le site sur GitHub Pages

Ce guide explique comment déployer l'atlas sur GitHub Pages et comment vérifier un déploiement en cours.

## Prérequis

- Droit d'écriture sur le dépôt GitHub
- GitHub Pages activé dans les paramètres du dépôt

## Activer GitHub Pages (une seule fois)

Dans **Settings** → **Pages** du dépôt :

1. Sous **Build and deployment**, choisir **Source: GitHub Actions**
2. Rien d'autre à configurer : le workflow `pages.yml` gère le reste

## Déclencher un déploiement

### Automatique (sur push)

Tout push sur `main` déclenche le workflow `Deploy to GitHub Pages`. Les commits qui ne touchent que `docs/` déclenchent aussi le déploiement (le workflow n'a pas de filtre de chemins).

### Manuel (workflow_dispatch)

Depuis l'onglet **Actions** du dépôt :

1. Sélectionner **Deploy to GitHub Pages**
2. Cliquer sur **Run workflow**
3. Choisir la branche (généralement `main`)
4. Lancer

Utile pour redéployer sans nouveau commit (par exemple après la mise à jour d'une source amont qui n'aurait pas modifié le dépôt).

## Suivre un déploiement

Depuis l'onglet **Actions**, ouvrir le run en cours. Le workflow a deux jobs :

1. **build** — clone, LFS, `mise install`, `uv pip install`, `just prepare`, `just site-setup`, `npm run build`, upload de l'artefact `site/dist`
2. **deploy** — publie l'artefact sur Pages et expose l'URL

Le job `build` prend quelques minutes (téléchargement LFS + reprojection de 73 couches). Le job `deploy` est rapide.

Une fois le run vert, l'URL est visible dans :

- L'onglet **Actions** (output du job `deploy`)
- **Settings** → **Pages**
- L'environnement GitHub Pages (page **Environments** du dépôt)

## Vérifier après déploiement

1. Ouvrir l'URL publiée (typiquement `https://<user>.github.io/morvan/`)
2. Vérifier que la carte charge et que le périmètre du PNR s'affiche
3. Activer quelques couches et confirmer qu'elles apparaissent
4. Cliquer sur une feature : le panneau de détails doit s'ouvrir avec les relations

## Dépannage

### Le job `build` échoue au `lfs pull`

Les fichiers LFS ne sont peut-être pas réellement poussés sur le remote. Vérifier localement :

```bash
git lfs ls-files
```

puis pousser explicitement les objets LFS :

```bash
git lfs push --all origin main
```

### Le site est vide (page blanche)

Ouvrir les DevTools du navigateur :

- Erreur 404 sur un fichier GeoJSON → `reproject` a échoué silencieusement. Relancer le workflow manuellement.
- Erreur 404 sur un asset → le chemin `base` de Vite doit correspondre au sous-chemin Pages. Vérifier `site/vite.config.js` (`base: './'` fonctionne pour `user.github.io/repo/`).

### « Resource not accessible by integration »

Les permissions du workflow sont incomplètes. Vérifier que `pages.yml` contient :

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Rollback

GitHub Pages ne conserve que le dernier déploiement. Pour revenir en arrière :

1. `git revert <sha-du-commit-fautif>`
2. Pousser sur `main`
3. Le workflow redéploie avec le code précédent

## Voir aussi

- [Référence : Workflow Pages](../reference/workflow-pages.md) — détail du fichier `pages.yml`
- [Guide : Lancer le site localement](lancer-site-localement.md) — tester avant de pousser
- [Guide : Mettre à jour les données](mettre-a-jour-les-donnees.md) — rafraîchir avant déploiement
