---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/harness/L8-destructive-command-guard.md
plan: docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
---

# 破壊的 command guard 機能設計

## 1. 公開 contract

- `classifyDestructiveGitCommand(command: string): GitCommandClassification`
- `authorizeGuardOverride(classification: GuardBlockClassification, marker): OverrideAuthorization`
- `commitOverrideUse(authorization, ports): OverrideCommitResult`

`GuardBlockClassification` は `guardKind: git | foreign_edit`、operation class、正規化済みsubject digest、
reason codeを持つgeneric transaction inputである。Git classifierとwork-guard classifierはこの型へ変換する。

`GitCommandClassification` は `safe | blocked | indeterminate`、operation class、正規化済み command digest、
parser reasonを持つ。`indeterminate` はblockと同じ実行境界にする。

`OverrideCommitResult` は `allowed | blocked_audit_failure | blocked_consume_failure | blocked_reuse` を区別し、
adapterが例外を成功へ縮退させない。

## 2. classifier

shell token、compound separator、nested shell、Git global optionを正規化した各Git sliceへtaxonomyを適用する。
`env KEY=value` prefixを除去後にGit executableを判定する。short option clusterは意味単位へ展開し、
`clean` はdry-runが含まれる場合でもGitの実意味に基づき分類する。quote/parserが入力全体を消費できなければ
`indeterminate`を返す。

support matrixは `sh|bash|zsh -c`、`command`、`eval`、`env KEY=value`、`git -C`、`--git-dir`、
`--work-tree`、`-c`、compound separator、最大4段のcommand substitutionを明示対応とする。解析深度超過、
unclosed quote、未知executable alias、非literal wrapperは`indeterminate`でblockする。

## 3. transaction 事前・事後条件

pre: classificationがblock相当、markerは非空理由とnonceを持つ。

env overrideではmarker preconditionをvirtual capabilityへ置換し、session IDとsubject digestからnonceを導出する。
virtual consumeは一意row commit後の当該呼出し一回だけ成功し、同一nonceの再利用を拒否する。

post:

- `allowed` ならexactly one committed auditとexactly one marker consumeが存在する。
- audit commit前、consume成功前にはallowしない。
- audit failureはmarkerを保持してblockする。
- consume failureはabortを監査してblockする。
- safe commandとmarker無しblockはportを呼ばない。
- `MarkerPort.consume(expectedNonce)`はatomic compare-and-consumeとし、競合/restart reuseを`blocked_reuse`にする。

invariant: exception、partial write、process retryをpassへ変換しない。audit recordはboundedかつredactedである。
監査schemaはallowlist fieldだけを持ち、SHA-256 digest、文字列256 byte上限、正規化error codeを使う。
SQLite transaction commitとrow一意性を確認し、未commit rowをcommittedとしない。session、parser reason、
例外、abortを含む全fieldでcredential、PII、個人absolute pathをredactする。nonce ledgerはrestart後も永続する。

`AuditPort.commit(record, nonce)`は`harness.db.guard_override_transactions`への一意INSERTを`BEGIN IMMEDIATE`内で行い、
audit recordとnonce reservationを単一atomic commitにする。durable commit前のrollbackはmarkerを保持し、同nonceのretryを
許可する。commit成功後からmarker consumeまでにcrashした場合、rowは予約済みのためrestart後のretryを`blocked_reuse`にする。
JSONL/nonce directory等の別storeへの二重書込みは禁止する。

## 4. adapter 同値性

`.claude/hooks/git-command-guard.ts`、`src/runtime/work-guard-hook.ts`、CLI/consumer hook は同じ結果codeを
exit 0/2へ変換する。adapterごとのbest-effort auditは禁止する。

## 5. Vペア

`docs/test-design/harness/L8-destructive-command-guard.md` の `U-GITGUARD-003..009` を正本oracleとする。
