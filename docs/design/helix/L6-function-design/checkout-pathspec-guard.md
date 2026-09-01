# Checkout Pathspec Guard

## 責務

`git checkout`のtarget identityを、文字列表現ではなく実効repositoryのrefとfilesystem pathから判定する。

## 契約

- `-b`、`-B`、`--orphan`、`--detach`は既存の非破壊分岐を維持する。
- `--`、force、path存在、ref/path衝突はdestructiveとしてblockする。
- pathが存在せず、全targetがcommit refへ解決できる場合だけcheckoutを許可する。
- Git照合失敗やtarget未解決はfail-closeする。
- hook初回評価ではtarget contextを要求し、実効cwd取得後に同じguardを再評価する。

## 非対象

override transaction、restore/reset分類、branch naming authorityは変更しない。
