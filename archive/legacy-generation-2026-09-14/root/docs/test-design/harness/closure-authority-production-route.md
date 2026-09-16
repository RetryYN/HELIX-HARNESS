---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/closure-authority-production-route.md
plan: docs/plans/PLAN-L6-74-closure-authority-production-route.md
---

# closure authority本番経路 テスト・検証設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CABF-011 | public API surface | 3 public exportの欠落、CLI/verifierのprivate fork、同名local shadowを拒否する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-012 | run保存則とwindow | 362件の全bundleと最大100件の連続windowを生成し、missing/excess/duplicate/order/window digest driftを拒否する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-013 | HEAD provenance | expected SHA、HEAD、local origin/main、branch、tracked blob、filesystem bytesをexact joinし、detached/missing ref/stale expected SHAを拒否する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-014 | worktree/source境界 | staged、tracked差分、untracked、case-fold collision、symlink ancestry、submodule source、path traversalの各fixtureを拒否する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-015 | canonical allowlist | strict schemaのtracked canonical pathだけを受理し、missing、override、unknown field、duplicate gate、untracked、symlink、HEAD driftをtyped errorにする | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-016 | CLI contract | command登録、必須3 option、単一JSON stdout、stderr診断、exit 0/1/2、persistent DB欠落/schema不整合を固定する | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-017 | read-only境界 | 成功・全error経路でregistry/PLAN/test/DB/status/approval/evidence directoryのbefore/after digestが同一で、`--out`が存在しない | `tests/closure-authority-backfill-production-route.test.ts` |
| U-CABF-018 | builder/verifier同型 | 初回runとreview/apply再構築が同じcandidate builderで同一bundle digestとなり、scope/source/partial bundle driftを拒否する | `tests/closure-authority-backfill-production-route.test.ts` |

## 検証戦略

pure fixtureだけでなく、temp Git repository、bare origin/main、persistent harness.db、tracked source blobを使う。
production CLI E2Eは実processで実行し、副作用digestとstdout/stderr/exit codeを観測する。
