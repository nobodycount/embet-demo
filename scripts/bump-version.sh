#!/usr/bin/env bash
set -euo pipefail
file="index.html"
if [ ! -f "$file" ]; then
  echo "index.html not found"
  exit 1
fi
current=$(sed -n 's/.*<meta name="app-version" content="\([^"]*\)".*/\1/p' "$file" | head -n1 || true)
if [[ -z "$current" ]]; then
  # insert meta tag after <title> or at end of head
  echo "No app-version meta found, inserting with value 1"
  perl -0777 -pe "s!(<title>.*?</title>)!$1\n    <meta name=\"app-version\" content=\"1\">!s" -i "$file"
  echo "Inserted app-version 1"
  exit 0
fi
if [[ "$current" =~ ^[0-9]+$ ]]; then
  next=$((current + 1))
  perl -0777 -pe "s/(<meta name=\"app-version\" content=\")$current(\">)/\1$next\2/" -i "$file"
  echo "Bumped app-version: $current -> $next"
else
  echo "Current app-version is non-numeric ('$current'), setting to 1"
  perl -0777 -pe "s/(<meta name=\"app-version\" content=\")[^\"]*(\">)/\11\2/" -i "$file"
  echo "Set app-version to 1"
fi
