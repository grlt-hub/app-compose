#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

version="${1:-}"
output_name="${2:-}"
[[ -n "$version" ]] || fail "No tag specified"
[[ -n "$output_name" ]] || fail "No output name specified"
version="${version#v}"
repo_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! normalized_version="$(pnpm --dir "$repo_directory" exec semver --version "$version")"; then
  fail "Cannot parse version: \"$version\""
fi

package_version="$(jq -er '.version' "$repo_directory/package.json")"

if [[ "$package_version" != "$version" ]]; then
  fail "Package version from tag \"$version\" mismatches with the current version \"$package_version\""
fi

tag="latest"
if [[ "$normalized_version" == *-* ]]; then
  prerelease="${normalized_version#*-}"
  tag="${prerelease%%.*}"

  # Preserve the original fallback for a numeric zero prerelease identifier.
  if [[ "$tag" == 0 ]]; then
    tag="latest"
  fi
fi

[[ -n "${GITHUB_OUTPUT:-}" ]] || fail "GITHUB_OUTPUT is not set"

printf '%s=%s\n' "$output_name" "$tag" >> "$GITHUB_OUTPUT"
printf 'Resolved version %s with tag %s\n' "$version" "$tag"
