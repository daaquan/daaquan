#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
release="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$(mktemp /tmp/daaquan-deploy.XXXXXX.tar.gz)"
trap 'rm -f "$archive"' EXIT
SITE_RELEASE="$release" npm run build
npm run typecheck
tar -czf "$archive" -C out .
redirects="$(mktemp /tmp/daaquan-redirects.XXXXXX.conf)"
trap 'rm -f "$archive" "$redirects"' EXIT
node ops/locale-redirects.mjs nginx > "$redirects"
scp "$archive" "tanuki:/tmp/daaquan-$release.tar.gz"
scp "$redirects" "tanuki:/tmp/daaquan-$release-redirects.conf"

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

python3 - "$config" "/tmp/daaquan-$release-redirects.conf" <<'PY'
from pathlib import Path
import sys
config, redirects = Path(sys.argv[1]), Path(sys.argv[2])
text = config.read_text()
block = redirects.read_text()
if not block.startswith('    # daaquan-locale-redirects\n') or '    # /daaquan-locale-redirects\n' not in block:
    raise SystemExit('Redirect block is missing its markers; config was not changed.')
anchor = '        root /var/www/daaquan/current;\n'
if text.count(anchor) != 1:
    raise SystemExit('Expected exactly one personal-site static root; config was not changed.')
if '        error_page 404 /404.html;' not in text:
    text = text.replace(anchor, anchor + '        error_page 404 /404.html;\n')
start = text.find('    # daaquan-locale-redirects\n')
end = text.find('    # /daaquan-locale-redirects\n')
if start != -1 and end != -1 and end > start:
    end += len('    # /daaquan-locale-redirects\n')
    text = text[:start] + block + text[end:]
else:
    needle = '    location / {\n        root /var/www/daaquan/current;\n'
    if text.count(needle) != 1:
        raise SystemExit('Could not find the personal-site location; config was not changed.')
    text = text.replace(needle, block + needle, 1)
config.write_text(text)
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
notes_status=$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: daaquan.com' http://127.0.0.1/notes/ai-tools/)
root_status=$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: daaquan.com' http://127.0.0.1/)
notes_location=$(curl -s -D - -o /dev/null -H 'Host: daaquan.com' http://127.0.0.1/notes/ai-tools/ | awk 'tolower($1)=="location:" {print $2}' | tr -d '\r')
root_location=$(curl -s -D - -o /dev/null -H 'Host: daaquan.com' http://127.0.0.1/ | awk 'tolower($1)=="location:" {print $2}' | tr -d '\r')
test "$notes_status" = 301
test "$root_status" = 302
case "$notes_location" in
  /ja/notes/ai-tools/|http://daaquan.com/ja/notes/ai-tools/|https://daaquan.com/ja/notes/ai-tools/) ;;
  *) echo "Unexpected notes redirect: $notes_location" >&2; exit 1 ;;
esac
case "$root_location" in
  /ja/|http://daaquan.com/ja/|https://daaquan.com/ja/) ;;
  *) echo "Unexpected root redirect: $root_location" >&2; exit 1 ;;
esac
trap - ERR
rm -f "/tmp/daaquan-$release.tar.gz" "/tmp/daaquan-$release-check.json" "/tmp/daaquan-$release-redirects.conf"
printf 'Deployed release: %s\n' "$release"
REMOTE
