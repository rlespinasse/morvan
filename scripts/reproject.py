#!/usr/bin/env python3
"""Reproject GeoJSON files from EPSG:2154 (Lambert 93) to EPSG:4326 (WGS84)."""

import json
import os
import sys

from pyproj import Transformer

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'layers')
DST_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'public', 'data', 'layers')

transformer = Transformer.from_crs(2154, 4326, always_xy=True)


def reproject_coords(coords):
    """Recursively reproject coordinates from EPSG:2154 to EPSG:4326."""
    if isinstance(coords[0], (int, float)):
        x, y = transformer.transform(coords[0], coords[1])
        result = [round(x, 6), round(y, 6)]
        if len(coords) > 2:
            result.append(coords[2])
        return result
    return [reproject_coords(c) for c in coords]


def reproject_file(src_path, dst_path):
    """Reproject a single GeoJSON file."""
    with open(src_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Remove CRS property (RFC 7946 forbids it)
    data.pop('crs', None)

    for feature in data.get('features', []):
        geom = feature.get('geometry')
        if geom and geom.get('coordinates'):
            geom['coordinates'] = reproject_coords(geom['coordinates'])

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)


def main():
    src_dir = os.path.abspath(SRC_DIR)
    dst_dir = os.path.abspath(DST_DIR)
    count = 0

    for root, _, files in os.walk(src_dir):
        for filename in sorted(files):
            if not filename.endswith('.geojson'):
                continue

            src_path = os.path.join(root, filename)
            rel_path = os.path.relpath(src_path, src_dir)
            dst_path = os.path.join(dst_dir, rel_path)

            print(f'  reproject: {rel_path}')
            reproject_file(src_path, dst_path)
            count += 1

    print(f'\nReprojected {count} files to {dst_dir}')


if __name__ == '__main__':
    main()
