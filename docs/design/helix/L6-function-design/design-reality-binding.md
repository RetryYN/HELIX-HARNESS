---
title: "Design Reality Binding関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
parent_design: docs/design/helix/L5-detail/design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-reality-binding-function-unit-test-design.md
behavior_contract_id: DESIGN-REALITY-BINDING-001
responsibility_owner: design-reality-binding
---

# Design Reality Binding関数設計

| 関数 | 契約 | failure |
|---|---|---|
| `analyzeDesignRealityBinding(repoRoot, files?)` | L4/L5 bindingをexact HEADで一括検査 | finding配列を返し例外でgreen化しない |
| `evaluateFailureWitness(witness, mutation?)` | identity解決後にpost-checkを実行 | 0件、複数、宣言reason、OKを区別 |
| `designRealityBindingMessages(result)` | doctor／PLAN lint共通表示 | findingを最大12件表示 |

loaderはrepository-contained realpathだけを読み、TypeScript exportはASTで検査する。source digestはraw UTF-8 byte列のSHA-256とする。
planned assetはdownstream PLAN実在と予定artifact記載を確認し、compatibility assetはcompletion根拠に使わない。
