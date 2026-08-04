---
plan_id: PLAN-RECOVERY-12-independent-review-fallback
title: "PLAN-RECOVERY-12: independent review provider fallback"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Claude quota時にKimiへ安全に切り替える"]
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 390
engineering_discipline_required: true
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "Claude failure evidence、current candidate HEAD、admitted task/risk classが一致する"
contract_postconditions: "Kimiはbounded packetだけをtool-less隔離でreviewしprovider-neutral receiptを返す"
contract_invariants: "Claude主系、同一generation一lease、次generationはClaudeへ復帰、Kimi自己admission禁止"
contract_failures: "偽failure、別HEAD、高risk、二重lease、tool activity、strict JSON違反をfail-closeする"
tdd_red_required: true
red_at: "2026-08-04T09:47:00Z"
green_at: "2026-08-04T10:03:00Z"
mutation_oracle_evidence: "tests/independent-review-fallback.test.ts::U-IRF-001..008がfailure seal、HEAD、risk、lease、tool-less marker、output exact schema、receipt binding除去でRedになる"
complexity_effect: justified_positive
complexity_justification: "Claude待機による停止をprovider-neutralな一経路へ集約し、手動loopとprovider別merge分岐を減らす"
removal_trigger: "共通worker schedulerが同一fallback selection/lease/receipt契約を所有した時にrouterを統合する"
parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — provider切替とlease実装" }
  - { role: qa, slot_label: "QA — 隔離、strict output、receipt検証" }
  - { role: tl, slot_label: "TL — bootstrap境界とFeature復帰監査" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-001, test_path: tests/independent-review-fallback.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-008, test_path: tests/independent-review-fallback.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/independent-review-fallback.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/independent-review-fallback.ts, artifact_type: source_module }
  - { artifact_path: config/kimi-reviewer-agent.md, artifact_type: config }
  - { artifact_path: tests/independent-review-fallback.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-506-worker-lifecycle-receipt.md
  blocks:
    - issue:390
---

# 独立レビュー・フォールバックRecovery

Claude Codeを正規reviewerとする。quota、unavailable、claim timeoutを同一HEADの封印済みfailureとして確認した場合だけ、低・中riskのPR収束reviewをKimiへ切り替える。次generationではfailure evidenceを継承せずClaudeを再び主系にする。

Kimiへrepository、`.helix`、DB、project credentialをmountしない。tool／subagentなしのagentとbounded packetだけを渡し、strict JSONをNode側で再検証する。provider transport credentialはscratchへcopyし、host auth stateをworkerから直接変更させない。

本PR自身をKimiで自己admissionしない。既存Claude復旧後の独立reviewまたはPOの一回bootstrap receiptが得られるまで`draft`とし、merge authorityへ接続しない。
