---
schema_version: skill.v1
name: context-memory
skill_type: process
applies_to:
  layers:
    - L1
    - L3
    - L5
    - L6
    - L7
    - L8
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Scrum
    - Reverse
    - Recovery
    - Incident
    - Refactor
    - Retrofit
---

# context memory（session 継続記憶）

`harness.db` continuation projection、session event、共有 memory journal を使って sessions 間の
continuity を維持し、再開状態を authored sources と照合する方法を扱う
（FR-L1-31 session log、FR-L1-42 context continuity の継続契約）。

## この skill を読む条件

- new session を開始し、continuation projection から作業を再開する。
- PLAN を close する、または drive-model cycle boundary を越える。
- task が複数 session または runtime switch をまたぐ。
- Scrum S3 verify または Recovery exit が、次 session 前に continuation evidence を必要とする。

## continuation projection の構造

append-only session event を先に durable appendし、その event ID と payload hash を使って
`harness.db` の active PLAN、blocker、next action、event frontier を冪等投影する。checkpoint は
projection 成功後だけ公開する。共有 memory は補足 breadcrumb であり、DB state を上書きしない。

再開前に:

1. `git log --oneline -20` を実行し、completed work を actual commits と cross-check する。
2. `helix doctor` を実行し、structural state を確認する。
3. `helix status` を実行し、current drive mode と open PLANs を確認する。
4. authored sources と DB projection が競合する場合は進行を止め、replay/rebuild または recovery へ送る。

## Session-close procedure（終了時手順）

PLAN completion は event-first 経路で continuation state を更新する。task が drive-cycle boundary
（例: Add-feature trace-freeze）を越える場合は、次を実行する。

```
helix status
helix doctor
```

両方の outputs と event/projection frontier を session-close evidence として監査証跡に残す。
chat や prose narrative だけに依存しない。

## Session-start procedure（開始時手順）

1. `helix status` で `harness.db` continuation projection の active PLAN、blocker、next action を読む。
2. projected state を `git log` と authored PLAN state で verify し、完了済み item を再報告しない。
3. `helix doctor` で event frontier、projection、memory breadcrumb の整合を確認する。
4. SessionStart の bounded memory recallを補助情報として読み、DBと矛盾する entryでは進まない。

## Session log and digests（session log と digest）

`SessionStart` と `Stop` hooks は `src/runtime/session-log.ts` に書き込む。
各 session は `harness.db` 内の PLAN digest に compress される。digests は `helix metrics` と
`helix find` で query できる。session log entries は metadata のみを保存し、
prompt text、credentials、PII は保存しない。

## Staleness and multi-session gaps（stale 判定と session 間隔）

event frontier と projection frontier が一致しない状態は stale として扱い、outdated next action を伝播させない。
projection が欠落または破損した場合は `helix db rebuild` で authored sources と append-only events から再投影し、
`helix doctor` が green になるまで memory breadcrumb だけで進行しない。

## Anti-patterns（避けるパターン）

- `git log` と authored sources の cross-check なしに projected next action を PO へ転送する。
- drive-cycle boundary で event append/projection の確認を省略する。
- session decisions を committed docs、PLAN、ADRではなく memory breadcrumbだけに保存する。
- provider evidenceをcontinuationやrecall sourceへjoinする。provider evidenceは監査専用である。
