#!/usr/bin/env python3
"""Télécharge tous les layers GeoJSON définis dans data/sources.json."""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCES_FILE = BASE_DIR / "data" / "sources.json"
LAYERS_DIR = BASE_DIR / "data" / "layers"

MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
REQUEST_DELAY = 0.5  # rate limiting between requests
TIMEOUT = 60  # seconds


def load_sources():
    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def inject_source_metadata(geojson_data, layer_key, layer_info, fetched_at):
    """Inject _source metadata into the GeoJSON root."""
    geojson_data["_source"] = {
        "dataset_id": layer_info["dataset_id"],
        "dataset_name": layer_info["name"],
        "resource_id": layer_info["resource_id"],
        "dataset_url": layer_info["dataset_url"],
        "layer": layer_key,
        "fetched_at": fetched_at,
    }
    return geojson_data


def fetch_layer(layer_key, layer_info):
    """Download a single layer and save it with _source metadata."""
    category = layer_info["category"]
    filename = layer_key.split("/")[-1] + ".geojson"
    output_dir = LAYERS_DIR / category
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename

    url = layer_info["resource_url"]
    fetched_at = datetime.now(timezone.utc).isoformat()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(url, timeout=TIMEOUT)
            response.raise_for_status()

            geojson_data = response.json()
            geojson_data = inject_source_metadata(
                geojson_data, layer_key, layer_info, fetched_at
            )

            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(geojson_data, f, ensure_ascii=False, indent=2)

            return True, None

        except requests.exceptions.RequestException as e:
            if attempt < MAX_RETRIES:
                print(
                    f"  Retry {attempt}/{MAX_RETRIES} for {layer_key}: {e}",
                    file=sys.stderr,
                )
                time.sleep(RETRY_DELAY * attempt)
            else:
                return False, str(e)

        except json.JSONDecodeError as e:
            return False, f"Invalid JSON: {e}"

    return False, "Max retries exceeded"


def main():
    sources = load_sources()
    layers = sources["layers"]
    total = len(layers)
    success_count = 0
    errors = []

    print(f"Fetching {total} layers...")

    for i, (layer_key, layer_info) in enumerate(layers.items(), 1):
        print(f"  [{i}/{total}] {layer_key}")
        ok, error = fetch_layer(layer_key, layer_info)

        if ok:
            success_count += 1
        else:
            errors.append((layer_key, error))
            print(f"    ERROR: {error}", file=sys.stderr)

        time.sleep(REQUEST_DELAY)

    print(f"\nDone: {success_count}/{total} layers downloaded successfully.")

    if errors:
        print(f"\n{len(errors)} error(s):", file=sys.stderr)
        for layer_key, error in errors:
            print(f"  - {layer_key}: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
