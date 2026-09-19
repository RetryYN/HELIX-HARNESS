#!/bin/sh
# install.sh — Capability Leaseの実行環境をrootで1回だけ組む（POが越えるtrust boundaryのうちOS側の1回）。
#
#   sudo sh install.sh --sha <40桁のcommit> --repo OWNER/NAME --pr <PR番号> [--ai-user NAME] [--exec-user NAME] [--org]
#
# 実行するinstall.shは--shaの版と同じbytesでなければならない（自分で照合し、違えば止まる）。
# --org は、Appを組織のsettingsで作る場合に付ける。repositoryが公開されていることを前提にする（cloneに資格情報を使わない）。
#
# 行うこと（これ以外は行わない）:
#   1. executor用のOS user（既定 helix-exec）を作る。AI側contextはこのuserになれない。
#   2. GitHubから--shaのtreeを取り出し、/opt/helix-lease へroot所有・group/other書込み不可で置く。
#   3. /usr/local/sbin/helix-lease-run を置く（installation tokenを発行してcommandへ渡すwrapper。tokenはAI側へ出さない）。
#   4. /etc/sudoers.d/helix-lease を置く（AI側userが、そのwrapperだけをexecutor userとして実行できる）。
#   5. GitHub Appの作成と installのURLを出す（値の入力は不要。POはbrowserで認可するだけ）。
# root以外では動かない。失敗したら途中で止まる。
set -eu
PATH=/usr/sbin:/usr/bin:/sbin:/bin; export PATH   # 呼出し元のPATHのcommandをrootで走らせない

SHA=""; REPO=""; PR=""; AI_USER="${SUDO_USER:-}"; EXEC_USER="helix-exec"; DEST="/opt/helix-lease"; ORG=""
while [ $# -gt 0 ]; do
  case "$1" in
    --sha) SHA="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --pr) PR="$2"; shift 2;;
    --ai-user) AI_USER="$2"; shift 2;;
    --exec-user) EXEC_USER="$2"; shift 2;;
    --org) ORG="--org"; shift;;
    *) echo "不明な引数: $1" >&2; exit 2;;
  esac
done
[ "$(id -u)" = "0" ] || { echo "rootで実行してください" >&2; exit 2; }
echo "$SHA" | grep -Eq '^[0-9a-f]{40}$' || { echo "--sha は40桁のcommitで指定してください" >&2; exit 2; }
echo "$REPO" | grep -Eq '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$' || { echo "--repo は OWNER/NAME で指定してください" >&2; exit 2; }
[ -n "$AI_USER" ] || { echo "--ai-user を指定してください（AI側contextのOS user）" >&2; exit 2; }
for u in "$AI_USER" "$EXEC_USER"; do
  echo "$u" | grep -Eq '^[A-Za-z_][A-Za-z0-9_-]*$' || { echo "user名の形が不正です: $u" >&2; exit 2; }
done
echo "$PR" | grep -Eq '^[0-9]+$' || { echo "--pr は有効化を運ぶPRの番号で指定してください" >&2; exit 2; }
[ "$AI_USER" != "$EXEC_USER" ] || { echo "AI側userとexecutor userは別にしてください" >&2; exit 2; }
id "$AI_USER" >/dev/null 2>&1 || { echo "AI側user $AI_USER が居ません" >&2; exit 2; }
[ "$(id -u "$EXEC_USER" 2>/dev/null || echo 999)" != "0" ] || { echo "executor userをrootにはできません" >&2; exit 2; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git -c core.attributesFile=/dev/null clone --quiet --no-checkout "https://github.com/$REPO.git" "$TMP/repo"
git -C "$TMP/repo" -c core.attributesFile=/dev/null fetch --quiet origin "$SHA"
git -C "$TMP/repo" cat-file -e "$SHA^{commit}"
rm -rf "$DEST.new"
mkdir -p "$DEST.new"
git -C "$TMP/repo" -c core.attributesFile=/dev/null archive --format=tar "$SHA" | tar -x -C "$DEST.new"
[ -f "$DEST.new/scaffold/lease/leasectl.py" ] || { echo "取り出したtreeにscaffold/leaseがありません" >&2; exit 2; }
# --shaが、指定したPRの現在のheadであること（資格情報なしの公開APIで確かめる。任意のcommitを入れさせない）
PRINFO="$(curl -fsSL -H 'Accept: application/vnd.github+json' "https://api.github.com/repos/$REPO/pulls/$PR" \
  | /usr/bin/python3 -I -c 'import json,sys; d=json.load(sys.stdin); print(d["head"]["sha"], d["state"], d["base"]["ref"])')"
set -- $PRINFO
[ "$1" = "$SHA" ] || { echo "拒否: --sha が PR #$PR の現在のhead（$1）と一致しません" >&2; exit 2; }
[ "$2" = "open" ] && [ "$3" = "main" ] || { echo "拒否: PR #$PR がopenでmainを対象にしていません（$2 $3）" >&2; exit 2; }
# 実行中のこのscript自身が、--shaの版と同じbytesであること（AI側の作業treeの書換えをrootで走らせない）
SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
if ! cmp -s "$SELF" "$DEST.new/scaffold/lease-bootstrap/install.sh"; then
  echo "拒否: 実行中のinstall.shが --sha $SHA の版と一致しません。" >&2
  echo "      次の版を使ってください: $DEST.new/scaffold/lease-bootstrap/install.sh" >&2
  echo "      （そのSHA-256: $(sha256sum "$DEST.new/scaffold/lease-bootstrap/install.sh" | cut -d" " -f1)）" >&2
  exit 2
fi
# 置くtreeの中身をPOが突き合わせられるように、commit・treeとcommand群のdigestを出す
echo "PR #$PR head: $SHA"
echo "tree: $(git -C "$TMP/repo" rev-parse "$SHA^{tree}")"
echo "scaffold/lease のdigest:"
(cd "$DEST.new" && find scaffold/lease scaffold/lease-bootstrap -type f | sort | xargs sha256sum | sed "s/^/  /")
id "$EXEC_USER" >/dev/null 2>&1 || useradd --system --create-home --home-dir "/var/lib/$EXEC_USER" --shell /usr/sbin/nologin "$EXEC_USER"
chmod 0750 "$(getent passwd "$EXEC_USER" | cut -d: -f6)"
if [ -e "$DEST" ]; then rm -rf "$DEST.old"; mv "$DEST" "$DEST.old"; fi
mv "$DEST.new" "$DEST"
chown -R root:root "$DEST"
chmod -R go-w "$DEST"
find "$DEST" -type d -exec chmod 755 {} +
find "$DEST" -type f -exec chmod 644 {} +

cat > /usr/local/sbin/helix-lease-run <<'WRAP'
#!/bin/sh
# helix-lease-run — executor userとしてlease commandを起動する。installation tokenをここで発行し、AI側contextへは出さない。
set -eu
DEST=/opt/helix-lease
# appsetupはここから起動できない（installation tokenと秘密鍵の操作をAI側contextへ出さない）
case "${1:-}" in
  leasectl|leasepost|leaseprobe|leaserecover|leaseboot) CMD="$1"; shift;;
  *) echo "使えるcommand: leasectl leasepost leaseprobe leaserecover leaseboot" >&2; exit 2;;
esac
GH_TOKEN="$(/usr/bin/python3 -I -B "$DEST/scaffold/lease-bootstrap/appsetup.py" token)"
export GH_TOKEN
exec /usr/bin/env -i PATH=/usr/bin:/bin HOME="$HOME" LANG=C.UTF-8 GH_TOKEN="$GH_TOKEN" \
  /usr/bin/python3 -I -B "$DEST/scaffold/lease/$CMD.py" "$@"
WRAP
chown root:root /usr/local/sbin/helix-lease-run
chmod 755 /usr/local/sbin/helix-lease-run

SUDO_TMP="$TMP/sudoers-lease"
cat > "$SUDO_TMP" <<EOF
# Capability Lease: AI側contextは、executor userとしてこのwrapperだけを、下のcommandに限って実行できる。
# 非常用command（leaserecover）は既定で許可しない。packetのとおり、POが対象を引数に固定した行を、必要なときだけ足す。
#   例: $AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leaserecover 1234 --context R --mode review --apply
Defaults:$AI_USER env_reset
$AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leasectl *
$AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leasepost *
$AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leaseprobe *
EOF
chmod 0440 "$SUDO_TMP"
visudo -cf "$SUDO_TMP" >/dev/null   # 検査に通ってから置く（壊れたfileでsudoを止めない）
install -m 0440 -o root -g root "$SUDO_TMP" /etc/sudoers.d/helix-lease

SUDO_TMP_B="$TMP/sudoers-lease-bootstrap"
cat > "$SUDO_TMP_B" <<EOF
# 有効化の準備の間だけの許可。対象PRを引数に固定する。有効化が済んだらこのfileを消す（commandも有効化後は動かない）。
$AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leaseboot prepare --lease-pr $PR *
$AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leaseboot probe --lease-pr $PR *
$AI_USER ALL=($EXEC_USER) NOPASSWD: /usr/local/sbin/helix-lease-run leaseboot verify --lease-pr $PR
EOF
chmod 0440 "$SUDO_TMP_B"
visudo -cf "$SUDO_TMP_B" >/dev/null
install -m 0440 -o root -g root "$SUDO_TMP_B" /etc/sudoers.d/helix-lease-bootstrap
# 準備commandの対象PRを、root所有のfileでも固定する（sudoersの引数照合だけに頼らない）
mkdir -p /etc/helix-lease
printf '%s\n' "$PR" > /etc/helix-lease/target-pr
chown -R root:root /etc/helix-lease
chmod 0755 /etc/helix-lease
chmod 0644 /etc/helix-lease/target-pr

echo "置き場所: $DEST（root所有）、wrapper: /usr/local/sbin/helix-lease-run、sudoers: /etc/sudoers.d/helix-lease"
echo "AI側userは次の形だけで実行できます: sudo -u $EXEC_USER /usr/local/sbin/helix-lease-run <command> ..."
echo "installation tokenはwrapperの中だけで発行され、標準出力へは出ません（appsetupはAI側から起動できません）。"
echo "続けてGitHub Appの作成に進みます。browserで表示のURLを開いてください。"
# shellcheck disable=SC2086  # ORGは空か--orgのどちらか
exec sudo -u "$EXEC_USER" /usr/bin/python3 -I -B "$DEST/scaffold/lease-bootstrap/appsetup.py" create --repo "$REPO" $ORG
