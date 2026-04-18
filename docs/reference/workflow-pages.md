# Référence : Workflow Pages

Le fichier `.github/workflows/pages.yml` définit le déploiement automatique de l'atlas sur GitHub Pages.

## Emplacement

```text
.github/workflows/pages.yml
```

## Déclencheurs

| Événement | Condition |
|-----------|-----------|
| `push` | Branche `main` |
| `workflow_dispatch` | Exécution manuelle depuis l'UI GitHub |

## Permissions

| Permission | Valeur | Raison |
|------------|--------|--------|
| `contents` | `read` | Clone du dépôt |
| `pages` | `write` | Publication de l'artefact Pages |
| `id-token` | `write` | Signature OIDC requise par `deploy-pages` |

## Concurrence

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

Un seul déploiement Pages à la fois. `cancel-in-progress: false` laisse le run courant finir avant d'en démarrer un nouveau (évite les artefacts tronqués).

## Jobs

### `build`

**Runner** : `ubuntu-latest`

**Étapes** :

| # | Action | Détail |
|---|--------|--------|
| 1 | `actions/checkout@v6.0.2` | Clone avec `lfs: true` |
| 2 | `jdx/mise-action@v2` | Provisionne Python, Node, just, uv selon `.mise.toml` |
| 3 | `uv pip install -r requirements.txt` | Dépendances Python dans le venv |
| 4 | `just prepare` | LFS pull + reproject + generate-config + generate-links |
| 5 | `just site-setup` | `npm install` dans `site/` |
| 6 | `cd site && npm run build` | Build Vite → `site/dist/` |
| 7 | `actions/upload-pages-artifact@v4.0.0` | Upload de `site/dist` |

### `deploy`

**Runner** : `ubuntu-latest`

**Dépend de** : `build`

**Environnement** : `github-pages` (URL exposée via `steps.deployment.outputs.page_url`)

**Étapes** :

| # | Action | Détail |
|---|--------|--------|
| 1 | `actions/configure-pages@v5.0.0` | Configure Pages pour le dépôt |
| 2 | `actions/deploy-pages@v4.0.5` | Publie l'artefact |

## Épinglage des actions

Toutes les actions sont épinglées par SHA (sauf `jdx/mise-action@v2`, épinglée par tag) :

| Action | SHA | Version |
|--------|-----|---------|
| `actions/checkout` | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` | v6.0.2 |
| `actions/configure-pages` | `983d7736d9b0ae728b81ab479565c72886d7745b` | v5.0.0 |
| `actions/upload-pages-artifact` | `7b1f4a764d45c48632c6b24a0339c27f5614fb0b` | v4.0.0 |
| `actions/deploy-pages` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` | v4.0.5 |
| `jdx/mise-action` | (tag `v2`) | — |

Dependabot (`.github/dependabot.yml`) ouvre des PR hebdomadaires pour ces actions ainsi que pour les dépendances npm (`site/`) et pip (racine).

## Artefact publié

- **Nom** : `github-pages` (artefact par défaut de `upload-pages-artifact`)
- **Contenu** : `site/dist/` (résultat de `vite build`)
- **URL** : exposée dans l'environnement `github-pages`

## Durée typique

- `build` : 3–5 minutes (majoritairement LFS pull + reprojection Python)
- `deploy` : < 1 minute

## Secrets et variables

Aucun secret ni variable externe n'est requis. Le workflow s'appuie uniquement sur les permissions `GITHUB_TOKEN` déclarées plus haut.

## Voir aussi

- [Guide : Déployer le site](../guides/deployer-le-site.md)
- [Recettes justfile](recettes-justfile.md) — détail de `prepare` et `site-setup`
- [Guide : Travailler avec LFS](../guides/travailler-avec-lfs.md)
