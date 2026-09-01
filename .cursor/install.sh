#!/usr/bin/env bash
# Cloud Agent install phase for HELIX-HARNESS.
#
# HELIX-HARNESS の package.json は Node.js >=24.15.0 <25 を要求するが、Cloud Agent VM が
# PATH 先頭付近に注入する /exec-daemon/node は v22 系である。そのため単に nvm で Node 24 を
# 入れても bare な `node` は v22 に解決されてしまう。ここでは PATH 最前段に位置し書き込み可能な
# ディレクトリ (/usr/local/cargo/bin) に Node 24 の shim を置き、後続のあらゆる bare コマンド
# (`node` / `npm` / `npx` / `corepack`) が Node 24 を使うようにする。
#
# このスクリプトは冪等である (再実行しても安全)。
set -euo pipefail

REQUIRED_MAJOR=24
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '[helix-install] %s\n' "$*"; }

# 1) Node 24 を用意する。まず nvm を優先し、無ければ公式 tarball で導入する。
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
NODE24_BIN=""

if [ -s "$NVM_DIR/nvm.sh" ]; then
  log "nvm を利用して Node ${REQUIRED_MAJOR} を確保する"
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  nvm install "$REQUIRED_MAJOR" >/dev/null
  nvm alias default "$REQUIRED_MAJOR" >/dev/null 2>&1 || true
  NODE24_BIN="$(dirname "$(nvm which "$REQUIRED_MAJOR")")"
fi

if [ -z "$NODE24_BIN" ] || [ ! -x "$NODE24_BIN/node" ]; then
  log "nvm が使えないため公式 tarball から Node ${REQUIRED_MAJOR} を導入する"
  NODE_VERSION="v24.20.0"
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) NODE_ARCH="linux-x64" ;;
    aarch64 | arm64) NODE_ARCH="linux-arm64" ;;
    *) log "未対応の CPU アーキテクチャ: $ARCH"; exit 1 ;;
  esac
  INSTALL_ROOT="$HOME/.local/node"
  mkdir -p "$INSTALL_ROOT"
  if [ ! -x "$INSTALL_ROOT/node-${NODE_VERSION}-${NODE_ARCH}/bin/node" ]; then
    TARBALL="node-${NODE_VERSION}-${NODE_ARCH}.tar.xz"
    curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/${TARBALL}" -o "/tmp/${TARBALL}"
    tar -xJf "/tmp/${TARBALL}" -C "$INSTALL_ROOT"
  fi
  NODE24_BIN="$INSTALL_ROOT/node-${NODE_VERSION}-${NODE_ARCH}/bin"
fi

log "Node 24 bin: $NODE24_BIN ($("$NODE24_BIN/node" --version))"

# 2) PATH 最前段の書き込み可能ディレクトリに shim を置き、bare コマンドを Node 24 に固定する。
#    /exec-daemon/node (v22) を上書きするのが目的。
SHIM_DIR=""
for cand in /usr/local/cargo/bin; do
  if [ -d "$cand" ] && [ -w "$cand" ]; then
    SHIM_DIR="$cand"
    break
  fi
done

if [ -n "$SHIM_DIR" ]; then
  log "Node 24 shim を $SHIM_DIR へ設置する"
  for bin in node npm npx corepack; do
    if [ -x "$NODE24_BIN/$bin" ]; then
      cat > "$SHIM_DIR/$bin" <<SHIM
#!/usr/bin/env bash
exec "$NODE24_BIN/$bin" "\$@"
SHIM
      chmod +x "$SHIM_DIR/$bin"
    fi
  done
else
  log "警告: PATH 最前段に書き込み可能なディレクトリが見つからず shim を設置できない"
  log "警告: nvm default のみ適用する。bare node が v22 に解決される可能性がある"
fi

# 3) 以降の依存導入・ビルドは Node 24 で実行する。
export PATH="$NODE24_BIN:$PATH"
log "使用する node=$(command -v node) ($(node --version)), npm=$(npm --version)"

cd "$REPO_DIR"
log "npm ci を実行する"
npm ci

log "CLI をビルドする (npm run build)"
npm run build

log "install phase 完了"
