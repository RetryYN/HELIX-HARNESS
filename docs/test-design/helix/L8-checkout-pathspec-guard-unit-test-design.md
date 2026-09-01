# Checkout Pathspec Guard Unit Test Design

## Oracle

- `git checkout .`、tracked path、`HEAD path`、未解決targetをblockする。
- branchと同名pathが存在する曖昧targetをblockする。
- existing branchだけを指すtargetと`checkout -b`を許可する。
- hookが実cwdを使って判定することを一時repositoryで実測する。

## 回帰境界

既存destructive command、nested shell、override audit、contextual mutation oracleを維持する。
