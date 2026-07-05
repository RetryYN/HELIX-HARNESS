---
schema_version: skill.v1
name: ci-deploy-and-rollback
skill_type: process
applies_to:
  layers:
    - L7
    - L9
    - L11
    - L12
    - L13
    - L14
  drive_models:
    - Forward
    - Add-feature
    - Recovery
    - Incident
---

# CI deploy と rollback

harness release と、harness が orchestrate する target-repo deploy のための
deploy-gate 順序、rollback 基準、証跡責務を扱う。
passing `harness-check` なしに deploy を開始しない。rollback criteria は問題発生後ではなく deploy 前に定義する。

## この skill を読む条件

- PLAN が Forward cycle の L12（deploy + acceptance）へ到達する。
- Add-feature increment を flag 配下で ship する準備ができている。
- Recovery rollback または Incident hotfix path が必要。

## Pre-deploy gate（必須）

すべて green でなければならない。failure は deploy を block する。

```
bun run lint          # Biome check（full output。tail へ pipe しない）
bun run test          # Vitest
bun run typecheck     # tsc --noEmit
helix doctor         # harness structural health + plan governance
helix plan lint      # PLAN schema、steps、dependency existence
helix review --uncommitted
```

`--no-verify` で bypass しない。local-green push が CI で失敗する場合、
ほぼ必ずこのどれかが skip されている。

## Strategy selection（戦略選択）

| Signal | Strategy |
|---|---|
| Forward L12, no data migration | rolling / direct replace、即時 smoke-test |
| Add-feature behind a flag | flag-off で deploy、post-verify 後に enable（flag-off = instant rollback） |
| Recovery after regression | last known-good へ revert。data が変わった場合は DB down-migration を実行 |
| Incident hotfix | minimum-change branch、two-party review、安定化後に main へ merge |

## Post-deploy smoke test（deploy 後 smoke test）

1. Health endpoint が 200 を返す。
2. Primary user path が expected status を返す。
3. deployed state に対する `helix doctor` が structural drift なしを示す。
4. pre-deploy baseline に対して error rate を約 15 分監視する。

結果は `.helix/audit/` に記録する。

## Rollback criteria（deploy 前に PLAN で定義）

典型的な trigger は、baseline を一定 margin 以上上回る error rate、set threshold を超える
p95 latency degradation、primary path の non-2xx/3xx、data-integrity failure。
Sev1 trigger では second opinion を待たず rollback する。extended downtime より rollback の方が安全である。

## Rollback procedure（手順）

1. `.helix/audit/` に intent（timestamp + reason）を宣言する。
2. 実行する。flag-guarded feature は flag-off。rolling deploy は previous tagged artifact を redeploy。
   data が変わった場合は app code を戻す前に DB down-migration を実行し、その後 integrity を確認する。
3. rolled-back state に対して smoke-test sequence を再実行する。
4. final state を `outcome=rollback` 付きで記録する。

## rollback 後

rollback は resolution ではない。stable になったら Recovery PLAN（branch `hotfix/*`）を開き、
root cause を記録し、fix を design-level（`add-design`）または implementation-only（L7 の `add-impl`）
に分類し、re-deploy 前に failure を捕捉できた regression test を追加する。
PLAN boundary で `helix handover` を実行する。

## DB migration safety（DB migration 安全性）

- one deploy で safe: nullable/default column add、concurrent index add、new table。
- staged expand-contract（multi-deploy）: column rename（add → dual-write → read new → drop old）を段階実施する。
  NOT NULL add（backfill first）、large backfill（background job、inline ではない）。
- one deploy で禁止: staging run なしの live data type change、または lock を取る table rebuild。

## Completion checklist（完了 checklist）

- [ ] Pre-deploy gate が green（lint / test / typecheck / doctor / plan lint）。
- [ ] Strategy + rollback threshold を cutover 前に PLAN へ記録済み。
- [ ] Smoke test が pass し、monitoring window が clean。
- [ ] Evidence が `.helix/audit/` にあり、PLAN は `helix plan use` で進行済み。
- [ ] rollback した場合: root cause + regression test 付きで Recovery PLAN を開いている。
