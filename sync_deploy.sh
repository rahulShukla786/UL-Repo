#!/bin/bash
# Copy the app source from UL-Repo into a clean deploy folder for the Databricks App "ul-app".
# Databricks Apps rejects any single file > 50 MB in the source folder, so we leave out:
#   - .git / .github        (git pack files grow past 50 MB)
#   - node_modules / dist   (rebuilt by the app at deploy time)
#   - any file > 50 MB      (keep those in /Volumes/r2a/journal/ul_app_files, served via /api/files/<key>)
# Run after every change in UL-Repo, then deploy ul-app from DEPLOY_DIR.
set -euo pipefail

SRC_DIR="/Workspace/Users/adm_rashukla@bsvadm.bsv.capgemini.com/UL-Repo"
DEPLOY_DIR="/Workspace/Users/adm_rashukla@bsvadm.bsv.capgemini.com/UL-App-Deploy"
MAX_BYTES=52428800  # 50 MB app file limit

mkdir -p "$DEPLOY_DIR"
# Start clean so files deleted in UL-Repo are removed here too
find "$DEPLOY_DIR" -mindepth 1 -delete

cd "$SRC_DIR"
find . -type f \
  -not -path './.git/*' \
  -not -path './.github/*' \
  -not -path './node_modules/*' \
  -not -path './dist/*' \
  -not -name 'sync_deploy.sh' \
  -print0 |
while IFS= read -r -d '' f; do
  size=$(stat -c %s "$f")
  if [ "$size" -gt "$MAX_BYTES" ]; then
    echo "SKIPPED (> 50 MB, keep it in the volume): $f ($size bytes)"
    continue
  fi
  mkdir -p "$DEPLOY_DIR/$(dirname "$f")"
  cp "$f" "$DEPLOY_DIR/$f"
done

echo "Synced to $DEPLOY_DIR"
echo "Files: $(find "$DEPLOY_DIR" -type f | wc -l)  Largest: $(find "$DEPLOY_DIR" -type f -printf '%s %p\n' | sort -n | tail -1)"
