#!/bin/sh
# executor userのhomeが、AI側contextから差し替えられない場所であることを確かめる。
# Appの秘密鍵と状態領域（観測済みreview・停止）を置くため、ここが動くと隔離が成り立たない。
# 使い方: checkhome.sh <executor user> <executor home> <AI側userのhome>
# 拒否のときだけ理由を出して2で終わる（rootでなくても動く。install.shから呼ぶ）。
set -eu
PATH=/usr/sbin:/usr/bin:/sbin:/bin; export PATH
EXEC_USER="${1:-}"; EXEC_HOME="${2:-}"; AI_HOME="${3:-}"
[ -n "$EXEC_USER" ] && [ -n "$EXEC_HOME" ] || { echo "拒否: 引数が足りません" >&2; exit 2; }
[ -d "$EXEC_HOME" ] || { echo "拒否: executor userのhomeがありません: $EXEC_HOME" >&2; exit 2; }
# symlinkを挟むと、検査したpathと書込み先が別になる。実体pathと一致することを求める
REAL="$(readlink -f "$EXEC_HOME")"
[ "$REAL" = "$EXEC_HOME" ] || { echo "拒否: $EXEC_HOME はsymlinkを含みます（実体: $REAL）" >&2; exit 2; }
[ "$(stat -c %U "$EXEC_HOME")" = "$EXEC_USER" ] || { echo "拒否: home $EXEC_HOME が $EXEC_USER の所有ではありません" >&2; exit 2; }
# home自身も他のuserから書けないこと（既存userのhomeをそのまま使う場合に効く）
HM="$(stat -c %a "$EXEC_HOME")"
case "$HM" in *[2367]) echo "拒否: home $EXEC_HOME が他のuserから書けます（$HM）" >&2; exit 2;; esac
case "$HM" in *[2367]?) echo "拒否: home $EXEC_HOME が同じgroupのuserから書けます（$HM）" >&2; exit 2;; esac
# 直下に、別のuserの持ち物やsymlinkが先に置かれていないこと（状態領域・App設定の置き場所の乗っ取りを防ぐ）
for e in "$EXEC_HOME"/* "$EXEC_HOME"/.*; do
  case "${e##*/}" in "*" | ".*" | "." | "..") continue;; esac
  [ ! -L "$e" ] || { echo "拒否: $e はsymlinkです" >&2; exit 2; }
  [ "$(stat -c %U "$e")" = "$EXEC_USER" ] || { echo "拒否: $e が $EXEC_USER の所有ではありません" >&2; exit 2; }
done
[ -z "$AI_HOME" ] || [ "$REAL" != "$(readlink -f "$AI_HOME")" ] || { echo "拒否: AI側userとhomeが同じです" >&2; exit 2; }
# 祖先はすべてroot所有で、他のuserから書けないこと（置き場所ごと差し替えられないため）
D="$(dirname "$EXEC_HOME")"
while :; do
  [ "$(stat -c %U "$D")" = "root" ] || { echo "拒否: $D がroot所有ではありません（homeの置き場所を変えてください）" >&2; exit 2; }
  M="$(stat -c %a "$D")"
  case "$M" in *[2367]) echo "拒否: $D が他のuserから書けます（$M）" >&2; exit 2;; esac
  case "$M" in *[2367]?) echo "拒否: $D が同じgroupのuserから書けます（$M）" >&2; exit 2;; esac
  [ "$D" != "/" ] || break
  D="$(dirname "$D")"
done
exit 0
