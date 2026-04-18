# Morvan

Pipeline d'agrégation de données géospatiales du [Parc naturel régional du Morvan](https://www.parcdumorvan.org/) (Bourgogne-Franche-Comté, France) et atlas web interactif.

Ce projet télécharge **73 jeux de données GeoJSON** depuis les portails open data français ([data.gouv.fr](https://www.data.gouv.fr/), [ternum-bfc.fr](https://trouver.ternum-bfc.fr/)), les organise en **9 catégories thématiques**, reprojette les géométries en WGS84, génère la configuration du site, et publie un atlas web sur GitHub Pages.

## Catégories

| Catégorie | Description |
|-----------|-------------|
| `administratif` | Périmètre du parc, communes, départements, EPCI |
| `nature-environnement` | Natura 2000, tourbières, forêts, réserve de ciel étoilé |
| `hydrographie` | Contrats territoriaux, bassins versants, GEMAPI |
| `paysages` | Atlas des paysages, entités, structures, enjeux |
| `patrimoine-culture` | Patrimoine bâti, écomusée, châteaux, bourgs |
| `tourisme-economie` | Hébergements, itinérances, marque Valeurs Parc |
| `programmes` | LEADER, animations EnR, parcelles acquises |
| `demographie` | Population, logements, emplois, établissements scolaires |
| `energie` | Énergies renouvelables, chaufferies bois |

## Démarrage rapide

### Prérequis

- [mise](https://mise.jdx.dev/) (ou Python 3 + Node 22 + [just](https://github.com/casey/just) + [uv](https://docs.astral.sh/uv/) installés manuellement)
- [Git LFS](https://git-lfs.com/) pour les 3 couches forestières volumineuses

### Installation et exécution

```bash
# Cloner le dépôt
git clone https://github.com/rlespinasse/morvan.git
cd morvan

# Installer les outils via mise (crée aussi le venv Python)
mise install

# Tout-en-un côté données : install + fetch + validate
just all
```

Ou étape par étape :

```bash
just install    # Installer les dépendances Python
just fetch      # Télécharger les 73 couches GeoJSON
just validate   # Valider l'intégrité des données
```

Les données brutes sont téléchargées dans `data/layers/`, organisées par catégorie.

### Lancer le site interactif

```bash
just site-setup   # Installer les dépendances npm (une seule fois)
just site-dev     # Lance LFS + reproject + config + Vite dev server
```

Le site est alors accessible sur <http://localhost:5173>.

## Structure du projet

```text
morvan/
├── data/
│   ├── sources.json       # Définition des 73 couches
│   ├── links.json         # 22 relations entre couches
│   └── layers/            # Fichiers GeoJSON téléchargés (3 via LFS)
├── scripts/
│   ├── fetch_all.py              # Téléchargement depuis les portails open data
│   ├── validate.py               # Validation d'intégrité
│   ├── reproject.py              # Reprojection EPSG:2154 → WGS84
│   ├── generate_site_config.py   # Génère site/src/generated-config.js
│   └── generate_reverse_links.py # Calcule les liens spatiaux
├── site/                  # Atlas web Leaflet (Vite)
│   ├── src/               # Code applicatif
│   └── public/data/       # Données reprojetées servies au navigateur
├── .github/workflows/     # Déploiement GitHub Pages
├── justfile               # Recettes de build
└── docs/                  # Documentation
```

## Documentation

- **Tutoriel** : [Premiers pas](docs/tutoriels/premiers-pas.md)
- **Guides pratiques** :
  [Lancer le site localement](docs/guides/lancer-site-localement.md) ·
  [Déployer le site](docs/guides/deployer-le-site.md) ·
  [Mettre à jour les données](docs/guides/mettre-a-jour-les-donnees.md) ·
  [Ajouter une source](docs/guides/ajouter-une-source.md) ·
  [Ajouter un lien](docs/guides/ajouter-un-lien.md) ·
  [Travailler avec LFS](docs/guides/travailler-avec-lfs.md) ·
  [Régénérer les favicons](docs/guides/regenerer-favicons.md)
- **Explications** :
  [Modèle de données](docs/explications/modele-de-donnees.md) ·
  [Sources de données](docs/explications/sources-de-donnees.md) ·
  [Le pipeline en deux étapes](docs/explications/pipeline-deux-etapes.md) ·
  [Pourquoi Git LFS](docs/explications/choix-lfs.md)
- **Référence** :
  [sources.json](docs/reference/sources-json.md) ·
  [links.json](docs/reference/links-json.md) ·
  [Recettes justfile](docs/reference/recettes-justfile.md) ·
  [Catalogue des couches](docs/reference/catalogue-des-donnees.md) ·
  [Configuration du site](docs/reference/site-config.md) ·
  [Workflow Pages](docs/reference/workflow-pages.md)

## Licence

Ce projet est sous [licence MIT](LICENSE.md).

Les données sont issues de portails open data publics français et sont soumises à leurs licences respectives.
