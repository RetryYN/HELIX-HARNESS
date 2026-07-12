---
layer: L5
sub_doc: module-decomposition
status: draft
pair_artifact: docs/test-design/harness/L9-destructive-command-guard-integration.md
plan: docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
---

# 破壊的 command guard 詳細設計

## 1. 目的と脅威境界

hybrid runtime の未共有成果を、同値な shell 表現、未分類 Git operation、監査 I/O failure を使って
破壊できないようにする。対象 actor は local AI runtime / hook caller、対象 tool は Git command と
foreign-edit override である。認証、remote write、release/cutover の承認権限は本設計で拡張しない。

## 2. モジュール境界

| module | 責務 | 禁止事項 |
|---|---|---|
| command classifier | shell input を command slice へ正規化し destructive taxonomy を返す | marker、filesystem、audit を読むこと |
| override authorizer | block classification と非空理由付き marker を結合する | audit 成功前に allow を返すこと |
| override transaction | `harness.db`へのaudit+nonce durable commit、marker one-shot consume、結果確定を直列化する | I/O failure の握り潰し、sidecar二重store |
| hook adapter | payload 正規化と exit/message 変換 | classifier/transaction logic の複製 |

依存方向は `hook/CLI -> transaction -> classifier` とする。classifier は pure、transaction は注入した
`AuditPort` / `MarkerPort` だけを使う。

## 3. 破壊操作 taxonomy

既存 `reset` / `revert` / force push / checkout / restore に加え、次を block する。

- `clean` の force option（`-f` を含む short option cluster、`--force`）。`-n` / `--dry-run` は pass。
- `branch -D`、`branch --delete --force`。
- `stash drop`、`stash clear`。

global option、nested shell、compound command 内でも同じ分類を維持する。未知・不完全 quote、解析上限超過、
destructive Git slice の可能性を排除できない parser state は fail-close とする。単なる文字列引数中の
`git reset --hard` は command と誤認しない。

## 4. override transaction 保存則

状態遷移は `classified_block -> marker_validated -> audit_committed -> marker_consumed -> allowed` の一方向とする。

1. safe command は audit/marker I/Oを呼ばず passし、markerを保持する。
2. block対象でmarkerが無ければ blockする。
3. marker理由を読み、transaction ID、operation class、redacted command digest、session、timestampを監査する。
4. audit append と必要な durability確認が成功した後だけmarkerを消費する。
5. marker消費成功後、その呼出し一回だけallowする。
6. auditまたはconsumeが失敗した場合はblockする。audit失敗時はmarkerを保持する。
7. consume失敗時はabort監査を残し、同じtransaction IDの再試行をallow済みとして扱わない。

環境変数による明示overrideは互換surfaceとして維持するが、silent bypassにはしない。markerの代わりに
`guard kind + session + subject digest`をvirtual one-shot capabilityとしてconsumeし、同じsession/subjectの
2回目は`blocked_reuse`にする。初回もDB audit commit失敗時はblockする。

raw secret、credential、PII、個人absolute pathはauditへ保存しない。transaction IDでretryを識別し、
同一markerの二重allowを拒否する。

同一nonceへの並行呼出しは`BEGIN IMMEDIATE`と`guard_override_transactions.nonce`の一意制約で直列化する。
同じrowにguard kind、operation class、subject/reason digest、状態を永続化し、audit JSONLやnonce sidecarへ
二重書込みしない。競合とprocess restart後の再利用は`blocked_reuse`としてallow回数を1以下に保つ。

## 5. 移行境界

`evaluateGitCommandGuard` は compatibility façade として維持する。`.claude` hook、Codex/consumer adapter、
`work-guard-hook` は同じ`guard_override_transactions` transaction primitiveを使用し、raw target/reason/sessionを
sidecarへ保存しない。CLI monolith分割や一般 shell parser置換は
混載せず、unsupported grammar は明示 classification と property oracle で閉じる。
