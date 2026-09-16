#!/usr/bin/env bash
set -euo pipefail
# Keep the historical entry point; parse YAML once so all metadata is preserved.
exec python3 "$(dirname "$(realpath "$0")")/scripts/build-tell.py"
