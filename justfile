default:
    @just --list

# Créer le venv et installer les dépendances
setup:
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt

# Télécharger toutes les données
fetch:
    .venv/bin/python3 scripts/fetch_all.py

# Valider l'intégrité des données
validate:
    .venv/bin/python3 scripts/validate.py

# Vérifier le style des fichiers Markdown
lint-md:
    markdownlint '**/*.md'

# Setup + fetch + validate
all: setup fetch validate
