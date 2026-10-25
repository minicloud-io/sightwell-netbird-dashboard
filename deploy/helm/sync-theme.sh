#!/usr/bin/env bash
# Copies deploy/idp-theme (the source of truth) into the chart's files/, so the
# ConfigMaps the chart renders always match the theme in this repository.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
src="$here/../idp-theme"
dst="$here/sightwell-connectivity/files/idp-theme"
rm -rf "$dst"
mkdir -p "$dst"
cp -R "$src"/templates "$src"/static "$src"/themes "$src"/robots.txt "$src"/LICENSE-NETBIRD-TEMPLATES "$dst"/
echo "synced $(find "$dst" -type f | wc -l | tr -d ' ') files into $dst"
