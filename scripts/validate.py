#!/usr/bin/env python3
"""Validate downloaded GeoJSON layers against sources.json and links.json."""

import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCES_FILE = BASE_DIR / "data" / "sources.json"
LINKS_FILE = BASE_DIR / "data" / "links.json"
LAYERS_DIR = BASE_DIR / "data" / "layers"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_geojson(filepath):
    """Check that a file is valid GeoJSON with features and _source."""
    errors = []
    try:
        data = load_json(filepath)
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]

    if data.get("type") != "FeatureCollection":
        if data.get("type") not in ("Feature", "GeometryCollection"):
            errors.append(f"Unexpected type: {data.get('type', 'missing')}")

    if "_source" not in data:
        errors.append("Missing _source metadata")

    if "features" in data:
        if not isinstance(data["features"], list):
            errors.append("features is not a list")
        elif len(data["features"]) == 0:
            errors.append("WARNING: empty features list")

    return errors


def main():
    sources = load_json(SOURCES_FILE)
    layers = sources["layers"]
    total_errors = 0
    total_warnings = 0
    checked = 0

    print(f"Validating {len(layers)} layers...\n")

    # Check each layer in sources.json exists on disk and is valid
    for layer_key, layer_info in layers.items():
        category = layer_info["category"]
        filename = layer_key.split("/")[-1] + ".geojson"
        filepath = LAYERS_DIR / category / filename

        if not filepath.exists():
            print(f"  MISSING: {layer_key} -> {filepath}")
            total_errors += 1
            continue

        checked += 1
        errors = validate_geojson(filepath)
        warnings = [e for e in errors if e.startswith("WARNING:")]
        real_errors = [e for e in errors if not e.startswith("WARNING:")]

        if real_errors:
            print(f"  ERROR: {layer_key}")
            for e in real_errors:
                print(f"    - {e}")
            total_errors += len(real_errors)

        if warnings:
            for w in warnings:
                print(f"  {w}: {layer_key}")
            total_warnings += len(warnings)

    # Check links.json references exist in sources.json
    print(f"\nValidating links.json...")
    links = load_json(LINKS_FILE)
    layer_keys = set(layers.keys())

    for i, link in enumerate(links["links"]):
        for field in ("from", "to"):
            ref = link[field]
            if ref not in layer_keys:
                print(f"  ERROR: link #{i} references unknown layer: {ref}")
                total_errors += 1

    # Check for orphan files on disk not in sources.json
    print(f"\nChecking for orphan files...")
    expected_files = set()
    for layer_key, layer_info in layers.items():
        category = layer_info["category"]
        filename = layer_key.split("/")[-1] + ".geojson"
        expected_files.add(LAYERS_DIR / category / filename)

    for geojson in LAYERS_DIR.rglob("*.geojson"):
        if geojson not in expected_files:
            print(f"  ORPHAN: {geojson.relative_to(BASE_DIR)}")

    # Summary
    print(f"\n{'='*50}")
    print(f"Checked: {checked}/{len(layers)} layers")
    print(f"Errors: {total_errors}")
    print(f"Warnings: {total_warnings}")

    if total_errors > 0:
        sys.exit(1)

    print("All validations passed!")


if __name__ == "__main__":
    main()
