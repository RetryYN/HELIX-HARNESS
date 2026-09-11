---
title: "Python意味コアverification verb canary L7テスト設計"
layer: L7
artifact_type: test_design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / QA
plan: docs/plans/PLAN-L6-108-python-semantic-canary-pair-freeze.md
parent_design: docs/design/helix/L6-function-design/python-semantic-verification-verb-canary.md
pair_artifact: docs/design/helix/L6-function-design/python-semantic-verification-verb-canary.md
github_issue_id: 1734
---

# Python意味コアverification verb canary L7テスト設計

| U-ID | L6 API pointer | 反例／刺激 | 期待結果 | 実装予定test citation |
|---|---|---|---|---|
| `U-PYSEM-001` | `helix.semantic.verification-verb.request.v1` | version不一致、unknown key、空request ID、digest改変、不正UTF-8 | strict requestを拒否しPython spawn 0 | `tests/python-semantic-verification-verb-contract.test.ts` |
| `U-PYSEM-002` | `helix.semantic.verification-verb.result.v1` | whitelist外token、null欠落、rule-set digest不一致、command本文混入 | closed result schemaで拒否しauthoritative result 0 | `tests/python-semantic-verification-verb-contract.test.ts` |
| `U-PYSEM-003` | `runVerificationVerbSemanticCore` | 未登録descriptor、interpreter drift、余剰stdout、複数result line | process／protocol failureとしてfail-closeしresultをadmitしない | `tests/python-semantic-verification-verb-runtime.test.ts` |
| `U-PYSEM-004` | `runVerificationVerbSemanticCore` | timeout、resource超過、network接続、protected root／credential要求 | processを終了・fenceしprotected writeとcredential exposureを0にする | `tests/python-semantic-verification-verb-sandbox.test.ts` |
| `U-PYSEM-005` | `revalidateVerificationVerbResult` | payload変更＋digest据置き、request／contract／rule-set provenance差替え | Node再計算不一致でquarantineしconsumer call 0 | `tests/python-semantic-verification-verb-adapter.test.ts` |
| `U-PYSEM-006` | `compareVerificationVerbShadow` | rule順序逆転、case normalization除去、`vitest`と`lint`誤併合、unknown強制分類 | parity mismatch findingとredacted digestを返しPython採用0 | `tests/python-semantic-verification-verb-parity.test.ts` |
| `U-PYSEM-007` | `selectVerificationVerbAuthority` | shadow中のPython active採用、failure時silent fallback、差分のgrouping混入 | TS結果だけを返しfailure／差分をtyped evidenceへ分離する | `tests/python-semantic-verification-verb-consumer.test.ts` |
| `U-PYSEM-008` | `rollbackVerificationVerbCanary` | rollback後もPython起動、TS結果変化、stale receiptのcurrent扱い | Python invocation 0、TS結果不変、旧receipt historical化を証明する | `tests/python-semantic-verification-verb-rollback.test.ts` |

8件はすべて未実装である。本pairのreview greenをunit greenへ読み替えず、後続実装PLANが各test pathを生成し、
L6 API pointerと個別IDを`verification_bindings`でexact joinしてからTDD Redへ進む。
