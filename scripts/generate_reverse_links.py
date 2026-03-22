#!/usr/bin/env python3
"""Generate bi-directional spatial links between GeoJSON features.

For each feature, finds which features from other layers contain or are contained
by it, producing a reverse-links.json used by leaflet-atlas detail panels.

Output format:
{
  "layerId": {
    "featureIndex": {
      "otherLayerId": [
        { "index": featureIndex, "label": "Feature Name" }
      ]
    }
  }
}
"""

import json
import os
from shapely.geometry import shape
from shapely import prepare

LAYERS_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'public', 'data', 'layers')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'site', 'public', 'data', 'reverse-links.json')

# Label property per layer — only layers that need a non-fallback property or
# explicit None (= no label).  Layers omitted here use the fallback chain in
# get_label(): NOM, Nom, nom, NOM_COM, NOM_DEP, name, NOM_ETBS.
LABEL_PROPS = {
    'administratif--perimetre-parc': 'NOM_PNR',
    'demographie--etablissements-scolaires-fermes': 'appellatio',
    'demographie--etablissements-scolaires-ouverts': 'appellatio',
    'hydrographie--bassins-hydrographiques': 'LbBH',
    'hydrographie--ct-aron-bassin': 'NOM_BVTopo',
    'hydrographie--ct-aron-cours-eau': 'TOPONYME',
    'hydrographie--ct-aron-sous-bassins': 'TopoOH',
    'hydrographie--gemapi-epci': 'NOM_EPCI',
    'nature-environnement--forets-anciennes': None,
    'nature-environnement--forets-deboisees': None,
    'nature-environnement--forets-recentes': None,
    'nature-environnement--tourbieres-points': 'nom_site',
    'nature-environnement--tourbieres-surfaces': 'nom_site',
    'patrimoine-culture--cinecyclo': 'NOM_MAJUSC',
    'paysages--enjeux': 'ENJEU',
    'paysages--limites-entites': 'TYPE',
    'paysages--routes-interet-paysager': 'ENTITE',
    'programmes--parcelles-acquises': 'commune',
    'tourisme-economie--chemins-reels-bibracte': None,
    'tourisme-economie--routes-departementales-bibracte': None,
}

# Container layers: polygon layers that "contain" other features.
# Order matters: larger containers first for efficiency.
CONTAINER_LAYERS = [
    'administratif--departements',
    'administratif--epci',
    'administratif--communes',
    'paysages--entites-paysageres',
    'paysages--sous-entites-paysageres',
    'nature-environnement--natura2000',
]

# Skip layers that have no meaningful labels or too many features to link usefully
SKIP_LAYERS = {
    'nature-environnement--forets-anciennes',
    'nature-environnement--forets-deboisees',
    'nature-environnement--forets-recentes',
}

# Max reverse links per container feature per layer (avoids huge lists)
MAX_REVERSE_PER_LAYER = 50


def get_label(layer_id, props):
    """Get display label for a feature."""
    if layer_id in LABEL_PROPS:
        prop = LABEL_PROPS[layer_id]
        if prop is None:
            return None
        if props.get(prop):
            return str(props[prop])
    # Fallback: try common label fields
    for field in ('NOM', 'Nom', 'nom', 'NOM_COM', 'NOM_DEP', 'name', 'NOM_ETBS'):
        if props.get(field):
            return str(props[field])
    return None


def load_layer(layer_id):
    """Load a GeoJSON layer and return features with shapely geometries."""
    parts = layer_id.split('--')
    path = os.path.join(LAYERS_DIR, parts[0], parts[1] + '.geojson')
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = []
    for i, feat in enumerate(data.get('features', [])):
        try:
            geom = shape(feat['geometry'])
            if not geom.is_valid:
                geom = geom.buffer(0)
            label = get_label(layer_id, feat.get('properties', {}))
            features.append({
                'index': i,
                'label': label,
                'geometry': geom,
                'type': feat['geometry']['type'],
            })
        except Exception:
            continue
    return features


def add_link(links, layer_a, idx_a, layer_b, idx_b, label_b):
    """Add a bi-directional link."""
    if label_b is None:
        return
    links.setdefault(layer_a, {}).setdefault(str(idx_a), {}).setdefault(layer_b, []).append({
        'index': idx_b,
        'label': label_b,
    })


def main():
    links = {}

    # Load container layers
    containers = {}
    for layer_id in CONTAINER_LAYERS:
        features = load_layer(layer_id)
        if features:
            containers[layer_id] = features
            for f in features:
                prepare(f['geometry'])
            print(f'  Container: {layer_id} ({len(features)} features)')

    # Load all layers
    all_layers = {}
    for root, _dirs, files in sorted(os.walk(LAYERS_DIR)):
        for fname in sorted(files):
            if not fname.endswith('.geojson'):
                continue
            cat = os.path.basename(root)
            name = fname.replace('.geojson', '')
            layer_id = f'{cat}--{name}'
            features = load_layer(layer_id)
            if features:
                all_layers[layer_id] = features

    # For each non-container layer, find which container features contain each feature
    for layer_id, features in all_layers.items():
        if layer_id in CONTAINER_LAYERS:
            continue
        if layer_id in SKIP_LAYERS:
            print(f'  Skipped: {layer_id} ({len(features)} features)')
            continue

        for feat in features:
            # Use centroid for point-like tests (works for points and polygon centroids)
            geom = feat['geometry']
            test_point = geom.centroid if geom.geom_type in ('Polygon', 'MultiPolygon') else geom

            for container_id, container_features in containers.items():
                if container_id == layer_id:
                    continue
                for cf in container_features:
                    try:
                        if cf['geometry'].contains(test_point):
                            # Link: feature -> container
                            add_link(links, layer_id, feat['index'],
                                     container_id, cf['index'], cf['label'])
                            # Link: container -> feature
                            add_link(links, container_id, cf['index'],
                                     layer_id, feat['index'], feat['label'])
                            break  # One match per container layer is enough
                    except Exception:
                        continue

        print(f'  Processed: {layer_id} ({len(features)} features)')

    # Sort and truncate links within each group
    for layer_id in links:
        for feat_idx in links[layer_id]:
            for target_layer in list(links[layer_id][feat_idx].keys()):
                items = links[layer_id][feat_idx][target_layer]
                items.sort(key=lambda x: x['label'] or '')
                if len(items) > MAX_REVERSE_PER_LAYER:
                    links[layer_id][feat_idx][target_layer] = items[:MAX_REVERSE_PER_LAYER]

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(links, f, ensure_ascii=False, separators=(',', ':'))

    # Stats
    total_links = sum(
        len(items)
        for layer in links.values()
        for feat in layer.values()
        for items in feat.values()
    )
    print(f'\nGenerated {OUTPUT_PATH}')
    print(f'  {len(links)} layers with links')
    print(f'  {total_links} total links')


if __name__ == '__main__':
    print('Generating reverse links...')
    main()
