---
plan_id: PLAN-REVERSE-220-l14-source-ledger-completion-hardening
title: "PLAN-REVERSE-220: L14 source ledger completion の hardening"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
drive: fullstack
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
forward_routing: L1
promotion_strategy: reuse-with-hardening
agent_slots:
  - role: tl
    slot_label: "TL - L14 completion evidence hardening"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-220-l14-source-ledger-completion-hardening.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
  - artifact_path: tests/vmodel-pair.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
  requires:
    - docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    - docs/process/forward/L08-L14-verification-phase.md
    - docs/process/gates.md
  blocks: []
backprop_scope:
  - layer: L14-operational-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    reason: "L14 operational tests now require fresh source ledgers and fresh completion decision packets before accepting whole-program completion."
  - layer: regression-test
    decision: updated
    evidence_path: tests/vmodel-pair.test.ts
    reason: "V-pair regression now fails if the L1↔L14 pair drops source ledger freshness, source meaning review, or completion packet freshness wording."
---

# PLAN-REVERSE-220: L14 source ledger completion の hardening

## 理由

現在の目的は、L14 completion、version-up の扱い、および外部根拠に基づく
より強い test/verification 戦略を求めている。下位の completion lint は
すでに stale な completion decision packet を拒否しており、right-arm の
process document では source ledger の freshness も定義されている。だが
L1↔L14 の operational test pair は、その同じ条件を直接は要求していなかった。

そのため semantic gap が残っていた。completion machinery は強くできても、
L14 側の operational oracle が広すぎるままだった。

## R4 前方ルーティング

L14 で実行される L1 requirement pair なので、L1 に戻す。この変更で強化するのは
test-design 側のみである。

- 90 日より古い source ledger、future-dated な ledger、date-only refresh は
  completion evidence ではない。
- source refresh では `source_status_delta`、`adoption_decision_delta`、
  `workflow_route_impact` を記録しなければならない。
- `completionDecisionPacket` は fresh であり、`outstanding.completionReadiness`
  と整合していなければならない。
- `outstanding.completionReadiness.ok=false` は、whole-program と L14 の
  completion を引き続きブロックする。

## 外部根拠

- NIST SSDF SP 800-218: evidence は実装済み software、environment、review、
  remediation records に traceable でなければならない。
- GitHub Environments required reviewers: deployment approvals は一般的な prose
  approval ではなく、scope された reviewer evidence である。
- SLSA Provenance v1.2: provenance は生成 artifact を builder、materials、
  timestamps に結び付ける。
- OWASP LLM06:2025 Excessive Agency: reversible ではない agentic actions には
  constrained authority と oversight が必要である。

## 非対象

この plan は `.helix -> .helix` cutover を承認しない。serverless/version-up
作業も有効化せず、保留中の S4 Discovery work も決定しない。
