---
title: "ScreenApplicabilityGate pure evaluator core L8単体テスト設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-07
updated: 2026-08-07
owner: QA
plan: docs/plans/PLAN-L7-510-screen-applicability-core.md
pair_artifact: docs/design/helix/L6-function-design/screen-applicability-prototype.md
---

# ScreenApplicabilityGate pure evaluator core L8単体テスト設計

L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §0-§1 の型・signature・DbC を
正本とし、write authority を持たない pure evaluator 5 本を対象とする（Issue #175 第1スライス、
L6テスト設計 `L6-screen-applicability-prototype-unit-test-design.md` の U-SAP-001〜005 行の L8 具体化）。
fake clock（trustedNow 文字列注入）と fixed scope fixture を使い、filesystem / DB / browser には触れない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAP-001 | `canonicalizeScreenScope` | field欠落・unknown capability・absolute locator を typed failure で拒否し、capability 順序違いの同義入力は同一 scope_digest | `tests/screen-scope.test.ts` |
| U-SAP-002 | `evaluateScreenApplicability` | no-UI / UI / free-text / unknown reason を matrix 評価し、free-text・deferred pass・二route同時選択を拒否（route は exactly-one） | `tests/screen-applicability.test.ts` |
| U-SAP-003 | `validateNoUiReceipt` | reason / actor / evidence / reentry / scope / rule / expiry を一件ずつ欠落・改変して valid 0（HIL_SCREEN_SKIP_EVIDENCE_MISSING / HIL_SCREEN_RECEIPT_STALE） | `tests/no-ui-receipt.test.ts` |
| U-SAP-004 | `evaluateScreenReentry` | capability / rule / scope digest の 1 箇所改変で stale + 再判定 task exactly-one、同一入力再送は増分 0（決定的同値） | `tests/screen-reentry.test.ts` |
| U-SAP-005 | `planPrototypeDiscovery` | screen / interaction / state / data obligation の欠落と no-UI route を拒否（task 0）、prototype_required では task exactly-one で義務 digest を全保持 | `tests/prototype-discovery.test.ts` |

U-SAP-006〜012（prototype artifact・walkthrough・agreement・backprop・freeze・stage closure gate・
plan route composition）は後続スライスで L8 化する。本設計は canonical assertion primary 表の分母を
変更しない（primary U/HST は L6 テスト設計のまま）。
