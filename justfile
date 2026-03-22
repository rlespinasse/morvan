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

# Récupérer les fichiers LFS
lfs-pull:
    git lfs pull

# Reprojeter les GeoJSON en WGS84 pour le site
reproject:
    .venv/bin/python3 scripts/reproject.py

# Générer la configuration du site
generate-config:
    .venv/bin/python3 scripts/generate_site_config.py

# Générer les liens spatiaux entre couches
generate-links:
    .venv/bin/python3 scripts/generate_reverse_links.py

# Générer les favicons à partir du SVG source
favicons:
    cd site/public && magick -background none favicon.svg -resize 32x32 favicon-32x32.png
    cd site/public && magick -background none favicon.svg -resize 16x16 favicon-16x16.png
    cd site/public && magick -background none favicon-maskable.svg -resize 192x192 icon-192.png
    cd site/public && magick -background none favicon-maskable.svg -resize 512x512 icon-512.png
    cd site/public && magick -background none favicon-maskable.svg -resize 180x180 apple-touch-icon.png
    cd site/public && magick favicon-16x16.png favicon-32x32.png favicon.ico

# Installer les dépendances du site
site-setup:
    cd site && npm install

# Lancer le site en développement
site-dev: lfs-pull reproject generate-config generate-links
    cd site && npm run dev

# Construire le site pour la production
site-build: lfs-pull reproject generate-config generate-links
    cd site && npm run build
