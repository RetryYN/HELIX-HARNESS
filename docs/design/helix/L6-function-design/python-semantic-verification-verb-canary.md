---
title: "Python意味コアverification verb canary機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: docs/plans/PLAN-L6-1734-python-semantic-canary-pair-freeze.md
parent_design: docs/design/helix/L6-function-design/python-worker-runtime.md
pair_artifact: docs/test-design/helix/L7-python-semantic-verification-verb-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
github_issue_id: 1734
behavior_contract_id: PYTHON-SEMANTIC-FOUNDATION-CANARY-001
responsibility_owner: python-semantic-runtime
---

# Python意味コアverification verb canary機能設計

## 目的と境界

HDS-HIL-12の汎用worker設計を入力とし、最初のsemantic atom `classifyVerificationVerb`を載せるcurrent
L6設計deltaを定義する。Python側は意味結果の生成、Node側は実行・再検証・採否を所有し、shadow期間の
active authorityは既存TS実装に固定する。本書はruntime実装済みを主張しない。

## 公開APIと個別oracle対応

| API／契約 | 責務 | DbC | L7 oracle |
|---|---|---|---|
| `helix.semantic.verification-verb.request.v1` | 共有versioned contract | `request_id`、contract version、UTF-8 command、input/config digestだけを許しunknown keyを拒否する | `U-PYSEM-001` |
| `helix.semantic.verification-verb.result.v1` | Python semantic core | `vitest \| tsc \| doctor \| lint \| eslint \| test \| null`の閉集合とrequest/input/config/rule-set digestを返す | `U-PYSEM-002` |
| `runVerificationVerbSemanticCore` | Node process boundary | registry済みdescriptor、exact interpreter、bounded stdio、deadline、network default deny、環境allowlistで一度だけ起動する | `U-PYSEM-003`, `U-PYSEM-004` |
| `revalidateVerificationVerbResult` | Node transactional boundary | strict JSONL exactly-one resultとschema/provenance/digestを再計算し、Python出力を実行しない | `U-PYSEM-005` |
| `compareVerificationVerbShadow` | Node observation boundary | 同じredacted input digestに対するTS/Python結果をexact比較し、不一致時はtyped findingだけを返す | `U-PYSEM-006` |
| `selectVerificationVerbAuthority` | Node consumer boundary | shadow中はTS結果のみを返し、Python failure/parity差をactive groupingへ混入させない | `U-PYSEM-007` |
| `rollbackVerificationVerbCanary` | Node rollback boundary | pointerをTS-onlyへ戻し、同じfixtureでPython invocation 0とTS結果不変を証明する | `U-PYSEM-008` |

## 意味分類規則

Python contractは現行TSと同じ先勝ち規則をversioned dataとして保持する。明示toolの優先順は`vitest`、
`typecheck|tsc`、`doctor`、`biome`、`eslint`、続いてscript aliasの`run test`、`run lint`とする。
case normalizationを行い、whitelist外は`null`にする。path中の`lint`や任意script名だけで分類せず、unknownを
`test`へ強制分類しない。

## failureと権威境界

protocol/schema/digest違反はquarantine、timeout/resource超過はnon-accepted terminalへ送る。parity差は
`PYSEM_VERIFICATION_VERB_PARITY_MISMATCH` findingとして記録するが、Python結果をcommit／escalation groupingへ
採用しない。Pythonにはrepository、DB path、credential、`.helix/`、Git/GitHub write権限を渡さず、stdoutは
JSONL通信専用とする。

実装は既存worker registry、protocol、sandbox、semantic revalidator、Node commit primitiveを再利用し、
別worker基盤、別store、別gateを追加しない。

## Design Reality Binding 契約

本書は実装前設計であり、runtime assetとfailure reachabilityは後続L6実装↔L7 TDD PLANで追加する。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
