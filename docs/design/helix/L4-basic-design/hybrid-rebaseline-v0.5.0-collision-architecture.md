---
title: "HELIX L4基本設計 — REBASELINE v0.5.0追突architecture"
layer: L4
kind: add-design
status: draft
created: 2026-07-18
updated: 2026-07-18
owner: TL
related_l3: docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md
related_l10: docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md
pair_artifact: docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md
---

# HELIX L4基本設計 — REBASELINE v0.5.0追突architecture

| component | input | output | fail-close条件 |
|---|---|---|---|
| `V050SourceCustodian` | ZIP bytes、manifest、checksums | source receipt | digest/member/count不一致 |
| `V050DeltaClassifier` | v0.4/v0.5 catalog、AC、edge | 採用・強化・再設計・保留・棄却 | 未分類、owner重複、orphan |
| `AuthorityResolver` | tracked ADR、project rules、package decision | current authority | multiple current、untracked authority昇格 |
| `DeliveryRouteProjector` | system scope、risk、release mode | exactly-one route | unknown/conflictは完全V以外を選択 |
| `V050ConsistencyGate` | package claimsと実測 | contradiction ledger | 既知矛盾又は新規不一致が1件以上 |

Python processへDB path、credential、repository、`.helix/`を渡さない。Python出力はversioned proposal bytesとして
Nodeがschema、digest、authority、lease/fenceを再検証し、canonical writeはNode transaction boundaryだけが行う。
capsule conformance失敗時はsubagent起動を拒否し、prompt-onlyへのsilent fallbackを禁止する。
