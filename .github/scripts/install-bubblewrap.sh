#!/usr/bin/env bash

set -euo pipefail

if [[ "${RUNNER_OS:-Linux}" != "Linux" ]]; then
  echo "ci_isolation_backend_unsupported_runner_os" >&2
  exit 1
fi

. /etc/os-release

if [[ "${ID:-}" != "ubuntu" || "${VERSION_ID:-}" != "24.04" ]]; then
  echo "ci_isolation_backend_runner_version_mismatch" >&2
  exit 1
fi

codename="${VERSION_CODENAME:-}"
if [[ "$codename" != "noble" ]]; then
  echo "ci_isolation_backend_codename_mismatch" >&2
  exit 1
fi

source_list="$(mktemp "${RUNNER_TEMP:-/tmp}/helix-ubuntu.XXXXXX.list")"
trap 'rm -f "$source_list"' EXIT
apt_options=(
  -o "Dir::Etc::sourcelist=$source_list"
  -o Dir::Etc::sourceparts=-
  -o Acquire::Retries=3
  -o Acquire::http::Timeout=30
  -o Acquire::https::Timeout=30
)

if dpkg-query -W -f='${Status}' bubblewrap 2>/dev/null | grep -q '^install ok installed$'; then
  echo "bubblewrap is already installed on the runner"
else
  printf '%s\n' \
    "deb [arch=amd64] https://archive.ubuntu.com/ubuntu $codename main universe" \
    "deb [arch=amd64] https://archive.ubuntu.com/ubuntu $codename-updates main universe" \
    "deb [arch=amd64] https://archive.ubuntu.com/ubuntu $codename-backports main universe" \
    "deb [arch=amd64] https://security.ubuntu.com/ubuntu $codename-security main universe" > "$source_list"
  sudo timeout 180s env DEBIAN_FRONTEND=noninteractive apt-get update "${apt_options[@]}"
  sudo timeout 180s env DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends bubblewrap "${apt_options[@]}"
fi

test -x /usr/bin/bwrap
if sysctl -n kernel.apparmor_restrict_unprivileged_userns >/dev/null 2>&1; then
  sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
fi
