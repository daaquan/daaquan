#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
release="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$(mktemp /tmp/daaquan-deploy.XXXXXX.tar.gz)"
trap 'rm -f "$archive"' EXIT
SITE_RELEASE="$release" npm run build
npm run typecheck
tar -czf "$archive" -C out .
scp "$archive" "tanuki:/tmp/daaquan-$release.tar.gz"

# Preserve the live upstream configuration; update only the static homepage.
ssh tanuki "sudo -n bash -s" -- "$release" <<'REMOTE'
set -euo pipefail
release="$1"
config=/etc/nginx/conf.d/daaquan.conf
backup="$config.bak-$release"
remote_release="/var/www/daaquan/releases/$release"
old_target=$(readlink /var/www/daaquan/current)
cp "$config" "$backup"
mkdir -p "$remote_release"
tar -xzf "/tmp/daaquan-$release.tar.gz" -C "$remote_release"
chmod -R a+rX "$remote_release"

rollback() {
  cp "$backup" "$config"
  ln -sfn "$old_target" /var/www/daaquan/current.rollback
  mv -Tf /var/www/daaquan/current.rollback /var/www/daaquan/current
  nginx -t && systemctl reload nginx
}
trap rollback ERR

python3 - "$config" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
text = p.read_text()
anchor = '        root /var/www/daaquan/current;\n'
if text.count(anchor) != 1:
    raise SystemExit('Expected exactly one personal-site static root; config was not changed.')
if '        error_page 404 /404.html;' not in text:
    text = text.replace(anchor, anchor + '        error_page 404 /404.html;\n')
p.write_text(text)
PY

# Retain the previous build's hashed assets for tabs open during deployment.
if [ -d "$old_target/_next/static" ]; then
  cp -an "$old_target/_next/static/." "$remote_release/_next/static/"
fi
nginx -t
ln -sfn "$remote_release" /var/www/daaquan/current.next
mv -Tf /var/www/daaquan/current.next /var/www/daaquan/current
systemctl reload nginx
# Reload starts new workers asynchronously; allow them to take over.
verified=false
for attempt in 1 2 3 4 5; do
  if curl --fail --silent --show-error -H 'Host: daaquan.com' http://127.0.0.1/site-build.json -o "/tmp/daaquan-$release-check.json" && python3 - "$release" "/tmp/daaquan-$release-check.json" <<'PY'
import json, sys
try:
    data = json.load(open(sys.argv[2]))
    sys.exit(0 if data.get('release') == sys.argv[1] else 1)
except (ValueError, OSError):
    sys.exit(1)
PY
  then
    verified=true
    break
  fi
  sleep 1
done
test "$verified" = true
trap - ERR
rm -f "/tmp/daaquan-$release.tar.gz" "/tmp/daaquan-$release-check.json"
printf 'Deployed release: %s\n' "$release"
REMOTE
