#!/usr/bin/env python3
"""Generate site/src/generated-config.js from data/sources.json."""

import json
import os

SOURCES_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'sources.json')
LAYERS_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'layers')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'site', 'src', 'generated-config.js')

CATEGORY_LABELS = {
    'administratif': 'Administratif',
    'nature-environnement': 'Nature & Environnement',
    'hydrographie': 'Hydrographie',
    'paysages': 'Paysages',
    'patrimoine-culture': 'Patrimoine & Culture',
    'tourisme-economie': 'Tourisme & Économie',
    'programmes': 'Programmes',
    'demographie': 'Démographie',
    'energie': 'Énergie',
}

CATEGORY_BASE_HUES = {
    'administratif': 217,
    'nature-environnement': 150,
    'hydrographie': 205,
    'paysages': 42,
    'patrimoine-culture': 358,
    'tourisme-economie': 25,
    'programmes': 270,
    'demographie': 340,
    'energie': 48,
}

CATEGORY_ORDER = list(CATEGORY_LABELS.keys())


def generate_layer_colors(category, count):
    """Generate visually distinct colors for layers in a category.

    Uses the category base hue and spreads layers across hue, saturation,
    and lightness to maximize contrast between siblings.
    """
    import colorsys
    base_hue = CATEGORY_BASE_HUES.get(category, 0) / 360.0
    colors = []
    # Spread hue across ±30° range, alternate light/dark for adjacent layers
    hue_spread = 60 / 360  # ±30°
    for i in range(count):
        if count == 1:
            h, s, l = base_hue, 0.65, 0.45
        else:
            t = i / (count - 1)
            h = (base_hue - hue_spread / 2 + t * hue_spread) % 1.0
            # Alternate between light/vivid and dark/muted for better contrast
            if i % 2 == 0:
                s = 0.55 + (t * 0.25)
                l = 0.50 - (t * 0.10)
            else:
                s = 0.75 - (t * 0.15)
                l = 0.35 + (t * 0.10)
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        colors.append(f'#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}')
    return colors

# Layers active by default
DEFAULT_ACTIVE = {
    'administratif--perimetre-parc',
}

GEOJSON_DIR = os.path.join(os.path.dirname(SOURCES_PATH), '..', 'site', 'public', 'data', 'layers')


def detect_geometry_type(layer_key):
    """Detect geometry type by reading the first feature of the GeoJSON file."""
    geojson_path = os.path.join(GEOJSON_DIR, f'{layer_key}.geojson')
    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for feat in data.get('features', []):
            geom_type = feat.get('geometry', {}).get('type', '')
            if geom_type in ('Point', 'MultiPoint'):
                return 'point'
            elif geom_type in ('LineString', 'MultiLineString'):
                return 'line'
            else:
                return 'polygon'
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        pass
    return 'polygon'


def main():
    with open(SOURCES_PATH, 'r', encoding='utf-8') as f:
        sources = json.load(f)

    layers_by_category = {}
    all_layers = {}

    for layer_key, info in sources['layers'].items():
        category = info['category']
        name = layer_key.split('/')[-1]
        layer_id = f'{category}--{name}'

        if category not in layers_by_category:
            layers_by_category[category] = []

        geom_type = detect_geometry_type(layer_key)
        is_active = layer_id in DEFAULT_ACTIVE

        all_layers[layer_id] = {
            'name': info['name'],
            'category': category,
            'geomType': geom_type,
            'file': f'data/layers/{layer_key}.geojson',
        }

        # Layer def matching leaflet-atlas format: {id, label, file, active}
        layer_def = {
            'id': layer_id,
            'label': info['name'],
            'file': f'data/layers/{layer_key}.geojson',
        }
        if not is_active:
            layer_def['active'] = False

        layers_by_category[category].append(layer_def)

    # Build layerGroups (ordered)
    layer_groups = []
    for cat in CATEGORY_ORDER:
        if cat not in layers_by_category:
            continue
        layer_groups.append({
            'id': cat,
            'group': CATEGORY_LABELS[cat],
            'layers': sorted(layers_by_category[cat], key=lambda x: x['label']),
        })

    # Build styles with distinct per-layer colors
    styles = {}
    layers_by_cat = {}
    for layer_id, info in all_layers.items():
        cat = info['category']
        layers_by_cat.setdefault(cat, []).append(layer_id)

    for cat, layer_ids in layers_by_cat.items():
        layer_ids_sorted = sorted(layer_ids)
        colors = generate_layer_colors(cat, len(layer_ids_sorted))
        for layer_id, color in zip(layer_ids_sorted, colors):
            info = all_layers[layer_id]
            if info['geomType'] == 'point':
                styles[layer_id] = {'color': color, 'radius': 6, 'weight': 1, 'fillOpacity': 0.7}
            elif info['geomType'] == 'line':
                styles[layer_id] = {'color': color, 'weight': 3, 'opacity': 0.8}
            else:
                styles[layer_id] = {'color': color, 'weight': 2, 'fillOpacity': 0.2, 'opacity': 0.8}

    # Build geometryTypes
    geometry_types = {lid: info['geomType'] for lid, info in all_layers.items()}

    # Generate JS
    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_PATH)), exist_ok=True)

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write('// Auto-generated by scripts/generate_site_config.py — do not edit\n\n')
        f.write(f'export const layerGroups = {json.dumps(layer_groups, ensure_ascii=False, indent=2)};\n\n')
        f.write(f'export const styles = {json.dumps(styles, ensure_ascii=False, indent=2)};\n\n')
        f.write(f'export const geometryTypes = {json.dumps(geometry_types, ensure_ascii=False, indent=2)};\n')

    print(f'Generated {OUTPUT_PATH} with {len(all_layers)} layers in {len(layer_groups)} groups')


if __name__ == '__main__':
    main()
