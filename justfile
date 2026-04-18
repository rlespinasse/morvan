# Atlas Morvan - Données géographiques et site interactif

set dotenv-load := false

py := ".venv/bin/python3"

# Liste des recettes disponibles
default:
    @just --list

# --- Setup ---

# Installer les dépendances Python
[group('setup')]
install:
    uv pip install -r requirements.txt

# Installer les dépendances du site
[group('setup')]
site-setup:
    cd site && npm install

# --- Data ---

# Télécharger toutes les données
[group('data')]
fetch:
    {{ py }} scripts/fetch_all.py

# Récupérer les fichiers LFS
[group('data')]
lfs-pull:
    git lfs pull

# Reprojeter les GeoJSON en WGS84 pour le site
[group('data')]
reproject:
    {{ py }} scripts/reproject.py

# Générer la configuration du site
[group('data')]
generate-config:
    {{ py }} scripts/generate_site_config.py

# Générer les liens spatiaux entre couches
[group('data')]
generate-links:
    {{ py }} scripts/generate_reverse_links.py

# Préparer toutes les données (fetch + lfs + reproject + config + links)
[group('data')]
prepare: lfs-pull reproject generate-config generate-links

# Setup complet + fetch + validation
[group('data')]
all: install fetch validate

# --- Site ---

# Lancer le site en développement
[group('site')]
site-dev: prepare
    cd site && npm run dev

# Construire le site pour la production
[group('site')]
site-build: prepare
    cd site && npm run build

# Générer les favicons à partir du SVG source
[group('site')]
favicons:
    cd site/public && magick -background none favicon.svg -resize 32x32 favicon-32x32.png
    cd site/public && magick -background none favicon.svg -resize 16x16 favicon-16x16.png
    cd site/public && magick -background none favicon-maskable.svg -resize 192x192 icon-192.png
    cd site/public && magick -background none favicon-maskable.svg -resize 512x512 icon-512.png
    cd site/public && magick -background none favicon-maskable.svg -resize 180x180 apple-touch-icon.png
    cd site/public && magick favicon-16x16.png favicon-32x32.png favicon.ico

# --- Quality ---

# Valider l'intégrité des données (structure GeoJSON, références links.json)
[group('quality')]
validate:
    {{ py }} scripts/validate.py

# Vérifier la présence des artefacts attendus (couches + sorties site)
[group('quality')]
check:
    #!/usr/bin/env bash
    set -euo pipefail
    missing=0
    expected=$({{ py }} -c "import json; print(len(json.load(open('data/sources.json'))['layers']))")
    found=$(find data/layers -name '*.geojson' 2>/dev/null | wc -l | tr -d ' ')
    echo "Couches data/layers/ : $found/$expected"
    [ "$found" -lt "$expected" ] && missing=$((missing + 1))
    for f in data/links.json site/src/generated-config.js; do
        if [ -f "$f" ]; then
            size=$(du -h "$f" | cut -f1)
            echo "OK   $f ($size)"
        else
            echo "MISS $f"
            missing=$((missing + 1))
        fi
    done
    site_data=$(find site/public/data -name '*.geojson' 2>/dev/null | wc -l | tr -d ' ')
    echo "Couches site/public/data/ : $site_data"
    [ "$site_data" -eq 0 ] && { echo "MISS site/public/data/*.geojson (lancer 'just reproject')"; missing=$((missing + 1)); }
    if [ "$missing" -gt 0 ]; then
        echo ""
        echo "$missing élément(s) manquant(s). Lancer 'just all prepare'."
        exit 1
    fi
    echo ""
    echo "Tous les artefacts sont présents."

# Vérifier le style des fichiers Markdown
[group('quality')]
lint-md:
    markdownlint '**/*.md'
