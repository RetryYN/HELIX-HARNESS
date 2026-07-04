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

`.ut-tdd/handover/CURRENT.json` と session log digests を使って sessions 間の continuity を維持する方法、
および handover carry state が実際に true かを verify する方法を扱う
（FR-L1-31 session log、FR-L1-42 handover state の方針）。

## この skill を読む条件

- `CURRENT.json` handover が存在する new session を開始する。
- PLAN を close する、または drive-model cycle boundary を越える。
- task が複数 session または runtime switch をまたぐ。
- Scrum S3 verify または Recovery exit が、次 session 前に handover evidence を必要とする。

## CURRENT.json anatomy（構造）

`ut-tdd handover` は `.ut-tdd/handover/CURRENT.json` を書く。この file は次を含む。

| Field | 記録内容 |
|---|---|
| `carry` | previous session が incomplete と報告した items |
| `completed` | previous session が done と報告した items |
| `open_plans` | non-terminal status の PLAN IDs |
| `session_digest` | closing session の compressed event log |

**`carry` は truth ではなく claim として扱う。** それに基づき行動する前に:

1. `git log --oneline -20` を実行し、completed work を actual commits と cross-check する。
2. `ut-tdd doctor` を実行し、structural state を確認する。
3. `ut-tdd status` を実行し、current drive mode と open PLANs を確認する。
4. `git log` または `doctor` output と conflict する carry item は stale。
   進む前に update または remove する。

## Session-close procedure（終了時手順）

任意の PLAN completion または session boundary で実行する。

```
ut-tdd handover
```

これは session log を flush し、`CURRENT.json` を rewrite する。task が drive-cycle boundary
（例: Add-feature trace-freeze）を越える場合は、次も実行する。

```
ut-tdd status
ut-tdd doctor
```

両方の outputs を session-close evidence として `.ut-tdd/audit/<session-id>-close.txt` に capture する。
handover narrative だけに依存しない。

## Session-start procedure（開始時手順）

1. `.ut-tdd/handover/CURRENT.json` が存在し stale でない場合に読む
   （timestamp が約 24 時間以内）。
2. 各 `carry` item を `git log` と current file state で verify する。
   既に commit 済みの item を re-report しない。
3. `open_plans` を `ut-tdd doctor` output と照合する。
   open と記載されているが governance に存在しない PLAN は stale handover entry。
4. raw handover text ではなく verified carry に基づいて進む。

## Session log and digests（session log と digest）

`SessionStart` と `Stop` hooks は `src/runtime/session-log.ts` に書き込む。
各 session は `harness.db` 内の PLAN digest に compress される。digests は `ut-tdd metrics` と
`ut-tdd find` で query できる。session log entries は metadata のみを保存し、
prompt text、credentials、PII は保存しない。

## Staleness and multi-session gaps（stale 判定と session 間隔）

24 時間を超えた `CURRENT.json` は potentially stale として扱う。possibly outdated carry を伝播させず、
open items を scratch から verify する。handover flush なしに複数 sessions が経過した場合は、
`ut-tdd db rebuild` を実行し、current `docs/plans/` と `.ut-tdd/` on-disk state から harness state を re-project する。

## Anti-patterns（避けるパターン）

- `git log` cross-check なしに raw `CURRENT.json` carry を PO へ forward する。
  stale carry は false incident reports を生む。
- drive-cycle boundary で `ut-tdd handover` を skip する。
  次 session が blind で始まる。
- session decisions を committed docs や ADRs ではなく handover file に保存する。
  handover は continuity glue であり、authoritative record ではない。
