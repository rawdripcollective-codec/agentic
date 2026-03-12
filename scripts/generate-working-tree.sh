#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

OUT_FILE="WORKING_TREE.md"

{
  echo "# Working Tree"
  echo
  echo "Canonical sorted file inventory for this repository."
  echo
  echo "## Regenerate"
  echo
  echo '```bash'
  echo './scripts/generate-working-tree.sh'
  echo '```'
  echo
  echo "## Sync to GitHub organization (Raw Drip Collective)"
  echo
  echo '```bash'
  echo '# Example: set org remote and push current branch'
  echo 'git remote add rawdrip git@github.com:raw-drip-collective/agentic.git'
  echo 'git push -u rawdrip "$(git rev-parse --abbrev-ref HEAD)"'
  echo '```'
  echo
  echo "## Files (sorted)"
  echo
  echo '```text'
  rg --files | sort
  echo '```'
} > "$OUT_FILE"

echo "Wrote $OUT_FILE"
