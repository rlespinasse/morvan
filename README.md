# Morvan

Pipeline d'agrégation de données géospatiales du [Parc naturel régional du Morvan](https://www.parcdumorvan.org/) (Bourgogne-Franche-Comté, France).

Ce projet télécharge **73 jeux de données GeoJSON** depuis les portails open data français ([data.gouv.fr](https://www.data.gouv.fr/), [ternum-bfc.fr](https://trouver.ternum-bfc.fr/)), les organise en **9 catégories thématiques**, valide leur intégrité et définit les relations entre les couches.

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

- [mise](https://mise.jdx.dev/) (ou Python 3 + [just](https://github.com/casey/just) installés manuellement)

### Installation et exécution

```bash
# Cloner le dépôt
git clone https://github.com/rlespinasse/morvan.git
cd morvan

# Installer les outils via mise
mise install

# Tout-en-un : setup + téléchargement + validation
just all
```

Ou étape par étape :

```bash
just setup      # Créer le venv et installer les dépendances
just fetch       # Télécharger les 73 couches GeoJSON
just validate    # Valider l'intégrité des données
```

Les données sont téléchargées dans `data/layers/`, organisées par catégorie.

## Structure du projet

```text
morvan/
├── data/
│   ├── sources.json       # Définition des 73 couches
│   ├── links.json         # 22 relations entre couches
│   └── layers/            # Fichiers GeoJSON téléchargés (gitignored)
├── scripts/
│   ├── fetch_all.py       # Script de téléchargement
│   └── validate.py        # Script de validation
├── justfile               # Recettes de build
└── docs/                  # Documentation
```

## Documentation

- **Tutoriel** : [Premiers pas](docs/tutoriels/premiers-pas.md)
- **Guides pratiques** :
  [Ajouter une source](docs/guides/ajouter-une-source.md) ·
  [Ajouter un lien](docs/guides/ajouter-un-lien.md) ·
  [Mettre à jour les données](docs/guides/mettre-a-jour-les-donnees.md)
- **Explications** :
  [Modèle de données](docs/explications/modele-de-donnees.md) ·
  [Sources de données](docs/explications/sources-de-donnees.md)
- **Référence** :
  [sources.json](docs/reference/sources-json.md) ·
  [links.json](docs/reference/links-json.md) ·
  [Recettes justfile](docs/reference/recettes-justfile.md) ·
  [Catalogue des couches](docs/reference/catalogue-des-donnees.md)

## Licence

Ce projet est sous [licence MIT](LICENSE.md).

Les données sont issues de portails open data publics français et sont soumises à leurs licences respectives.
