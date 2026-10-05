#!/usr/bin/env bash
set -euo pipefail

artifact_directory="${1:-}"
tag="${2:-}"

if [[ -z "$artifact_directory" ]]; then
  echo "No artifact directory specified" >&2
  exit 1
fi

if [[ -z "$tag" ]]; then
  echo "No npm tag specified" >&2
  exit 1
fi

artifact_directory="$(cd -- "$artifact_directory" && pwd -P)"
shopt -s nullglob
tarballs=("$artifact_directory"/*.tgz)

if (( ${#tarballs[@]} == 0 )); then
  echo "No package tarballs found" >&2
  exit 1
fi

for tarball in "${tarballs[@]}"; do
  echo "Staging $tarball with tag $tag"
  npm stage publish "$tarball" --tag "$tag" --access public --provenance --ignore-scripts
done
