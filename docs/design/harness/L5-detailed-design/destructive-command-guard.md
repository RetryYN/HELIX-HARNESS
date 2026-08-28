---
layer: L5
sub_doc: module-decomposition
status: confirmed
pair_artifact: docs/test-design/harness/L9-destructive-command-guard-integration.md
plan: docs/plans/PLAN-L6-77-destructive-command-guard-design.md
---

# 破壊的 command guard 詳細設計

## 1. 目的と脅威境界

hybrid runtime の未共有成果とhost filesystemを、同値な shell 表現、未分類 Git operation、機械生成された
削除対象、secret egress、監査 I/O failure を使って破壊・流出できないようにする。対象 actor は local AI
runtime / hook caller、対象 tool は shell/edit、Git command、foreign-edit overrideである。認証、release/cutover
の承認権限は本設計で拡張しない。

## 2. モジュール境界

| module | 責務 | 禁止事項 |
|---|---|---|
| command classifier | shell input を command slice へ正規化し destructive taxonomy を返す | marker、filesystem、audit を読むこと |
| override authorizer | block classification と非空理由付き marker を結合する | audit 成功前に allow を返すこと |
| override transaction | `harness.db`へのaudit+nonce durable commit、marker one-shot consume、結果確定を直列化する | I/O failure の握り潰し、sidecar二重store |
| hook adapter | payload 正規化と exit/message 変換 | classifier/transaction logic の複製 |
| worktree state source | 実効cwd、Git common-dir、primary/linked worktree、git status、session touched pathsを一度だけ収集する | runtime別foreign判定、path文字列だけのroot同一性判定 |
| machine safety classifier | 静的単一ファイルと動的・広域・host破壊操作を分離する | 対象を推測してsafeへ倒すこと |
| secret egress runner | proposed write、working/index/outgoing blobを値非表示でscanする | raw secretをmessage/auditへ含めること |

依存方向は `hook/CLI -> worktree state source -> classifier -> transaction` とする。classifier はpure、
state sourceはread-only Git/filesystem port、transactionは注入した`AuditPort` / `MarkerPort`だけを使う。

## 3. 破壊操作 taxonomy

既存 `reset` / `revert` / force push / checkout / restore に加え、次を block する。

- `clean` の force option（`-f` を含む short option cluster、`--force`）。`-n` / `--dry-run` は pass。
- `branch -D`、`branch --delete --force`。
- `stash drop`、`stash clear`。

`merge`、`rebase`、`cherry-pick`、`stash pop|apply`、`am`、`apply`は、常時blockするdestructive
taxonomyではなく**working-tree context付きmutation**として分類する。`apply --check`等のread-only
inspectionはmutationへ含めない。context付きmutationは次のAND条件でだけpassする。

```text
repository identity resolved
AND effective cwd belongs to the same Git common-dir
AND (
  linked worktree
  OR (primary shared root AND foreign uncommitted count == 0)
)
```

primary shared rootに、このsessionがtouchしていないdirty pathが1件でもあれば、mutation対象とのpath重複に
関係なくblockする。identity、git status、session touched sourceのいずれかが取得不能ならunknownとして
fail-closeする。foreign判定はwork-guardと同じstate collectorを使い、Git guardへ別実装を作らない。

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

## 4.1 host破壊・secret egress境界

- `rm`はrepo内の静的な単一ファイルだけpassする。recursive、複数対象、glob/変数/substitution、repo外はblockする。
- `find -delete/-exec rm`、`xargs rm`、Python/Node/PowerShellの削除API、参照script本文の削除APIはsandboxへrouteする。
- `mkfs`/`wipefs`/partition操作、raw deviceへの`dd`、recursive `chmod/chown`、forced broad process killをblockする。
- write/add/commit/pushではhigh-confidence secret markerをscanする。outgoingは最終treeだけでなく未送信各commitのblobを検査する。
- findingはpath、line、markerだけを返し、値をstdout/stderr/DBへ出さない。egress scope不明、script読取不能はfail-closeする。
- hook非対応runtimeと難読化された任意コードはclassifierだけで安全を証明せず、worker isolationを第二境界にする。

同一nonceへの並行呼出しは`BEGIN IMMEDIATE`と`guard_override_transactions.nonce`の一意制約で直列化する。
同じrowにguard kind、operation class、subject/reason digest、状態を永続化し、audit JSONLやnonce sidecarへ
二重書込みしない。競合とprocess restart後の再利用は`blocked_reuse`としてallow回数を1以下に保つ。

SQLite `BUSY` / `LOCKED`だけはbounded retry対象とし、最大5 attempts、attempt間10/20/30/40ms
（connection `busy_timeout`とは別の上限付きbackoff）とする。winner commit後のretryは一意rowを読み
`blocked_reuse`へ収束する。5 attempts exhaustionとnon-busy errorはfail-closeし、markerを保持する。

## 5. 移行境界

`evaluateGitCommandGuard` は compatibility façade として維持する。`.claude` hook、Codex/consumer adapter、
`work-guard-hook` は同じ`guard_override_transactions` transaction primitiveを使用し、raw target/reason/sessionを
sidecarへ保存しない。CLI monolith分割や一般 shell parser置換は
混載せず、unsupported grammar は明示 classification と property oracle で閉じる。
